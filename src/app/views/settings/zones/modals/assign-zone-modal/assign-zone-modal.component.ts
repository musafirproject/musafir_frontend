import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-assign-zone-modal',
  templateUrl: './assign-zone-modal.component.html',
  styleUrls: ['./assign-zone-modal.component.css']
})
export class AssignZoneModalComponent implements OnInit {
  public assignform: FormGroup
  public users;
  public selectedzone; 
  public zones; 
  public data; 
  public userZone; 
  public isUpdate=false; 
  public id; 

 

 
  constructor(
    private userService: UserListService,
    private bsmodalref: BsModalRef,
    private service: SettingsServiceService, 
    private cdr: ChangeDetectorRef, 
    private fb: FormBuilder, 
    private translate: TranslateService, 
    private toastr: ToastrService) { }

  ngOnInit(): void {
    this.initializeForm();
    // this.getUsersList(); 
    this.getZones();
    this.getUzerZoneByUser();

   

    
  }

  initializeForm(){
    this.assignform= this.fb.group({
      user:[],
      zone: [, Validators.required]
    })
  }

  public getUzerZoneByUser(){
    this.service.getUserZoneByUser(this.data.id)
    .subscribe({
      next: (zone: any)=>{
        if(zone){
          
          this.userZone= zone.user_zones[0].zone;
          this.id= zone.user_zones[0]?.id
          this.assignform.patchValue({
            zone: this.userZone.id
          })
          this.isUpdate=true;
          
          this.cdr.detectChanges(); 
        }
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


  public assign(){
    if(this.isUpdate){
      this.assignform.patchValue({
        user: this.data.id
      })
      if(this.assignform.valid){
        
        this.service.updateUserZone(this.assignform.value, this.id)
        .subscribe({
          next: (userzoone: any)=>{
            if(userzoone){
              this.translate.get('TR.update_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
              this.bsmodalref.hide();

            }
          }, error :()=> {
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
              
          },
        })

      }else{
        this.translate.get('TR.form_err').subscribe((message: string) => {
          this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
            this.toastr.error(message, title);
          });
        });

      }
    }else{
      if(this.assignform.valid){
        this.assignform.patchValue({
          user: this.data.id
        })
        
        this.service.assignZoneToUser(this.assignform.value)
        .subscribe({
          next: (assign: any)=>{
            if(assign){
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
              this.bsmodalref.hide(); 
            }
          }, error:(err)=> {
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
              
          },
        })
      }else{
        this.translate.get('TR.form_err').subscribe((message: string) => {
          this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
            this.toastr.error(message, title);
          });
        });
      }

    }

    
    

  }

  public close(){
    this.bsmodalref.hide();

  }

}
