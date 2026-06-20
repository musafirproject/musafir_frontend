import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable, of, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';
import { Select } from '@ngxs/store';
import { AppConfig } from '@app/shared/types/app-config.interface';

@Injectable({
  providedIn: 'root'
})
export class UserListService {

      @Select((state: { app: AppConfig; }) => state.app) app$: Observable<AppConfig>;

      getCurrentLang$(): Observable<string> {
        return this.app$.pipe(
          map(app => app.lang) 
        );
      }





  constructor(
    private http: HttpClient,
    private toastr: ToastrService
  ) { }




  public getUsersList() {
    return this.http.get(`${environment.apiUrl}/common/users`)
      .pipe(map((user) => {
        return user
      }))
  }
  public getGuestUsersList() {
    return this.http.get(`${environment.apiUrl}/common/guest-users`)
      .pipe(map((user) => {
        return user
      }))
  }
  public getUnpaginatedUsers() {
    return this.http.get(`${environment.apiUrl}/common/unpaginated-users`)
      .pipe(map((user) => {
        return user
      }))
  }

  public getUserById(id: number) {
    return this.http.get(`${environment.apiUrl}/common/users/${id}`)
      .pipe(map((user) => {
        return user;
      }))
  }

  public createUser(data: any) {
    return this.http.post(`${environment.apiUrl}/common/users`, data)
      .pipe(map((user) => {
        return user;
      }))
  }
  public resetPassword(user_id:number) {
    return this.http.post(`${environment.apiUrl}/common/reset-password/${user_id}`, {})
      .pipe(map((passwordReset) => {
        return passwordReset;
      }))
  }
  getRoles() {
    return this.http.get(`${environment.apiUrl}/common/roles`)
      .pipe(map((roles) => {
        return roles;
      }))
  }

  updateUser(id: number, data: any) {
    return this.http.put(`${environment.apiUrl}/common/users/${id}`, data)
      .pipe(map((user) => {
        return user;
      }))
  }

  softDeleteUser(id: number) {
    return this.http.put(`${environment.apiUrl}/common/users/${id}`, { is_deleted: true })
      .pipe(map((users) => {
        return users;
      }))
  }

  deleteUserRegistration(id: number){
    return this.http.delete(`${environment.apiUrl}/common/users/${id}`)
    .pipe(map((deleteUser)=>{
      return deleteUser;
    }))
  }



  public getUsersByPage(page: number){
    return this.http.get(`${environment.apiUrl}/core/users?page=${page}`)
      .pipe(map((paginatedData) => {
        return paginatedData;
      }))
  }


  getCities() {
    return this.http.get(`${environment.apiUrl}/bases/cities`)
      .pipe(map((cities) => {
        return cities;
      }))
  }
  getCountries() {
    return this.http.get(`${environment.apiUrl}/bases/countries`)
      .pipe(map((cities) => {
        return cities;
      }))
  }

  public upload(data: any) {
    return this.http.post(`${environment.apiUrl}/common/file-uploads`,data)
      .pipe(map((file) => {
        return file;
      }))
  }

  getUserByEmail(email: string) {
    return this.http.get(`${environment.apiUrl}/common/users-by-email/${email}`)
      .pipe(map((user) => {
        return user;
      }))
  }
  getAddressByUserId(user_id: string) {
    return this.http.get(`${environment.apiUrl}/bases/addresses-by-user/${user_id}`)
      .pipe(map((address) => {
        return address;
      }))
  }

  getAddressByGuestId(guest_id: string) {
    return this.http.get(`${environment.apiUrl}/bases/addresses-by-guest/${guest_id}`)
      .pipe(map((address) => {
        return address;
      }))
  }


  getMediaByUserId(user_id: string) {
    return this.http.get(`${environment.apiUrl}/common/media-by-user/${user_id}`)
      .pipe(map((address) => {
        return address;
      }))
  }

  public completeRegistration(user_id: number, data: any){
    return this.http.post(`${environment.apiUrl}/common/register/${user_id}/details/`,data)
    .pipe(map((userDetails)=>{
      return userDetails;
    }))

  }
  public createAddress(data: any){
    return this.http.post(`${environment.apiUrl}/bases/addresses`, data)
    .pipe(map((address)=>{
      return address;
    }))
  }

  public updateAddress(id: number, data: any){
    return this.http.put(`${environment.apiUrl}/bases/addresses/${id}`, data)
    .pipe(map((address) => {
      return address;
    }))
  }

  public createDocuments(data: any){
    return this.http.post(`${environment.apiUrl}/common/media`, data)
    .pipe(map((media)=>{
      return media;
    }))
  }

  public updateUserDocuments(id: number, data: any){

    return this.http.put(`${environment.apiUrl}/common/media/${id}`,data)
    .pipe(map((media)=>{
      return media;
    }))
  }

  //logs api

  public getLogs() {
    return this.http.get(`${environment.apiUrl}/activity-logs/`)
      .pipe(map((logs) => {
        return logs
      }))
  }
  //
  public deleteLog(ids : number[]){
    return this.http.post(`${environment.apiUrl}/activity-logs/bulk-delete`,{'ids':ids} )
    .pipe(map((deletelog)=>{
      return deletelog;
    }))
  }



