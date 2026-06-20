import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Router } from '@angular/router';
import { GuestService } from '../../services/guest.service';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, finalize } from 'rxjs';

export interface ResidenceDetail {
  hotel: string;
  date_of_entry: string | null;
  date_of_exit: string | null;
}

export interface AbnormalRow {
  id: number;
  name: string;
  phone: string | null;
  gender: string | null;
  guest_type: string | null;
  residence?: string | null;
  country_title?: string | null;
  date_of_entry?: string | null;
  date_of_exit?: string | null;
  nights?: number | null;
  created_by_name?: string | null;
  reasons: string[];
  abnormal_level: 'High' | 'Low';
  tazkira?: string | null;
  expanded?: boolean;
  residences?: ResidenceDetail[]; // ✅ Residence history
}

@Component({
  selector: 'app-abnormal-guests',
  templateUrl: './abnormal.component.html',
  styleUrls: ['./abnormal.component.css']
})
export class AbnormalComponent implements OnInit, OnDestroy {
  guests: AbnormalRow[] = [];
  isLoading = false;

  // analytics
  total = 0;
  totalHigh = 0;
  totalLow = 0;
  reasonCounts: Record<string, number> = {};
  genderCounts: Record<string, number> = {};

  // filters
  searchText = '';
  reasonFilter = '';
  levelFilter = '';
  genderFilter = '';

  // sorting (visual only)
  sortBy = 'abnormal_level';
  sortDir: 'asc' | 'desc' = 'desc';

  // paging
  page = 1;
  pageSize = 10;
  pageSizes = [10, 20, 30, 50, 100];

  // selection
  selectedIds = new Set<number>();

  reasonsList = [
    { value: '',             label: 'All reasons' },
    { value: 'same_day',     label: 'Same Day (3+ hotels)' },
    { value: 'weekly',       label: 'Weekly (3+ days in 7d)' },
    { value: 'streak',       label: 'Streak (3+ consecutive days)' },
    { value: 'shared_phone', label: 'Shared Phone' },
  ];

  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  constructor(
    private guestService: GuestService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(txt => {
        this.searchText = txt;
        this.page = 1;
        this.load();
      });

    this.load();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ------ Build params and load ------
  private buildParams(): HttpParams {
    let params = new HttpParams()
      .set('page', String(this.page))
      .set('page_size', String(this.pageSize));

    if (this.searchText.trim()) params = params.set('search', this.searchText.trim());
    if (this.reasonFilter)      params = params.set('reason', this.reasonFilter);
    if (this.levelFilter)       params = params.set('level', this.levelFilter.toLowerCase());
    if (this.genderFilter)      params = params.set('gender', this.genderFilter.toLowerCase());
    params = params.set('t', Date.now().toString());

    return params;
  }

  private load(): void {
    this.isLoading = true;
    const params = this.buildParams();

    this.guestService.getAbnormalGuests(params)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (res: any) => {
          const payload = res?.results || {};
          const list: AbnormalRow[] = payload?.results || [];
          this.guests = list;
          this.total  = Number(res?.count || list.length);
          const a = payload?.analytics || {};
          this.totalHigh    = Number(a?.total_high || 0);
          this.totalLow     = Number(a?.total_low  || 0);
          this.reasonCounts = a?.reasons || {};
          this.genderCounts = a?.genders || {};
          this.selectedIds.clear();
        },
        error: _ => { this.guests = []; }
      });
  }

  onSearchInput(val: string) { this.searchSubject.next(val || ''); }

  applyReasonFilter() { this.page = 1; this.load(); }
  applyLevelFilter()  { this.page = 1; this.load(); }
  applyGenderFilter() { this.page = 1; this.load(); }

  toggleSort(field: string) {
    if (this.sortBy === field) this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    else { this.sortBy = field; this.sortDir = 'asc'; }
  }

  totalPages(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }
  showingFrom(): number { return this.total === 0 ? 0 : (this.page - 1) * this.pageSize + 1; }
  showingTo(): number   { const to = this.page * this.pageSize; return to > this.total ? this.total : to; }

  prevPage() {
    if (this.page > 1) { this.page--; this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }
  nextPage() {
    if (this.page * this.pageSize < this.total) { this.page++; this.load(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
  }
  changePageSize(size: number) {
    this.pageSize = Number(size) || 10;
    this.page = 1;
    this.load();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  allOnPageSelected(): boolean {
    if (!this.guests.length) return false;
    return this.guests.every(g => this.selectedIds.has(g.id));
  }
  toggleSelectAllOnPage(checked: boolean) {
    if (checked) this.guests.forEach(g => this.selectedIds.add(g.id));
    else this.guests.forEach(g => this.selectedIds.delete(g.id));
  }
  toggleRow(id: number, checked: boolean) {
    if (checked) this.selectedIds.add(id); else this.selectedIds.delete(id);
  }
  trackById(_: number, row: AbnormalRow) { return row.id; }

  exportCurrentPageCSV() {
    if (!this.guests?.length) return;
    const header = ['ID','Name','Phone','Gender','Guest Type','Residence','Entry','Exit','Level','Reasons','Created By'];
    const rows = this.guests.map(g => [
      g.id,
      safe(g.name),
      safe(g.phone),
      safe(g.gender),
      safe(g.guest_type),
      safe(g.residence),
      safe(g.date_of_entry),
      safe(g.date_of_exit),
      safe(g.abnormal_level),
      (g.reasons || []).join('|'),
      safe(g.created_by_name),
    ]);
    const csv = [header, ...rows].map(r => r.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `abnormal_guests_page_${this.page}.csv`; a.click();
    URL.revokeObjectURL(url);

    function safe(v: any) { return (v === undefined || v === null) ? '' : String(v); }
    function csvEscape(v: any) {
      const s = safe(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    }
  }

  viewHistory(g: AbnormalRow) {
    this.router.navigate(['guests/history'], {
      queryParams: { tazkira: g.tazkira || '', phone: g.phone || '', id: g.id }
    });
  }

  getReasonTooltip(r: string) {
    switch (r) {
      case 'same_day': return '3+ different hotels on the same day';
      case 'weekly':   return '3+ days with moves within 7 days';
      case 'streak':   return '3+ consecutive days with moves';
      case 'shared_phone': return 'Same phone across different identities';
      default: return r;
    }
  }
  getPatternIcon(r: string) {
    return r === 'same_day' ? 'bi bi-calendar2-date'
         : r === 'weekly' ? 'bi bi-calendar-week'
         : r === 'streak' ? 'bi bi-lightning-charge'
         : 'bi bi-telephone';
  }
  getPatternDescription(r: string) {
    return r === 'same_day' ? 'Same day (3+ hotels)'
         : r === 'weekly' ? 'Weekly (3+ days in 7d)'
         : r === 'streak' ? 'Streak (3+ consecutive days)'
         : r === 'shared_phone' ? 'Shared phone across guests'
         : r;
  }
}
