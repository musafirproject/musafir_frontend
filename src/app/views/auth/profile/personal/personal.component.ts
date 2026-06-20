import { Component, OnInit, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators} from "@angular/forms";
import { SafeUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { UserListService } from '../../user-list/user-list.services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';


@Component({
    selector: 'profile-personal',
    templateUrl: './personal.component.html',
    styles: [`
        ::ng-deep .upload {
            width: 100%
        }
    `]
})

export class PersonalComponent implements OnInit {
    
    formGroup: UntypedFormGroup;
    edit: boolean = false; 
    imageUrl: SafeUrl ='/assets/images/avatars/thumb-1.jpg'
    message: string = ''
    showMessage: boolean = false
    status: 'success' | 'fail' | '' = ''
    currentUser;
    userData;
    showAlert:boolean = false;
    showError:boolean=false;
    showErrorMsg='';
    submitted= false;
    @Output() openMobilePanel = new EventEmitter();

    constructor(
        private fb: UntypedFormBuilder,
        private route: ActivatedRoute,
        private router : Router,
        private authService: AuthService,
        private userService: UserListService, 
        private cdr: ChangeDetectorRef, 
        private toastr: ToastrService, 
        private translate: TranslateService


    ) {
        this.formGroup = this.fb.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            father_name:['',Validators.required], 
            grand_father_name: ['', Validators.required],
            email: ['', [
                Validators.required,
                Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
            ]],
            phone: ['', [Validators.required, Validators.pattern(/^\+93 \d{3} \d{2} \d{4}$/)]],
            occupation: ['',Validators.required]
        });
    }
 
    ngOnInit() { 
        this.authService.getCurrentUser()
        .subscribe({
          next: (currentuser: any) => {            
            this.currentUser = currentuser?.authenticatedUser
            
            this.userService.getUserById(this.currentUser?.id)
            .subscribe({
                next:(user: any) =>{
                    this.userData = user.user;
                    this.cdr.markForCheck(); 
                    this.formGroup.patchValue(user['user'])

                    this.formGroup.reset(
                        {
                            first_name: this.userData?.first_name,
                            last_name:this.userData?.last_name, 
                            father_name: this.userData?.father_name, 
                            grand_father_name: this.userData.grand_father_name, 
                            email: this.userData?.email,
                            phone: this.userData?.phone,
                            occupation: this.userData?.occupation,

                        }
                    )
                    

                }
            })
  
          }
        })



    }




 
    onSubmit() {
        if(this.formGroup.valid){
            
            this.showError=false;
            this.userService.updateUser(this.userData?.id, this.formGroup.value)
            .subscribe(editedUser =>{
              if(editedUser){
                this.translate.get('TR.form_success').subscribe((message: string) => {
                    this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                      this.toastr.success(message, title);
                    });
                  });
                this.router.navigate(['/pages/profile']) 
              }else{
                this.translate.get('TR.form_err').subscribe((message: string) => {
                    this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                      this.toastr.error(message, title);
                    });
                  });
              }
            })
        
        }else{
            this.translate.get('TR.form_err').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toastr.error(message, title);
                });
              });
          return
        }
        this.onEdit()
    }
 
    onReset() {
        this.formGroup.reset();
        
    }

   

    onEdit () {
       this.edit = !this.edit
    }

    onMobilePanelOpen() {
        this.openMobilePanel.emit()
    }
}
