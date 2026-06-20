import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { UserListService } from '../../user-list/user-list.services';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-edit-guest-user',
  templateUrl: './edit-guest-user.component.html',
  styleUrls: ['./edit-guest-user.component.css']
})
export class EditGuestUserComponent implements OnInit {

  public userForm: FormGroup;
  public roles: any[];
  selectedRole: any;
  public userId;
  public closeReason:string='';



  canSeeOptions = [
    { value: 'FOREIGN', label: 'International',ps:'بهرنی',dr:'خارجې' },
    { value: 'NATIONAL', label: 'National',ps:'کورنی',dr:'داخلی' }
  ];
  public currentLang;
  translatedCanSeeOptions: any[] = [];
  selectedCanSee: string[] = [];



  constructor(
    private service: UserListService,
    public bsModalRef: BsModalRef,
    private fb: FormBuilder,
    private router: Router,
    private toaster: ToastrService,
    private translate: TranslateService
  ) { }

  ngOnInit(): void {
    this.getuserById()
    this.initializeUserForm();
    this.getRoles();

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

  public getuserById(){
    this.service.getUserById(this.userId)
    .subscribe({
      next: (response:any)=>{
        const userData = response?.user;


        this.userForm.patchValue(userData)
        this.userForm.patchValue({
          role: userData.role.id,

        })

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
      first_name: ['', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(50)
      ]],
      last_name: [''],
      phone: ['', [Validators.required, Validators.pattern(/^\+93 \d{3} \d{2} \d{4}$/)]],
      role: ['', Validators.required],
      tazkira: ['', [Validators.required, Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
      occupation: ['', Validators.required],
      can_see:[,Validators.required]
    });

  }



  public update(){
    // const dob = this.service.formatDate(this.userForm.get('date_of_birth').value)

    // this.userForm.patchValue({
    //   date_of_birth: dob,
    // })
    if(this.userForm.valid){
      this.service.updateUser(this.userId, this.userForm.value)
      .subscribe({
        next: (response: any)=>{

          if(response){
            this.translate.get('TR.update_success').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toaster.success(message, title);
              });
            });
          }else{
            this.translate.get('TR.server_err').subscribe((message: string) => {
              this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                this.toaster.error(message, title);
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
    }else{
      this.translate.get('TR.form_err').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toaster.error(message, title);
        });
      });
    }
    this.closeReason='success';
    this.bsModalRef.hide();
  }




  public close() {
    this.closeReason = 'close';  // Set the reason
    this.bsModalRef.hide();       // Just hide the modal
  }

  public editGuestUser(){

  }

}
