import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ReportService } from '../../service/report.service';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';


@Component({
  selector: 'app-guest-report-modal',
  templateUrl: './guest-report-modal.component.html',
  styleUrls: ['./guest-report-modal.component.css']
})
export class GuestReportModalComponent implements OnInit {

  public guest_type;
  public guest_gender;
  public guest_hotel;
  public guest_city;
  public guest_country;
  public guest_resident;
  public guest_user;
  public title;
  public staff;
  public staff_gender;
  public staff_hotel;
  public staff_hotel_type;
  public hotel;
  public zone;
  public guestForm: FormGroup;
  public closeReason:string='';
  public top_residence?: boolean;
  public reportType: {key: string, value: string}[] = [
    {key: 'pdf', value: 'PDF'},
    {key: 'excel', value: 'EXCEL'},
  ]

  public selectedReport = 'pdf';

  //guesby type

  public guest_types: {key: string, value: string, ps:string, dr:string}[] = [
    {key: 'NATIONAL', value: 'National',ps:'کورنی',dr:'داخلی'},
    {key: 'FOREIGN', value: 'Foreign',ps:'بهرنی',dr:'خارجی'},
  ]

  public selectedGuestType = 'NATIONAL';

  /// guest by gender

  public genders: {key: string, value: string, ps:string, dr:string }[] = [
    {key: 'MALE', value: 'Male',ps:'نارینه',dr:'مرد'},
    {key: 'FEMALE', value: 'Female',ps:'ښځینه',dr:'زن'},
  ]

  public selectedGender = 'MALE';

  public residencies: {key: string, value: string, ps:string, dr:string}[] = [
    {key: 'HOTEL', value: 'Hotel',ps:'هوټل',dr:'هوتل'},
    {key: 'HOSTEL', value: 'Hostel',ps:'لیلیه',dr:'لیلیه'},
    {key: 'GUEST_HOUSE', value: 'Guest House',ps:'میلمستون',dr:'مهمانخانه'},
    {key: 'MUSAFIR_KHANA', value: 'Musafir Khana',ps:'مسافرخانه',dr:'مسافرخانه'},
    {key: 'HOUSE', value: 'House',ps:'کور',dr:'حویلی'},
    {key: 'RENT_ROOM', value: 'Rent Room',ps:'کوټه',dr:'اطاق'},
    {key: 'COMPANY', value: 'Company',ps:'کمپنی',dr:'کمپنی'},
  ]

  public selectedResidence = 'HOTEL';

  public address_types: {key: string, value: string, ps:string, dr:string}[] = [
    {key: 'CURRENT ADDRESS', value: 'Current Address',ps:'اوسنی استوګنځی',dr:'فعلی ادرس'},
    {key: 'PERMANENT ADDRESS', value: 'Permanent Address',ps:'اصلی استوګنځی',dr:'دایمی ادرس'},

  ]

  public selectedAddress = 'CURRENT ADDRESS';

  public cities;
  public hotels;
  public users;
  public zones;
  public countries;

  public nameError: ErrorMessage[] = [
    {
      error: 'required',
      format: (label, error) => `${label.toUpperCase()} IS REQUIRED!`
    },
  ];

  public: ErrorMessage[] = [
    {
      error: 'required',
      format: (label, error) => `${label.toUpperCase()} IS  REQUIRED!`
    }
  ];

  public currentLang;

  constructor(
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private userService: UserListService,
    private toastr: ToastrService,
    private translate: TranslateService,
    private service: SettingsServiceService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getCities();
    this.getHotels();
    this.getUsersList();
    this.getZones();
    this.getCountries();

    this.userService.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang

    });


  }

  public initializeForm() {
    this.guestForm = this.fb.group({
      start_date: [''],
      end_date: [''],
      guest_type: [''],
      guest_gender: [''],
      guest_hotel: [],
      guest_resident: [''],
      city: [''],
      country:[''],
      user:[''],
      address_type:[''],
      zone: [''],
      format: ['', Validators.required],

    })
  }


  public getCities() {
    this.userService.getCities()
      .subscribe({
        next: (cities: any) => {

          this.cities = cities?.cities;
        }
      })

  }
  public getCountries() {
    this.userService.getCountries()
      .subscribe({
        next: (countries: any) => {

          this.countries = countries?.countries;
        }
      })

  }
  public getZones(){
    this.service.getUnpaginatedZone()
      .subscribe({
        next: (data: any) => {
          this.zones = data.zones;

          this.cdr.markForCheck();
        }
      })
  }

  public getUsersList() {


    this.userService.getUnpaginatedUsers()
    .subscribe({
      next: (response: any) => {

          this.users = response?.users

        }
      })
}

  public getHotels(){
    this.userService.getHotels()
    .subscribe({
        next: (hotels: any)=>{

            this.hotels= hotels?.hotels
        }
    })
}

public getUserReport() {
  switch (true) {
    case this.guest_type:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('guest_type').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
            return;
      }
      break;

    case this.guest_gender:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('guest_gender').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;

    case this.guest_hotel:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
    case this.guest_user:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('user').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
    case this.guest_city:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('city').value ||
          !this.guestForm.get('format').value ||
          !this.guestForm.get('address_type').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
    case this.guest_country:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('country').value ||
          !this.guestForm.get('format').value ||
          !this.guestForm.get('address_type').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
    case this.guest_resident:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('guest_resident').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
    case this.staff:
      if (!this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
      case this.staff_hotel:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('guest_hotel').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
      case this.staff_hotel_type:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('guest_resident').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
      case this.staff_gender:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('guest_gender').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
      case this.hotel:
      if (!this.guestForm.get('start_date').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
      case this.zone:
      if (!this.guestForm.get('start_date').value ||!this.guestForm.get('zone').value ||
          !this.guestForm.get('format').value) {
            this.translate.get('TR.report_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
        return;
      }
      break;
    case this.top_residence:
    if (!this.guestForm.get('format').value) {
      this.translate.get('TR.report_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
      return;
    }
  break;
    default:
      this.translate.get('TR.report_type_selection').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
      return;
  }
  this.bsModalRef.hide();  // Close modal for guest_gender case
}





public close() {
  this.closeReason = 'close';  // Set the reason
  this.bsModalRef.hide();       // Just hide the modal
}
  public onReset() {
    this.guestForm.reset();
  }
}
