import { Component, OnInit, Output, EventEmitter  } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'profile-security',
    templateUrl: './security.component.html',
    providers: [ ToastrService ]
})
export class SecurityComponent implements OnInit {
    
    form: UntypedFormGroup;
    showEdit: boolean = false;
    public authUser; 
    @Output() openMobilePanel = new EventEmitter();

    constructor(
        private formBuilder: UntypedFormBuilder,
         private toastr: ToastrService,
         private translate: TranslateService,
         private authService: AuthService) {
        this.form = this.formBuilder.group({
            old_password: ['', Validators.required],
            new_password: ['', Validators.required],
            confirm_password: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        this.getAuthUser();
     }


    editForm () {
        
        this.showEdit = !this.showEdit;
        this.form.reset()
    }

    onReset() {
        this.form.reset();
    }
    public getAuthUser(){
        this.authService.getCurrentUser()
        .subscribe({
            next:(authUser:any)=>{
                
                this.authUser= authUser?.authenticatedUser; 
            }
        })
    }

    onSubmit() {
        
        if(this.form.valid){
      
            if(this.form.get('new_password').value!==this.form.get('confirm_password').value){
                this.translate.get('TR.password_missmatch').subscribe((message: string) => {
                    this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                      this.toastr.error(message, title);
                    });
                  });
                
                return
            }
            this.authService.changePassword(this.form.value)
            .subscribe((passwordchange : any) =>{                
              if(passwordchange?.msg==="Wrong Password"){
                this.translate.get('TR.current_password').subscribe((message: string) => {
                    this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                      this.toastr.error(message, title);
                    });
                  });
               
              }else{
                if(this.authUser?.role?.code=='guest_care'){
                    this.translate.get('TR.password_change_success_guest_care').subscribe((message: string) => {
                        this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                          this.toastr.success(message, title);
                        });
                      });
                    
                    this.authService.logout();
                }else{
                    this.translate.get('TR.password_change_success').subscribe((message: string) => {
                        this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                          this.toastr.success(message, title);
                        });
                      });

                    this.form.reset();
                    this.editForm();
                    
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

    onMobilePanelOpen() {
        this.openMobilePanel.emit()
    }
}
