import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PusherService } from '@app/shared/services/pusher.service';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { TranslateService } from '@ngx-translate/core';
import { ErrorMessage } from 'ng-bootstrap-form-validation';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Editor, Toolbar, Validators } from 'ngx-editor';
import { schema } from 'ngx-editor/schema';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-create-notification-modal',
  templateUrl: './create-notification-modal.component.html',
  styleUrls: ['./create-notification-modal.component.css']
})
export class CreateNotificationModalComponent implements OnInit {

  notificationTypes = [
    { value: 'NOTIFICATION', label: 'NOTIFICATION',ps:'خبرتیا',dr:'اطلاعیه' },
    { value: 'BLACK_LIST', label: 'BLACK LIST',ps:'تور لیست',dr:'لیست سیاه'  }
   
  ];
  selectedNotification: string = '';
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
    private service: PusherService,
    private modalService: BsModalService,
    private fb: FormBuilder,
    private toastr: ToastrService, 
    private translate: TranslateService
  ) {
  }

  ngOnInit() {


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
  }


  public initializeForm() {
    this.notificationFormGroup = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      notification_type: [],
    })
  }






  public close() {
    this.modalService.hide();
  }

  public createNotification() {
    
    if (this.notificationFormGroup.valid) {
      this.service.createNotification( this.notificationFormGroup.value)
        .subscribe({
          next: (data) => {
            if (data) {
              this.translate.get('TR.notification_success').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
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