  formatDate(dateString: string): string {
    const date = new Date(dateString); // Parse the date string

    const year = date.getFullYear();  // Get the full year (e.g., 2024)
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Get the month (0-indexed, so add 1) and pad with leading zero if needed
    const day = String(date.getDate()).padStart(2, '0');  // Get the day of the month and pad with leading zero if needed



    return `${year}-${month}-${day}`;  // Construct the formatted date string
}

convertToFullDate(dateString: string): string {
  const dateParts = dateString.split('-');
  const year = parseInt(dateParts[0], 10);
  const month = parseInt(dateParts[1], 10) - 1; // Months are 0-based in JavaScript
  const day = parseInt(dateParts[2], 10);

  // Create a new Date object using the extracted parts
  const date = new Date(year, month, day);
  // Convert the date back to the full string format
  return date.toString(); // This returns a format like "Wed May 14 1986 04:30:00 GMT+0430 (Afghanistan Time)"
}

// delete media

public deleteUser(id : number){
  return this.http.put(`${environment.apiUrl}/bases/delete-user/${id}`,{is_deleted: true})
  .pipe(map((deleteMedia)=>{
    return deleteMedia;
  }))
}

// getHotels() {
//   return this.http.get(`${environment.apiUrl}/residences/unpaginaed-hotels`)
//     .pipe(map((hotels) => {
//       return hotels;
//     }))
// }


  private hotelCache: any = null;
 getHotels(): Observable<any> {
    // If we already have the hotels cached, return them as an Observable
    if (this.hotelCache) {
      return of(this.hotelCache);
    }
    // Otherwise, call API and cache the result
    return this.http.get(`${environment.apiUrl}/residences/unpaginaed-hotels`).pipe(
      tap((res: any) => this.hotelCache = res)
    );
  }

  // Optional: to manually clear cache
  clearHotelCache() {
    this.hotelCache = null;
  }








createUserHotel(data: any){
  return this.http.post(`${environment.apiUrl}/residences/user-hotels`,data)
  .pipe(map((userHotel)=>{
    return userHotel;
  }))

}

updateUserHotel(id: number, data: any){
  return this.http.put(`${environment.apiUrl}/residences/user-hotels/${id}`, data)
  .pipe(map((userHotel)=>{
    return userHotel;
  }))
}

deleteUserHotel(user_id: number){
  return this.http.delete(`${environment.apiUrl}/residences/delete-user-hotels/${user_id}`)
  .pipe(map((deleteUserHotel)=>{
    return deleteUserHotel;
  }))
}

getUserHotelByUserId(user_id: string) {
  return this.http.get(`${environment.apiUrl}/residences/user-hotels-byuser/${user_id}`)
    .pipe(map((userHotel) => {
      return userHotel;
    }))
}

public assignHotel(data: any) {
  return this.http.post(`${environment.apiUrl}/reports/guest-user-accounts`, data)
    .pipe(map((assign) => {
      return assign;
    }))
}
public getAssignedHotels(user) {
  return this.http.get(`${environment.apiUrl}/reports/guest-user-hotels/${user}`)
    .pipe(map((assignedHotels) => {
      return assignedHotels;
    }))
}
public updateAssignedHotels(guestUserAccountId, payload) {
  return this.http.put(`${environment.apiUrl}/reports/guest-user-accounts/${guestUserAccountId}`, payload)
    .pipe(map((assignedHotels) => {
      return assignedHotels;
    }))
}


public getLogsPaginated(page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());
  return this.http.get(`${environment.apiUrl}/activity-logs/`, {params: params})
    .pipe(map((data: any) => {
      return data?.activity_logs;
    }));
}

// search for logs

public searchLogs(searchTerm: string, currentPage: number, pageSize: number) {

  return this.http.get(`${environment.apiUrl}/activity-logs?search=${searchTerm}&page_size=${pageSize}`)
    .pipe(map((searchValue: any) => {
      return searchValue?.activity_logs;
    }))
}

/// for pagination

public getUserListPaginated(page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());
  return this.http.get(`${environment.apiUrl}/common/users`, {params: params})
    .pipe(map((data: any) => {
      return data?.users;
    }));
}
public getGuestUserListPaginated(page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());
  return this.http.get(`${environment.apiUrl}/common/guest-users`, {params: params})
    .pipe(map((data: any) => {
      return data?.users;
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
      this.toastr.error('Failed To search! Kindly try again','error')

    }
  })
}


public search(searchTerm: string, currentPage: number, pageSize: number) {

  return this.http.get(`${environment.apiUrl}/common/users-list?search=${searchTerm}&page_size=${pageSize}`)
    .pipe(map((searchValue: any) => {
      return searchValue?.users;
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

public advanceSearchGuestUser(data: any) {
  return this.http.post(`${environment.apiUrl}/common/user-search`, data)
    .pipe(map((users) => {
      return users;
    }))
}

 public advanceSearch(data: any, page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());

  return this.http.post(
    `${environment.apiUrl}/common/user-search`,
    data,   // request body (filters)
    { params }  // query params (pagination)
  ).pipe(
    map((data:any) => {
      return data;
    })
  );
}
}
