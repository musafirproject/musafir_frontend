import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { TranslateService } from '@ngx-translate/core';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.css']
})
export class ReportModalComponent implements OnInit {

  public currentLang; 
  public guestForm: FormGroup;
  public closeReason:string='';
  public hotels; 

  public reportType: {key: string, value: string}[] = [
    {key: 'pdf', value: 'PDF'},
    {key: 'excel', value: 'EXCEL'},
  ]

  public selectedReport = 'pdf';

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



  constructor(
    private userService: UserListService, 
    private fb: FormBuilder, 
    private translate: TranslateService, 
    private toastr: ToastrService, 
    private bsModalRef: BsModalRef,
    
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getHotels();
    this.userService.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang
      
    });
  }

  public initializeForm() {
      this.guestForm = this.fb.group({
        start_date: [''],
        end_date: [''],
        guest_hotel: [''],
        guest_resident: [''],
        report_format: ['', Validators.required],
  
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
    if (!this.guestForm.get('start_date').value || 
            !this.guestForm.get('report_format').value) {
              this.translate.get('TR.report_err').subscribe((message: string) => {
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
