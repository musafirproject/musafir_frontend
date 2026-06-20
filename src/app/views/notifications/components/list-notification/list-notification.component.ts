import {
  Component,
  OnInit,
  ViewChild,
  ChangeDetectorRef,
  HostListener,
} from '@angular/core';
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import { ColumnMode, DatatableComponent } from '@swimlane/ngx-datatable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { delay } from 'rxjs/operators';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { CreateNotificationModalComponent } from '../../modals/create-notification-modal/create-notification-modal.component';
import { DeleteNotificationModalComponent } from '../../modals/delete-notification-modal/delete-notification-modal.component';
import { EditNotificationComponent } from '../../modals/edit-notification/edit-notification.component';
import { ViewNotificationComponent } from '../../modals/view-notification/view-notification.component';
import { PusherService } from '@app/shared/services/pusher.service';
import { DeletemodelComponent } from '@app/views/auth/modals/deletemodel/deletemodel.component';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@app/views/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-list-notification',
  templateUrl: './list-notification.component.html',
  styleUrls: ['./list-notification.component.css'],
})
export class ListNotificationComponent implements OnInit {
  temp = [];

  notifications: any[] = [];
  columnMode: ColumnMode = ColumnMode.force;
  rowHeight: 'auto' | number = 'auto';
  scrollbarH = false;

  public role: string;
  public currentUserId: number | null = null;

  public loadingIndicator = true;
  public searchTerm: string = '';
  public totalItems: number = 0;
  public currentPage: number = 1;
  public pageSize: number = 10;
  public totalPages: number = 0;
  public pages: number[] = [];
  public showPrevious: boolean = true;
  public showNext: string | boolean = true;
  public showPagination: boolean = true;
  public pageSizeOptions: number[] = [10, 20, 30, 50, 100];

  @ViewChild(DatatableComponent) table: DatatableComponent;

  public bsModalRef: BsModalRef;
  public isSmallScreen: boolean = false;
  constructor(
    private notificationService: PusherService,
    private service: SettingsServiceService,
    private modalService: BsModalService,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private authService: AuthService,
    private translate: TranslateService,
    private screenSizeSvc: ScreenSizeService,
  ) {
    this.screenSizeSvc.onResize$.pipe(delay(0)).subscribe((sizes) => {
      const sizeTabletAbove =
        sizes.includes(SCREEN_SIZE.XXL) ||
        sizes.includes(SCREEN_SIZE.XL) ||
        sizes.includes(SCREEN_SIZE.LG);
      if (sizeTabletAbove) {
        this.rowHeight = 'auto';
        this.scrollbarH = false;
        this.columnMode = ColumnMode.force;
      } else {
        this.rowHeight = 68;
        this.scrollbarH = true;
        this.columnMode = ColumnMode.force;
      }
      this.cdr.markForCheck();
    });
  }

