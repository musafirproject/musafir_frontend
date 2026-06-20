import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@app/views/auth/auth.service';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { ToastrService } from 'ngx-toastr';
import { catchError, forkJoin, of } from 'rxjs';

@Component({
  selector: 'app-view-hotel',
  templateUrl: './view-hotel.component.html',
  styleUrls: ['./view-hotel.component.css']
})
export class ViewHotelComponent implements OnInit {

  public hotels: any;
  public currentLang;
  public page;
  public size;
  public copiedEmail?: string;
  public defaultPageSize = 10;
  public showHotelImage = false;
  public loadingImage = false;
  public imageLoaded = false;
  public imageError = false;
  public role: any;

  public residenceUsers: any[] = [];
  public residenceStaffs: any[] = [];
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private settingService: SettingsServiceService,
    private cdr: ChangeDetectorRef,
    private userService: UserListService,
    private toastrService: ToastrService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe({
      next: (response: any) => {
        this.page = response?.page
        this.size = response?.size
      }
    })
    this.route.params.subscribe({
      next: (param: any) => {
        this.settingService.getConfigurationByIdData('hotels', param?.id)
          .subscribe({
            next: (data: any) => {
              this.hotels = data?.hotel;
              this.loadStaffAndUsers(data?.hotel?.id)
              this.cdr.markForCheck()
            }
          })
      }
    })


    this.userService.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang

    });
    this.getAuthUser();
    this.cdr.detectChanges();
  }

      public getAuthUser(){
    this.authService.getCurrentUser()
    .subscribe({
      next: (user: any)=>{
        this.role = user?.authenticatedUser?.role?.code;
        this.cdr.detectChanges();
        }
    })
  }


public loadStaffAndUsers(hotelId: number) {
  forkJoin({
    users: this.settingService.getResidenceUsers(hotelId).pipe(
      catchError(error => {
        console.warn('Users API failed:', error);
        return of({ users: [] }); // Return empty array on error
      })
    ),
    staffs: this.settingService.getResidenceStaffs(hotelId).pipe(
      catchError(error => {
        console.warn('Staff API failed:', error);
        return of({ staffs: [] }); // Return empty array on error
      })
    )
  }).subscribe({
    next: (data: any) => {
      this.residenceUsers = data?.users?.users || [];
      this.residenceStaffs = data?.staffs?.staffs || [];
      this.cdr.markForCheck();
    },
    error: (error) => {
      console.error('Both APIs failed:', error);
      this.residenceUsers = [];
      this.residenceStaffs = [];
      this.cdr.markForCheck();
    }
  });
}

  copyToClipboard(value?: string) {
    if (!value) { return; }

    // Modern API
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(value)
        .then(() => this.copiedEmail = value)
        .catch(() => this.fallbackCopy(value));
      this.toastrService.success('Email copied to clipboard');
      return;
    }

    // Fallback
    this.fallbackCopy(value);
  }

  private fallbackCopy(value: string) {
    const area = document.createElement('textarea');
    area.value = value;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.left = '-9999px';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); this.copiedEmail = value; } catch { }
    document.body.removeChild(area);
  }

  goToResidenceGuests(period: '24h' | '7d' | 'month' | 'year') {
    const hotelId = this.hotels?.id ?? Number(this.route.snapshot.paramMap.get('hotel_id'));
    if (hotelId) {
      this.router.navigate(
        ['/guests/list'],
        { queryParams: { hotel_id: hotelId, period, page: 1, size: this.defaultPageSize }, queryParamsHandling: 'merge' }
      );
    } else {
      this.router.navigate(
        ['/guests'],
        { queryParams: { page: 1, size: this.defaultPageSize }, queryParamsHandling: 'merge' }
      );
    }
  }

  loadHotelImage() {
    this.showHotelImage = true;   // triggers *ngIf → <img> is created → download starts
    this.loadingImage = true;
    this.imageLoaded = false;
    this.imageError = false;
  }

  onImageLoad() {
    this.imageLoaded = true;
    this.loadingImage = false;
  }

  onImageError() {
    this.imageError = true;
    this.loadingImage = false;
  }

  public close() {
    if(this.role == 'guest_care') {
      history.back();
    }else{
      this.router.navigate(['/settings/hotel'], { queryParams: { page: this.page, size: this.size } })
    }
  }

}
