  import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import Pusher from 'pusher-js';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PusherService {

  private pusher: Pusher;
  private notificationList: any[] = [];
  private notificationsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  private notifications$: Observable<any[]> = this.notificationsSubject.asObservable();




  constructor(private http: HttpClient, private toastr: ToastrService) {

    this.initializePusher();

   }

   private initializePusher() {


    this.pusher = new Pusher('test', {
      cluster: 'ap2',
      forceTLS: true   
    });

    const channel = this.pusher.subscribe('test');
    channel.bind('pusher:subscription_succeeded', () => {
    });

    channel.bind('guest', (data: any) => {
      this.notificationList.push(data);
      this.notificationsSubject.next(this.notificationList);

      this.saveNotification(data).subscribe(

      );
    });
  }


   saveNotification(notification: any): Observable<any> {
    return this.http.post(`${environment.apiUrl}/notifications/`, notification)
  }


  fetchNotifications(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/notifications/`); 
  }


  getNotifications(): Observable<any[]> {
    return this.notifications$;
  }


  public createNotification( data: any){
    return this.http.post(`${environment.apiUrl}/notifications/`, data)
      .pipe(map((notification) => {
        return notification;
      }))
  }

  public deleteNotification(id : number){
    return this.http.put(`${environment.apiUrl}/notifications/${id}`,{is_deleted: true})
    .pipe(map((deleteMedia)=>{
      return deleteMedia;
    }))
  }


public getNotificationListPaginated(page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());
  return this.http.get(`${environment.apiUrl}/notifications/`, {params: params})
    .pipe(map((data: any) => {
      return data?.notifications;
    }));
}


sharedLoadData(
  observable: Observable<any>,
  totalItems: number,
  totalPages: number,
  pageSize: number,
  loadingIndicator: boolean = false,
  showNext: string | boolean,
  callback: (result: any) => void
): void {
  let myList: any = [];
  observable.subscribe({
    next: (data: any) => {

      myList = data?.results || [];

      totalItems = data?.count || 0;
      totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      loadingIndicator = false;

      let pageNumber: number | null = null;

      if (typeof showNext === 'string') {
        const matchResult = showNext.match("[=]");
        if (matchResult) {
          pageNumber = Number(showNext[matchResult.index + 1]) - 1;
        }
      }

      callback({ list: myList, total_items: totalItems, total_pages: totalPages, loadingIndicator: loadingIndicator });
    },
    error: (err: any) => {
      callback({ list: [], total_items: 0, loadingIndicator: false, error: err });
    }
  });
}

public getPaginationArray(tPages: number, cPage: number) {
  const maxPagesToShow = 3;
  const totalPages = tPages; 
  const currentPage = cPage; 
  if (totalPages <= maxPagesToShow + 1) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages = [];
  if (currentPage <= maxPagesToShow) {
    for (let i = 1; i <= maxPagesToShow; i++) {
      pages.push(i);
    }
    pages.push('...', totalPages);
  } else if (currentPage > totalPages - maxPagesToShow) {
    pages.push(1, '...');
    for (let i = totalPages - maxPagesToShow + 1; i <= totalPages; i++) {
      pages.push(i);
    }
  } else {
    pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
  }

  return pages;
}



OriginalData(
  observable: Observable<any>,
  totalItems: number,
  totalPages: number,
  pageSize: number,
  loadingIndicator: boolean = false,
  pages: number[] = [],
  callback: (result: any) => void

): void {
  let allList: any = [];
  observable.subscribe({
    next: (response: any) => {
      allList = response?.results || [];

      totalItems = response?.count || 0;
      totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
      loadingIndicator = false;
      pages = Array.from({ length: totalPages }, (_, i) => i + 1);
      callback({ list: allList, total_items: totalItems, total_pages: totalPages, loadingIndicator: loadingIndicator, allPages: pages });

    },
    error: () => {
      loadingIndicator = false;
      this.toastr.error('Failed To search! Kindly try again','error')

    }
  })
}


public search(searchTerm: string, currentPage: number, pageSize: number) {

  return this.http.get(`${environment.apiUrl}/notifications?search=${searchTerm}&page_size=${pageSize}`)
    .pipe(map((searchValue: any) => {
      return searchValue?.notifications;
    }))
}


SearchResults(
  observable: Observable<any>,
  searchTerm,
  pageSize: number,
  totalItems: number,
  loadingIndicator: boolean = false,
  callback: (result: any) => void
): void {
  let allList: any = [];
  observable.subscribe({
    next: (response: any) => {
      let totalItems = response?.count;
      if (totalItems > pageSize) {
        this.SearchResults(totalItems, searchTerm, null, null, null, null);

      } else {
        allList = response?.results;
      }
      callback({ list: allList, total_items: totalItems, loadingIndicator: loadingIndicator });

    },
    error: () => {
      loadingIndicator = false;
      this.toastr.error('Failed To search!  try again','error')
    }
  })
}

}
