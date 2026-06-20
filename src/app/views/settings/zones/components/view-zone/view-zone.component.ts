import { Component, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-view-zone',
  templateUrl: './view-zone.component.html',
  styleUrls: ['./view-zone.component.css']
})
export class ViewZoneComponent implements OnInit {
  public zoneData; 

  constructor(private bsmodalref: BsModalRef) { }

  ngOnInit(): void {
    
  }

  public close(){
    this.bsmodalref.hide();
  }

}
