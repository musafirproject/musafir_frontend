import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { UserListService } from '../../user-list/user-list.services';
import { ColumnMode, DatatableComponent, SelectionType } from '@swimlane/ngx-datatable';
import { SCREEN_SIZE } from '@app/shared/types/screen-size.enum';
import { delay } from 'rxjs';
import { ScreenSizeService } from '@app/shared/services/screen-size.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ViewLogsComponent } from '../view-logs/view-logs.component';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-list-logs',
  templateUrl: './list-logs.component.html',
  styleUrls: ['./list-logs.component.css']
})
export class ListLogsComponent implements OnInit {

  public logsData;
  temp = [];
  selected = [];
  columnMode: ColumnMode = ColumnMode.force;
  SelectionType = SelectionType;
  rowHeight: 'auto' | number = 'auto'
  scrollbarH: boolean = false;
  public selectedIds;
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
  public pageSizeOptions : number[] = [10,20,30,50,100,500,1000];
  public bsModalRef: BsModalRef;


  @ViewChild(DatatableComponent) table: DatatableComponent;


  constructor(
    private service: UserListService,
    private screenSizeSvc: ScreenSizeService,
    private cdr: ChangeDetectorRef,
    private bsModalService: BsModalService,
    private translate: TranslateService,
    private toastr: ToastrService



  ) {
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
    }); }

  ngOnInit(): void {
    this.getLogs();
    this.loadPaginatedData();
    this.cdr.detectChanges();
  }

  public getLogs(){
    this.cdr.markForCheck();
    this.service.getLogs()
    .subscribe({
      next: (logData: any)=>{
        this.logsData = logData.activity_logs.results
        this.cdr.markForCheck();
      }
    })
  }

  public viewlogs(row) {
    this.bsModalRef = this.bsModalService.show(ViewLogsComponent, {
        backdrop: 'static',
        keyboard: false,
        initialState: {
            data: row
        },
        class: 'modal-xl' // Specifies a larger modal size
    });
}




public loadPaginatedData() {
  this.service.sharedLoadData(
    this.service.getLogsPaginated(this.currentPage, this.pageSize),
    this.totalItems,
    this.totalPages,
    this.pageSize,
    this.loadingIndicator,
    this.showNext,
    (result: any) => {
      this.logsData = result?.list;
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


public search(){
  this.loadingIndicator = true;
  this.logsData = [];
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
    this.service.searchLogs('', this.currentPage, this.pageSize),
    this.totalItems,
    this.totalPages,
    this.pageSize,
    this.loadingIndicator,
    this.pages,
    (result: any) => {
      this.logsData = result?.list;
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
    this.service.searchLogs(searchTerm, page, pageSize),
    this.searchTerm,
    this.totalItems,
    this.pageSize,
    this.loadingIndicator,
    (result: any) => {
      this.logsData = result?.list;
      this.totalItems = result?.total_items;
      this.loadingIndicator = result?.loadingIndicator;
      this.cdr.detectChanges();
    }
  )
}
onSelect({ selected }) {
  this.selected.splice(0, this.selected.length);
  this.selected.push(...selected);
  this.selectedIds = this.selected.map(item => item.id);

}

public delete(){
  this.service.deleteLog(this.selectedIds)
  .subscribe({
    next:(deleted:any)=> {
      this.translate.get('TR.delete_msg').subscribe((message: string) => {
        this.translate.get('TR.SUCCESS_TITLE').subscribe((title: string) => {
          this.toastr.success(message, title);
        });
      });
      this.ngOnInit();

    }, error:(err)=> {
      this.translate.get('TR.server_error_address').subscribe((message: string) => {
        this.translate.get('TR.ERROR_TITLE').subscribe((title: string) => {
          this.toastr.error(message, title);
        });
      });


    },


  })

}



}
