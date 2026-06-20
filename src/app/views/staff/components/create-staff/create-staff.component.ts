import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@app/views/auth/auth.service';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { TranslateService } from '@ngx-translate/core';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../service/staff.service';

@Component({
  selector: 'app-create-staff',
  templateUrl: './create-staff.component.html',
  styleUrls: ['./create-staff.component.css']
})
export class CreateStaffComponent implements OnInit {

  public staffForm: FormGroup;
  public permanentAddressForm: FormGroup;
  public currentAddressForm: FormGroup;
  public hotelForm: FormGroup;

  public profile: boolean=true;
  public currentAddress: boolean= true;
  public permanentAddress: boolean = true;
  public document: boolean=true;
  public profileImageFile: File | null = null;
  public profileImagePreview: string | ArrayBuffer | null = null;

  currentTab; // Default tab


  public error: ErrorMessage[] = [
    {
      error: 'required',
      format: (label, error) => `${label.toUpperCase()} IS REQUIRED!`
    },
  ];

  // public roles: any[];
  public cities: any[];
  public hotels;
  // public role;
  selectedhotel: any;

  documentTypes = [
    { value: 'TAZKIRA', label: 'TAZKIRA',ps:"تذکره", dr:"تذکره" },
    { value: 'PASSPORT', label: 'PASSPORT',ps:"پاسپورت", dr:"پاسپورت" },
    { value: 'VISA', label: 'Visa',ps:"ویزا", dr:"ویزا" },
  ];
  staffTypes = [
    { value: 'NATIONAL', label: 'NATIONAL',ps:"کورنی", dr:"داخلی" },
    { value: 'INTERNATIONAL', label: 'INTERNATIONAL',ps:"خارجی", dr:"خارجی" }
  ];

  selectedDocType: string = '';
  genders=[
    {value: 'MALE', label: 'Male',ps:"نارینه", dr:"مرد"},
    {value: 'FEMALE',label: 'Female',ps:"ښځینه", dr:"زن"}
  ]
  selectedGender: string='';
  uploadedFiles: { document_type: string, name: string, url: string, mime: string, file_size: string, staff: number }[] = [];
  selectedFile: File | null = null;
  public staffId;
  public isSearched: boolean = false;
  public selectedStaffType: string = 'NATIONAL';

  public currentLang;


  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserListService,
    private fb: FormBuilder,
    private router: Router,
    private toaster: ToastrService,
    private translate: TranslateService,
    private service: StaffService
  ) { }

  ngOnInit(): void {

    this.getCities();
    this.getHotels();
    this.initializeStaffForm()
    this.initializePermanentAddressForm();
    this.initializeCurrentAddressForm();
    this.selectTab('profile')
    this.userService.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang

    });
  }

