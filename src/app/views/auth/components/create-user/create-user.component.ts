import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { UserListService } from '../../user-list/user-list.services';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../auth.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.css'],

})
export class CreateUserComponent implements OnInit {
  public userForm: FormGroup;
  public permanentAddressForm: FormGroup;
  public currentAddressForm: FormGroup;
  public hotelForm: FormGroup;

  public profile: boolean=true;
  public currentAddress: boolean= true;
  public permanentAddress: boolean = true;
  public document: boolean=true;

  currentTab; // Default tab


  public error: ErrorMessage[] = [
    {
      error: 'required',
      format: (label, error) => `${label.toUpperCase()} IS REQUIRED!`
    },
  ];

  public roles: any[];
  public cities: any[];
  public hotels;
  public role;
  selectedRole: any;
  documentTypes = [
    { value: 'TAZKIRA', label: 'TAZKIRA',ps:"تذکره", dr:"تذکره" },
    { value: 'PASSPORT', label: 'PASSPORT',ps:"پاسپورت", dr:"پاسپورټ" },
    { value: 'JAWAZ', label: 'JAWAZ',ps:"جواز", dr:"جواز" },
  ];

  selectedDocType: string = '';
  uploadedFiles: { document_type: string, name: string, url: string, mime: string, file_size: string, user: number }[] = [];
  selectedFile: File | null = null;
  public userId;
  public isSearched: boolean = false;
  public currentLang;

  canSeeOptions = [
    { value: 'FOREIGN', label: 'International',ps:'بهرنی',dr:'خارجې' },
    { value: 'NATIONAL', label: 'National',ps:'کورنی',dr:'داخلی' }
  ];
  translatedCanSeeOptions: any[] = []; // Store translated options


  selectedCanSee: string[] = [];

  constructor(
    private cdr: ChangeDetectorRef,
    private service: UserListService,
    private fb: FormBuilder,
    private router: Router,
    private toaster: ToastrService,
    private authService: AuthService,
    private translate: TranslateService
  ) { }



  ngOnInit(): void {
    this.getRoles();
    this.getCities();
    this.getHotels();
    this.initializeUserForm()
    this.initializePermanentAddressForm();
    this.initializeCurrentAddressForm();
    this.initializeHotelForm();
    this.selectTab('profile')
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
          this.roles = roles?.results;
          this.authService.getCurrentUser()
          .subscribe({
            next: (user: any)=>{
              this.role = user?.authenticatedUser?.role?.code;
              if(this.role!='super_admin'){

                this.roles= this.roles.filter(val=>val.code == 'guest_care')
              }else{
                this.roles= this.roles.filter(val=>val.code=='super_admin' || val.code=='sub_admin'|| val.code=='guest_care')

              }
            }
          })
        }
      })
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
    this.service.getHotels()
    .subscribe({
        next: (hotels: any)=>{
            this.hotels= hotels?.hotels

        }
    })
}
  public getUserByemail(event: any) {

    const email = event.target.value;
    this.service.getUserByEmail(email)
      .subscribe({
        next: (user: any) => {
          if (user) {
            const userData = user.user_by_email;
            const dob = this.service.convertToFullDate(userData[0].date_of_birth)
            const date = new Date(dob);
            this.userForm.patchValue({
              first_name: userData[0].first_name,
              last_name: userData[0].last_name,
              email: userData[0].email,
              father_name: userData[0].father_name,
              grand_father_name: userData[0].grand_father_name,
              phone: userData[0].phone,
              tazkira: userData[0].tazkira,
              occupation: userData[0].occupation,
              role: userData[0].role.id,
              date_of_birth: date,
              can_see: userData[0].can_see
            })
            this.selectedRole = userData[0].role?.id
            this.userId = userData[0].id
            this.userForm.disable()

            this.cdr.detectChanges()
            this.isSearched = true;
          }

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
      image: [''],
      role: ['', Validators.required],
      // role: ['', [Validators.required]],
      confirm_password: ['', [Validators.required]],
      father_name: ['', Validators.required],
      grand_father_name: ['', Validators.required],
      tazkira: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      occupation: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      can_see:[]


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


  initializePermanentAddressForm() {
    this.permanentAddressForm = this.fb.group({
      city: ['', Validators.required],
      address_type: ['PERMANENT ADDRESS'],
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
      user: [],
      guest: [],
      district: ['', Validators.required],
      village: ['', Validators.required],
      addr: ['', Validators.required]
    });
  }
  initializeHotelForm(){
    this.hotelForm = this.fb.group({
        hotel: ['', Validators.required]
    })
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


  public createPermanentAddress() {
    this.permanentAddressForm.patchValue({
      user: this.userId
    }

    )
    if (this.permanentAddressForm.valid) {

      this.service.createAddress(this.permanentAddressForm.value)
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
      user: this.userId
    })
    if (this.currentAddressForm.valid) {
      this.service.createAddress(this.currentAddressForm.value)
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
            user: this.userId
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
              user: this.userId
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
              user: this.userId

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
      media: this.uploadedFiles
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

            this.router.navigate(['/pages/users'])
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

  onReset() {
    // Reset logic, depending on the active tab
    switch (this.currentTab) {
      case 'profile':
        this.userForm.reset();
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



  public close() {
    this.router.navigate(['/pages/users'])
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.service.upload(formData).subscribe({
        next: (response: any) => {
          if(response) {
            this.translate.get('UC.image_upload_msg').subscribe((message: string) => {
                this.translate.get('UC.image_upload_title').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
          this.userForm.get('image')?.setValue(response.url);

          }
          // Update the form with the image URL
        },
        error: (error: any) => {
          console.error('Upload failed', error);
        }
      });
    }
  }

  public createProfile() {
    if (!this.isSearched) {
      if (this.userForm.valid) {
        const dob = this.service.formatDate(this.userForm.get('date_of_birth').value)

        this.userForm.patchValue({
          date_of_birth: dob,
        })
        this.service.createUser(this.userForm.value)
          .subscribe({
            next: (response: any) => {
              if (response) {
                // this.settingService.setImageUrl('none')
                this.userId = response.user.id
                if(response.user.role.code=='guest_care'){

                  this.createUserHotel();
                }
                this.translate.get('TR.form_success').subscribe((message: string) => {
                  this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                    this.toaster.success(message, title);
                  });
                });

                this.userForm.disable();
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

  private createUserHotel() {
    const hotel = this.hotelForm.get('hotel').value;

        this.service.createUserHotel({ user: this.userId, hotel: hotel }).subscribe({
            next: (userhotel: any) => {
                if (userhotel) {
                }
            },
            error: (err) => {

              this.translate.get('TR.form_err').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toaster.error(message, title);
                });
              });
                // this.rollbackUserCreation();
            }
        });

}
  selectTab(tabName: string) {
    this.currentTab = tabName;
  }

}






