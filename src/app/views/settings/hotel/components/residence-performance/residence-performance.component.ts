import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GuestService } from '@app/views/guests/services/guest.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-residence-performance',
  templateUrl: './residence-performance.component.html',
  styleUrls: ['./residence-performance.component.css']
})
export class ResidencePerformanceComponent implements OnInit {

performanceData: any[] = [];
  loadingIndicator = true;
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  performanceType: string = 'top';
  windowDays: number = 30;

  constructor(
    private service: GuestService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private translate: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.performanceType = params['type'] || 'top';
      this.currentPage = parseInt(params['page']) || 1;
      this.pageSize = parseInt(params['page_size']) || 10;
      this.windowDays = parseInt(params['window_days']) || 30;
      this.loadPerformanceData();
    });
  }

  loadPerformanceData() {
    this.loadingIndicator = true;
    this.cdr.detectChanges(); // Force change detection for loading state

    this.service.getPerformanceDetails(
      this.performanceType,
      this.currentPage,
      this.pageSize,
      this.windowDays
    ).subscribe({
      next: (response: any) => {
        this.performanceData = response?.results || [];
        this.totalItems = response?.count || 0;
        this.totalPages = response?.total_pages || 0;
        this.loadingIndicator = false;
        this.cdr.detectChanges(); // Force change detection after data load
      },
      error: (error) => {
        this.loadingIndicator = false;
        this.cdr.detectChanges(); // Force change detection on error
        this.translate.get('TR.server_err').subscribe((message: string) => {
          this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
            this.toastr.error(message, title);
          });
        });
      }
    });
  }

  getPerformanceTitle(): string {
    return this.performanceType === 'top' ?
      'DASH.top_performers_details' : 'DASH.bottom_performers_details';
  }

  getPerformanceBadgeClass(): string {
    return this.performanceType === 'top' ? 'bg-primary' : 'bg-danger';
  }

  getPerformanceTextClass(): string {
    return this.performanceType === 'top' ? 'text-primary' : 'text-danger';
  }

  // Pagination methods
  getStartRange(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  getEndRange(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateQueryParams();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  firstPage() {
    this.setPage(1);
  }

  lastPage() {
    this.setPage(this.totalPages);
  }

  previous() {
    if (this.currentPage > 1) {
      this.setPage(this.currentPage - 1);
    }
  }

  next() {
    if (this.currentPage < this.totalPages) {
      this.setPage(this.currentPage + 1);
    }
  }

  itemsPerPage(event: any) {
    const newPageSize = parseInt(event.target.value, 10);
    if (!isNaN(newPageSize) && newPageSize > 0) {
      this.pageSize = newPageSize;
      this.currentPage = 1;
      this.updateQueryParams();
    }
  }

  updateQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        type: this.performanceType,
        page: this.currentPage,
        page_size: this.pageSize,
        window_days: this.windowDays
      },
      queryParamsHandling: 'merge'
    });
  }

  getPaginationArray() {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (this.currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }

      pages.push(this.totalPages);
    }

    return pages;
  }

  goBack() {
    this.router.navigate(['/dashboard']);
  }
}
