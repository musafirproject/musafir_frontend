import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router'
import { ToastrService } from 'ngx-toastr';

import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { GuestService } from '../../services/guest.service';
import { AuthService } from '@app/views/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-edit-guest',
  templateUrl: './edit-guest.component.html',
  styleUrls: ['./edit-guest.component.css']
})
export class EditGuestComponent implements OnInit {


  public message: string = ''
  public showMessage: boolean = false
  public status: 'success' | 'fail' | '' = '';
  public guestForm: FormGroup;
  public permanentAddressForm: FormGroup;
  public currentAddressForm: FormGroup;
  public passportForm: FormGroup;
  public visaForm: FormGroup; 
  public occupationForm : FormGroup
  public guest_id;
  public countries: any[];
  public cities: any[];
  public filteredCities:any[]=[];
  currentTab;
  
  public guestData: any = [];
  public guestAddresses: any[] = [];
  public pAddressId; 
  public cAddressId; 
  isPassportTabEnabled: boolean = false;
  isVisaTabEnabled: boolean = false;
  isAddressTabEnabled: boolean = true;
  isNidEnabled: boolean = true; 
  public foreingerAddress:boolean=false
 

  public passportUpdate: boolean=false; 
  public visaUpdate: boolean=false; 
  public occupationUpdate: boolean=false; 
  public updatePermanentAdd: boolean = false; 
  public updateCurrentAdd: boolean = false; 
  public selectedCounrty; 

  public visa_id; 
  public passport_id; 
  public occupation_id; 
  public role; 

  documentTypes = [
    { value: 'TAZKIRA', label: 'TAZKIRA',ps:"تذکره", dr:"تذکره" },
    { value: 'PASSPORT', label: 'PASSPORT',ps:"پاسپورت", dr:"پاسپورټ" },
    { value: 'VISA', label: 'VISA',ps:"ویزا", dr:"ویزا" }, 
    { value: 'IMAGE', label: 'Image',ps:"انځور", dr:"تصویر"}
  ];
  selectedDocType: string = '';
  genders=[
    {value: 'MALE', label: 'Male',ps:"نارینه", dr:"مرد"},
    {value: 'FEMALE',label: 'Female',ps:"ښځینه", dr:"زن"}
  ]
  selectedGender: string='';
  
  guestTypes=[
    {value: 'NATIONAL', label: 'National', ps: "کورنی", dr: "داخلی"},
    {value: 'FOREIGN',label: 'FOREIGN', ps:"بهرنی",dr:"خارجې"}
  ]

  selectedGuestType: string='';
  uploadedFiles: { document_type: string, name: string, url: string, mime: string, file_size: string, guest: number }[] = [];
  selectedFile: File | null = null;

  public currentLang;
  public page; 
  public size; 


 