public initializeStaffForm() {
  this.staffForm = this.fb.group({
    first_name: ['', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]],
    last_name: [''],

    // will be required only when staff_type === 'NATIONAL'
    father_name: [''],
    grand_father_name: [''],

    gender: ['', Validators.required],

    // pattern always, required only for NATIONAL
    tazkira: [null, [
      Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)
    ]],

    phone: ['', [
      Validators.required,
      Validators.pattern(/^\+93 \d{3} \d{2} \d{4}$/)
    ]],

    position: ['', Validators.required],

    email: ['', [
      Validators.email,
      Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
    ]],

    hotel: ['', Validators.required],
    image: [''],

    staff_type: ['', Validators.required],

    // will be required only when staff_type === 'INTERNATIONAL'
    passport_no: [],
    visa_no: [],
    visa_expiration_date: [],
  });

  // Apply correct validators based on initial value (edit mode, etc.)
  const initialType = this.staffForm.get('staff_type')?.value;
  this.applyStaffTypeValidators(initialType);

  // React to future changes
  this.staffForm.get('staff_type')?.valueChanges.subscribe(type => {
    this.applyStaffTypeValidators(type);
  });
}

  prefillAfCode() {
    const ctrl = this.staffForm.get('phone')!;
    const v = (ctrl.value ?? '').toString();
    if (!v.trim()) {
      ctrl.setValue('+93 ', { emitEvent: false });
    }
  }

  onPhoneInput(e: Event) {
    const ctrl = this.staffForm.get('phone')!;
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

    onTazkiraInput(e: Event) {
    const input = e.target as HTMLInputElement;

    // keep only digits, cap at 13
    const digits = input.value.replace(/\D/g, '').slice(0, 13);

    // split 4-4-5
    const parts = [digits.slice(0, 4), digits.slice(4, 8), digits.slice(8, 13)].filter(Boolean);
    const formatted = parts.join('-');

    // update control without re-triggering this handler
    this.staffForm.get('tazkira')!.setValue(formatted, { emitEvent: false });
  }

private applyStaffTypeValidators(type: string): void {
  const fatherCtrl        = this.staffForm.get('father_name');
  const grandFatherCtrl   = this.staffForm.get('grand_father_name');
  const tazkiraCtrl       = this.staffForm.get('tazkira');

  const passportCtrl      = this.staffForm.get('passport_no');
  const visaCtrl          = this.staffForm.get('visa_no');
  const visaExpiryCtrl    = this.staffForm.get('visa_expiration_date');

  if (!fatherCtrl || !grandFatherCtrl || !tazkiraCtrl ||
      !passportCtrl || !visaCtrl || !visaExpiryCtrl) {
    return;
  }

  if (type === 'NATIONAL') {
    // NATIONAL: father, grandfather, tazkira are required
    fatherCtrl.setValidators([Validators.required]);
    grandFatherCtrl.setValidators([Validators.required]);
    tazkiraCtrl.setValidators([
      Validators.required,
      Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)
    ]);

    // Passport / visa NOT required
    passportCtrl.clearValidators();
    visaCtrl.clearValidators();
    visaExpiryCtrl.clearValidators();

  } else if (type === 'INTERNATIONAL') {
    // INTERNATIONAL: clear national-specific requirements
    fatherCtrl.clearValidators();
    grandFatherCtrl.clearValidators();
    tazkiraCtrl.clearValidators(); // keep optional; pattern only if you want

    // Passport / visa required
    passportCtrl.setValidators([Validators.required]);
    visaCtrl.setValidators([Validators.required]);
    visaExpiryCtrl.setValidators([Validators.required]);
  } else {
    // No staff_type chosen yet: make all these optional
    fatherCtrl.clearValidators();
    grandFatherCtrl.clearValidators();
    tazkiraCtrl.clearValidators();
    passportCtrl.clearValidators();
    visaCtrl.clearValidators();
    visaExpiryCtrl.clearValidators();
  }

  // Refresh validation state without re-triggering valueChanges
  fatherCtrl.updateValueAndValidity({ emitEvent: false });
  grandFatherCtrl.updateValueAndValidity({ emitEvent: false });
  tazkiraCtrl.updateValueAndValidity({ emitEvent: false });
  passportCtrl.updateValueAndValidity({ emitEvent: false });
  visaCtrl.updateValueAndValidity({ emitEvent: false });
  visaExpiryCtrl.updateValueAndValidity({ emitEvent: false });
}




  initializePermanentAddressForm() {
    this.permanentAddressForm = this.fb.group({
      city: ['', Validators.required],
      address_type: ['PERMANENT ADDRESS'],
      staff: [],
      user: [],
      guest: [],
      district: ['', Validators.required],
      village: ['', Validators.required],
      addr: ['', Validators.required]
    });
  }

  initializeCurrentAddressForm() {
    this.currentAddressForm = this.fb.group({
      city: ['', Validators.required],
      address_type: ['CURRENT ADDRESS'],
      staff: [],
      user: [],
      guest: [],
      district: ['', Validators.required],
      village: ['', Validators.required],
      addr: ['', Validators.required]
    });
  }

  public getCities() {
    this.service.getCities()
      .subscribe({
        next: (cities: any) => {

          this.cities = cities?.cities;
        }
      })

  }


  public getHotels(){
    this.userService.getHotels()
    .subscribe({
        next: (hotels: any)=>{
            this.hotels= hotels?.hotels


        }
    })
}
selectTab(tabName: string) {
  this.currentTab = tabName;
}
onSubmit() {

  switch (this.currentTab) {
    case 'profile':
      this.createProfile();
      break;
    case 'permanentAddress':
      this.createPermanentAddress();
      break;
    case 'currentAddress':
      this.createCurrentAddress();
      break;
    case 'documents':
      this.createDocuments();
      break;
  }
}

