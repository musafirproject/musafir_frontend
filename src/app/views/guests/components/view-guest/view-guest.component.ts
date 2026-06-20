import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { GuestService } from '../../services/guest.service';
import { Router, ActivatedRoute } from '@angular/router';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { ReportService } from '@app/views/reports/service/report.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AwsMediaService } from '@app/shared/services/aws-media.service';
import { DashboardService } from '@app/views/dashboard/dashboard.service';
import { AuthService } from '@app/views/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-view-guest',
  templateUrl: './view-guest.component.html',
  styleUrls: ['./view-guest.component.css']
})
export class ViewGuestComponent implements OnInit {

  public guestData: any = [];
  public guest_id;
  public guestAddresses: any[] = [];
  public guestMedia: any[] = [];
  public guestHotel;
  public currentLang;
  public page;
  public size;
  public role;
  public visitCount: number = 0;

  //Journey Vars
  public journeyLoading = false;
  public journeyError = false;
  public journeyRefreshToken = 0; // bump this to force child to refetch

  public isModalOpen = false;
  public selectedMedia: any = null;
  public isPdf = false;
  public pdfUrl: SafeResourceUrl | null = null; // sanitized URL
  public loadingPdf = false;
  public pdfIframeHeight: string = '80vh'; // default

  // New properties for helper methods
  public filePreviewExtensions: string[] = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.pdf'];

