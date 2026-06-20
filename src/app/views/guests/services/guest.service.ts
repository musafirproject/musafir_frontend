import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class GuestService {

  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) { }


  public getGuests() {
    return this.http.get(`${environment.apiUrl}/guests/`)
      .pipe(map((guests) => {
        return guests;
      }));
  }

  public getVisaStatus(scope: string, page: number = 1, pageSize: number = 10) {
    return this.http.get(`${environment.apiUrl}/guests/visa-status?scope=${scope}&page=${page}&page_size=${pageSize}`)
      .pipe(map((response: any) => {
        return {
          results: response.results,
          count: response.count,
          next: response.next,
          previous: response.previous
        };
      }));
  }

  public getPerformanceDetails(performanceType: string, page: number = 1, pageSize: number = 10, windowDays: number = 30) {
    return this.http.get(`${environment.apiUrl}/guests/residence-performance?type=${performanceType}&page=${page}&page_size=${pageSize}&window_days=${windowDays}`)
      .pipe(map((response: any) => {
        return response;
      }));
  }
  public getAbnormalGuests(params?: HttpParams): Observable<any> {
    return this.http.get(`${environment.apiUrl}/guests/abnormal`, { params })
      .pipe(
        map((res: any) => res)
      );
  }
  public getGuestByResidenceAndPeriod(residenceId: number, params: any) {
    return this.http.get(`${environment.apiUrl}/guests/guests-by-residence/${residenceId}`, { params })
      .pipe(map((guests) => {
        return guests;
      }));
  }

  public getGuestById(id: number) {
    return this.http.get(`${environment.apiUrl}/guests/${id}`)
      .pipe(map((guest) => {
        return guest;
      }));
  }

  public createGuest(data: any) {
    return this.http.post(`${environment.apiUrl}/guests/`, data)
      .pipe(map((guest) => {
        return guest;
      }))
  }
  public cloneGuest(id: number, data: any) {
    return this.http.post(`${environment.apiUrl}/guests/clone-guest/${id}`, data)
      .pipe(map((guest) => {
        return guest;
      }))
  }

  public updateGuest(id: number, data: any) {

    return this.http.put(`${environment.apiUrl}/guests/${id}`, data)
      .pipe(map((guest) => {
        return guest;
      }));
  }


  public deleteGuest(id: number) {
    return this.http.delete(`${environment.apiUrl}/guests/${id}`)
      .pipe(map((guest) => {

        return guest;
      }))
  }


  public getGuestByPage(page: number) {
    return this.http.get(`${environment.apiUrl}/guests/?page=${page}`)
      .pipe(map((paginatedData) => {
        return paginatedData;
      }))
  }



  // Gust child tables

  public createGuestPassport(data: any) {
    return this.http.post(`${environment.apiUrl}/guests/passports`, data)
      .pipe(map((passport) => {
        return passport;
      }))
  }


  public updateGuestPassport(id: number, data: any) {

    return this.http.put(`${environment.apiUrl}/guests/passports/${id}`, data)
      .pipe(map((passport) => {
        return passport;
      }));
  }
  public createGuestVisa(data: any) {
    return this.http.post(`${environment.apiUrl}/guests/visas`, data)
      .pipe(map((visa) => {
        return visa;
      }))
  }

  public updateGuestVisa(id: number, data: any) {
    return this.http.put(`${environment.apiUrl}/guests/visas/${id}`, data)
      .pipe(map((visa) => {
        return visa;
      }));
  }
  public createGuestOccupation(data: any) {
    return this.http.post(`${environment.apiUrl}/guests/occupations`, data)
      .pipe(map((occupation) => {
        return occupation;
      }))
  }

  public updateOccupation(id: number, data: any) {
    return this.http.put(`${environment.apiUrl}/guests/occupations/${id}`, data)
      .pipe(map((occupation) => {
        return occupation;
      }));
  }

  public createDocuments(data: any) {
    return this.http.post(`${environment.apiUrl}/guests/media`, data)
      .pipe(map((media) => {
        return media;
      }))
  }

  public updateGuestDocuments(id: number, data: any) {

    return this.http.put(`${environment.apiUrl}/guests/media/${id}`, data)
      .pipe(map((media) => {
        return media;
      }))
  }

  public getGuestHistory(nid, phone, passport) {
    return this.http.get(`${environment.apiUrl}/guests/guest-histories?nid=${nid}&phone=${phone}&passport=${passport}`)
      .pipe(map((guestHistory) => {
        return guestHistory;
      }))
  }





  /// for pagination

  public getGuestListPaginated(page: number, size: number) {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('page_size', size.toString());
    return this.http.get(`${environment.apiUrl}/guests/`, { params: params })
      .pipe(map((data: any) => {

        return data?.guests;
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

        // Callback to notify the caller that the data is ready
        callback({ list: myList, total_items: totalItems, total_pages: totalPages, loadingIndicator: loadingIndicator });
      },
      error: (err: any) => {
        // Callback with error if needed
        callback({ list: [], total_items: 0, loadingIndicator: false, error: err });
      }
    });
  }

  public getPaginationArray(tPages: number, cPage: number) {
    const maxPagesToShow = 3;
    const totalPages = tPages; // total pages send from the component
    const currentPage = cPage; // current page sent from the component
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
        this.toastr.error('Failed To search! Kindly try again', 'error')

      }
    })
  }


  public search(searchTerm: string, currentPage: number, pageSize: number) {

    return this.http.get(`${environment.apiUrl}/guests?search=${searchTerm}&page_size=${pageSize}`)
      .pipe(map((searchValue: any) => {
        return searchValue?.guests;
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
        this.toastr.error('Failed To search!  try again', 'error')
      }
    })

  }


  public advanceSearch(data: any, page: number, size: number) {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('page_size', size.toString());

    return this.http.post(
      `${environment.apiUrl}/guests/search-guest`,
      data,   // request body (filters)
      { params }  // query params (pagination)
    ).pipe(
      map((data: any) => {
        return data;
      })
    );
  }


}
