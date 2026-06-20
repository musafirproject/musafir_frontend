import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  NgZone,
} from '@angular/core';
import { NotificationService } from '@app/shared/services/notification.service';
import { PusherService } from '@app/shared/services/pusher.service';
import { TimeSince } from '@app/shared/utils/TimeSince';
import { AuthService } from '@app/views/auth/auth.service';

@Component({
  selector: 'nav-notification',
  templateUrl: './nav-notification.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.header-nav-item]': 'true',
  },
  providers: [NotificationService],
})
export class NavNotificationComponent implements OnInit {
  notifications: any[] = [];
  unreadCount = 0;

  role: string | null = null;
  currentUserId: number | null = null;

  constructor(
    private notificationService: PusherService,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.getAuthUser();
  }

  /* ─────────────────────────────────────────────
   *  Auth + Role helpers
   * ───────────────────────────────────────────── */

  private getAuthUser(): void {
    this.authService.getCurrentUser().subscribe({
      next: (user: any) => {
        const authenticatedUser = user?.authenticatedUser;
        this.role = authenticatedUser?.role?.code ?? null;
        this.currentUserId =
          authenticatedUser?.id ?? authenticatedUser?.user_id ?? null;

        this.fetch();
      },
      error: (err) => {
        console.error('Error loading current user for nav-notification:', err);
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
      if (!this.currentUserId) return [];

      return list.filter((n) => {
        const recipientId =
          n?.user?.id ??
          n?.user_id ??
          n?.recipient_id ??
          null;
        return recipientId === this.currentUserId;
      });
    }

    return list;
  }


  fetch(): void {
    this.notificationService.fetchNotifications().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          const raw = data?.notifications?.results || [];
          this.notifications = this.filterNotificationsByRole(raw);
          this.updateUnreadCount();
        });
      },
      error: (error) =>
        console.error('Error fetching notifications (nav):', error),
    });

    this.notificationService.getNotifications().subscribe({
      next: (data: any) => {
        this.ngZone.run(() => {
          let combined: any[] = [];

          if (Array.isArray(data)) {
            combined = [...data, ...this.notifications];
          } else {
            combined = [data, ...this.notifications];
          }

          this.notifications = this.filterNotificationsByRole(combined);
          this.updateUnreadCount();
        });
      },
      error: (err) =>
        console.error('Error getting real-time notifications (nav):', err),
    });
  }


  updateUnreadCount(): void {
    this.unreadCount = this.notifications.filter(
      (n) => n.status === 'DELIVERED',
    ).length;
    this.cdr.markForCheck();
  }

  markAllAsRead(): void {
    this.notifications = [];
    this.unreadCount = 0;
    this.cdr.markForCheck();
  }

  markAsRead(notification: any): void {
    const index = this.notifications.indexOf(notification);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.updateUnreadCount();
    }
  }

  getTimeDistance(time: number): number | string {
    return TimeSince(time);
  }
}
