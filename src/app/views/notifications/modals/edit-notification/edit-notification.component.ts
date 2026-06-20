import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Editor, Toolbar, Validators, toDoc, toHTML } from 'ngx-editor';
import { ToastrService } from 'ngx-toastr';
import { schema } from 'ngx-editor/schema';


@Component({
  selector: 'app-edit-notification',
  templateUrl: './edit-notification.component.html',
  styleUrls: ['./edit-notification.component.css']
})
export class  EditNotificationComponent implements OnInit {

  public notificationData;
  public customers$ = [];
  public selectedCustomers = [];
  public customersId: any[] = [];
  public bsModalRef: BsModalRef;
  public error: ErrorMessage[] = [
    {
      error: 'required',
      format: (label, error) => `${label.toUpperCase()} IS REQUIRED!`
    },
  ];
  editor: Editor;
  html: '';
  toolbar: Toolbar = [
    ['bold', 'italic'],
    ['underline', 'strike'],
    ['code', 'blockquote'],
    ['ordered_list', 'bullet_list'],
    [{ heading: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }],
    ['link', 'image'],
    ['text_color', 'background_color'],
    ['align_left', 'align_center', 'align_right', 'align_justify'],
  ]
  public notificationFormGroup: FormGroup;
  constructor(
    private settingService: SettingsServiceService,
    private userService: UserListService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {
  }

  ngOnInit() {
    this.userService.getUsersList()
      .subscribe({
        next: (users: any) => {
          this.customers$ = users?.results?.filter((val) => {
            return val?.user_type == 'C';
          })
        }
      })

    this.editor = new Editor({
      content: '',
      plugins: [],
      schema,
      nodeViews: {},
      history: true,
      keyboardShortcuts: true,
      inputRules: true,
    });

    this.initializeForm();
    this.notificationFormGroup.patchValue({
      title: this.notificationData?.title,
    });
    this.html = toDoc(this.notificationData?.message).content[0].content[0].text;
    this.selectedCustomers = this.customers$


  }


  public initializeForm() {
    this.notificationFormGroup = this.fb.group({
      title: ['', Validators.required],
      message: ['', Validators.required],
      status: [],
      notification_type: [],
      user_notifications: []
    })
  }

  combinedNames(customers: any[]): string[] {
    return customers.map(customer => `${customer.first_name} ${customer.last_name}`);
  }

  clearModel() {
    this.selectedCustomers = [];
  }

  changeModel() {
    this.selectedCustomers = [{ name: 'ALL CUSTOMERS' }];

  }

  public onChange(event: Event) {
    this.customers$.push(event)

  }

  public close() {
    this.modalService.hide();
  }

  public editNotification() {
    if (this.notificationFormGroup.valid) {

      this.customers$.forEach((el: any) => {
        if (el.id != null && el.id != undefined) {
          this.customersId.push({ "user_id": el.id, "is_seen": false });
        }
      })

      this.notificationFormGroup.patchValue({
        status: 'DELIVERED',
        notification_type: 'info',
        user_notifications: this.customersId
      })

      this.settingService.updateConfiguration('notifications',this.notificationFormGroup.value, this.notificationData?.id)
        .subscribe({
          next: (data) => {
            if (data) {
              this.toastr.success('Notification Updated Successfully.', 'Success', { easeTime: 100 });
              this.modalService.hide();
            }
          }
        })

    }

  }


  public onReset() {
    this.notificationFormGroup.reset();
  }


}
