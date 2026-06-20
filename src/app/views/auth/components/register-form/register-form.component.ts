import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, Validators, FormGroup } from "@angular/forms";
import { AuthService } from '../../auth.service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'register-form',
    templateUrl: './register-form.component.html'
})
export class RegisterFormComponent implements OnInit {
    registerForm: FormGroup;
    constructor(
        private formBuilder: UntypedFormBuilder,
        private authService:AuthService,
        private router:Router,
        private toastr: ToastrService
        ) {}

    ngOnInit() {

        this.initializeForm()

    }
    initializeForm() {
        this.registerForm = this.formBuilder.group({
     
            email: ['', [Validators.required, Validators.email]],
          


        });
      }

   

     

    public forgotPassword() {
        if(this.registerForm.valid) {
          this.authService.resetPassword({email: this.registerForm.get('email').value})
            .subscribe({
              next: (resetPassword) => {
                if(resetPassword) {
                  this.toastr.success('We have sent a link to your email, please follow the link to recover your account!', 'Success')    
                  this.router.navigate([`/login`])            
                }
              },error: (err) => {
                if(err.status==400){

                  this.toastr.error('Email not registered. Please check and try again with the correct email address.','Failed!')
                }
                
              }
            })
        }else{
          this.toastr.error('Provide you Email to receive passwor reset link', 'Failed!')
        }
      }
}
