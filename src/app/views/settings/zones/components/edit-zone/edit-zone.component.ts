import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { TranslateService } from '@ngx-translate/core';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { title } from 'process';

@Component({
  selector: 'app-edit-zone',
  templateUrl: './edit-zone.component.html',
  styleUrls: ['./edit-zone.component.css']
})
export class EditZoneComponent implements OnInit {
  public zoneForm:FormGroup
  public districts; 
  public zoneId; 

  constructor(private service: SettingsServiceService,
              private toastr: ToastrService, 
              private translate: TranslateService, 
              private fb: FormBuilder, 
              private modalService: BsModalService) { }

  ngOnInit(): void {
    this.getDistricts();
    this.initializeForm();
    this.getZone();
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
      district:[[] ,Validators.required],
      

    })
  }

  public getZone(){
    this.service.getZoneByID(this.zoneId)
    .subscribe({
      next: (zoneData: any)=>{
        const zone = zoneData?.zone; 
        this.zoneForm.patchValue({
          title:zone.title,
          district: zone.district.map((d: any) => d.id) // Ensure district is an array of IDs
        })
        
      }
    })
  }

  public updateZone(){
    if(this.zoneForm.valid){
      this.service.updateZone(this.zoneForm.value, this.zoneId)
      .subscribe({
        next: (zone: any)=>{
          if(zone){
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toastr.success(message, title);
              });
            });
            this.modalService.hide(); 
            
          }
        }, error:(err)=> {
          this.translate.get('TR.form_err').subscribe((message: string) => {
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

  public close(){
    this.modalService.hide()

  }

}
