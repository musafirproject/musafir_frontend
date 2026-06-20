import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-create-black-list',
  templateUrl: './create-black-list.component.html',
  styleUrls: ['./create-black-list.component.css']
})
export class CreateBlackListComponent implements OnInit {

    public blackListForm: FormGroup;

    public error: ErrorMessage[] = [
        {
          error: 'required',
          format: (label, error) => `${label.toUpperCase()} IS REQUIRED!`
        },
      ];


  constructor(
    private service: SettingsServiceService,
        private fb: FormBuilder,
        private router: Router,
        private toaster: ToastrService,
        private translate: TranslateService,
  ) { }

  ngOnInit(): void {
    this.initializeUserForm()
  }



  public initializeUserForm() {
      this.blackListForm = this.fb.group({


        name: ['', [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(50)
        ]],
        last_name: [''],
        father_name: [''],
        grand_father_name: [''],
        passport: [''],

        phone: ['',Validators.required],
        nid: ['', [Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      });

    }

    prefillAfCode() {
    const ctrl = this.blackListForm.get('phone')!;
    const v = (ctrl.value ?? '').toString();
    if (!v.trim()) {
      ctrl.setValue('+93 ', { emitEvent: false });
    }
  }

  onPhoneInput(e: Event) {
    const ctrl = this.blackListForm.get('phone')!;
    const raw = (e.target as HTMLInputElement).value;

    const digits = raw.replace(/\D/g, '');

  
    let local = '';
    if (digits.startsWith('93')) {
      local = digits.slice(2);
    } else if (digits.startsWith('0')) {
      local = digits.slice(1);
    } else {
      local = digits;
    }
    local = local.slice(0, 9);

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


    public createBlackListNotification() {

      if (this.blackListForm.valid) {
        this.service.createBlackList(this.blackListForm.value)
          .subscribe({
            next: (response: any) => {
              if (response) {
                this.translate.get('TR.form_success').subscribe((message: string) => {
                  this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                    this.toaster.success(message, title);
                    this.router.navigate(['guests/blacklist']);
                  });
                });
              }
            },
            error: (errorResponse: any) => {


                this.translate.get('TR.server_err').subscribe((message: string) => {
                  this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                    this.toaster.error(message, title);
                  });
                });

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
    this.router.navigate(['guests/blacklist'])
  }


}
