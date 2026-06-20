import { Component, OnInit } from '@angular/core';
import { HexToRGB } from '@app/shared/utils/HexToRGB';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsServiceService } from '../service/settings-service.service';

@Component({
  selector: 'app-list-settings',
  templateUrl: './list-settings.component.html',
  styleUrls: ['./list-settings.component.css']
})
export class ListSettingsComponent implements OnInit {
//  public childLoaded = false;
  selectedCategory: string = 'Navigation';
  hexToRGB = HexToRGB

  constructor(
    private router:Router,
    private route:ActivatedRoute,
    private settingService:SettingsServiceService
  ) {
   }

   ngOnInit(): void {

  }



  category = [
    
    {
        title: 'Hotels',
        icon: 'la la-hotel',
        color: '#11a1fd',
        path: 'hotel',
        is_last: false
    },
    {
        title: 'Zones',
        icon: 'la la-location-arrow',
        color: '#11a1fd',
        path: 'zone',
        is_last: false
    },
    {
        title: 'Districts',
        icon: 'la la-city',
        color: '#11a1fd',
        path: 'district',
        is_last: false
    },


]

  selectCategory (category: string) {
      // this.selectedCategory = category;
  }

  public openConfig(path: string) {
    this.router.navigate([`settings/${path}`])
  }
}
