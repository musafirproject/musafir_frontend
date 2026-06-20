import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router'
import { GuestService } from '../../services/guest.service';
import { ToastrService } from 'ngx-toastr';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, distinctUntilChanged, startWith } from 'rxjs';
import { count } from 'console';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';


@Component({
  selector: 'app-create-guest',
  templateUrl: './create-guest.component.html',
  styleUrls: ['./create-guest.component.css']
})
export class CreateGuestComponent implements OnInit {

  public guestForm: FormGroup;
  public permanentAddressForm: FormGroup;
  public currentAddressForm: FormGroup;
  public passportForm: FormGroup;
  public visaForm: FormGroup;
  public occupationForm: FormGroup;
  currentTab; // Default tab
  public guest: boolean = true;
  public currentAddress: boolean = true;
  public permanentAddress: boolean = true;
  public passport: boolean = true;
  public visa: boolean = true;
  public occupation: boolean = true;
  public documents: boolean = true;
  isPassportTabEnabled: boolean = false;
  isNidEnabled: boolean = true;
  isVisaTabEnabled: boolean = false;
  isAddressTabEnabled: boolean = true;
  public foreingerAddress: boolean = false
  public guestType;






  public cities: any[];
  public countries: any[];
  public districts: any[];
  filteredCities: any[] = []; // Dynamically filtered list of cities

  documentTypes = [
    { value: 'TAZKIRA', label: 'TAZKIRA', ps: "تذکره", dr: "تذکره" },
    { value: 'PASSPORT', label: 'PASSPORT', ps: "پاسپورت", dr: "پاسپورټ" },
    { value: 'VISA', label: 'VISA', ps: "ویزا", dr: "ویزا" },
    { value: 'IMAGE', label: 'IMAGE', ps: "انځور", dr: "تصویر" }
  ];
  selectedDocType: string = '';

  genders = [
    { value: 'MALE', label: 'Male', ps: "نارینه", dr: "مرد" },
    { value: 'FEMALE', label: 'Female', ps: "ښځینه", dr: "زن" }
  ]

  selectedGender: string = '';

  guestTypes = [
    { value: 'NATIONAL', label: 'National', ps: "کورنی", dr: "داخلی" },
    { value: 'FOREIGN', label: 'International', ps: "بهرنی", dr: "خارجې" }
  ]
  selectedGuestType: string = '';
  uploadedFiles: { document_type: string, name: string, url: string, mime: string, file_size: string, guest: number }[] = [];
  selectedFile: File | null = null;
  public guestId;
  public isSearched: boolean = false;
  public successMsg: string;
  public showSuccessMsg: boolean = false;
  public error: ErrorMessage[] = [
    {
      error: 'required',
      format: (label, error) => `${label.toUpperCase()} IS REQUIRED!`
    }
  ];
  public currentLang;

  constructor(
    public bsModalRef: BsModalRef,
    private guestService: GuestService,
    private service: UserListService,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private router: Router,
    private translate: TranslateService,
    private settingService: SettingsServiceService
  ) { }

  ngOnInit(): void {
    this.getCountries();
    this.getCities();
    this.getDistricts();
    this.initializeGuestForm()
    this.initializePermanentAddressForm();
    this.initializeCurrentAddressForm();
    this.initializePassportForm();
    this.initializeVisaForm();
    this.initializeOccupationForm()
    this.selectTab('guest')
    this.wireGuestTypeValidators();

    this.service.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang

    });
    this.cdr.detectChanges();
  }
  public getCities() {
    this.service.getCities()
      .subscribe({
        next: (cities: any) => {

          this.cities = cities?.cities;
          this.filteredCities = cities?.cities

        }
      })
  }
  public getDistricts() {
    this.settingService.getDistricts()
      .subscribe({
        next: (dist: any) => {
          this.districts = dist?.districts;
        }
      })
  }
  public getCountries() {
    this.service.getCountries()
      .subscribe({
        next: (countries: any) => {
          this.countries = countries?.countries;
        }
      })
  }


  public onCityChange(city: any) {
    if(this.guestForm.get('guest_type')?.value == 'NATIONAL') {
      this.settingService.getDistrictByCity(city?.id)
        .subscribe({
          next: (dist: any) => {
            this.districts = dist?.districts;
          }
        });
    }
  }
  onCountryChange(country: any): void {
    const countryId = country?.id

    this.settingService.getCityByCountry(countryId).
      subscribe({
        next: (data: any) => {
          this.cities = [];
          this.cities = data?.cities;
        }
      })
  }

  onTazkiraInput(e: Event) {
    const input = e.target as HTMLInputElement;

    // keep only digits, cap at 13
    const digits = input.value.replace(/\D/g, '').slice(0, 13);

    // split 4-4-5
    const parts = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 13)].filter(Boolean);
    const formatted = parts.join('-');

    // update control without re-triggering this handler
    this.guestForm.get('tazkira')!.setValue(formatted, { emitEvent: false });
  }




