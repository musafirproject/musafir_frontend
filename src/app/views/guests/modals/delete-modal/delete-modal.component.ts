import { Component, OnInit } from '@angular/core';
import { GuestService } from '../../services/guest.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';

@Component({
  selector: 'app-delete-modal',
  templateUrl: './delete-modal.component.html',
  styleUrls: ['./delete-modal.component.css']
})
export class DeleteModalComponent implements OnInit {

  public productId;
  constructor(
    private service: GuestService,
    private modalService: BsModalService,
    private settingService: SettingsServiceService
  ) { }

  ngOnInit(): void {
  }

  deleteProduct(value) {
    if (value === 'Yes') {
      this.service.deleteGuest(this.productId)
        .subscribe(del => {
          this.settingService.setDelete(true);
          this.modalService.hide();

        })
    } else if (value === 'No') {
      this.modalService.hide();
    }

  }

}
