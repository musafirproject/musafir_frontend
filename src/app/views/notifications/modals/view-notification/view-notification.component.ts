import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-notification',
  templateUrl: './view-notification.component.html',
  styleUrls: ['./view-notification.component.css']
})
export class ViewNotificationComponent implements OnInit {

  public notificationData;
  public seenByUsers = [];
  constructor(private modalService: BsModalService, private userService: UserListService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    let users = [];
    this.notificationData?.user_notifications.forEach((val) => {
      users.push({ 'user_id': val.user, 'is_seen': val.is_seen });
    });
    const seen = new Set();
    const uniqueUsers = users.filter(item => {
      const duplicate = seen.has(item.user_id);
      seen.add(item.user_id);
      return !duplicate;
    });

    uniqueUsers.forEach((user) => {
      this.userService.getUserById(user?.user_id)
        .subscribe({
          next: (el: any) => {
            this.seenByUsers.push({ 'user': el.user, 'is_seen': user?.is_seen });
            this.cdr.detectChanges();
          }
        })
    });

  }

  public close() {
    this.modalService.hide();
  }

}
