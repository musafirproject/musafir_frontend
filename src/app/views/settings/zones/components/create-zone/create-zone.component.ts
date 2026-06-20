import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-zone',
  templateUrl: './create-zone.component.html',
  styleUrls: ['./create-zone.component.css']
})
export class CreateZoneComponent implements OnInit {
  public zoneForm: FormGroup;
  public districts: any[];


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
    private router: Router,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.getDistricts();
    this.initializeForm();
  }

  public getDistricts() {
    this.service.getUnpaginatedDistricts()
      .subscribe({
        next: (districts: any) => {
          this.districts = districts?.districts;
        }
      })

  }

  public initializeForm() {
    this.zoneForm = this.fb.group({
      title:['',Validators.required],
      district:[ ,Validators.required],
      

    })
  }

  public createZone(){
    
    if(this.zoneForm.valid){
      this.service.createZone(this.zoneForm.value)
      .subscribe({
        next:(zone: any)=>{
          if(zone){
            this.translate.get('TR.form_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
            this.router.navigate(['/settings/zone'])
          }
        },error:(err)=> {
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
            
        },
      })
      
    }else{
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toaster.error(message, title);
        });
      });
    }

  }

  public close() {
    this.router.navigate(['/settings/zone'])
  }

}
