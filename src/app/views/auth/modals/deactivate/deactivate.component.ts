import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-deactivate',
  templateUrl: './deactivate.component.html',
  styleUrls: ['./deactivate.component.css']
})
export class DeactivateComponent {

  modalRef: BsModalRef;
    result: string;

    constructor(
      private bsModalRef: BsModalRef,
      private modalService: BsModalService
  ) {}

    openModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    deactivate() {
      this.result = 'yes'; // Set result to 'yes' to confirm deletion
      this.bsModalRef.hide();


    }
  public close(){
    this.bsModalRef.hide();

  }

}
