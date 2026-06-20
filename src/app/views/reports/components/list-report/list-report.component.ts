import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { HexToRGB } from '@app/shared/utils/HexToRGB';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { GuestReportModalComponent } from '../../modals/guest-report-modal/guest-report-modal.component';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { ReportService } from '../../service/report.service';
import { RequestProgressService } from '@app/shared/services/request-progress.service';
import { finalize, Observable, switchMap, tap } from 'rxjs';
import { AuthService } from '@app/views/auth/auth.service';

@Component({
  selector: 'app-list-report',
  templateUrl: './list-report.component.html',
  styleUrls: ['./list-report.component.css']
})
export class ListReportComponent implements OnInit {

  selectedCategory: string = 'Navigation';
  public role: any;
  hexToRGB = HexToRGB;
  reportServiceState$: Observable<any>;
  public bsModalRef: BsModalRef;
  constructor(
    private modalService: BsModalService,
    private userService: UserListService,
    private reportService: ReportService,
    private progress: RequestProgressService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getAuthUser();
    this.reportServiceState$ = this.progress.state$
  }

  public getAuthUser() {
    this.authService.getCurrentUser()
      .subscribe({
        next: (user: any) => {
          this.role = user?.authenticatedUser?.role?.code;
          this.cdr.markForCheck();

        }
      })
  }

