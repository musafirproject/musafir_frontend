import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { GuestService } from '../../services/guest.service';
import { ToastrService } from 'ngx-toastr';
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import { TranslateService } from '@ngx-translate/core';
import { delay } from 'rxjs';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '@app/views/reports/service/report.service';

@Component({
  selector: 'app-guest-history',
  templateUrl: './guest-history.component.html',
  styleUrls: ['./guest-history.component.css']
})
export class GuestHistoryComponent implements OnInit {



    public tazkira;
    public phone;
    public guestsHistory;
    public id;
    public page;
    public size;
  constructor(
        private service: GuestService,
        private cdr: ChangeDetectorRef,
        private route: ActivatedRoute,
        private router: Router,
        private reportService: ReportService,

  ) {


   }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.tazkira = params['tazkira'];
      this.phone = params['phone'];
      this.id= params['id']
      this.page = params['page'],
      this.size = params['size'],
      this.service.getGuestById(this.id)
      .subscribe({
        next: (response: any)=>{
          const passport = response?.passport[0]?.number;
          this.fetch(this.tazkira, this.phone,passport )
        }
      })
    });
  }





  print() {
    this.reportService.printGuestHistory('pdf','Guest History Report',this.tazkira)

  }

  fetch(nid, phone, passport) {
    this.service.getGuestHistory(nid, phone, passport)
      .subscribe({
        next: (guests: any) => {

          this.guestsHistory = guests?.guest_histories;
          // getting total count of elements for pages
          this.cdr.markForCheck();
        }
      });
  }

  public close() {
    this.router.navigate([`/guests/list`],{ queryParams: { page: this.page, size:this.size} })
  }

}
