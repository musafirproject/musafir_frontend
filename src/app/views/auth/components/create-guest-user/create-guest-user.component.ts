import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { UserListService } from '../../user-list/user-list.services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-guest-user',
  templateUrl: './create-guest-user.component.html',
  styleUrls: ['./create-guest-user.component.css']
})
export class CreateGuestUserComponent implements OnInit {
  public userForm: FormGroup;
  public roles: any[];
  selectedRole: any;



  public error: ErrorMessage[] = [
    {
      error: 'required',
      format: (label, error) => `${label.toUpperCase()} IS REQUIRED!`
    },
  ];





  canSeeOptions = [
    { value: 'FOREIGN', label: 'International',ps:'بهرنی',dr:'خارجې' },
    { value: 'NATIONAL', label: 'National',ps:'کورنی',dr:'داخلی' }
  ];
  public currentLang;
  translatedCanSeeOptions: any[] = [];
  selectedCanSee: string[] = [];




  constructor(
    private service: UserListService,
    private fb: FormBuilder,
    private router: Router,
    private toaster: ToastrService,
    private translate: TranslateService,
  ) { }

  ngOnInit(): void {

    this.getRoles();
    this.initializeUserForm();
    this.service.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang
      this.updateTranslatedCanSeeOptions(lang);


    });

  }

  updateTranslatedCanSeeOptions(currentLang: string) {
    this.translatedCanSeeOptions = this.canSeeOptions.map(option => ({
      ...option,
      label:
        currentLang === 'en_US'
          ? option.label
          : currentLang === 'ps_AF'
          ? option.ps
          : option.dr
    }));
  }

  public getRoles() {
    this.service.getRoles()
      .subscribe({
        next: (roles: any) => {
          const guestRole = roles?.results.find(val => val.code === 'guest_user');
          this.selectedRole= guestRole.id
          this.roles = roles?.results.filter(val=>val.code=='guest_user')
        }
      })
  }

  public initializeUserForm() {
    this.userForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ]],
      password: ['', [
        Validators.required,
        Validators.minLength(8),
        Validators.maxLength(20),
        Validators.pattern(/^(?=.*[!@#$%^&*()_+-=])(?=.*[A-Z]).*$/)

      ]],
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      last_name: [''],
      phone: ['', [Validators.required, Validators.pattern(/^\+93 \d{3} \d{2} \d{4}$/)]],
      role: ['', Validators.required],
      confirm_password: ['', [Validators.required]],
      tazkira: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      occupation: ['', Validators.required],
      can_see:[,Validators.required]
    }, { validators: this.passwordMatchValidator });

  }
  private passwordMatchValidator(form: FormGroup): null | { mismatch: true } {
    const password = form.get('password');
    const confirm_password = form.get('confirm_password');

    if (password && confirm_password && password.value !== confirm_password.value) {
      confirm_password.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    return null;
  }

  prefillAfCode() {
    const ctrl = this.userForm.get('phone')!;
    const v = (ctrl.value ?? '').toString();
    if (!v.trim()) {
      ctrl.setValue('+93 ', { emitEvent: false });
    }
  }

  onPhoneInput(e: Event) {
    const ctrl = this.userForm.get('phone')!;
    const raw = (e.target as HTMLInputElement).value;

    // Keep only digits, but remember if user already typed +93 somewhere
    const digits = raw.replace(/\D/g, '');

    // Normalize to +93 and a 9-digit local mobile (Afghanistan: 7xx xx xxxx)
    // Accept inputs starting with 93, or with leading 0, or just local digits.
    let local = '';
    if (digits.startsWith('93')) {
      local = digits.slice(2);
    } else if (digits.startsWith('0')) {
      local = digits.slice(1);
    } else {
      local = digits;
    }
    // Cap to 9 local digits (7xx xx xxxx)
    local = local.slice(0, 9);

    // Build "+93 700 00 0000" => "+93 " + 3-2-4 grouping
    const p1 = local.slice(0, 3);        // 700
    const p2 = local.slice(3, 5);        // 00
    const p3 = local.slice(5, 9);        // 0000

    const formatted =
      '+93' +
      (p1 ? ' ' + p1 : '') +
      (p2 ? ' ' + p2 : '') +
      (p3 ? ' ' + p3 : '');

    // Update control without re-triggering this handler
    ctrl.setValue(formatted, { emitEvent: false });
  }

  public createGuestUser() {

      if (this.userForm.valid) {
        this.service.createUser(this.userForm.value)
          .subscribe({
            next: (response: any) => {
              if (response) {
                this.translate.get('TR.form_success').subscribe((message: string) => {
                  this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                    this.toaster.success(message, title);
                    this.router.navigate(['/pages/guestusers']);
                  });
                });
              }
            },
            error: (errorResponse: any) => {
              if (errorResponse.status === 400 && errorResponse.error && errorResponse.error.email) {
                // Check if the error is due to a non-unique email
                this.translate.get('TR.email_unique').subscribe((message: string) => {
                  this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                    this.toaster.error(message, title);
                  });
                });
              } else {

                this.translate.get('TR.server_err').subscribe((message: string) => {
                  this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                    this.toaster.error(message, title);
                  });
                });
              }
            }
          })
      } else {
        this.translate.get('TR.form_err').subscribe((message: string) => {
          this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
            this.toaster.error(message, title);
          });
        });
      }
  }
  public close() {
    this.router.navigate(['/pages/guestusers'])
  }

}
