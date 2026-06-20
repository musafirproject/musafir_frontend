import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserListService } from '../../user-list.services';
import { Router, ActivatedRoute } from '@angular/router';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@app/views/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {


  public userForm: FormGroup;
  public permanentAddressForm: FormGroup;
  public currentAddressForm: FormGroup;
  public hotelForm: FormGroup;
  public user_id;
  public roles: any[];
  public cities: any[];
  selectedRole: any;
  currentTab;
  public updatePermanentAdd: boolean = false;
  public updateCurrentAdd: boolean = false;
  public userData: any = [];
  public userAddresses: any[] = [];
  public userMedia: any[] = [];
  public pAddressId;
  public cAddressId;
  public hotels;
  public role;
  public userHotelId;
  documentTypes = [
    { value: 'TAZKIRA', label: 'TAZKIRA',ps:"تذکره", dr:"تذکره" },
    { value: 'PASSPORT', label: 'PASSPORT',ps:"پاسپورت", dr:"پاسپورټ" },
    { value: 'JAWAZ', label: 'JAWAZ',ps:"جواز", dr:"جواز" },
  ];
  selectedDocType: string = '';
  uploadedFiles: { document_type: string, name: string, url: string, mime: string, file_size: string, user: number }[] = [];
  selectedFile: File | null = null;

  public currentLang;

  canSeeOptions = [
    { value: 'FOREIGN', label: 'International',ps:'بهرنی',dr:'خارجې' },
    { value: 'NATIONAL', label: 'National',ps:'کورنی',dr:'داخلی' }
  ];
  translatedCanSeeOptions: any[] = [];
  public page;
  public size;

  constructor(
    private cdr: ChangeDetectorRef,
    private service: UserListService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private settingService: SettingsServiceService,
    private toaster: ToastrService,
    private authService: AuthService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
         this.route.queryParams.subscribe({
      next: (response: any)=>{
        this.page= response?.page
        this.size = response?.size
      }
    })

    this.getUserById()
    this.getRoles();
    this.getCities();
    this.getHotels();
    this.initializeUserForm()
    this.initializeHotelForm();
    this.initializePermanentAddressForm();
    this.initializeCurrentAddressForm();
    this.selectTab('profile')
    this.service.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang
      this.updateTranslatedCanSeeOptions(lang);


    });
    this.cdr.detectChanges();
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







  public initializeUserForm() {
    this.userForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
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
      father_name: ['', Validators.required],
      grand_father_name: ['', Validators.required],
      tazkira: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      occupation: ['', Validators.required],
      date_of_birth: ['', Validators.required],
      can_see:[],

    });

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

  initializeHotelForm() {
    this.hotelForm = this.fb.group({
      hotel: ['', Validators.required]
    })
  }

  public getRoles() {
    this.service.getRoles()
      .subscribe({
        next: (roles: any) => {
          this.roles = roles?.results;
          this.authService.getCurrentUser()
            .subscribe({
              next: (user: any) => {
                this.role = user?.authenticatedUser?.role?.code;
                if (this.role != 'super_admin') {

                  this.roles = this.roles.filter(val => val.code == 'guest_care')
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
        next: (data: any) => {
          this.cities = data?.cities;

        }
      })
  }


  public getUserById() {
    this.route.params.subscribe(param => {
      this.service.getUserById(param['id'])
        .subscribe({
          next: (response: any) => {
            this.userData = response.user;
            this.user_id = this.userData.id
            // if(this.userData.role.code=='sub_admin'){
            //   this.onChange(this.userData.role);
            // }
            this.cdr.detectChanges();
            // Manually trigger change detection
          },
          complete: () => {
            const dob = this.service.convertToFullDate(this.userData.date_of_birth)
            const date = new Date(dob);

            this.userForm.patchValue(this.userData)
            this.userForm.patchValue({
              role: this.userData?.role.id,
              date_of_birth: date,
              can_see: this.userData.can_see
            })
            this.selectedRole = this.userData.role?.id
            this.getAddressByUserID(this.user_id)
            this.getMediaByUserID(this.user_id)
            if(this.userData.role.code=='guest_care'){


              this.getuserHotelByUserID(this.user_id)
            }


          },
          error: (err) => {
            console.error('Error fetching user data:', err);
          }
        });
    });
  }

  public getHotels() {
    this.service.getHotels()
      .subscribe({
        next: (hotels: any) => {
          this.hotels = hotels?.hotels


        }
      })
  }

  public getuserHotelByUserID(user_id) {
    this.service.getUserHotelByUserId(user_id)
      .subscribe({
        next: (response: any) => {
          const userHotel = response?.user_hotels;
          this.userHotelId = userHotel[0].id;

          this.hotelForm.patchValue({
            hotel: userHotel[0]?.hotel?.id
          })

        }
      })

  }


  public getAddressByUserID(user_id) {
    this.service.getAddressByUserId(user_id)
      .subscribe({
        next: (addresses: any) => {

          this.userAddresses = addresses.addresses_by_user;
          const permanentAddresses = this.userAddresses.filter(address => address.address_type === 'PERMANENT ADDRESS');
          const currentAddresses = this.userAddresses.filter(address => address.address_type === 'CURRENT ADDRESS');


          if (permanentAddresses && permanentAddresses.length > 0) {

            this.permanentAddressForm.patchValue(permanentAddresses[0])
            this.permanentAddressForm.patchValue({
              city: permanentAddresses[0].city.id
            })
            this.updatePermanentAdd = true;
            this.pAddressId = permanentAddresses[0].id;

          }
          if (currentAddresses && currentAddresses.length > 0) {

            this.currentAddressForm.patchValue(currentAddresses[0])
            this.currentAddressForm.patchValue({
              city: currentAddresses[0].city.id
            })
            this.updateCurrentAdd = true;
            this.cAddressId = currentAddresses[0].id;
          }
          this.cdr.detectChanges();
        }
      })

  }

  public getMediaByUserID(user_id) {
    this.service.getMediaByUserId(user_id)
      .subscribe({
        next: (media: any) => {
          this.userMedia = media.media_by_user;
          this.cdr.detectChanges();
        }
      })
  }

  onSubmit() {

    switch (this.currentTab) {
      case 'profile':
        this.updateUser();
        break;
      case 'permanentAddress':
        this.isUpdatePermanentAdd();
        break;
      case 'currentAddress':
        this.isUpdateCurrenttAdd();
        break;
      default:
        break;
    }
  }

  public isUpdatePermanentAdd() {
    if (!this.updatePermanentAdd) {
      this.createPermanentAddress();

    } else {
      this.updatePermanentAddress();
    }
  }
  public isUpdateCurrenttAdd() {
    if (!this.updateCurrentAdd) {
      this.createCurrentAddress();
    } else {
      this.updateCurrentAddress();
    }
  }

  public createPermanentAddress() {
    this.permanentAddressForm.patchValue({
      user: this.user_id
    }

    )
    if (this.permanentAddressForm.valid) {


      this.service.createAddress(this.permanentAddressForm.value)
        .subscribe({
          next: (address: any) => {
            if (address) {
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
              this.updatePermanentAdd = true;
              this.pAddressId = address?.address?.id
              this.selectTab('currentAddress');

            }
          }, error: (err) => {
            this.translate.get('TR.server_err').subscribe((message: string) => {
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
      user: this.user_id
    })
    if (this.currentAddressForm.valid) {

      this.service.createAddress(this.currentAddressForm.value)
        .subscribe({
          next: (address: any) => {
            if (address) {
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
              this.updateCurrentAdd = true;
              this.cAddressId = address?.address?.id
              this.selectTab('documents')
            }
          }, error: (err) => {
            this.translate.get('TR.server_err').subscribe((message: string) => {
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

  onReset() {
    this.userForm.reset();
  }
  public close() {
    this.router.navigate(['/pages/users'],{ queryParams: { page: this.page, size:this.size }})
  }

  selectTab(tabName: string) {
    this.currentTab = tabName;
  }

  uploadImage(event: any) {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);
      this.service.upload(formData).subscribe({
        next: (response: any) => {
          // Update the form with the image URL
          this.userForm.get('image')?.setValue(response.url);
               this.translate.get('UC.image_upload_msg').subscribe((message: string) => {
                this.translate.get('UC.image_upload_title').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
        },
        error: (error: any) => {
          console.error('Upload failed', error);
        }
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
        // Check if the document type already exists in userMedia
        const existingMedia = this.userMedia.find(media => media.document_type === this.selectedDocType);

        if (existingMedia) {

          // Update the existing media details
          existingMedia.name = this.selectedFile.name;
          existingMedia.url = fileUrl;
          existingMedia.mime = this.selectedFile.type;
          existingMedia.file_size = String(this.selectedFile.size);
          existingMedia.user = existingMedia.user.id;

          // Call the API to update the existing media record
          this.service.updateUserDocuments(existingMedia.id, existingMedia).subscribe({
            next: () => {
              this.translate.get('TR.upload_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
            },
            error: () => {
              this.translate.get('TR.file_uplaod_err').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toaster.error(message, title);
                });
              });
            }
          });

        } else {

          // Create a new media record
          this.uploadedFiles = [
            {
              document_type: this.selectedDocType,
              name: this.selectedFile.name,
              url: fileUrl,
              mime: this.selectedFile.type,
              file_size: String(this.selectedFile.size),
              user: this.user_id
            }
          ]

          const uploads = {
            media: this.uploadedFiles
          }


          // Call the API to create a new media record
          this.service.createDocuments(uploads).subscribe({
            next: (createdMedia: any) => {

              this.userMedia.push(createdMedia.media[0]);

              this.cdr.detectChanges();
              this.translate.get('TR.upload_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
            },
            error: () => {
              this.translate.get('TR.upload_save_fail').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toaster.error(message, title);
                });
              });
            }
          });
        }

        // Reset the selected document type and file
        this.selectedDocType = '';
        this.selectedFile = null;
        this.cdr.detectChanges();

        // Clear the file input field
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




  updateUser() {
    const dob = this.service.formatDate(this.userForm.get('date_of_birth').value)

    this.userForm.patchValue({
      date_of_birth: dob,
    })
    if (this.userForm.valid) {
      this.service.updateUser(this.user_id, this.userForm.value)
        .subscribe(editedUser => {
          if (editedUser) {

            this.settingService.setImageUrl('none')
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
            if(editedUser?.[0]?.user.role.code=='guest_care'){

              this.updateUserHotel();
            }

            this.selectTab('permanentAddress');

            // this.router.navigate(['/pages/users'])

          } else {
            this.translate.get('TR.form_err').subscribe((message: string) => {
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

  public updateUserHotel() {

    const hotel = this.hotelForm.get('hotel').value

    if (hotel) {
      this.service.updateUserHotel(this.userHotelId, { user: this.user_id, hotel: hotel })
        .subscribe({
          next: (response: any) => {
            if (response) {
              this.translate.get('TR.update_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
            }
          }
        })
    }
  }

  public updatePermanentAddress() {
    if (this.permanentAddressForm.valid) {
      this.service.updateAddress(this.pAddressId, this.permanentAddressForm.value)
        .subscribe({
          next: (address: any) => {
            if (address) {
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
              this.selectTab('currentAddress');

            }
          }, error(err) {
            if (err.status == 400) {
              this.translate.get('TR.form_err').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toaster.error(message, title);
                });
              });
            } else if (err.status == 500) {
              this.translate.get('TR.server_err').subscribe((message: string) => {
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

  public updateCurrentAddress() {
    if (this.currentAddressForm.valid) {
      this.service.updateAddress(this.cAddressId, this.currentAddressForm.value)
        .subscribe({
          next: (address: any) => {
            if (address) {
              this.translate.get('TR.update_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
              this.selectTab('documents')
            }
          }, error(err) {
            if (err.status == 400) {
              this.translate.get('TR.form_err').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toaster.error(message, title);
                });
              });
            } else if (err.status == 500) {
              this.translate.get('TR.form_err').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toaster.error(message, title);
                });
              });
            } else {
              this.translate.get('TR.form_err').subscribe((message: string) => {
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




}
