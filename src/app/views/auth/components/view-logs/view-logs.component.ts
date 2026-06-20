import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-logs',
  templateUrl: './view-logs.component.html',
  styleUrls: ['./view-logs.component.css']
})
export class ViewLogsComponent implements OnInit {

  public data; 

  constructor(    private bsmodalref: BsModalRef,
) { }
  ngOnInit(): void {
  }

  public close(){
    this.bsmodalref.hide(); 

  }

}