onReset() {
  // Reset logic, depending on the active tab
  switch (this.currentTab) {
    case 'profile':
      this.staffForm.reset();
      break;
    case 'permanentAddress':
      this.permanentAddressForm.reset();
      break;
    case 'currentAddress':
      this.currentAddressForm.reset();
      break;
    case 'documents':
      this.selectedDocType = '';
      this.selectedFile = null;
      break;
  }
}

public createProfile() {
  if (!this.isSearched) {
    if (this.staffForm.valid) {
      if(this.profileImageFile) {
        this.staffForm.patchValue({
          image: this.profileImageFile,
          visa_expiration_date: this.service.formatDate(this.staffForm.get('visa_expiration_date')?.value)
        })
      }
      this.service.createStaff(this.staffForm.value)
        .subscribe({
          next: (response: any) => {
            if (response) {

              // this.settingService.setImageUrl('none')
              this.staffId = response.staff.id
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });

              this.staffForm.disable();
              this.profile=false;
              this.selectTab('permanentAddress');
              // this.router.navigate(['/pages/users']);
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

  } else {
    this.translate.get('TR.user_exist').subscribe((message: string) => {
      this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
        this.toaster.warning(message, title);
      });
    });
  }
}

public createPermanentAddress() {
  this.permanentAddressForm.patchValue({
    staff: this.staffId
  }

  )
  if (this.permanentAddressForm.valid) {

    this.userService.createAddress(this.permanentAddressForm.value)
      .subscribe({
        next: (address: any) => {
          if (address) {
            this.translate.get('TR.ADDRESS_SUBMIT_SUCCESS').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
            this.permanentAddressForm.disable()
            this.permanentAddress=false;
            this.selectTab('currentAddress');

          }
        }, error:(err)=> {
          this.translate.get('TR.server_error_address').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        },
      })
  } else {
    this.translate.get('TR.form_err').subscribe((message: string) => {
      this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
        this.toaster.error(message, title);
      });
    });
  }

}

public createCurrentAddress() {
  this.currentAddressForm.patchValue({
    staff: this.staffId
  })
  if (this.currentAddressForm.valid) {
    this.userService.createAddress(this.currentAddressForm.value)
      .subscribe({
        next: (address: any) => {
          if (address) {
            this.translate.get('TR.ADDRESS_CURRENT_SUCCESS').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
            this.currentAddressForm.disable();
            this.currentAddress=false;
            this.selectTab('documents');

          }
        }, error:(err)=> {
          this.translate.get('TR.server_error_address').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        },
      })
  } else {
    this.translate.get('TR.form_err').subscribe((message: string) => {
      this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
        this.toaster.error(message, title);
      });
    });
  }

}
onFileSelected(event: any) {
  this.selectedFile = event.target.files[0];

  if (this.selectedFile && this.selectedDocType) {
    this.uploadFile();
  } else {
    this.translate.get('TR.doc_warning').subscribe((message: string) => {
      this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
        this.toaster.warning(message, title);
      });
    });
  }
}


public onProfileImageSelected(event: any) {
  this.selectedFile = event.target.files[0];
  if (this.selectedFile) {
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    this.service.upload(formData)
      .subscribe({
        next: (profileImage: any) => {
          this.profileImageFile = profileImage?.key;
                this.translate.get('UC.image_upload_msg').subscribe((message: string) => {
                this.translate.get('UC.image_upload_title').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });

        }
      })
  }

}

uploadFile() {
  const formData = new FormData();
  formData.append('file', this.selectedFile!);

  this.service.upload(formData).subscribe({
    next: (file: any) => {
      const fileUrl = file.key;
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
          staff: this.staffId
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
            staff: this.staffId
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
            staff: this.staffId

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
          this.toaster.error(message, title);
        });
      });

    }
  });
}

public createDocuments() {
  const uploads = {
    file: this.uploadedFiles
  }


  this.service.createDocuments(uploads)
    .subscribe({
      next: (response: any) => {
        if (response) {
          this.translate.get('TR.upload_success').subscribe((message: string) => {
            this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
              this.toaster.success(message, title);
            });
          });

          this.router.navigate(['/staff/list'])
        }
      }, error:(err)=> {
        this.translate.get('TR.form_err').subscribe((message: string) => {
          this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
            this.toaster.error(message, title);
          });
        });
      },
    })

}
public close() {
  this.router.navigate(['/staff/list'])
}


}
