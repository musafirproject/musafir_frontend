import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-activate',
  templateUrl: './activate.component.html',
  styleUrls: ['./activate.component.css']
})
export class ActivateComponent {
  modalRef: BsModalRef;
    result: string;

    constructor(
      private bsModalRef: BsModalRef,
      private modalService: BsModalService
  ) {}

    openModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }

    activate() {
      this.result = 'yes';
      this.bsModalRef.hide();


    }
  public close(){
    this.bsModalRef.hide();

  }

}
