import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { stat } from 'fs';
import { ToastrService } from 'ngx-toastr';
import { map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StaffService {

  constructor(private http: HttpClient, private toastr: ToastrService) { }


  public getStaffList() {
    return this.http.get(`${environment.apiUrl}/residences/staff?page_size=10`)
      .pipe(map((staff) => {
        return staff
      }))
  }

  public getStaffById(id: number) {
    return this.http.get(`${environment.apiUrl}/residences/staff/${id}`)
      .pipe(map((staff) => {
        return staff;
      }))
  }

  public createStaff(data: any) {
    return this.http.post(`${environment.apiUrl}/residences/staff`, data)
      .pipe(map((staff) => {
        return staff;
      }))
  }

  updateStaff(id: number, data: any) {
    return this.http.put(`${environment.apiUrl}/residences/staff/${id}`, data)
      .pipe(map((staff) => {
        return staff;
      }))
  }

  deleteStaff(id: number) {
    return this.http.put(`${environment.apiUrl}/residences/staff/${id}`, { is_deleted: true })
      .pipe(map((staff) => {
        return staff;
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

  public getStaffListPaginated(page: number, size:number) {
    let params = new HttpParams();
    params = params.append('page', page.toString());
    params = params.append('page_size', size.toString());
    return this.http.get(`${environment.apiUrl}/residences/staff`, {params: params})
      .pipe(map((data: any) => {
        return data?.staff;
      }));
  }

  public createDocuments(data: any){
    return this.http.post(`${environment.apiUrl}/residences/media`, data)
    .pipe(map((media)=>{
      return media;
    }))
  }

  public updateStaffDocuments(id: number, data: any){

    return this.http.put(`${environment.apiUrl}/residences/media/${id}`,data)
    .pipe(map((media)=>{
      return media;
    }))
  }

  getAddressByStaffId(staff_id: string) {
    return this.http.get(`${environment.apiUrl}/bases/addresses-by-staff/${staff_id}`)
      .pipe(map((address) => {
        return address;
      }))
  }

  getMediaByStaffId(staff_id: string) {
    return this.http.get(`${environment.apiUrl}/residences/media-by-staff/${staff_id}`)
      .pipe(map((address) => {
        return address;
      }))
  }

    formatDate(dateString: string): string {
    const date = new Date(dateString); // Parse the date string

    const year = date.getFullYear();  // Get the full year (e.g., 2024)
    const month = String(date.getMonth() + 1).padStart(2, '0');  // Get the month (0-indexed, so add 1) and pad with leading zero if needed
    const day = String(date.getDate()).padStart(2, '0');  // Get the day of the month and pad with leading zero if needed



    return `${year}-${month}-${day}`;  // Construct the formatted date string
}

  // pagination for staff

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

    return this.http.get(`${environment.apiUrl}/residences/staff?search=${searchTerm}&page_size=${pageSize}`)
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



  public advanceSearch(data: any, page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());

  return this.http.post(
    `${environment.apiUrl}/residences/search-staff`,
    data,   // request body (filters)
    { params }  // query params (pagination)
  ).pipe(
    map((data:any) => {
      return data;
    })
  );
}

public setStaffStatus(id: number, status: string) {
  if(status === 'activate') {
    return this.http.put(`${environment.apiUrl}/residences/staff/${id}`, {is_approved: true})
    .pipe(map((staff) => {
      return staff;
    }))
}
else if(status === 'deactivate') {
    return this.http.put(`${environment.apiUrl}/residences/staff/${id}`, {is_approved: false})
    .pipe(map((staff) => {
      return staff;
    }))
  }
}
}
