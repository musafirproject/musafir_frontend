import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { GuestService } from '../../services/guest.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-visa-expiry',
  templateUrl: './visa-expiry.component.html',
  styleUrls: ['./visa-expiry.component.css']
})
export class VisaExpiryComponent implements OnInit {
  guests: any[] = [];
  loadingIndicator = true;
  totalItems: number = 0;
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  pageSizeOptions: number[] = [10, 20, 30, 50, 100];
  showPagination: boolean = true;
  scope: string = '7'; // Default scope

  constructor(
    private service: GuestService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private translate: TranslateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe({
      next: (params: any) => {
        if(params['scope']) {
          this.scope = params['scope'];
          this.currentPage = 1; // Reset to first page when scope changes
          this.loadPaginatedData();
        }
      }
    })
  }

  // Add this method to calculate the end range
  getEndRange(): number {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  }

  // Add this method to calculate the start range
  getStartRange(): number {
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  formatCountry(val: any): string {
    if (val == null) return '';
    if (typeof val === 'string' || typeof val === 'number') return String(val);
    if (typeof val === 'object') {
      return (val.title ?? val.name ?? val.code ?? '').toString();
    }
    return String(val);
  }

  dueInDays(expiryDate: string | Date, expiredMode: boolean): number {
    if (!expiryDate) return 0;
    const today = new Date();
    const exp = new Date(expiryDate);

    const d0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d1 = new Date(exp.getFullYear(), exp.getMonth(), exp.getDate());

    const diff = Math.round((d1.getTime() - d0.getTime()) / (1000 * 60 * 60 * 24));
    return expiredMode ? Math.max(0, -diff) : Math.max(0, diff);
  }

  overdueBadgeClass(scope: '7' | '30' | 'expired' | string): string {
    if (scope === 'expired') return 'bg-danger';
    if (scope === '7') return 'bg-warning text-dark';
    if (scope === '30') return 'bg-info text-dark';
    return 'bg-secondary';
  }

  loadPaginatedData() {
  this.loadingIndicator = true;
  this.service.getVisaStatus(this.scope, this.currentPage, this.pageSize)
    .subscribe({
      next: (response: any) => {
        // Handle Django REST framework pagination response
        this.guests = response?.results || [];
        this.totalItems = response?.count || 0;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loadingIndicator = false;
        this.cdr.markForCheck();
      },
      error: (error) => {
        this.loadingIndicator = false;
        this.translate.get('TR.server_err').subscribe((message: string) => {
          this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
            this.toastr.error(message, title);
          });
        });
        this.cdr.markForCheck();
      }
    });
}

  setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPaginatedData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
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
    const pageSize = parseInt(event.target.value, 10);
    if (!isNaN(pageSize) && pageSize > 0) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.loadPaginatedData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  viewGuest(id) {
    this.router.navigate([`guests/${id}/view`]);
  }

  setScope(newScope: string) {
    this.scope = newScope;
    this.currentPage = 1;
    this.loadPaginatedData();
  }
}