  constructor(
    private guestService: GuestService,
    private service: UserListService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private reportService: ReportService,
    private sanitizer: DomSanitizer,
    private mediaService: AwsMediaService,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe({
      next: (response: any) => {
        this.page = response?.page
        this.size = response?.size
      }
    })

    this.route.params.subscribe({
      next: (param: any) => {
        if (param?.id) {
          this.guestService.getGuestById(param?.id)
            .subscribe({
              next: (guest: any) => {
                this.guestData = guest;
                this.guest_id = this.guestData.guest.id;
                this.visitCount = this.guestData?.visit_count || 0;

                // Load journey data for super admin
                if (this.role === 'super_admin') {
                  this.loadJourneyForGuest(this.guest_id);
                }

                this.cdr.markForCheck();
              },
              complete: () => {
                this.getAddressByGuestID(this.guest_id)
              },
              error: (err) => {
                console.error('Error fetching guest data:', err);
              }
            })
        }
      }
    })

    this.service.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang
    });

    this.getAuthUser();

    this.cdr.detectChanges();
  }

  public getAuthUser() {
    this.authService.getCurrentUser()
      .subscribe({
        next: (user: any) => {
          this.role = user?.authenticatedUser?.role?.code;
          this.cdr.detectChanges();
        }
      })
  }

  public getAddressByGuestID(guest_id) {
    this.service.getAddressByGuestId(guest_id)
      .subscribe({
        next: (addresses: any) => {
          this.guestAddresses = addresses.addresses_by_guest;
          this.cdr.detectChanges();
          this.cdr.markForCheck()
        }
      })
  }

  public close() {
    this.router.navigate([`/guests/list`], { queryParams: { page: this.page, size: this.size } })
  }

  public printGuest() {
    this.reportService.printIndividualGuest('pdf', 'Individual Guest Report', this.guest_id)
  }

  openMediaViewer(media: any) {
    this.selectedMedia = media;
    const extension = media?.name?.split('.').pop()?.toLowerCase();
    this.isPdf = extension === 'pdf';
    this.pdfUrl = null;
    this.loadingPdf = this.isPdf;

    if (this.isPdf) {
      // Get signed URL
      this.mediaService.getSignedUrl(media.url).subscribe({
        next: (url) => {
          // Sanitize the URL for iframe
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.loadingPdf = false;
          this.isModalOpen = true; // open modal only after URL is ready
        },
        error: (err) => {
          this.loadingPdf = false;
        },
      });
    } else {
      // For images
      this.isModalOpen = true;
    }
  }

  updateIframeHeight() {
    const headerHeight = 70; // approximate modal header in px
    const availableHeight = window.innerHeight - headerHeight - 60; // 60px padding
    this.pdfIframeHeight = availableHeight + 'px';
  }

  closeModal() {
    this.isModalOpen = false;
    this.selectedMedia = null;
    this.pdfUrl = null;
    this.isPdf = false;
    this.loadingPdf = false;
  }

  journeyPayload: any | null = null;

  loadJourneyForGuest(guestId: number) {
    this.journeyLoading = true;
    this.journeyError = false;

    this.dashboardService.getGuestJourney(guestId).subscribe({
      next: (payload) => {
        this.journeyPayload = payload;
        this.journeyLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.journeyLoading = false;
        this.journeyError = true;
        this.cdr.markForCheck();
      }
    });
  }

  // ========== HELPER METHODS ==========

  /**
   * Get CSS class for document type badge
   */
  getDocumentTypeClass(type: string): string {
    if (!type) return 'bg-secondary';

    const upperType = type.toUpperCase();
    switch (upperType) {
      case 'TAZKIRA':
        return 'bg-success';
      case 'PASSPORT':
        return 'bg-info';
      case 'VISA':
        return 'bg-warning';
      case 'IMAGE':
        return 'bg-purple';
      default:
        return 'bg-secondary';
    }
  }

  /**
   * Get translated label for document type
   */
  getDocumentTypeLabel(type: string): string {
    if (!type) return '';

    const upperType = type.toUpperCase();
    switch (upperType) {
      case 'TAZKIRA':
        return this.translate.instant('GC.tazkira');
      case 'PASSPORT':
        return this.translate.instant('GC.passport');
      case 'VISA':
        return this.translate.instant('GC.visa');
      case 'IMAGE':
        return this.translate.instant('GC.image');
      default:
        return type;
    }
  }

  /**
   * Check if media is an image
   */
  isImage(media: any): boolean {
    if (!media || !media.name) return false;
    const fileName = media.name.toLowerCase();
    return this.filePreviewExtensions.some(ext => fileName.endsWith(ext)) && !this.isPdfFile(media);
  }

  /**
   * Check if media is a PDF
   */
  isPdfFile(media: any): boolean {
    if (!media || !media.name) return false;
    return media.name.toLowerCase().endsWith('.pdf');
  }

  /**
   * Get file extension from filename
   */
  getFileExtension(filename: string): string {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts.pop() || '' : '';
  }

  /**
   * Check if passport is expired
   */
  isPassportExpired(passport: any): boolean {
    if (!passport?.expiry_date) return false;

    try {
      const expiryDate = new Date(passport.expiry_date);
      const today = new Date();
      // Set both dates to start of day for accurate comparison
      today.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);

      return expiryDate < today;
    } catch (error) {
      console.error('Error parsing passport expiry date:', error);
      return false;
    }
  }

  /**
   * Check if visa is expired
   */
  isVisaExpired(visa: any): boolean {
    if (!visa?.expiry_date) return false;

    try {
      const expiryDate = new Date(visa.expiry_date);
      const today = new Date();
      // Set both dates to start of day for accurate comparison
      today.setHours(0, 0, 0, 0);
      expiryDate.setHours(0, 0, 0, 0);

      return expiryDate < today;
    } catch (error) {
      console.error('Error parsing visa expiry date:', error);
      return false;
    }
  }

  /**
   * Get status badge for passport/visa
   */
  getDocumentStatus(passportOrVisa: any): { class: string, label: string } {
    if (this.isPassportExpired(passportOrVisa) || this.isVisaExpired(passportOrVisa)) {
      return {
        class: 'bg-danger',
        label: this.translate.instant('GV.expired')
      };
    } else {
      return {
        class: 'bg-success',
        label: this.translate.instant('GV.valid')
      };
    }
  }

  /**
   * Get formatted date for display
   */
  formatDate(dateString: string, format: 'short' | 'medium' | 'long' = 'medium'): string {
    if (!dateString) return '—';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '—';

      if (format === 'short') {
        return date.toLocaleDateString(this.currentLang, { day: '2-digit', month: 'short', year: 'numeric' });
      } else if (format === 'long') {
        return date.toLocaleDateString(this.currentLang, { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' });
      } else {
        return date.toLocaleDateString(this.currentLang, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return '—';
    }
  }

  /**
   * Get file preview icon based on file type
   */
  getFilePreviewIcon(media: any): string {
    if (!media) return 'feather icon-file';

    const extension = this.getFileExtension(media.name).toLowerCase();

    if (this.isPdfFile(media)) {
      return 'feather icon-file-text text-danger';
    } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(extension)) {
      return 'feather icon-image text-primary';
    } else if (['doc', 'docx'].includes(extension)) {
      return 'feather icon-file-text text-info';
    } else if (['xls', 'xlsx'].includes(extension)) {
      return 'feather icon-file-text text-success';
    } else {
      return 'feather icon-file text-muted';
    }
  }

  /**
   * Get human readable file size
   */
  getFileSize(bytes: number): string {
    if (!bytes || bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Check if guest has blacklisted status
   */
  isGuestBlacklisted(): boolean {
    return this.guestData?.guest?.is_blacklisted === true;
  }

  /**
   * Get total count of documents by type
   */
  getDocumentCountByType(type: string): number {
    if (!this.guestData?.media) return 0;

    const upperType = type.toUpperCase();
    return this.guestData.media.filter((media: any) =>
      media?.document_type?.toUpperCase() === upperType
    ).length;
  }

  /**
   * Get city name based on current language
   */
  getCityName(city: any): string {
    if (!city) return '—';

    if (this.currentLang === 'en_US') {
      return city.title || '—';
    } else if (this.currentLang === 'ps_AF') {
      return city.ps_name || city.title || '—';
    } else if (this.currentLang === 'dr_AF') {
      return city.dr_name || city.title || '—';
    }

    return city.title || '—';
  }

  /**
   * Get address type label based on current language
   */
  getAddressTypeLabel(type: string): string {
    if (!type) return '';

    const upperType = type.toUpperCase();
    if (upperType === 'CURRENT ADDRESS' || upperType === 'CURRENT_ADDRESS') {
      return this.translate.instant('GC.current_address');
    } else if (upperType === 'PERMANENT ADDRESS' || upperType === 'PERMANENT_ADDRESS') {
      return this.translate.instant('GC.permanent_address');
    }

    return type;
  }


  calculateDuration(startDate: string, endDate: string): string {
    if (!startDate || !endDate) return '—';

    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      if (remainingDays === 0) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
      }
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }
  }

  calculateDurationFromNow(startDate: string): string {
    if (!startDate) return '—';

    const start = new Date(startDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    } else if (diffDays < 30) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
    } else {
      const diffMonths = Math.floor(diffDays / 30);
      const remainingDays = diffDays % 30;
      if (remainingDays === 0) {
        return `${diffMonths} month${diffMonths !== 1 ? 's' : ''}`;
      }
      return `${diffMonths} month${diffMonths !== 1 ? 's' : ''} ${remainingDays} day${remainingDays !== 1 ? 's' : ''}`;
    }
  }

  /**
   * Download media file
   */
  downloadMedia(media: any): void {
    if (!media?.url) return;

    this.mediaService.getSignedUrl(media.url).subscribe({
      next: (url) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = media.name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      error: (err) => {
        console.error('Error getting signed URL for download:', err);
      }
    });
  }
}
