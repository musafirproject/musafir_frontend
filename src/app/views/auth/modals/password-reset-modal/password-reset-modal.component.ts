import { Component, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-password-reset-modal',
  templateUrl: './password-reset-modal.component.html',
  styleUrls: ['./password-reset-modal.component.css']
})
export class PasswordResetModalComponent implements OnInit {


    modalRef: BsModalRef;
    result: string; 

  constructor(
     private bsModalRef: BsModalRef,
        private modalService: BsModalService
  ) { }

  ngOnInit(): void {
  }

   openModal(template: TemplateRef<any>) {
      this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
    }
   
    reset() {
      this.result = 'yes'; // Set result to 'yes' to confirm deletion
      this.bsModalRef.hide();
      
  
    }
  public close(){
    this.bsModalRef.hide();
  
  }

}
