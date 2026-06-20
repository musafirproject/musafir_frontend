import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { UserListService } from '../user-list/user-list.services';
import { ToastrService } from 'ngx-toastr';
import { AppConfig } from '@app/shared/types/app-config.interface';
import { Observable } from 'rxjs';
import { Select, Store } from '@ngxs/store';
import { TranslateService } from '@ngx-translate/core';
import { UpdateCurrentLanguage } from '@app/store/app-config/app-config.action';
import { supportedLanguages } from '@app/configs/i18n.config';
import { Tooltip } from 'bootstrap';


@Component({
    selector: 'register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[class.header-nav-item]': 'true'
    }
})
export class RegisterComponent implements OnInit {

    @Select((state: { app: AppConfig; }) => state.app) app$: Observable<AppConfig>;
    currentLang: string;
    languageList = []


    step1Form: FormGroup;
    step2Form: FormGroup;
    step3Form: FormGroup;
    step4Form: FormGroup;
    // step5Form: FormGroup;
    hotelForm: FormGroup; 
    public userCreated: boolean = false;
    public userUpdated: boolean = false; 
    currentStep = 1;
    userId: number;
    userHotelId: number; 
    public roles; 
    // public selectedRole;
    public cities; 
    public hotels; 

    public userData; 
    documentTypes = [
        { value: 'TAZKIRA', label: 'TAZKIRA' },
        { value: 'PASSPORT', label: 'PASSPORT' },
        { value: 'JAWAZ', label: 'JAWAZ' }
      ];
      
