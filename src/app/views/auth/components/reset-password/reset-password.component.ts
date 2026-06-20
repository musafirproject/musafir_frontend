import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {

  formGroup: UntypedFormGroup;
  public resetPasswordToken;
 

  constructor(
    private fb: UntypedFormBuilder,
    private router:Router,
    private route:ActivatedRoute, 
    private service: AuthService, 
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {

    this.route.queryParams.subscribe(token => {
      this.resetPasswordToken = token['token'];

      

    })
    this.initializeForm();
  }

  public initializeForm() {
    this.formGroup = this.fb.group({
      new_password: ['', Validators.required],
      confirm_password: ['', Validators.required]
    })
  }

  public changePassword(){

    if(this.formGroup.valid) {
      if(this.formGroup.get('new_password').value == this.formGroup.get('confirm_password').value) {
        this.service.validateResetPasswordToken(this.resetPasswordToken)
          .subscribe({
            next: (passToken) => {
              if(passToken) {
                this.service.confirmResetPassword(this.resetPasswordToken, this.formGroup.get('new_password').value)
                  .subscribe({
                    next: (passReset) => {
                      if(passReset) {
                        this.router.navigate(['/login']);
                        this.toastr.success('All done! Your password has been reset successfully. Continue logging in to pick up where you left off.','Success')

                      }
                    }
                  })
              }
            }
          })
      }else{
        this.toastr.error('Looks like the passwords don’t match. Please try again and make sure they’re identical!!', 'Failed!')
      }

    }else{
      this.toastr.error( 'Oops! Something went wrong. Please double-check your entries.','Failed!')
    }

  }

}
