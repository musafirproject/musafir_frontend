import { ChangeDetectorRef, Component, HostListener, OnInit, ViewChild } from '@angular/core';
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import { SettingsServiceService } from '@app/views/settings/service/settings-service.service';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { delay } from 'rxjs/operators';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '@app/views/auth/auth.service';
import { TranslateService } from '@ngx-translate/core';
import { DeletemodelComponent } from '@app/views/auth/modals/deletemodel/deletemodel.component';
import { EditZoneComponent } from '../edit-zone/edit-zone.component';
import { ViewZoneComponent } from '../view-zone/view-zone.component';

@Component({
  selector: 'app-list-zones',
  templateUrl: './list-zones.component.html',
  styleUrls: ['./list-zones.component.css']
})
export class ListZonesComponent implements OnInit {

  temp = [];
  selected = [];
  zonesData = []
  public role; 
  public settingsId;
  columnMode: ColumnMode = ColumnMode.force;
  SelectionType = SelectionType;
  rowHeight: 'auto' | number = 'auto'
  scrollbarH: boolean = false

  // Pangination Attributes
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


  constructor(
    private router: Router,
    private modalService: BsModalService,
    private service: SettingsServiceService,
    private cdr: ChangeDetectorRef,
    private toastr:ToastrService,
    private authService: AuthService,
    private translate: TranslateService,
    private screenSizeSvc: ScreenSizeService) {this.screenSizeSvc.onResize$.pipe(delay(0)).subscribe(sizes => {
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
    this.getAuthUser();
    this.fetch();
    this.loadPaginatedData();
  }

  fetch() {
    this.service.getZoneListData()
      .subscribe({
        next: (data: any) => {
          
          this.zonesData = data.zones?.results;
          
          this.cdr.markForCheck();
        }
      })

  }
  getScreenWidth(size: number) {
    this.screenSizeSvc.onResize(size)
  }

  public getAuthUser(){
    this.authService.getCurrentUser()
    .subscribe({
      next: (user: any)=>{
        this.role = user?.authenticatedUser?.role?.code;
        }
    })
  }

  
  public createZone(){
    this.router.navigate([`settings/create-zone`])
  }

  public viewzone(row) {
    this.bsModalRef = this.modalService.show(ViewZoneComponent,{
      backdrop:'static',
      keyboard: false,
      initialState:{
        zoneData: row
      }
    })
    // this.router.navigate([`settings/zone/${id}/view`])
  }
  public editzone(id:number) {
    
    this.bsModalRef = this.modalService.show(EditZoneComponent, 
      {
        backdrop: 'static',
        keyboard: false, 
        initialState:{
          zoneId: id,
        }
      }
    )

    
  }

  openModal(id: number) {
    this.bsModalRef = this.modalService.show(DeletemodelComponent);

    

    // Subscribe to the onHide event to get the result from the modal
    this.bsModalRef.onHide.subscribe(() => {
      const modalContent = this.bsModalRef?.content;
      if (modalContent && modalContent.result === 'yes') {
        this.deleteZone(id); // Perform the delete operation

        
      }
    });
  }

public deleteZone(id: number){
    this.service.deleteZone(id)
    .subscribe({
        next: (zonedelete: any)=>{
            if(zonedelete){
              this.translate.get('TR.delete_msg').subscribe((message: string) => {
                this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
                  this.toastr.success(message, title);
                });
              });
               
                this.zonesData = this.zonesData.filter(hotel => hotel.id !== id);
                this.cdr.detectChanges()
                
                
            }
        }
    })

}


public loadPaginatedData() {
  this.service.sharedLoadData(
    this.service.getZoneListPaginated(this.currentPage, this.pageSize),
    this.totalItems,
    this.totalPages,
    this.pageSize,
    this.loadingIndicator,
    this.showNext,
    (result: any) => {
      this.zonesData = result?.list;
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


public searchZone(){
  this.loadingIndicator = true;
  this.zonesData = [];
  if(!this.searchTerm){
    this.showPagination = true;
    this.currentPage = 1;
    this.loadOriginalData();
  }else{
    this.showPagination = false;
    this.fetchSearchResults(this.searchTerm, 10);
  }
  this.searchTerm = '';
}
private loadOriginalData(){    
  this.service.OriginalData(
    this.service.searchZone('', this.currentPage, this.pageSize),
    this.totalItems,
    this.totalPages,
    this.pageSize,
    this.loadingIndicator,
    this.pages,
    (result: any) => {                  
      this.zonesData = result?.list;
      this.totalItems = result?.total_items;
      this.totalPages = result?.total_pages;
      this.loadingIndicator = result?.loadingIndicator;
      this.pages = result?.allPages;
      this.cdr.detectChanges();

      }
    );
}
private fetchSearchResults(searchTerm, pageSize: number){
  const page = 1;
  this.service.SearchResults(
    this.service.searchZone(searchTerm, page, pageSize),
    this.searchTerm,
    this.totalItems,
    this.pageSize,
    this.loadingIndicator,
    (result: any) => {
      this.zonesData = result?.list;
      this.totalItems = result?.total_items;
      this.loadingIndicator = result?.loadingIndicator;
      this.cdr.detectChanges();
    }
  )
}



}
