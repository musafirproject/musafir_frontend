import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserListService } from '../../user-list.services';
import { ToastrService } from 'ngx-toastr';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AwsMediaService } from '@app/shared/services/aws-media.service';
import { AuthService } from '@app/views/auth/auth.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { PasswordResetModalComponent } from '@app/views/auth/modals/password-reset-modal/password-reset-modal.component';

@Component({
  selector: 'app-view-user',
  templateUrl: './view-user.component.html',
  styleUrls: ['./view-user.component.css'],
   animations: [
    trigger('collapse', [
      state('collapsed', style({
        height: '0',
        opacity: '0',
        overflow: 'hidden',
        display: 'none'
      })),
      state('expanded', style({
        height: '*',
        opacity: '1',
        overflow: 'visible',
        display: 'block'
      })),
      transition('expanded <=> collapsed', [
        animate('300ms ease-in-out')
      ])
    ])
  ]
})
export class ViewUserComponent implements OnInit {

  public userData: any = [];
  public user_id;
  public currentLang;
  public userAddresses: any[] = [];
  public userMedia: any[] = [];
  public userHotel: any[] = []; // Initialize with an empty array
  public page;
  public size;
  public role;
    public bsModalRef: BsModalRef;



  hotelsCollapsed = true;
  addressesCollapsed = false;
  documentsCollapsed = false;
  public isModalOpen = false;
  public selectedMedia: any = null;
  public isPdf = false;
  public pdfUrl: SafeResourceUrl | null = null; // sanitized URL
  public loadingPdf = false;
  public pdfIframeHeight: string = '80vh'; // default
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: UserListService,
    public cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private translate: TranslateService,
    private mediaService: AwsMediaService,
    private sanitizer: DomSanitizer,
    private authService: AuthService,
    private bsModalService: BsModalService



  ) { }

  ngOnInit(): void {
    this.getAuthUser();
    this.route.queryParams.subscribe({
      next: (response: any) => {
        this.page = response?.page
        this.size = response?.size
      }
    })
    this.route.params.subscribe(param => {
      this.service.getUserById(param['id'])
        .subscribe({
          next: (response: any) => {
            this.userData = response.user;
            this.user_id = this.userData.id
            this.cdr.detectChanges();
            // Manually trigger change detection
          },
          complete: () => {
            this.getAddressByUserID(this.user_id)
            this.getMediaByUserID(this.user_id)
            this.getuserHotelByUserID(this.user_id)

          },
          error: (err) => {
            console.error('Error fetching user data:', err);
          }
        });
    });

    this.service.getCurrentLang$().subscribe(lang => {
      this.currentLang = lang

    });
    this.cdr.detectChanges();

  }


  public getAuthUser() {
    this.authService.getCurrentUser()
      .subscribe({
        next: (user: any) => {
          this.role = user?.authenticatedUser?.role?.code
        }
      })
  }

  private stripDomain(input?: string | null): string {
    if (!input) return '';

    let path = String(input).trim();

    // Remove only protocol + domain, keep the path (e.g., /media/...)
    path = path.replace(/^https?:\/\/[^/]+/i, '');

    // Decode once to fix legacy %2520 → %20 → space, etc.
    try { path = decodeURIComponent(path); } catch { }

    // Ensure it starts with a slash for consistency
    if (path && path[0] !== '/') path = '/' + path;

    return path; // e.g. "/media/sharif id card comp(0).pdf"
  }

  public openMediaViewer(media: any) {
    this.selectedMedia = media;

    // Normalize path from either url or name (legacy data might store full URL)
    const pathFromUrl = this.stripDomain(media?.url);
    const pathFromName = this.stripDomain(media?.name);
    const mediaPath = pathFromUrl || pathFromName;   // e.g. "/media/file.pdf"

    const filename = mediaPath.split('/').pop() || '';
    const extension = filename.split('.').pop()?.toLowerCase();
    this.isPdf = extension === 'pdf';

    this.pdfUrl = null;
    this.loadingPdf = this.isPdf;

    if (this.isPdf) {
      // Pass the path (with /media/...), NOT a full URL
      this.mediaService.getSignedUrl(mediaPath).subscribe({
        next: (url) => {
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
          this.loadingPdf = false;
          this.isModalOpen = true;
        },
        error: () => { this.loadingPdf = false; },
      });
    } else {
      // For images, just use the relative path (served by your backend)
      // this.imageSrc = mediaPath;     // e.g. "/media/photo.jpg"
      this.isModalOpen = true;
    }
  }


  public close(role: any) {
    if(role != 'Guest') {
      this.router.navigate(['/pages/users'], { queryParams: { page: this.page, size: this.size } })
    }else{
      this.router.navigate(['/pages/guestusers'], { queryParams: { page: this.page, size: this.size } })
    }
  }

  openPasswordReset(id: number) {
      this.bsModalRef = this.bsModalService.show(PasswordResetModalComponent);
      this.bsModalRef.onHide.subscribe(() => {
        const modalContent = this.bsModalRef?.content;
        if (modalContent && modalContent.result === 'yes') {
          this.resetPassword(id);


        }
      });
    }

    public resetPassword(id: number) {
      this.service.resetPassword(id)
        .subscribe({
          next: (response: any) => {
            if (response.detail == 'User not found.') {
              this.translate.get('TR.no_user').subscribe((message: string) => {
                this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
                  this.toastr.error(message, title);
                });
              });
            } else {
              this.translate.get('TR.password_reset').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
            }
          }
        })
    }

  public getAddressByUserID(user_id) {
    this.service.getAddressByUserId(user_id)
      .subscribe({
        next: (addresses: any) => {

          this.userAddresses = addresses.addresses_by_user;
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

  public getuserHotelByUserID(user_id: string) {
    if (this.userData.role.code === 'sub_admin') {
      this.service.getHotels().subscribe({
        next: (response: any) => {
          const hotels = response.hotels || [];


          // Filter by created_by
          const filteredHotels = hotels.filter(val => val.created_by === String(user_id));

          // Normalize data
          this.userHotel = this.normalizeHotelData(filteredHotels);

          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error fetching hotels for sub_admin:', err);
          this.userHotel = [];
          this.cdr.detectChanges();
        }
      });
    } else if (this.userData.role.code === 'guest_care') {
      this.service.getUserHotelByUserId(user_id).subscribe({
        next: (response: any) => {
          const userHotels = response?.user_hotels || [];


          // Normalize data
          this.userHotel = this.normalizeHotelData(userHotels);

          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error fetching hotels for guest_care:', err);
          this.userHotel = [];
          this.cdr.detectChanges();
        }
      });
    } else {
      // For other roles or no role match
      this.userHotel = [];
      this.cdr.detectChanges();
    }
  }

  /**
   * Normalize data to a consistent format for the template.
   */
  private normalizeHotelData(data: any[]): { title: string }[] {
    return data.map(item => {
      if (item.title) {
        // Format 1: Direct hotel data
        return { title: item.title, id: item.id };
      } else if (item.hotel?.title) {
        // Format 2: Nested hotel data

        return { title: item.hotel.title, id: item.hotel.id };
      }
      return { title: 'Unknown Hotel' }; // Fallback for unexpected formats
    });
  }



  public activate() {
    this.service.updateUser(this.user_id, { is_active: true })
      .subscribe({
        next: (updateUser: any) => {
          if (updateUser) {
            this.translate.get('TR.user_activatioin').subscribe((message: string) => {
              this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                this.toastr.success(message, title);
              });
            });
            this.router.navigate([`/pages/users`]);
          }
        }
      })
  }

  public getFileIcon(name: string) { }

  toggleSection(section: 'hotels' | 'addresses' | 'documents') {
    switch (section) {
      case 'hotels':
        this.hotelsCollapsed = !this.hotelsCollapsed;
        break;
      case 'addresses':
        this.addressesCollapsed = !this.addressesCollapsed;
        break;
      case 'documents':
        this.documentsCollapsed = !this.documentsCollapsed;
        break;
    }
  }

  // Update the scrollToSection method to expand the section
  scrollToSection(section: string) {
    // Expand the section first
    if (section === 'addresses' && this.addressesCollapsed) {
      this.toggleSection('addresses');
    } else if (section === 'documents' && this.documentsCollapsed) {
      this.toggleSection('documents');
    }

    // Then scroll to it
    setTimeout(() => {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 350)
  }

  public closeModal() { this.isModalOpen = false };
  public getFileSize(size: any) {
    return size;
  }
}