  constructor(
    private cdr: ChangeDetectorRef,
    private service: UserListService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toaster: ToastrService, 
    private guestService: GuestService, 
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
    this.getAuthUser()
    this.getCities();
    this.getCountries();
    this.getGuestById()
    this.initializeGuestForm()
    this.initializePermanentAddressForm();
    this.initializeCurrentAddressForm();
    this.initializePassportForm();
    this.initializeVisaForm();
    this.initializeOccupationForm()
    this.selectTab('guest')
    this.cdr.detectChanges();

    this.service.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang
      
    });
    
  }


  public initializeGuestForm() {
    this.guestForm = this.fb.group({
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      last_name: [''],
      
      father_name: ['', Validators.required],
      grand_father_name: ['', Validators.required],
      tazkira: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      phone: ['', Validators.required],
      gender: ['',Validators.required],
      guest_type: ['',Validators.required],
      date_of_entry:['',Validators.required]
    })

  }

  initializePermanentAddressForm() {
    this.permanentAddressForm = this.fb.group({
      city: ['', Validators.required],
      address_type: ['PERMANENT ADDRESS'],
      user: [],
      guest: [],
      district: [''],
      village: [''],
      addr: ['', Validators.required],
      country:[]
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

  initializePassportForm(){
    this.passportForm = this.fb.group({
      number: ['',Validators.required], 
      issue_country: ['',Validators.required],
      issue_date: ['', Validators.required],
      expiry_date: ['', Validators.required],
      guest: ['' , Validators.required]
      
    })
  }
  initializeVisaForm(){
    this.visaForm = this.fb.group({
      number: ['',Validators.required], 
      issue_country: ['',Validators.required],
      issue_date: ['', Validators.required],
      expiry_date: ['', Validators.required],
      guest: [ [], Validators.required]
      
    })
  }
  initializeOccupationForm(){
    this.occupationForm = this.fb.group({
      title: ['',Validators.required], 
      organization: ['',Validators.required],
      location: ['', Validators.required],
      guest: [ , Validators.required]
      
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


  public getCities(){
    this.service.getCities()
    .subscribe({
        next: (data: any) => {
            this.cities = data?.cities;
            this.filteredCities = data?.cities;
        }
    })
  }

  onCountryChange(country: any): void {
    const countryId = country.id
    
      // Filter cities based on the selected country
      this.cities = this.filteredCities.filter(
        (city) => city.country.id === countryId
      );
  }

  public getAuthUser(){
    this.authService.getCurrentUser()
    .subscribe({
      next: (user: any)=>{
        this.role = user?.authenticatedUser?.role?.code;
        
        }
    })
  }
  public getGuestById(){
    this.route.params.subscribe(param => {
      this.guestService.getGuestById(param['id'])
      .subscribe({
          next: (response: any) => {
              this.guestData = response; 
              this.guest_id = this.guestData.guest.id
              
              if(this.guestData?.guest?.guest_type=='FOREIGN'){
                  this.isPassportTabEnabled = true;
                  this.isVisaTabEnabled = true;
                  this.isAddressTabEnabled = false;
                  this.foreingerAddress = true; 
                } else {
                  this.isPassportTabEnabled = false;
                  this.isVisaTabEnabled = false;
                  this.isAddressTabEnabled = true;
                  this.foreingerAddress = false; 
              }
              
              this.cdr.detectChanges();
              // Manually trigger change detection
          },
          complete:() => {
                  this.guestForm.patchValue(this.guestData.guest)
                  if(this.guestData.visas.length>0)
                  {
                  const visa_issue_date = new Date(this.service.convertToFullDate(this.guestData.visas[0].issue_date));
                  const visa_expiry_date = new Date(this.service.convertToFullDate(this.guestData.visas[0].expiry_date));
                   this.visaForm.patchValue(this.guestData.visas[0]),
                   this.visaForm.patchValue({
                     issue_date: visa_issue_date,
                     expiry_date: visa_expiry_date
                   })
                   this.visaUpdate=true; 
                   this.visa_id= this.guestData.visas[0].id
                  }
                  if(this.guestData.passport.length>0){
                    const passport_issue_date = new Date(this.service.convertToFullDate(this.guestData.passport[0].issue_date));
                    const passport_expiry_date = new Date(this.service.convertToFullDate(this.guestData.passport[0].expiry_date));
                    this.passportForm.patchValue(this.guestData.passport[0])
                    this.passportForm.patchValue({
                      issue_date: passport_issue_date,
                      expiry_date: passport_expiry_date
                    })
                    this.passportUpdate=true; 
                    this.passport_id = this.guestData.passport[0].id
                  }
                  if(this.guestData.occupation.length>0){
                    this.occupationForm.patchValue(this.guestData.occupation[0])
                    this.occupationUpdate = true; 
                    this.occupation_id = this.guestData.occupation[0].id
                  }
                    this.getAddressByGuestID(this.guest_id)  


                  },
          error: (err) => {
              console.error('Error fetching guest data:', err);
          }
      });
  });
  }

  public getAddressByGuestID(user_id){
    this.service.getAddressByGuestId(user_id)
    .subscribe({
      next: (addresses: any)=>{
        this.guestAddresses = addresses.addresses_by_guest; 
        const permanentAddresses = this.guestAddresses.filter(address => address.address_type === 'PERMANENT ADDRESS');
        const currentAddresses = this.guestAddresses.filter(address => address.address_type === 'CURRENT ADDRESS');
        if(permanentAddresses && permanentAddresses.length>0){
          
          this.permanentAddressForm.patchValue(permanentAddresses[0])
          this.permanentAddressForm.patchValue({
          city: permanentAddresses[0].city.id,
          country:permanentAddresses[0].city.country.id
          })
          this.updatePermanentAdd = true;
          this.pAddressId= permanentAddresses[0].id; 
        }
        if(currentAddresses && currentAddresses.length>0){
          this.currentAddressForm.patchValue(currentAddresses[0])
          this.currentAddressForm.patchValue({
            city: currentAddresses[0].city.id
          })
          this.updateCurrentAdd= true; 
          this.cAddressId= currentAddresses[0].id; 
        }
        this.cdr.detectChanges();
      }
    })
  }
  limit500(file: File): boolean {
    if (file.size > 500000) {
      alert('File has exceeded 500 kb.')
      return false
    }
    return true
  }

  successFeedBack() {
    this.showMessage = true
    this.status = 'success'
    this.message = 'File uploaded successfully'
    this.dismissMessage()
  }

  failFeedBack() {
    this.showMessage = true
    this.status = 'fail'
    this.message = 'File upload failed'
    this.dismissMessage()
  }

  dismissMessage() {
    setTimeout(() => {
      this.showMessage = false;
      this.status = '';
      this.message = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  onSubmit() {

    switch (this.currentTab) {
      case 'guest':
        this.updateGuest();
        break;
      case 'permanentAddress':
        this.isUpdatePermanentAdd();
        break;
      case 'currentAddress':
        this.isUpdateCurrenttAdd();
        break;
      case 'passport':
        this.isUpdatePassport();
        break;
      case 'occupation':
        this.isUpdateOccupation();
        break;
      case 'visa':
        this.isUpdateVisa();
        break;
      default: 
        break; 
    }
  }

  public isUpdatePermanentAdd(){
    if(!this.updatePermanentAdd){
      this.createPermanentAddress();
      
    }else{
      this.updatePermanentAddress();
    }
  }
  public isUpdateCurrenttAdd(){
    if(!this.updateCurrentAdd){
      this.createCurrentAddress();
    }else{
      this.updateCurrentAddress();
    }
  }

public isUpdatePassport(){
  if(!this.passportUpdate){
    this.createPassport()
  }else{
    this.updatePassport();
  }
}

public isUpdateVisa(){
  if(!this.visaUpdate){
    this.createVisa();
  }else{
    this.updateVisa();
  }
}

public isUpdateOccupation(){
  if(!this.occupationUpdate){
    this.createOccupation(); 
  }else{
    this.updateOccupation();
  }
}


  public createPermanentAddress(){
    this.permanentAddressForm.patchValue({
      guest: this.guest_id
    }
    )
    if (this.permanentAddressForm.valid) {
      this.service.createAddress(this.permanentAddressForm.value)
        .subscribe({
          next: (address: any) => {
            if (address) {
              this.updatePermanentAdd= true;
              this.pAddressId= address?.address?.id
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
            }
          }, error:(err)=> {
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

  public createCurrentAddress(){
    this.currentAddressForm.patchValue({
      guest: this.guest_id
    })
    if (this.currentAddressForm.valid) {

      this.service.createAddress(this.currentAddressForm.value)
        .subscribe({
          next: (address: any) => {
            if (address) {
              this.updateCurrentAdd = true; 
              this.cAddressId= address?.address?.id
              this.translate.get('TR.form_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toaster.success(message, title);
                });
              });
            }
          }, error:(err)=> {
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
    this.guestForm.reset();
  }
  public close() {
    this.router.navigate([`/guests/list`],{ queryParams: { page: this.page, size:this.size} })
  }

  selectTab(tabName: string) {
    this.currentTab = tabName;
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
        
  
        // Check if the document type already exists in userMedia
        const existingMedia = this.guestData.media.find(media => media.document_type === this.selectedDocType);
        
        
  
        if (existingMedia) {
          
          // Update the existing media details
          existingMedia.name = this.selectedFile.name;
          existingMedia.url = fileUrl;
          existingMedia.mime = this.selectedFile.type;
          existingMedia.file_size = String(this.selectedFile.size);
          existingMedia.guest = this.guest_id; 
  
          // Call the API to update the existing media record
          this.guestService.updateGuestDocuments(existingMedia.id, existingMedia).subscribe({
            next: () => {
              this.translate.get('TR.update_success').subscribe((message: string) => {
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
          this.uploadedFiles =[
            {document_type: this.selectedDocType,
              name: this.selectedFile.name,
              url: fileUrl,
              mime: this.selectedFile.type,
              file_size: String(this.selectedFile.size),
              guest: this.guest_id}
          ]

          const uploads = {
            media: this.uploadedFiles
          }
          
  
          // Call the API to create a new media record
          this.guestService.createDocuments(uploads).subscribe({
            next: (createdMedia: any) => {
              
              this.guestData.media.push(createdMedia.media[0]);
              
              this.cdr.detectChanges();
              this.translate.get('TR.form_success').subscribe((message: string) => {
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
  
  updateGuest() {
    if(this.isNidEnabled==false){
      this.guestForm.patchValue({ tazkira: '' });
      this.guestForm.get('tazkira')?.clearValidators();
      this.guestForm.get('tazkira')?.updateValueAndValidity();

    }
    
    if (this.guestForm.valid ) {
      this.guestService.updateGuest(this.guest_id, this.guestForm.value)
        .subscribe(editedGuest => {
          if (editedGuest) {
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
            // this.router.navigate(['/pages/users'])

          }else{
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

  public updatePermanentAddress(){
    if(this.permanentAddressForm.valid){
      this.service.updateAddress(this.pAddressId, this.permanentAddressForm.value)
      .subscribe({
        next: (address:any) =>{
          if(address){
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
           
          }
        }, error(err) {
          if(err.status==400){
            this.translate.get('TR.form_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toaster.error(message, title);
              });
            });
          }else if(err.status == 500){
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toaster.error(message, title);
              });
            });
          }else{
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toaster.error(message, title);
              });
            });
          }
            
        }
      })

    }else{
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toaster.error(message, title);
        });
      });
    }
  }

  public updateCurrentAddress(){
    if(this.currentAddressForm.valid){
      this.service.updateAddress(this.cAddressId, this.currentAddressForm.value)
      .subscribe({
        next: (address:any) =>{
          if(address){
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
          }
        }, error(err) {
          if(err.status==400){
            this.translate.get('TR.form_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toaster.error(message, title);
              });
            });
          }else if(err.status == 500){
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toaster.error(message, title);
              });
            });
          }else{
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toaster.error(message, title);
              });
            });
          }
            
        }
      })

    }else{
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toaster.error(message, title);
        });
      });
    }

  }

  public createPassport(){
    this.passportForm.patchValue({
      guest: this.guest_id
    })
    if(this.passportForm.valid){
      const issue_date=this.service.formatDate(this.passportForm.get('issue_date').value)
      const expiry_date= this.service.formatDate(this.passportForm.get('expiry_date').value)
      this.passportForm.patchValue({
        issue_date: issue_date, 
        expiry_date: expiry_date
      })

      this.guestService.createGuestPassport(this.passportForm.value)
      .subscribe({
        next: (passport: any)=>{
          if(passport){
            this.passportUpdate=true; 
            this.passport_id= passport?.passport?.id
            const passport_issue_date = new Date(this.service.convertToFullDate(passport?.passport.issue_date));
            const passport_expiry_date = new Date(this.service.convertToFullDate(passport?.passport.expiry_date));

            this.passportForm.patchValue(passport)
            this.passportForm.patchValue({
              issue_date:passport_issue_date,
              expiry_date : passport_expiry_date
            })
            this.translate.get('TR.form_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
          }
        },error:(err)=> {
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        },
      })
    }else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toaster.error(message, title);
        });
      });
    }
  }

  public createVisa(){
    this.visaForm.patchValue({
      guest: this.guest_id
    })
    if(this.visaForm.valid){
      const issue_date=this.service.formatDate(this.visaForm.get('issue_date').value)
      const expiry_date= this.service.formatDate(this.visaForm.get('expiry_date').value)
      this.visaForm.patchValue({
        issue_date: issue_date, 
        expiry_date: expiry_date
      })
      this.guestService.createGuestVisa(this.visaForm.value)
      .subscribe({
        next: (visa: any)=>{
          if(visa){
            this.visaUpdate=true;
            this.visa_id= visa?.visa?.id
            const visa_issue_date = new Date(this.service.convertToFullDate(visa?.visa.issue_date));
            const visa_expiry_date = new Date(this.service.convertToFullDate(visa?.visa.expiry_date));

            this.visaForm.patchValue(visa)
            this.visaForm.patchValue({
              issue_date:visa_issue_date,
              expiry_date : visa_expiry_date
            })
            this.translate.get('TR.form_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
          }
        },error:(err)=> {
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        },
      })
    }else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toaster.error(message, title);
        });
      });
    }
  }

  public createOccupation(){
    this.occupationForm.patchValue({
      guest: this.guest_id
    })
    if(this.occupationForm.valid){
      this.guestService.createGuestOccupation(this.occupationForm.value)
      .subscribe({
        next: (occupation: any)=>{
          if(occupation){
            this.occupationUpdate= true; 
            this.occupation_id = occupation?.occupation?.id
            this.translate.get('TR.form_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });

            
          }
        },error:(err)=> {
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        },
      })
    }else {
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toaster.error(message, title);
        });
      });
    }
  }
  public updatePassport(){
    const issue_date =  this.service.formatDate(this.passportForm.get('issue_date').value);
    const expiry_date = this.service.formatDate(this.passportForm.get('expiry_date').value);
    this.passportForm.patchValue({
      issue_date: issue_date, 
      expiry_date: expiry_date,
      guest: this.guest_id
    })
    if(this.passportForm.valid){
      

      this.guestService.updateGuestPassport(this.passport_id, this.passportForm.value)
      .subscribe({
        next: (passport: any)=>{
          if(passport){
            
            const passport_issue_date = new Date(this.service.convertToFullDate(passport?.passport.issue_date));
            const passport_expiry_date = new Date(this.service.convertToFullDate(passport?.passport.expiry_date));

            this.passportForm.patchValue(passport)
            this.passportForm.patchValue({
              issue_date:passport_issue_date,
              expiry_date : passport_expiry_date
            })
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
          }
        },
        error(err) {
        if(err.status==400){
          this.translate.get('TR.form_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        }else if(err.status == 500){
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        }else{
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        }
      }
      })
    }
  }
  public updateVisa(){
    const issue_date =  this.service.formatDate(this.visaForm.get('issue_date').value);
    const expiry_date = this.service.formatDate(this.visaForm.get('expiry_date').value);

    this.visaForm.patchValue({
      issue_date: issue_date, 
      expiry_date: expiry_date,
      guest: this.guest_id
    })

    if(this.visaForm.valid){
      this.guestService.updateGuestVisa(this.visa_id, this.visaForm.value)
      .subscribe({
        next: (visa: any)=>{
          if(visa){
            const visa_issue_date = new Date(this.service.convertToFullDate(visa?.visa.issue_date));
            const visa_expiry_date = new Date(this.service.convertToFullDate(visa?.visa.expiry_date));

            this.visaForm.patchValue(visa)
            this.visaForm.patchValue({
              issue_date:visa_issue_date,
              expiry_date : visa_expiry_date
            })
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
          }
        },
        error(err) {
        if(err.status==400){
          this.translate.get('TR.form_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        }else if(err.status == 500){
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        }else{
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        }
      }
      })
    }
}

  public updateOccupation(){
    this.occupationForm.patchValue({
      guest: this.guest_id
    })
    if(this.occupationForm.valid){
      this.guestService.updateOccupation(this.occupation_id, this.occupationForm.value)
      .subscribe({
        next: (occupation: any)=>{
          if(occupation){
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
          }
        },
        error(err) {
        if(err.status==400){
          this.translate.get('TR.form_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        }else if(err.status == 500){
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        }else{
          this.translate.get('TR.server_err').subscribe((message: string) => {
            this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
              this.toaster.error(message, title);
            });
          });
        }
      }
      })
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
