import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { AuthService } from '@app/views/auth/auth.service';
import { DeletemodelComponent } from '@app/views/auth/modals/deletemodel/deletemodel.component';
import { UserListService } from '@app/views/auth/user-list/user-list.services';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { TranslateService } from '@ngx-translate/core';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { delay } from 'rxjs';

@Component({
  selector: 'app-black-list',
  templateUrl: './black-list.component.html',
  styleUrls: ['./black-list.component.css']
})
export class BlackListComponent implements OnInit {

   temp = [];
    selected = [];
    blackListData = []
    columnMode: ColumnMode = ColumnMode.force;
    SelectionType = SelectionType;
    showSearchFields: boolean = false;
    public searchForm: FormGroup;
    rowHeight: 'auto' | number = 'auto'
    scrollbarH: boolean = false
    public isSmallScreen: boolean = false;

    public loadingIndicator = true;
    public searchTerm:string = '';
    public totalItems: number = 0;
    public currentPage: number = 1;
    public pageSize: number = 10;
    public totalPages: number = 0;
    public pages: number[] = [];
    public showPrevious: boolean = true;
    public showNext:string | boolean = true;
    public showPagination: boolean = true;
    public pageSizeOptions : number[] = [10,20,30,50,100];
    @ViewChild(DatatableComponent) table: DatatableComponent;

    public bsModalRef: BsModalRef;

    public currentLang;
    public role;


    constructor(
      private router: Router,
      private userService: UserListService,
      private modalService: BsModalService,
      private service: SettingsServiceService,
      private cdr: ChangeDetectorRef,
      private toastr:ToastrService,
      private authService: AuthService,
      private translate: TranslateService,
      private fb: FormBuilder,

      private screenSizeSvc: ScreenSizeService) {
      this.screenSizeSvc.onResize$.pipe(delay(0)).subscribe(sizes => {
        const sizeTabletAbove = sizes.includes(SCREEN_SIZE.XXL) || sizes.includes(SCREEN_SIZE.XL) || sizes.includes(SCREEN_SIZE.LG)
        if (sizeTabletAbove) {
          this.rowHeight = 'auto'
          this.scrollbarH = false
          this.columnMode = ColumnMode.force;
        } else {
          this.rowHeight = 68
          this.scrollbarH = true
          this.columnMode = ColumnMode.force;
        }
        this.cdr.markForCheck()
      });


    }

    @HostListener('window:resize', ['$event']) windowResize(event) {
      this.getScreenWidth(event.target.innerWidth)
    }
    ngOnInit(): void {
      this.checkScreenSize();
      this.initializeSearch()
      this.getAuthUser();
      this.fetch();
      this.loadPaginatedData();

      this.userService.getCurrentLang$().subscribe(lang => {
        this.currentLang = lang

      });
      this.cdr.detectChanges();
    }

    initializeSearch(){
      this.searchForm = this.fb.group({
        name:[''],
        last_name: [''],
        father_name: [''],
        grand_father_name: [''],
        nid: ['', [ Validators.pattern(/^[0-9]{4}-[0-9]{4}-[0-9]{5}$/)]],
        phone: [''],
        passport: [''],
      })
    }

        @HostListener('window:resize', ['$event'])
      onResize(event: UIEvent): void {
        this.checkScreenSize();
      }

      private checkScreenSize(): void {
        if (typeof window !== 'undefined') {
          this.isSmallScreen = window.innerWidth < 768; // small screen breakpoint
        }
      }

    public getAuthUser(){
      this.authService.getCurrentUser()
      .subscribe({
        next: (user: any)=>{
          this.role = user?.authenticatedUser?.role?.code;
          this.cdr.detectChanges();

          }
      })
    }

    fetch() {
      this.service.getBlackLists()
        .subscribe({
          next: (data: any) => {

            this.blackListData = data.blacklist?.results;


            this.cdr.markForCheck();
          }
        })

    }
    getScreenWidth(size: number) {
      this.screenSizeSvc.onResize(size)
    }


    public create(){
      this.router.navigate([`guests/create-blacklist`])
    }

    openModal(id: number) {
      this.bsModalRef = this.modalService.show(DeletemodelComponent);
      // Subscribe to the onHide event to get the result from the modal
      this.bsModalRef.onHide.subscribe(() => {
        const modalContent = this.bsModalRef?.content;
        if (modalContent && modalContent.result === 'yes') {
          this.deleteBlackList(id); // Perform the delete operation


        }
      });
    }

  public deleteBlackList(id: number){
      this.service.deleteBlackList(id)
      .subscribe({
          next: (Delete: any)=>{
              if(Delete.success=='Record Deleted'){
                this.translate.get('TR.delete_msg').subscribe((message: string) => {
                  this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                    this.toastr.success(message, title);
                  });
                });

                  this.blackListData = this.blackListData.filter(val => val.id !== id);
                  this.cdr.detectChanges()


              }
          }
      })

  }




  public loadPaginatedData() {
    this.service.sharedLoadData(
      this.service.getBlackListPaginated(this.currentPage, this.pageSize),
      this.totalItems,
      this.totalPages,
      this.pageSize,
      this.loadingIndicator,
      this.showNext,
      (result: any) => {
        this.blackListData = result?.list;
        this.totalItems = result?.total_items;
        this.loadingIndicator = result?.loadingIndicator;
        this.totalPages = result?.total_pages;
        this.cdr.detectChanges();
      }
    );

  }

  public setPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadPaginatedData();
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    }
  }

  public getPaginationArray() {
    return this.service.getPaginationArray(this.totalPages, this.currentPage);
  }

  public firstPage() {
    this.setPage(1);
  }
  public lastPage() {
    this.setPage(this.totalPages);
  }
  public previous() {
    if (this.currentPage > 1) {
      this.setPage(this.currentPage - 1);
      this.loadPaginatedData();
    }
  }

  public next() {
    if (this.currentPage < this.totalPages) {
      this.setPage(this.currentPage + 1);
      this.loadPaginatedData();
    }
  }

  public itemsPerPage(event: any) {
    const pageSize = parseInt(event.target.value, 10);
    if (!isNaN(pageSize) && pageSize > 0) {
      this.pageSize = pageSize;
      this.currentPage = 1; // reset to first page
      this.loadPaginatedData();
      this.cdr.detectChanges();
      window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll to top
    }
  }


  // Toggle function to show/hide search fields
  toggleSearchFields() {
    this.showSearchFields = !this.showSearchFields;
  }

  public advanceSearch(){
    this.service.advanceSearchBalcList(this.searchForm.value)
    .subscribe({
      next: (response: any)=>{
        if(response?.blacklist?.count == 0){

          this.translate.get('TR.search_notify').subscribe((message: string) => {
            this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
              this.toastr.warning(message, title);
            });
          });
          this.blackListData= [];
          this.cdr.detectChanges();
        }

        this.blackListData = response?.blacklist?.results;


        this.showPagination= false;
        this.cdr.detectChanges()


      }
    })

  }
  public reset(){
    this.searchForm.reset();
    this.cdr.detectChanges();
  }


}
