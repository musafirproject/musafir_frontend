import { Component, OnInit } from '@angular/core';
import { HexToRGB } from '@app/shared/utils/HexToRGB';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsServiceService } from './service/settings-service.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {

  constructor(
  ) {
   }

  ngOnInit(): void {
  }

}