     @HostListener('window:resize', ['$event'])
  onResize(event: UIEvent): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.isSmallScreen = window.innerWidth < 768; // small screen breakpoint
    }
  }

  ngOnInit(): void {
    this.getAuthUser();
  }

  /* ─────────────────────────────────────────────
   *  Auth + Role helpers
   * ───────────────────────────────────────────── */

  public getAuthUser() {
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        const authenticatedUser = user?.authenticatedUser;
        this.role = authenticatedUser?.role?.code;
        this.currentUserId =
          authenticatedUser?.id ?? authenticatedUser?.user_id ?? null;
        this.fetch();
        this.loadPaginatedData();
      },
      error: (err) => {
        console.error('Error loading current user:', err);
      },
    });
  }

  private get isPrivileged(): boolean {
    return this.role === 'super_admin' || this.role === 'sub_admin';
  }


  private filterNotificationsByRole(list: any[]): any[] {
    if (!Array.isArray(list)) {
      return [];
    }

    if (this.isPrivileged) {
      return list;
    }

    if (this.role === 'guest_care' || this.role === 'guest_user') {
      if (!this.currentUserId) {
        return [];
      }

      return list.filter((n) => {
        // Adjust these fields depending on your API shape
        const recipientId =
          n?.user?.id ??
          n?.user_id ??
          n?.recipient_id ??
          null;
        return recipientId === this.currentUserId;
      });
    }

    // Default: if some other role, just return as-is
    return list;
  }

  
  private applyPaginationMeta(result: any, filtered: any[], updatePages = false) {
    if (this.isPrivileged) {
      this.totalItems = result?.total_items ?? filtered.length;
      this.totalPages =
        result?.total_pages ??
        (this.totalItems > 0
          ? Math.ceil(this.totalItems / this.pageSize)
          : 0);
    } else {
      // Guest roles: pagination is based only on what they can actually see.
      this.totalItems = filtered.length;
      this.totalPages = filtered.length > 0 ? 1 : 0;

      if (this.currentPage > this.totalPages) {
        this.currentPage = this.totalPages || 1;
      }
    }

    this.loadingIndicator = result?.loadingIndicator;

    if (updatePages) {
      this.pages =
        result?.allPages ??
        this.service.getPaginationArray(this.totalPages, this.currentPage);
    }
  }

 

  fetch() {
    // initial fetch (non-paginated or first chunk)
    this.notificationService.fetchNotifications().subscribe({
      next: (data: any) => {
        const raw = data?.notifications?.results ?? [];
        this.notifications = this.filterNotificationsByRole(raw);

        // For initial fetch we can also sync basic meta for non-privileged
        if (!this.isPrivileged) {
          this.totalItems = this.notifications.length;
          this.totalPages = this.notifications.length > 0 ? 1 : 0;
        }

        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error fetching notifications:', error);
      },
    });

    // real-time notifications
    this.notificationService.getNotifications().subscribe({
      next: (data: any[]) => {
        const combined = Array.isArray(data) ? data : [data];
        const merged = [...combined, ...this.notifications];
        this.notifications = this.filterNotificationsByRole(merged);

        if (!this.isPrivileged) {
          this.totalItems = this.notifications.length;
          this.totalPages = this.notifications.length > 0 ? 1 : 0;
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error getting real-time notifications:', err);
      },
    });
  }

  getScreenWidth(size: number) {
    this.screenSizeSvc.onResize(size);
  }

 

  public openNotificationModal() {
    const initialState = {};

    const modalConfig = {
      initialState,
      class: 'modal-lg',
    };
    this.bsModalRef = this.modalService.show(
      CreateNotificationModalComponent,
      modalConfig,
    );
    this.bsModalRef.onHide.subscribe({
      next: (value) => {
        if (value) {
          this.ngOnInit();
          this.cdr.detectChanges();
        }
      },
    });
  }

  public viewNotification(data: any) {
    const initialState = {
      notificationData: data,
    };

    const modalConfig = {
      initialState,
      class: 'modal-xl',
    };

    this.bsModalRef = this.modalService.show(
      ViewNotificationComponent,
      modalConfig,
    );
  }

  public editNotification(data: any) {
    const initialState = {
      notificationData: data,
    };
    this.bsModalRef = this.modalService.show(EditNotificationComponent, {
      initialState,
    });
    this.bsModalRef.onHide.subscribe({
      next: (value) => {
        if (value) {
          this.ngOnInit();
          this.cdr.markForCheck();
        }
      },
    });
  }

  openModal(id: number) {
    this.bsModalRef = this.modalService.show(DeletemodelComponent);

    this.bsModalRef.onHide.subscribe(() => {
      const modalContent = this.bsModalRef?.content;
      if (modalContent && modalContent.result === 'yes') {
        this.deleteNotification(id);
      }
    });
  }

  public deleteNotification(id: number) {
    this.notificationService.deleteNotification(id).subscribe({
      next: (notificationDelete: any) => {
        this.translate.get('TR.delete_msg').subscribe((message: string) => {
          this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
            this.toastr.success(message, title);
          });
        });

        this.notifications = this.notifications.filter(
          (notifi) => notifi.id !== id,
        );

        if (!this.isPrivileged) {
          this.totalItems = this.notifications.length;
          this.totalPages = this.notifications.length > 0 ? 1 : 0;
        }

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error deleting notification:', err);
      },
    });
  }

  /* ─────────────────────────────────────────────
   *  Pagination
   * ───────────────────────────────────────────── */

  public loadPaginatedData() {
    this.notificationService.sharedLoadData(
      this.notificationService.getNotificationListPaginated(
        this.currentPage,
        this.pageSize,
      ),
      this.totalItems,
      this.totalPages,
      this.pageSize,
      this.loadingIndicator,
      this.showNext,
      (result: any) => {
        const raw = result?.list ?? [];
        const filtered = this.filterNotificationsByRole(raw);
        this.notifications = filtered;

        // Apply pagination based on role + filtered list
        this.applyPaginationMeta(result, filtered);

        this.cdr.detectChanges();
      },
    );
  }

  public setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPaginatedData();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  public getPaginationArray() {
    return this.service.getPaginationArray(this.totalPages, this.currentPage);
  }

  public firstPage() {
    this.setPage(1);
  }

  public lastPage() {
    this.setPage(this.totalPages);
  }

  public previous() {
    if (this.currentPage > 1) {
      this.setPage(this.currentPage - 1);
      this.loadPaginatedData();
    }
  }

  public next() {
    if (this.currentPage < this.totalPages) {
      this.setPage(this.currentPage + 1);
      this.loadPaginatedData();
    }
  }

  public itemsPerPage(event: any) {
    const pageSize = parseInt(event.target.value, 10);
    if (!isNaN(pageSize) && pageSize > 0) {
      this.pageSize = pageSize;
      this.currentPage = 1;
      this.loadPaginatedData();
      this.cdr.detectChanges();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /* ─────────────────────────────────────────────
   *  Search
   * ───────────────────────────────────────────── */

  public search() {
    this.loadingIndicator = true;
    this.notifications = [];
    if (!this.searchTerm) {
      this.showPagination = true;
      this.currentPage = 1;
      this.loadOriginalData();
    } else {
      this.showPagination = false;
      this.fetchSearchResults(this.searchTerm, 10);
    }
    this.searchTerm = '';
  }

  private loadOriginalData() {
    this.service.OriginalData(
      this.notificationService.search('', this.currentPage, this.pageSize),
      this.totalItems,
      this.totalPages,
      this.pageSize,
      this.loadingIndicator,
      this.pages,
      (result: any) => {
        const raw = result?.list ?? [];
        const filtered = this.filterNotificationsByRole(raw);
        this.notifications = filtered;

        // For original data we also update pages array
        this.applyPaginationMeta(result, filtered, true);

        this.cdr.detectChanges();
      },
    );
  }

  private fetchSearchResults(searchTerm: string, pageSize: number) {
    const page = 1;
    this.notificationService.SearchResults(
      this.notificationService.search(searchTerm, page, pageSize),
      this.searchTerm,
      this.totalItems,
      this.pageSize,
      this.loadingIndicator,
      (result: any) => {
        const raw = result?.list ?? [];
        const filtered = this.filterNotificationsByRole(raw);
        this.notifications = filtered;

        // For search we also want meta consistent
        this.applyPaginationMeta(result, filtered);

        this.cdr.detectChanges();
      },
    );
  }
}
