import { Component, TemplateRef  } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserListService } from '../../user-list/user-list.services';
import { Router } from '@angular/router';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';

@Component({
  selector: 'app-deletemodel',
  templateUrl: './deletemodel.component.html',
  styleUrls: ['./deletemodel.component.css']
})
export class DeletemodelComponent  {

  modalRef: BsModalRef;
  result: string; 

  constructor(
    private bsModalRef: BsModalRef,
    private modalService: BsModalService
) {}
 
  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, {class: 'modal-sm'});
  }
 
  delete() {
    this.result = 'yes'; // Set result to 'yes' to confirm deletion
    this.bsModalRef.hide();
    

  }
public close(){
  this.bsModalRef.hide();

}


}
