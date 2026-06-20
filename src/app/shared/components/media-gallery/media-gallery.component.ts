import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AwsMediaService } from '@app/shared/services/aws-media.service';

export type MediaType = 'image' | 'pdf' | 'other';

export interface MediaItem {
  key: string;
  label?: string;
  type?: MediaType;

  // UI/runtime
  _show?: boolean;
  _loading?: boolean;
  _loaded?: boolean;
  _error?: boolean;
  _url?: string;             
}

@Component({
  selector: 'app-media-gallery',
  standalone: true,
  templateUrl: './media-gallery.component.html',
  styleUrls: ['./media-gallery.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule],
})
export class MediaGalleryComponent implements OnChanges {
  @Input() items: MediaItem[] = [];

  viewMode: 'grid' | 'list' = 'grid';
  query = '';
  typeFilter: 'all' | MediaType = 'all';

  filtered: MediaItem[] = [];
  loading = false;

  // Modal
  isModalOpen = false;
  selectedItem: MediaItem | null = null;
  isPdf = false;
  pdfUrl: SafeResourceUrl | null = null;
  pdfNotFound = false;
  loadingPdf = false;
  pdfIframeHeight = '80vh';

  constructor(
    private media: AwsMediaService,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items']) {
      const base = (this.items || []).map(i => ({
        ...i,
        type: i.type || this.detectType(i.key),
        _show: false, _loading: false, _loaded: false, _error: false, _url: undefined,
      }));
      this.filtered = base;
      this.applyFilters();
    }
  }

  // ---------- UI ----------
  setViewMode(m: 'grid' | 'list') { this.viewMode = m; }

  applyFilters() {
    const hasCatalog = !!(this.items && this.items.length);
    if (hasCatalog) {
      const q = (this.query || '').toLowerCase().trim();
      const t = this.typeFilter;
      const base = (this.items || []).map(i => ({
        ...i, type: i.type || this.detectType(i.key),
      }));
      this.filtered = base.filter(i => {
        const inType = t === 'all' ? true : i.type === t;
        const text = `${i.label ?? ''} ${i.key}`.toLowerCase();
        return inType && (!q || text.includes(q));
      });
      this.filtered.forEach(i => { i._show = i._loading = i._loaded = i._error = false; i._url = undefined; });
    } else {
      const keys = (this.query || '').split(/[\s,]+/).filter(Boolean);
      this.filtered = keys.map<MediaItem>(k => ({
        key: k,
        label: k.split('/').pop() || k,
        type: this.detectType(k),
        _show: true, _loading: true, _loaded: false, _error: false, _url: undefined,
      }));
      this.filtered.forEach(i => this.resolveAndPreload(i));
    }
    this.cdr.markForCheck();
  }

  resetFilters() {
    this.query = '';
    this.typeFilter = 'all';
    this.applyFilters();
  }

  async showPreview(item: MediaItem) {
    if (item._url || item._loaded) { item._show = true; this.cdr.markForCheck(); return; }
    item._show = true;
    item._loading = true;
    item._error = false;
    item._loaded = false;
    this.cdr.markForCheck();
    await this.resolveAndPreload(item);
  }

  copyKey(key: string) {
    if (key) navigator.clipboard?.writeText(key);
  }

  trackByKey = (_: number, i: MediaItem) => i.key;

  // ---------- Modal ----------
  async openViewer(item: MediaItem) {
    this.selectedItem = item;
    this.isPdf = (item.type || this.detectType(item.key)) === 'pdf';
    this.pdfUrl = null;
    this.pdfNotFound = false;

    if (this.isPdf) {
      this.loadingPdf = true;
      this.cdr.markForCheck();
      try {
        const url = await this.media.getSignedUrl(item.key).toPromise();
        let exists = true;
        try {
          const res = await fetch(url, { method: 'HEAD' });
          exists = res.ok;
        } catch {
          exists = true;
        }
        if (!exists) {
          this.pdfNotFound = true;
        } else {
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        }
      } catch {
        this.pdfNotFound = true;
      } finally {
        this.loadingPdf = false;
        this.openModal();
      }
    } else {
      if (!item._url) await this.resolveAndPreload(item);
      this.openModal();
    }
  }

  openModal() {
    this.isModalOpen = true;
    this.updateIframeHeight();
    this.cdr.markForCheck();
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedItem = null;
    this.isPdf = false;
    this.pdfUrl = null;
    this.pdfNotFound = false;
    this.loadingPdf = false;
    this.cdr.markForCheck();
  }

  updateIframeHeight() {
    const header = 70, padding = 60;
    const available = window.innerHeight - header - padding;
    this.pdfIframeHeight = Math.max(300, available) + 'px';
  }

  // ---------- Core: resolve + pre-check ----------
  private async resolveAndPreload(item: MediaItem) {
    try {
      const url = await this.media.getSignedUrl(item.key).toPromise();

      if ((item.type || this.detectType(item.key)) === 'image') {
        // preload image
        await this.preloadImage(url);
      }
      item._url = url;
      item._loaded = true;
      item._loading = false;
      item._error = false;
    } catch {
      item._error = true;
      item._loading = false;
      item._loaded = false;
      item._url = undefined;
    } finally {
      this.cdr.markForCheck();
    }
  }

  private preloadImage(url: string) {
    return new Promise<void>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('not-found'));
      img.src = url;
    });
  }

  // ---------- helpers ----------
  private detectType(key: string): MediaType {
    const ext = (key?.split('.').pop() || '').toLowerCase();
    if (['jpg','jpeg','png','gif','bmp','webp','svg'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    return 'other';
  }
}
