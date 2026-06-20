import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'login-form',
  templateUrl: './login-form.component.html'
})
export class LoginFormComponent implements OnInit {

  formGroup: UntypedFormGroup;
  public showError: boolean = false;
  public showErrorMsg: string = '';
  public showPassword = false;


  @Input() thirPartyLogin = true

  constructor(
    private fb: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {

    localStorage.clear();
    this.initializeForm()
  }
  public initializeForm() {
    this.formGroup = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }


  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }


public login() {
  if (this.formGroup.invalid) {
    this.formGroup.markAllAsTouched();
    return;
  }

  const email = this.formGroup.get('email')?.value;
  const password = this.formGroup.get('password')?.value;

  this.authService.Login(email, password).subscribe({
    next: (loginData: any) => {
      if (loginData?.message === 'Logged In Successfully' && loginData?.user) {

        // store user first
        this.authService.storeToStorage('user', loginData.user);

        this.authService.getToken(email, password).subscribe({
          next: (token: any) => {
            if (token?.access && token?.refresh) {
              this.authService.storeToStorage('access_token', token.access);
              this.authService.storeToStorage('refresh_token', token.refresh);
              this.authService.setLoginState(true);

              const role = loginData?.user?.role?.code;

              switch (role) {
                case 'super_admin':
                case 'sub_admin':
                case 'guest_user':
                  this.router.navigate(['/dashboard']);
                  break;

                case 'guest_care':
                  this.router.navigate(['/pages/profile']);
                  break;

                default:
                  this.router.navigate(['/dashboard']);
                  break;
              }
            }
          },
          error: () => {
            this.showError = true;
            this.showErrorMsg = 'Unable to get authentication token.';
            this.cdr.detectChanges();
          }
        });

        this.showError = false;
      } else if (loginData?.error === 'Your account is not active, please check your email for activation link, and try again') {
        this.showError = true;
        this.showErrorMsg = 'Your account is not active, Consulte with the admin to activate your account!';
        this.cdr.detectChanges();
      } else if (loginData?.error === 'Incorrect Password') {
        this.showError = true;
        this.showErrorMsg = 'Your Password is Incorrect!';
        this.cdr.detectChanges();
      } else if (loginData?.error === 'This email do not match our records') {
        this.showError = true;
        this.showErrorMsg = 'This email is not registerd with us!';
        this.cdr.detectChanges();
      }
    },
    error: () => {
      this.showError = true;
      this.showErrorMsg = 'Login failed.';
      this.cdr.detectChanges();
    }
  });
}




  onReset() {
    this.formGroup.reset();
  }
}