  public guestByTypeReport() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static', // Prevent closing on backdrop click
      keyboard: false,
      initialState: {
        guest_type: true,
        guest_gender: false,
        staff_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'Guest Report By Guest Type'
      }


    })

    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }
      const modalContent = this.bsModalRef?.content.guestForm.value;

      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (start_date != null && end_date != null) {
        // list-report.component.ts (inside the bsModalRef.onHide handler)
        this.reportService
          .startAsyncReport(
            this.reportService.createGuestRangeReport(
              modalContent.format,
              'Guest Range Report',
              start_date ?? null,
              end_date ?? null,
              modalContent.guest_type ?? null
            ),
            'Guest report'
          )
          .subscribe(); // fire-and-forget; overlay handles UI


      } else {
        this.reportService
          .startAsyncReport(
            this.reportService.createGuestRangeReport(
              modalContent.format,
              'Guest Range Report',
              start_date ?? null,
              end_date ?? null,
              modalContent.guest_type ?? null
            ),
            'Guest report'
          )
          .subscribe(); // the service will auto-download on success

      }

    });

  }


  private startAsyncReport(create$: Observable<{ status_url: string }>, filenameHint?: string) {
    create$.pipe(
      tap(() => {
        this.progress.setLabel('Queuing…');
      }),
      switchMap(res => this.reportService.pollJob(res.status_url)),
      tap(status => {
        if (status.status === 'finished') {
          // show 100% and start the download
          this.progress.setPercent(100);
          this.progress.setLabel('Downloading…');

          const url = status.file_url!;
          // simplest: open in the same tab; or use anchor to preserve name
          const a = document.createElement('a');
          a.href = url;
          a.rel = 'noopener';
          a.download = filenameHint || ''; // the S3 Content-Disposition will supply correct name
          document.body.appendChild(a);
          a.click();
          a.remove();

          // clear soon after
          setTimeout(() => this.progress.clear(), 1200);
        } else if (status.status === 'failed') {
          this.progress.setLabel('Failed');
          setTimeout(() => this.progress.clear(), 1500);
          console.error('Report failed:', status.error_message);
        }
      }),
      finalize(() => {
        // If stream ends unexpectedly
        // leave progress as-is; caller can decide to clear
      })
    ).subscribe({
      error: (e) => {
        console.error(e);
        this.progress.setLabel('Failed');
        setTimeout(() => this.progress.clear(), 1500);
      }
    });
  }

  public guestByGenderReport() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: true,
        guest_hotel: false,
        staff_gender: false,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'Guest Report By Guest Gender'
      }
    });

    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') return;

      const modalContent = this.bsModalRef?.content.guestForm.value;

      const start_date =
        modalContent.start_date && modalContent.start_date !== ''
          ? this.userService.formatDate(modalContent.start_date)
          : null;

      const end_date =
        modalContent.end_date && modalContent.end_date !== ''
          ? this.userService.formatDate(modalContent.end_date)
          : null;

      // Fire-and-forget async job; the service handles polling + download
      this.reportService
        .startAsyncReport(
          this.reportService.createGuestRangeReportByGender(
            modalContent.format as 'pdf' | 'excel',
            'Guest Range Report By Guest Gender',
            start_date,
            end_date,
            modalContent.guest_gender ?? null
          ),
          'Guest report by gender'
        )
        .subscribe();
    });
  }


  public guestByHotel() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: true,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_gender: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'Guest Report By Hotel'
      }
    });

    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') return;

      const modalContent = this.bsModalRef?.content.guestForm.value;

      const start_date =
        modalContent.start_date && modalContent.start_date !== ''
          ? this.userService.formatDate(modalContent.start_date)
          : null;

      const end_date =
        modalContent.end_date && modalContent.end_date !== ''
          ? this.userService.formatDate(modalContent.end_date)
          : null;

      const hotelId = modalContent.guest_hotel ?? null;

      // Queue async job; service will poll + download when done
      this.reportService
        .startAsyncReport(
          this.reportService.createGuestRangeReportByHotel(
            modalContent.format as 'pdf' | 'excel',
            'Guest Range Report By Hotel',
            start_date,
            end_date,
            hotelId
          ),
          'Guest report by hotel'
        )
        .subscribe();
    });
  }


  public topResidencesReport() {
  this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
    backdrop: 'static',
    keyboard: false,
    initialState: {
      
      top_residence: true,
      title: 'Top Residences Performance'
    }
  });

  this.bsModalRef.onHide.subscribe(() => {
    if (this.bsModalRef.content.closeReason === 'close') return;

    const form = this.bsModalRef?.content.guestForm?.value ?? {};

    // Fallbacks if your modal doesn’t have these fields yet:
    const format: 'pdf' | 'excel' = (form.format as 'pdf' | 'excel') || 'excel';
    const windowDays: number = Number(form.window_days ?? 30);
    const topN: number = Number(form.top_n ?? 10);
    const includeZero: boolean = !!form.include_zero;

    // Fire-and-forget; your ReportService handles polling + download
    this.reportService
      .startAsyncReport(
        this.reportService.createTopResidenceReport(format, windowDays, topN, includeZero),
        'Top Residences'
      )
      .subscribe();
  });
}
  public guestByResidence() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: false,
        guest_resident: true,
        guest_user: false,
        staff: false,
        staff_gender: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'Guest Report By Guest Residence Type'
      }
    })

    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }
      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (start_date != null && end_date != null) {
        this.reportService.createGuestRangeReportByResidnece(modalContent.format, 'Guest Range Report By Residence', start_date, end_date, modalContent.guest_resident)
      } else {
        this.reportService.createGuestDailyReportByResidence(modalContent.format, 'Guest Daily Report By Residence', start_date, modalContent.guest_resident)
      }

    });

  }

  public guestByCity() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: true,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_gender: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'Guest Report By Guest City'
      }
    })

    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }
      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (start_date != null && end_date != null) {
        this.reportService.createGuestRangeReportByCity(modalContent.format, 'Guest Range Report Bt Guest City', start_date, end_date, modalContent.city, modalContent.address_type)
      } else {
        this.reportService.createGuestDailyReportByCity(modalContent.format, 'Guest Daily Report Bt Guest City', start_date, modalContent.city, modalContent.address_type)
      }

    });
  }

  public guestByUser() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: true,
        staff: false,
        staff_gender: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'Guest Report By Guest User'
      }
    })
    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }
      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (start_date != null && end_date != null) {
        this.reportService.createGuestRangeReportByUser(modalContent.format, 'Guest Range Report Bt Guest User', start_date, end_date, modalContent.user)
      } else {
        this.reportService.createGuestDailyReportByUser(modalContent.format, 'Guest Daily Report Bt Guest User', start_date, modalContent.user)
      }

    });

  }



  public Staff() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: true,
        staff_gender: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'Staff Report'
      }
    })
    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }
      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }


      if (start_date != null && end_date != null) {
        this.reportService.createStaffRangeReport(modalContent.format, 'Staff Range Report ', start_date, end_date)
      } else if (start_date != null) {

        this.reportService.createStaffDailyReport(modalContent.format, 'Staff Daily Report ', start_date)
      } else {
        this.reportService.createStaffTotalReport(modalContent.format, 'Staff Total Report')
      }

    });

  }

  // Staff report by hotel

  public StaffbyHotel() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_gender: false,
        staff_hotel: true,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'Staff Report by Hotel'
      }
    })
    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }
      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (start_date != null && end_date != null) {
        this.reportService.createStaffbyHotelRangeReport(modalContent.format, 'Staff Range Report by hotel', start_date, end_date, modalContent.guest_hotel)
      } else {
        this.reportService.createStaffbyHotelDailyReport(modalContent.format, 'Staff Daily Report by hotel', start_date, modalContent.guest_hotel)
      }

    });

  }
  public StaffbyHotelType() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_gender: false,
        staff_hotel: false,
        staff_hotel_type: true,
        hotel: false,
        zone: false,
        title: 'Staff Report by Hotle Type'
      }
    })
    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }
      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (start_date != null && end_date != null) {
        this.reportService.createStaffbyHotelTypeRangeReport(modalContent.format, 'Staff Range Report Bt residence', start_date, end_date, modalContent.guest_resident)
      } else {
        this.reportService.createStaffbyHotelTypeDailyReport(modalContent.format, 'Staff Daily Report By resitence', start_date, modalContent.guest_resident)
      }

    });

  }
  public StaffbyGender() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_gender: true,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'Staff Report by Gender'
      }
    })
    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }
      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (start_date != null && end_date != null) {
        this.reportService.createStaffbyGenderRangeReport(modalContent.format, 'Staff Range Report By gender', start_date, end_date, modalContent.guest_gender)
      } else {
        this.reportService.createStaffbyGenderDailyReport(modalContent.format, 'Staff Daily Report By gender', start_date, modalContent.guest_gender)
      }

    });

  }
  public hotelReport() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_gender: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: true,
        zone: false,
        title: 'Residencies Report'
      }
    })
    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }

      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (modalContent.guest_resident != null && (start_date != null && end_date != null)) {

        this.reportService.createResidencebyTypeRangeReport(modalContent.format, 'Residence Range Report Bt type', start_date, end_date, modalContent.guest_resident)
      } else if (start_date != null && end_date != null) {
        this.reportService.createResidenceRangeReport(modalContent.format, 'Residence Range Report', start_date, end_date)
      } else if (start_date != null && modalContent.guest_resident != null) {

        this.reportService.createResidencebyTypeDailyReport(modalContent.format, 'Residence Daily Report by Type', start_date, modalContent.guest_resident)
      } else {
        this.reportService.createResidenceDailyReport(modalContent.format, 'Residence Daily Report', start_date)
      }

    });

  }
  public guestByZone() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: false,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_gender: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: true,
        title: 'Guest Report by Zone'
      }
    })
    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }

      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (start_date != null && end_date != null) {

        this.reportService.createGuestByZoneRangeReport(modalContent.format, 'Guest by Zone Range Report', start_date, end_date, modalContent.zone)
      } else {
        this.reportService.createGuestByZoneDailyReport(modalContent.format, 'Guest by Zone Daily Report', start_date, modalContent.zone)
      }



    });

  }
  public guestByCountry() {
    this.bsModalRef = this.modalService.show(GuestReportModalComponent, {
      backdrop: 'static',
      keyboard: false,
      initialState: {
        guest_type: false,
        guest_gender: false,
        guest_hotel: false,
        guest_city: false,
        guest_country: true,
        guest_resident: false,
        guest_user: false,
        staff: false,
        staff_gender: false,
        staff_hotel: false,
        staff_hotel_type: false,
        hotel: false,
        zone: false,
        title: 'guest by report by country'
      }
    })
    this.bsModalRef.onHide.subscribe(() => {
      if (this.bsModalRef.content.closeReason === 'close') {
        return; // Exit without making any API call
      }

      const modalContent = this.bsModalRef?.content.guestForm.value;
      let start_date;
      let end_date;
      if (modalContent.start_date != '') {
        start_date = this.userService.formatDate(modalContent.start_date)
      }
      if (modalContent.end_date != '') {
        end_date = this.userService.formatDate(modalContent.end_date)
      }

      if (start_date != null && end_date != null) {

        this.reportService.createGuestByCountryRangeReport(modalContent.format, 'Guest by Country Range Report', start_date, end_date, modalContent.country, modalContent.address_type)
      } else {
        this.reportService.createGuestByCountryDailyReport(modalContent.format, 'Guest by Country Daily Report', start_date, modalContent.country, modalContent.address_type)
      }



    });

  }


}