      selectedDocType: string = '';
      uploadedFiles: { document_type: string, name: string, url: string, mime: string,file_size:string, user: number }[] = [];
      selectedFile: File | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private authService:AuthService,
        private userService: UserListService,
        private router:Router,
        private toaster: ToastrService, 
        private store: Store, 
        private translateService: TranslateService,
    ) { }

    ngOnInit(): void { 
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.forEach((tooltipTriggerEl) => {
          new Tooltip(tooltipTriggerEl);
        });
      

        this.getLanguageList()
        this.app$.subscribe(app => {
            this.currentLang = app.lang;
        });
        this.initializeStep1Form();
        this.initializeStep2Form();
        this.initializeStep3Form();
        this.initializeStep4Form();
        this.initializeHotelForm(); 
        // this.initializeStep5Form();
        // this.getRoles();
        this.getCities();
        this.getHotels();
    }

    getLanguageList() {
        let list = []
        for (const key in supportedLanguages) {
            if (Object.prototype.hasOwnProperty.call(supportedLanguages, key)) {
                const lang = supportedLanguages[key];
                list.push({
                    key: key,
                    lang: lang
                })
            }
        }
        
        this.languageList = list
    }

    setLanguage(language: string) {
        
        
        this.store.dispatch(new UpdateCurrentLanguage(language));
        this.translateService.use(language);
    }



    initializeStep1Form() {
        this.step1Form = this.formBuilder.group({
            first_name: ['', Validators.required],
            last_name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            phone: ['', [Validators.required, Validators.pattern(/^\+93 \d{3} \d{2} \d{4}$/)]],
            password: ['', [
              Validators.required,
              Validators.minLength(8),
              Validators.pattern(/^(?=.*[!@#$%^&*()_+-=])(?=.*[A-Z]).*$/)
            ]],
            confirm_password: ['', Validators.required],
            is_active: [false]



        });
      }

    initializeStep2Form() {
        this.step2Form = this.formBuilder.group({
            father_name:['', Validators.required],
            grand_father_name: ['', Validators.required],
            tazkira: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
            occupation: ['',Validators.required], 
            date_of_birth: ['',Validators.required], 
            role: [3],  
            image: ['', Validators.required]

            
        });
    }

    initializeStep3Form() {
        this.step3Form = this.formBuilder.group({
            city: ['', Validators.required],
            address_type: ['PERMANENT ADDRESS'], 
            user: [],
            guest: [],
            district: ['',Validators.required],
            village: ['',Validators.required],
            addr: ['', Validators.required]
        });
    }
    
    initializeStep4Form() {
        this.step4Form = this.formBuilder.group({
            city: ['', Validators.required],
            address_type: ['CURRENT ADDRESS'], 
            user: [],
            guest: [],
            district: ['',Validators.required],
            village: ['',Validators.required],
            addr: ['', Validators.required]
        });
    }

    initializeHotelForm(){
        this.hotelForm = this.formBuilder.group({
            hotel: ['', Validators.required]
        })
    }
   

    public getCities(){
        this.userService.getCities()
        .subscribe({
            next: (cities:any) =>{
                
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
    nextStep() {
        if (this.isCurrentStepValid()) {
            this.currentStep++;
        } else {
            this.toaster.error('Please complete the current form before proceeding.','Failed!');
        }

    }
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
        }
    }
    uploadImage(event: any) {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);
            this.userService.upload(formData).subscribe({
                next: (response: any) => {
                    // Update the form with the image URL
                    this.step2Form.get('image')?.setValue(response.url);
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
          this.toaster.error('Select a Document Type, Then Upload the Document','Failed!');
        }
      }
    
      uploadFile() {
        const formData = new FormData();
        formData.append('file', this.selectedFile!);
      
        this.userService.upload(formData).subscribe({
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
      
      (document.querySelector('input[type="file"]') as HTMLInputElement).value = '';
          },
          error: () => {
            this.toaster.error('Failed to upload file. Please try again.','Failed!');
          }
        });
      }


    saveStep1() {
        if(this.step1Form.valid){

            const email= this.step1Form.get('email').value; 
            this.userService.getUserByEmail(email)
            .subscribe({
                next: (user: any)=>{
                    this.userData = user?.user_by_email;
                    
                    
                }, complete:() => {
                    if(this.userData[0]?.is_deleted==true){
                        this.toaster.error('User with this email already exists de-activated by admin, Try with different email', 'error')
                        return; 
                    }
                    if(email===this.userData[0]?.email){
                        this.userId = this.userData[0]?.id
                        this.update()
                        
                    }else{
                        this.register()
                    }
                }, error :(err)=> {

                    
                    
                },
            }) 
        }else{
            this.toaster.error( 'Error in Form Entries, Make Sure You Have Provided the Correct Data!','Failed')
        }

    }
    public register(){
        if (this.step1Form.valid && this.hotelForm.valid) {
            if (this.step1Form.get('password').value === this.step1Form.get('confirm_password').value) {
                
            this.authService.register(this.step1Form.value)
            .subscribe({
                next: (response: any)=>{
                    if(response && response.data){
                        this.userId = response.data.id; 
                        this.userCreated = true; 
                        this.createUserHotel(); 
                        this.nextStep()
                        this.toaster.success( 'All set! Your Information Has Been Successully Saved.','Success')
                    }
                }, 
                error :(err) => {
                    this.toaster.error('Error in Saving the Registration Data','Failed')
                },
            })
            } else {
                this.toaster.error('Looks like the passwords don’t match. Please try again and make sure they’re identical!!', 'Failed!')
            }
        } else {
            this.toaster.error( 'Oops! Something went wrong. Please double-check your entries.','Failed!')
        }
    }

    private createUserHotel() {
        const hotel = this.hotelForm.get('hotel').value;
    
        if (this.userCreated || this.userUpdated) {
            this.userService.createUserHotel({ user: this.userId, hotel: hotel }).subscribe({
                next: (userhotel: any) => {
                    if (userhotel) {
                        this.userHotelId = userhotel.user_hotel?.id;
                    }
                },
                error: (err) => {
                    this.toaster.error('Error in specifying User Hotel, Complete the form and try again ');
                    this.rollbackUserCreation();
                }
            });
        }
    }

    
    private rollbackUserCreation() {
        if (this.userId) {
            this.userService.deleteUserRegistration(this.userId).subscribe({
                next: () => {
                    this.toaster.success('User creation rolled back successfully.', 'Rolled Back');
                },
                error: (err) => {
                    this.toaster.error('Failed to roll back user creation. Please contact support.', 'Error');
                }
            });
        }
    }

    isCurrentStepValid(): boolean {
        switch (this.currentStep) {
            case 1:
                return this.step1Form.valid;
            case 2:
                return this.step2Form.valid;
            case 3:
                return this.step3Form.valid;
            case 4:
                return this.step4Form.valid;
            // case 5:
            //     return this.step5Form.valid;
            default:
                return false;
        }
    }

    public update(){
        this.deleteUserHotel(this.userId); 

        if(this.step1Form.valid && this.hotelForm.valid){
            if(this.step1Form.get('password').value === this.step1Form.get('confirm_password').value){
                this.userService.updateUser(this.userId, this.step1Form.value)
                    .subscribe({
                        next: (editUser: any) => {
                            if (editUser) {
                                this.userUpdated = true;
                                this.createUserHotel(); 
                                this.nextStep()
                                this.toaster.success( 'All set! Your Information Has Been Successully Updated.','Success!',)
                            }
                        }, error(err) {
                            this.toaster.error( 'Error in Updating the Registration Data','Failed',)
                        },
                    })

            }else{
                this.toaster.error('Looks like the passwords don’t match. Please try again and make sure they’re identical!!', 'Failed!')
            }
            
        }else{
            this.toaster.error('Oops! Something went wrong. Please double-check your entries','Failed!')
        }
    
    }

    submitFinalStep() {
        this.patchFormValues();
       
        const addresses = [
            {

                ...this.step3Form.value,
            },
            {

                ...this.step4Form.value
            }
        ]    
        const finalData = {
            userId: this.userId,
            ...this.step2Form.value,
            addresses:addresses, 
            media: this.uploadedFiles
        
        };


        this.userService.completeRegistration(this.userId, finalData)
        .subscribe({
            next: (response: any)=>{
                if(response){
                    this.toaster.success('Your Registrations has been completed! For Activating You Account visit the Office of the Application Owner with Your NID','Success!')
                    this.router.navigate(['/login']);
                }else{

                    this.toaster.error('Registration Failed, Make Suer, You Have Provided All The Required Data','Failed!')
                }
            }, error(err) {
                this.toaster.error('Registration Failed, Make Suer, You Have Provided All The Required Data','Failed!',)
            }
        })
    }

    patchFormValues(){
        // this.step2Form.patchValue({
        //     role: this.selectedRole
        // }) 
        this.step3Form.patchValue({
            user: this.userId
        })
        this.step4Form.patchValue({
            user: this.userId
        })
        const dob= this.userService.formatDate(this.step2Form.get('date_of_birth').value)
        this.step2Form.patchValue({
        date_of_birth: dob
        })
    }
 

    public deleteUserHotel(user_id: number){
        
        this.userService.deleteUserHotel(user_id)
        .subscribe({
            next: (response: any)=>{
                 
            }
        })

    }


}
