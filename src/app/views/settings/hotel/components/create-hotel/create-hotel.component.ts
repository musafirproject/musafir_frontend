import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-hotel',
  templateUrl: './create-hotel.component.html',
  styleUrls: ['./create-hotel.component.css']
})
export class CreateHotelComponent implements OnInit {

  // title: string;
  public cities: any[];
  public districts: any[];
  public hotelForm: FormGroup;

  hotel_types = [
    { value: 'HOTEL', label: 'HOTEL',ps:'هوټل',dr:'هوتل' },
    { value: 'HOSTEL', label: 'HOSTEL',ps:'لیلیه',dr:'لیلیه' },
    { value: 'GUEST_HOUSE', label: 'GUEST HOUSE',ps:'میلمستون',dr:'مهمانخانه' },
    { value: 'MUSAFIR_KHANA', label: 'MUSAFIR KHANA',ps:'مسافرخانه',dr:'مسافرخانه' },
    { value: 'HOUSE', label: 'HOUSE',ps:'کور',dr:'حویلی' },
    { value: 'RENT_ROOM', label: 'RENT ROOM',ps:'کوټه',dr:'اطاق' },
    { value: 'COMPANY', label: 'COMPANY',ps:'کمپنی',dr:'کمپنی' },

  ];
  selectedType: string = '';

  public currentLang;


  public error: ErrorMessage[] = [
    {
      error: 'required',
      format: (label, error) => `${label.toUpperCase()} IS REQUIRED!`
    }
  ];
  constructor(
    private fb: FormBuilder,
    private service: SettingsServiceService,
    private toaster: ToastrService,
    private userService: UserListService,
    private router: Router,
    private translate: TranslateService

  ) { }

  ngOnInit(): void {
    this.getCities();
    this.initializeForm();
    this.userService.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang

    });
  }


  public getCities() {
    this.userService.getCities()
      .subscribe({
        next: (cities: any) => {

          this.cities = cities?.cities;

        }
      })

  }


  public initializeForm() {
    this.hotelForm = this.fb.group({
      title:['',Validators.required],
      city:[],
      hotel_type:['',Validators.required],
      address:['',Validators.required],
      phone: ['', [Validators.required, Validators.pattern(/^\+93 \d{3} \d{2} \d{4}$/)]],
      email: ['', [
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ]],
      website: ['', [Validators.pattern(/^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/)]],
      description:[''],
      image:[''],
      district: [''],

    })
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.userService.upload(formData).subscribe({
        next: (response: any) => {
          // Update the form with the image URL

          this.hotelForm.get('image')?.setValue(response.url);
             this.translate.get('UC.image_upload_msg').subscribe((message: string) => {
                this.translate.get('UC.image_upload_title').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });

        },
        error: (error: any) => {
          console.error('Upload failed', error);
        }
      });
    }
  }

  public createWebConfig() {

    if (this.hotelForm.valid) {
      this.service.createConfiguration('hotels', this.hotelForm.value)
        .subscribe({
          next: (data) => {
            if (data) {
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
              this.router.navigate([`/settings/hotel/`])
            } else {
              this.translate.get('TR.server_err').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toaster.error(message, title);
                });
              });
            }
          }, error:(err)=> {
            if (err.status === 400 && err.error && err.error.email) {
              // Check if the error is due to a non-unique email
              this.translate.get('TR.server_err').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toaster.error(message, title);
                });
              });
            }

          },
        }
      )

    } else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toaster.error(message, title);
        });
      });
    }
  }

      prefillAfCode() {
    const ctrl = this.hotelForm.get('phone')!;
    const v = (ctrl.value ?? '').toString();
    if (!v.trim()) {
      ctrl.setValue('+93 ', { emitEvent: false });
    }
  }

  onPhoneInput(e: Event) {
    const ctrl = this.hotelForm.get('phone')!;
    const raw = (e.target as HTMLInputElement).value;

    // Keep only digits, but remember if user already typed +93 somewhere
    const digits = raw.replace(/\D/g, '');

   
    let local = '';
    if (digits.startsWith('93')) {
      local = digits.slice(2);
    } else if (digits.startsWith('0')) {
      local = digits.slice(1);
    } else {
      local = digits;
    }
    // Cap to 9 local digits (7xx xx xxxx)
    local = local.slice(0, 9);

    // Build "+93 700 00 0000" => "+93 " + 3-2-4 grouping
    const p1 = local.slice(0, 3);        // 700
    const p2 = local.slice(3, 5);        // 00
    const p3 = local.slice(5, 9);        // 0000

    const formatted =
      '+93' +
      (p1 ? ' ' + p1 : '') +
      (p2 ? ' ' + p2 : '') +
      (p3 ? ' ' + p3 : '');

    // Update control without re-triggering this handler
    ctrl.setValue(formatted, { emitEvent: false });
  }


  public onCityChange(event) {
    this.service.getUnpaginatedDistricts()
      .subscribe({
        next: (districts: any) => {
          this.districts = districts.districts.filter((dist: any) => {
            return dist?.city?.id === event?.id
          })
        }
      })
  }
  public close() {
    this.router.navigate(['/settings/hotel'])
  }

  public onReset() {
    this.hotelForm.reset();
  }

}
