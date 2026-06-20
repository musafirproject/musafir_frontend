import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../service/staff.service';

@Component({
  selector: 'app-edit-staff',
  templateUrl: './edit-staff.component.html',
  styleUrls: ['./edit-staff.component.css']
})
export class EditStaffComponent implements OnInit {
  public staffForm: FormGroup;
  public permanentAddressForm: FormGroup;
  public currentAddressForm: FormGroup;
  public staff_id;
  public cities: any[];
  currentTab;
  public updatePermanentAdd: boolean = false;
  public updateCurrentAdd: boolean = false;
  public staffData: any = [];
  public staffAddresses: any[] = [];
  public staffMedia: any[] = [];
  public pAddressId;
  public cAddressId;
  public hotels;
  public selectedhotel; 
  public page; 
  public size; 
  documentTypes = [
    { value: 'TAZKIRA', label: 'TAZKIRA',ps:"تذکره", dr:"تذکره" },
    { value: 'PASSPORT', label: 'PASSPORT',ps:"پاسپورت", dr:"پاسپورت" },
    { value: 'VISA', label: 'Visa',ps:"ویزا", dr:"ویزا" }, 
  ];
  
  selectedDocType: string = '';
  genders=[
    {value: 'MALE', label: 'Male',ps:"نارینه", dr:"مرد"},
    {value: 'FEMALE',label: 'Female',ps:"ښځینه", dr:"زن"}
  ]
  selectedGender: string='';
  uploadedFiles: { document_type: string, name: string, url: string, mime: string, file_size: string, staff: number }[] = [];
  selectedFile: File | null = null;

  public currentLang; 
 

  constructor(
    private cdr: ChangeDetectorRef,
    private userService: UserListService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToastrService,
    private translate: TranslateService, 
    private service: StaffService
  ) { }

  ngOnInit(): void {
      this.route.queryParams.subscribe({
      next: (response: any)=>{
        this.page= response?.page
        this.size = response?.size
      }
    })
    this.getStaffById()
    this.initializeStaffForm()
    this.getCities();
    this.getHotels();
    this.initializePermanentAddressForm();
    this.initializeCurrentAddressForm();
    this.selectTab('profile')
    this.userService.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang
      
    });
    this.cdr.detectChanges();
  }

  public initializeStaffForm() {
    this.staffForm = this.fb.group({
      
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      last_name: [''],
      father_name: ['', Validators.required],
      grand_father_name: ['', Validators.required],
      gender: ['', Validators.required],
      tazkira: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      phone: ['', [Validators.required, Validators.pattern(/^\+93 \d{3} \d{2} \d{4}$/)]],
      position: ['', Validators.required],
      email: ['', [
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
      ]],
      hotel: ['', Validators.required],
      // role: ['', [Validators.required]],
   

    });

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
        next: (data: any) => {
          this.cities = data?.cities;

        }
      })
  }

  onSubmit() {

    switch (this.currentTab) {
      case 'profile':
        this.updateStaff();
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
      staff: this.staff_id
    }

    )
    if (this.permanentAddressForm.valid) {


      this.userService.createAddress(this.permanentAddressForm.value)
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
      staff: this.staff_id
    })
    if (this.currentAddressForm.valid) {

      this.userService.createAddress(this.currentAddressForm.value)
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
    this.staffForm.reset();
  }

  public close(){
    this.router.navigate(['/staff/list'],{ queryParams: { page: this.page, size:this.size }})
    
  }

  public getStaffById() {
    this.route.params.subscribe(param => {
      this.service.getStaffById(param['id'])
        .subscribe({
          next: (response: any) => {
            this.staffData = response.staff;
            this.staff_id = this.staffData.id
            
            this.cdr.detectChanges();
            // Manually trigger change detection
          },
          complete: () => {
           

            this.staffForm.patchValue(this.staffData)
            
            this.selectedhotel = this.staffData.hotel?.id
            this.getAddressByStaffID(this.staff_id)
            this.getMediaByStaffID(this.staff_id)

          },
          error: (err) => {
            console.error('Error fetching user data:', err);
          }
        });
    });
  }

  public getAddressByStaffID(staff_id) {
    this.service.getAddressByStaffId(this.staff_id)
      .subscribe({
        next: (addresses: any) => {

          

          this.staffAddresses = addresses.addresses_by_staff;
          const permanentAddresses = this.staffAddresses.filter(address => address.address_type === 'PERMANENT ADDRESS');
          const currentAddresses = this.staffAddresses.filter(address => address.address_type === 'CURRENT ADDRESS');


          if (permanentAddresses && permanentAddresses.length > 0) {

            this.permanentAddressForm.patchValue(permanentAddresses[0])
            this.permanentAddressForm.patchValue({staff: staff_id})
            
            this.permanentAddressForm.patchValue({
              city: permanentAddresses[0].city.id
            })
            this.updatePermanentAdd = true;
            this.pAddressId = permanentAddresses[0].id;

          }
          if (currentAddresses && currentAddresses.length > 0) {

            this.currentAddressForm.patchValue(currentAddresses[0])
            this.currentAddressForm.patchValue({staff: staff_id})
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

  public getMediaByStaffID(staff_id) {
    this.service.getMediaByStaffId(staff_id)
      .subscribe({
        next: (media: any) => {
          this.staffMedia = media.media_by_staff;
          this.cdr.detectChanges();
        }
      })
  }

  public getHotels() {
    this.userService.getHotels()
      .subscribe({
        next: (hotels: any) => {
          this.hotels = hotels?.hotels


        }
      })
  }

  

  selectTab(tabName: string) {
    this.currentTab = tabName;
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
        const existingMedia = this.staffMedia.find(media => media.document_type === this.selectedDocType);

        if (existingMedia) {

          // Update the existing media details
          existingMedia.name = this.selectedFile.name;
          existingMedia.url = fileUrl;
          existingMedia.mime = this.selectedFile.type;
          existingMedia.file_size = String(this.selectedFile.size);
          existingMedia.staff = existingMedia.staff.id;

          // Call the API to update the existing media record
          this.service.updateStaffDocuments(existingMedia.id, existingMedia).subscribe({
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
              staff: this.staff_id
            }
          ]

          const uploads = {
            media: this.uploadedFiles
          }


          // Call the API to create a new media record
          this.service.createDocuments(uploads).subscribe({
            next: (createdMedia: any) => {

              this.staffMedia.push(createdMedia.media[0]);

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




  updateStaff() {
    if (this.staffForm.valid) {
      this.service.updateStaff(this.staff_id, this.staffForm.value)
        .subscribe(editStaff => {
          if (editStaff) {
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
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

 

  public updatePermanentAddress() {
    if (this.permanentAddressForm.valid) {
      
      this.userService.updateAddress(this.pAddressId, this.permanentAddressForm.value)
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
      this.userService.updateAddress(this.cAddressId, this.currentAddressForm.value)
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
