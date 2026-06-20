import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { ToastrService } from 'ngx-toastr';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-edit-hotel',
  templateUrl: './edit-hotel.component.html',
  styleUrls: ['./edit-hotel.component.css']
})
export class EditHotelComponent implements OnInit {


  public settingsId;
  public hotelForm: FormGroup;
  public cities: any[];
  public hotelData;


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
   public page;
  public size;



  public error: ErrorMessage[] = [
    {
      error: 'required',
      format: (label, error) => `${label.toUpperCase()} IS REQUIRED!`
    }
  ];

  constructor(
    private fb: FormBuilder,
    private service: SettingsServiceService,
    private userService: UserListService,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {

       this.route.queryParams.subscribe({
      next: (response: any)=>{
        this.page= response?.page
        this.size = response?.size
      }
    })


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

        }, complete:()=> {
          this.getHotelDataById();

        },
      })
  }

  public getHotelDataById(){
    this.route.params.subscribe((param) => {
      this.settingsId = param['id']
      this.service.getConfigurationByIdData('hotels', this.settingsId)
        .subscribe({
          next: (data: any) => {
            this.hotelData= data?.hotel;
          }, complete :()=> {
            this.hotelForm.patchValue(this.hotelData);
            this.hotelForm.patchValue({
              city: this.hotelData?.city.id
            })
          },
        })
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
      website: ['', [ Validators.pattern(/^(https?:\/\/)?(www\.)?([a-zA-Z0-9]+(-?[a-zA-Z0-9])*\.)+[a-zA-Z]{2,}(\/[^\s]*)?$/)]],
      description:[''],
      image:[''],
      district:[''],


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
                  this.toastr.success(message, title);
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
        this.service.updateConfiguration('hotels', this.hotelForm.value, this.settingsId)
        .subscribe({
          next: (data) => {
            if (data) {
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
              this.cdr.markForCheck();
              this.router.navigate(['/settings/hotel'])
            }
          }
        })

    }else{
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
    }
  }

  public close() {
    this.router.navigate(['/settings/hotel'],{ queryParams: { page: this.page, size:this.size }})
  }

}