public initializeGuestForm() {
    this.guestForm = this.fb.group({
      first_name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      last_name: [''],
      father_name: [''],            // no validators here; we toggle dynamically
      grand_father_name: [''],      // no validators here; we toggle dynamically
      tazkira: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      phone: ['', Validators.required],
      gender: ['', Validators.required],
      guest_type: ['', Validators.required],  // 'NATIONAL' | 'FOREIGN'
      date_of_entry: ['', Validators.required],
      email: ['', [Validators.email]],
    });
  }

  private wireGuestTypeValidators() {
    const guestTypeCtrl = this.guestForm.get('guest_type');
    if (!guestTypeCtrl) return;

    // apply on init + every change
    guestTypeCtrl.valueChanges
      .pipe(startWith(guestTypeCtrl.value), distinctUntilChanged())
      .subscribe(val => this.toggleNationalNameValidators(val));
  }


  private toggleNationalNameValidators(guestType: string) {
    const isNational = guestType === 'NATIONAL';
    const fatherCtrl = this.guestForm.get('father_name');
    const grandFatherCtrl = this.guestForm.get('grand_father_name');

    if (!fatherCtrl || !grandFatherCtrl) return;

    if (isNational) {
      fatherCtrl.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
      grandFatherCtrl.setValidators([Validators.required, Validators.minLength(2), Validators.maxLength(50)]);
    } else {
      // when not national: remove validators and clear values optionally
      fatherCtrl.clearValidators();
      grandFatherCtrl.clearValidators();
      fatherCtrl.reset();           // optional: wipe value so it doesn't get sent
      grandFatherCtrl.reset();      // optional
    }

    // prevent re-triggering valueChanges
    fatherCtrl.updateValueAndValidity({ emitEvent: false });
    grandFatherCtrl.updateValueAndValidity({ emitEvent: false });
  }


  initializePermanentAddressForm() {
    this.permanentAddressForm = this.fb.group({
      city: ['', Validators.required],
      address_type: ['PERMANENT ADDRESS'],
      user: [],
      guest: [],
      district: [''],
      village: [''],
      addr: ['', Validators.required]
    });
  }

  initializeCurrentAddressForm() {
    this.currentAddressForm = this.fb.group({
      city: ['', Validators.required],
      address_type: ['CURRENT ADDRESS'],
      user: [],
      guest: [],
      district: [''],
      village: [''],
      addr: ['', Validators.required]
    });
  }

  initializePassportForm() {
    this.passportForm = this.fb.group({
      number: ['', Validators.required],
      issue_country: ['', Validators.required],
      issue_date: ['', Validators.required],
      expiry_date: ['', Validators.required],
      guest: [, Validators.required]

    })
  }
  initializeVisaForm() {
    this.visaForm = this.fb.group({
      number: ['', Validators.required],
      issue_country: ['', Validators.required],
      issue_date: ['', Validators.required],
      expiry_date: ['', Validators.required],
      guest: [[], Validators.required]

    })
  }
  initializeOccupationForm() {
    this.occupationForm = this.fb.group({
      title: ['', Validators.required],
      organization: ['', Validators.required],
      location: ['', Validators.required],
      guest: [, Validators.required]

    })
  }
  onSubmit() {
    switch (this.currentTab) {
      case 'guest':
        this.createGuest();
        break;
      case 'passport':
        this.createPassport();
        break;
      case 'visa':
        this.createVisa();
        break
      case 'permanentAddress':
        this.createPermanentAddress();
        break;
      case 'currentAddress':
        this.createCurrentAddress();
        break;
      case 'occupation':
        this.createOccupation();
        break;
      case 'documents':
        this.createDocuments();
        break;
    }
  }

  public createPermanentAddress() {
    this.permanentAddressForm.patchValue({
      guest: this.guestId
    }
    )
    if (this.permanentAddressForm.valid) {

      this.service.createAddress(this.permanentAddressForm.value)
        .subscribe({
          next: (address: any) => {
            if (address) {
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
              this.permanentAddressForm.disable();
              this.permanentAddress = false;
              if (this.guestType == 'NATIONAL') {

                this.selectTab('currentAddress');
              } else {
                this.selectTab('occupation')
              }
            }
          }, error: (err) => {
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
          },
        })
    } else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
    }

  }
  public createCurrentAddress() {
    this.currentAddressForm.patchValue({
      guest: this.guestId
    })
    if (this.currentAddressForm.valid) {
      this.service.createAddress(this.currentAddressForm.value)
        .subscribe({
          next: (address: any) => {
            if (address) {
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
              this.currentAddressForm.disable();
              this.currentAddress = false;
              this.selectTab('occupation')
            }
          }, error: (err) => {
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
          },
        })
    } else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
    }

  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];

    if (this.selectedFile && this.selectedDocType) {
      this.uploadFile();
    } else {
      this.translate.get('TR.doc_upload_warning').subscribe((message: string) => {
        this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
          this.toastr.warning(message, title);
        });
      });
    }
  }

  uploadFile() {
    const formData = new FormData();
    formData.append('file', this.selectedFile!);

    this.service.upload(formData).subscribe({
      next: (file: any) => {
        const fileUrl = file.key; // Assuming your backend returns the URL of the uploaded file

        // Check if the document type already exists
        const existingIndex = this.uploadedFiles.findIndex(f => f.document_type === this.selectedDocType);

        if (existingIndex !== -1) {
          // Replace the existing file
          this.uploadedFiles[existingIndex] = {
            document_type: this.selectedDocType,
            name: this.selectedFile.name,
            url: fileUrl,
            mime: this.selectedFile.type,
            file_size: String(this.selectedFile.size),
            guest: this.guestId
          };
        } else {
          // Add the new file if not already present
          if (this.uploadedFiles.length < this.documentTypes.length) {
            this.uploadedFiles.push({
              document_type: this.selectedDocType,
              name: this.selectedFile.name,
              url: fileUrl,
              mime: this.selectedFile.type,
              file_size: String(this.selectedFile.size),
              guest: this.guestId
            });
          } else {
            // Replace the oldest file if the limit is reached
            this.uploadedFiles.shift(); // Remove the oldest file
            this.uploadedFiles.push({
              document_type: this.selectedDocType,
              name: this.selectedFile.name,
              url: fileUrl,
              mime: this.selectedFile.type,
              file_size: String(this.selectedFile.size),
              guest: this.guestId

            });
          }
        }
        this.selectedDocType = '';
        this.selectedFile = null;
        this.cdr.detectChanges();

        (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
      },
      error: () => {
        this.translate.get('TR.file_uplaod_err').subscribe((message: string) => {
          this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
            this.toastr.error(message, title);
          });
        });
      }
    });
  }


