import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { StaffService } from '../../service/staff.service';
import { AuthService } from '@app/views/auth/auth.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AwsMediaService } from '@app/shared/services/aws-media.service';

@Component({
  selector: 'app-view-staff',
  templateUrl: './view-staff.component.html',
  styleUrls: ['./view-staff.component.css']
})
export class ViewStaffComponent implements OnInit {
  public staffData: any = [];
    public staff_id;
    public staffAddresses: any[] = [];
    public staffMedia: any[] = [];
    public role;
    public currentLang;
    public page;
    public size;

    isModalOpen = false;
      selectedMedia: any = null;
      isPdf = false;
      pdfUrl: SafeResourceUrl | null = null; // sanitized URL
      loadingPdf = false;
      pdfIframeHeight: string = '80vh'; // default

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserListService,
    public cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private translate: TranslateService,
    private service: StaffService,
    private authService: AuthService,
    private sanitizer: DomSanitizer,
    private mediaService: AwsMediaService,

  ) { }

  ngOnInit(): void {

     this.route.queryParams.subscribe({
      next: (response: any)=>{
        this.page= response?.page
        this.size = response?.size
      }
    })
    this.route.params.subscribe(param => {
      this.service.getStaffById(param['id'])
      .subscribe({
          next: (response: any) => {
              this.staffData = response.staff;
              this.staff_id = this.staffData.id
              this.cdr.detectChanges();
          },
          complete:() => {
                    this.getAddressByStaffID(this.staff_id)
                    this.getMediaByStaffID(this.staff_id)

                  },
          error: (err) => {
              console.error('Error fetching user data:', err);
          }
      });
  });
  this.getAuthUser();
  this.userService.getCurrentLang$().subscribe(lang => {
    this.currentLang = lang

  });
  this.cdr.detectChanges();
  }

  public getAuthUser(){
    this.authService.getCurrentUser()
    .subscribe({
      next: (user: any)=>{
        this.role = user?.authenticatedUser?.role?.code


      }
    })
  }


  public close(){
    this.router.navigate(['/staff/list'],{ queryParams: { page: this.page, size:this.size }})
  }

  public getAddressByStaffID(staff_id){
    this.service.getAddressByStaffId(this.staff_id)
    .subscribe({
      next: (addresses: any)=>{

        this.staffAddresses = addresses.addresses_by_staff;
        this.cdr.detectChanges();



      }
    })

  }

  public getMediaByStaffID(staff_id){
    this.service.getMediaByStaffId(staff_id)
    .subscribe({
      next: (media: any)=>{
        this.staffMedia=media.media_by_staff;
        this.cdr.detectChanges();


      }
    })
  }



  public activate(){
    this.service.updateStaff(this.staff_id, {is_approved: true})
    .subscribe({
      next: (updatStaff: any)=>{
        if(updatStaff){
          this.translate.get('TR.staff_approved').subscribe((message: string) => {
            this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
              this.toastr.success(message, title);
            });
          });
          this.router.navigate([`/staff/list`]);
        }
      }
    })
  }


  // openMediaViewer(media: any) {
  //   this.selectedMedia = media;
  //   const extension = media?.name?.split('.').pop()?.toLowerCase();
  //   this.isPdf = extension === 'pdf';
  //   this.pdfUrl = null;
  //   this.loadingPdf = this.isPdf;

  //   if (this.isPdf) {
  //     // Get signed URL
  //     this.mediaService.getSignedUrl(media.url).subscribe({
  //       next: (url) => {
  //         // Sanitize the URL for iframe
  //         this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  //         this.loadingPdf = false;
  //         this.isModalOpen = true; // open modal only after URL is ready
  //       },
  //       error: (err) => {
  //         console.error('Failed to get signed PDF URL', err);
  //         this.loadingPdf = false;
  //       },
  //     });
  //   } else {
  //     // For images
  //     this.isModalOpen = true;
  //   }
  // }

  updateIframeHeight() {
  const headerHeight = 70; // approximate modal header in px
  const availableHeight = window.innerHeight - headerHeight - 60; // 60px padding
  this.pdfIframeHeight = availableHeight + 'px';
}

// Add these methods to your component class

public previewDocument(media: any): void {
  const extension = media?.name?.split('.').pop()?.toLowerCase();

  if (['pdf', 'doc', 'docx'].includes(extension)) {
    this.openMediaViewer(media);
  } else {
    // For images, open in a lightbox preview
    this.openMediaViewer(media);
  }
}

public downloadDocument(media: any): void {
  if (!media?.url) return;

  // Create a temporary link and trigger download
  const link = document.createElement('a');
  link.href = media.url;
  link.download = media.name;
  link.target = '_blank';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Show download success message
  this.translate.get('TR.document_download_started').subscribe((message: string) => {
    this.toastr.info(message);
  });
}

public getFileIcon(filename: string): string {
  if (!filename) return 'fa-file';

  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return 'fa-file-pdf text-danger';
    case 'doc':
    case 'docx':
      return 'fa-file-word text-primary';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return 'fa-file-image text-success';
    case 'xls':
    case 'xlsx':
      return 'fa-file-excel text-success';
    case 'zip':
    case 'rar':
      return 'fa-file-archive text-warning';
    default:
      return 'fa-file text-secondary';
  }
}

public scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

public onImageLoad(event: any): void {
}

public onPdfLoad(): void {

}

// Update the existing openMediaViewer method
public openMediaViewer(media: any): void {
  this.selectedMedia = media;
  const extension = media?.name?.split('.').pop()?.toLowerCase();
  this.isPdf = extension === 'pdf';
  this.pdfUrl = null;
  this.loadingPdf = this.isPdf;

  this.updateIframeHeight(); // Update height before opening

  if (this.isPdf) {
    this.mediaService.getSignedUrl(media.url).subscribe({
      next: (url) => {
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        this.loadingPdf = false;
        this.isModalOpen = true;
      },
      error: (err) => {
        console.error('Failed to get signed PDF URL', err);
        this.loadingPdf = false;
        this.translate.get('TR.document_load_error').subscribe((message: string) => {
          this.toastr.error(message);
        });
      },
    });
  } else {
    this.isModalOpen = true;
  }
}

  closeModal() {
    this.isModalOpen = false;
    this.selectedMedia = null;
    this.pdfUrl = null;
    this.isPdf = false;
    this.loadingPdf = false;
  }

}
