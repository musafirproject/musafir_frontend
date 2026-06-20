import { Component, OnInit } from '@angular/core';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-delete-notification-modal',
  templateUrl: './delete-notification-modal.component.html',
  styleUrls: ['./delete-notification-modal.component.css']
})
export class DeleteNotificationModalComponent implements OnInit {

  public notificationId;
  constructor(
    private service: SettingsServiceService,
    private modalService: BsModalService,
  ) { }

  ngOnInit(): void {
  }

  deleteNotification(value) {
    if (value === 'Yes') {
      this.service.deleteConfiguration('notifications', this.notificationId)
        .subscribe(del => {
          this.service.setDelete(true);
          this.modalService.hide();

        })
    } else if (value === 'No') {
      this.modalService.hide();
    }

  }

}