prefillAfCode() {
  const ctrl = this.guestForm.get('phone')!;
  const v = (ctrl.value ?? '').toString().trim();

  // Read guest_type from the form (e.g. 'NATIONAL' / 'FOREIGN')
  const guestType = this.guestForm.get('guest_type')?.value;

  // If NATIONAL and phone is empty, prefill with +93
  if (!v && guestType === 'NATIONAL') {
    ctrl.setValue('+93 ', { emitEvent: false });
  }
  // If FOREIGN, do nothing (leave empty so user can type their own prefix)
}

onPhoneInput(e: Event) {
  const ctrl = this.guestForm.get('phone')!;
  const raw = (e.target as HTMLInputElement).value;

  // Get guest_type to decide how we treat the number
  const guestType = this.guestForm.get('guest_type')?.value;

  // For FOREIGN guests, don't force +93 formatting – just store as typed.
  if (guestType === 'FOREIGN') {
    ctrl.setValue(raw, { emitEvent: false });
    return;
  }

  // === NATIONAL guests: keep your Afghanistan-specific formatting ===

  // Keep only digits
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


  public createDocuments() {

    const uploads = {
      media: this.uploadedFiles
    }
    this.guestService.createDocuments(uploads)
      .subscribe({
        next: (response: any) => {
          if (response) {
            this.documents = false;

            this.router.navigate(['/guests/list'])
            this.cdr.detectChanges();
            this.translate.get('TR.upload_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toastr.success(message, title);
              });
            });
          }
        }, error: (err) => {
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toastr.error(message, title);
            });
          });
        },
      })

  }

  public close() {
    this.router.navigate(['/guests/list'])
  }



  public createGuest() {
    const date = new Date().toISOString().split('T')[0];
    this.guestForm.patchValue({
      date_of_entry: date,
    })
    if (this.isNidEnabled == false) {
      this.guestForm.patchValue({ tazkira: '' });
      this.guestForm.get('tazkira')?.clearValidators();
      this.guestForm.get('tazkira')?.updateValueAndValidity();

    }
    this.guestType = this.guestForm.get('guest_type').value
    if (this.guestForm.valid) {
      this.guestService.createGuest(this.guestForm.value)
        .subscribe({
          next: (response: any) => {
            if (response) {
              this.guestId = response.guest.id
              this.guest = false;
              this.guestForm.disable()
              this.selectTab('permanentAddress')
              this.cdr.detectChanges();
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
              // this.router.navigate(['/pages/users']);
            }
          },
          error: (errorResponse: any) => {

            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
            console.error('Server Respons ', errorResponse);
          }
        })
    } else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
    }
  }


  selectTab(tabName: string) {
    this.currentTab = tabName;
  }


  public createPassport() {
    this.passportForm.patchValue({
      guest: this.guestId
    })
    if (this.passportForm.valid) {
      const issue_date = this.service.formatDate(this.passportForm.get('issue_date').value)
      const expiry_date = this.service.formatDate(this.passportForm.get('expiry_date').value)
      this.passportForm.patchValue({
        issue_date: issue_date,
        expiry_date: expiry_date
      })

      this.guestService.createGuestPassport(this.passportForm.value)
        .subscribe({
          next: (passport: any) => {
            if (passport) {
              this.passport = false
              this.passportForm.disable();
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
              this.selectTab('visa')
            }
          }, error: (err) => {
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
          },
        })
    } else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
    }
  }
  public createVisa() {
    this.visaForm.patchValue({
      guest: this.guestId
    })
    if (this.visaForm.valid) {
      const issue_date = this.service.formatDate(this.visaForm.get('issue_date').value)
      const expiry_date = this.service.formatDate(this.visaForm.get('expiry_date').value)
      this.visaForm.patchValue({
        issue_date: issue_date,
        expiry_date: expiry_date
      })
      this.guestService.createGuestVisa(this.visaForm.value)
        .subscribe({
          next: (visa: any) => {
            if (visa) {
              this.visa = false;
              this.visaForm.disable();
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
              this.selectTab('documents')
            }
          }, error: (err) => {
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
          },
        })
    } else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
    }
  }
  public createOccupation() {
    this.occupationForm.patchValue({
      guest: this.guestId
    })
    if (this.occupationForm.valid) {
      this.guestService.createGuestOccupation(this.occupationForm.value)
        .subscribe({
          next: (occupation: any) => {
            if (occupation) {
              this.occupation = false;
              this.occupationForm.disable();
              if (this.guestType !== 'NATIONAL') {

                this.selectTab('passport')
              } else {
                this.selectTab('documents')
              }
              this.cdr.detectChanges();
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });

            }
          }, error: (err) => {
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toastr.error(message, title);
              });
            });
          },
        })
    } else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });
    }
  }


  onGuestTypeChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;

    if (selectedValue === 'FOREIGN') {
      this.isPassportTabEnabled = true;
      this.isVisaTabEnabled = true;
      this.isAddressTabEnabled = false;
      this.foreingerAddress = true;
      this.isNidEnabled = false;
    } else {
      this.isPassportTabEnabled = false;
      this.isVisaTabEnabled = false;
      this.isAddressTabEnabled = true;
      this.foreingerAddress = false;
      this.isNidEnabled = true;
    }
  }

}
