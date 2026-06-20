import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, map, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})
export class SettingsServiceService {


  public imageUploaderSubscriber = new BehaviorSubject<string>('none');
  public settingModuleRouterSubscriber = new BehaviorSubject<boolean>(false);
  public deleteModalSubscriber = new BehaviorSubject<boolean>(false);
  constructor(private http:HttpClient, private toastr: ToastrService) { }

  // About Us Methods




  public setDelete(value: boolean)  {
    return this.deleteModalSubscriber.next(value);
  }

  public getDelete() {
    return this.deleteModalSubscriber.asObservable();
  }
  public setRouter(value: boolean) {
    this.settingModuleRouterSubscriber.next(value);
  }

  public getRouter() {
    return this.settingModuleRouterSubscriber.asObservable();
  }
  public setImageUrl(url) {
    return this.imageUploaderSubscriber.next(url);
  }

  public getImageUrl() {
    return this.imageUploaderSubscriber.asObservable();
  }

  // Dynamic method for getting configruation sub modules list
  public getConfigurationListData(module_name: string) {
    return this.http.get(`${environment.apiUrl}/residences/${module_name}?page_size=10`)
      .pipe(map((data) => {
        return data;
      }))
  }
  public getBlackLists() {
    return this.http.get(`${environment.apiUrl}/guests/blacklists`)
      .pipe(map((data) => {
        return data;
      }))
  }

  public createBlackList( data: any){
    return this.http.post(`${environment.apiUrl}/guests/blacklists`, data)
      .pipe(map((blacklist) => {
        return blacklist;
      }))
  }

  public deleteBlackList( id: number) {
    return this.http.delete(`${environment.apiUrl}/guests/blacklists/${id}`)
      .pipe(map((deleteblackList) => {
        return deleteblackList;
      }))
  }


  public getZoneListData() {
    return this.http.get(`${environment.apiUrl}/zones`)
      .pipe(map((data) => {
        return data;
      }))
  }
  public getUnpaginatedZone() {
    return this.http.get(`${environment.apiUrl}/zones/unpaginated-zones`)
      .pipe(map((data) => {
        return data;
      }))
  }
  public getDistrictListData() {
    return this.http.get(`${environment.apiUrl}/zones/districts`)
      .pipe(map((data) => {
        return data;
      }))
  }

  public getUnpaginatedDistricts() {
    return this.http.get(`${environment.apiUrl}/zones/unpaginated-districts`)
      .pipe(map((data) => {
        return data;
      }))
  }

  // pagenated data
  public getconfigurationsByPage(module_name: string, page: number){
    return this.http.get(`${environment.apiUrl}/configurations/${module_name}?page=${page}`)
      .pipe(map((paginatedData) => {
        return paginatedData;
      }))
  }

  // Dynamic getById method for getting the sub modules of configurations by id
  public getConfigurationByIdData(module_name: string, id: number) {
    return this.http.get(`${environment.apiUrl}/residences/${module_name}/${id}`)
      .pipe(map((dataById) => {
        return dataById;
      }))
  }


  // Dynamic create for configurations sub modules
  public createConfiguration(module_name: string, data: any){
    return this.http.post(`${environment.apiUrl}/residences/${module_name}`, data)
      .pipe(map((configuration) => {
        return configuration;
      }))
  }

// update configuration sub modules
  public updateConfiguration(module_name: string, data: any, id: number) {
    return this.http.put(`${environment.apiUrl}/residences/${module_name}/${id}`, data)
      .pipe(map((updateConfig) => {
        return updateConfig
      }))
  }

  public getConfigurationByPage(page: number,module_name: string,){
    return this.http.get(`${environment.apiUrl}/residences/${module_name}/?page=${page}`)
      .pipe(map((paginatedData) => {
        return paginatedData;
      }))
  }

// Delete configuration sub modules
  public deleteConfiguration(module_name: string, id: number) {
    return this.http.put(`${environment.apiUrl}/residences/${module_name}/${id}`,{is_deleted:true})
      .pipe(map((deleteConfig) => {
        return deleteConfig;
      }))
  }

  public createZone( data: any){
    return this.http.post(`${environment.apiUrl}/zones/`, data)
      .pipe(map((zones) => {
        return zones;
      }))
  }
  public assignZoneToUser( data: any){
    return this.http.post(`${environment.apiUrl}/zones/user-zones`, data)
      .pipe(map((zoneuser) => {
        return zoneuser;
      }))
  }

  public getUserZoneByUser( user_id: number) {
    return this.http.get(`${environment.apiUrl}/zones/user-zones-byuser/${user_id}`)
      .pipe(map((zone) => {
        return zone;
      }))
  }

  public getZoneByID( id: number) {
    return this.http.get(`${environment.apiUrl}/zones/${id}`)
      .pipe(map((zone) => {
        return zone;
      }))
  }

  public updateZone( data: any, id: number) {

    return this.http.put(`${environment.apiUrl}/zones/${id}`, data)
      .pipe(map((zone) => {
        return zone
      }))
  }
  public updateUserZone( data: any, id: number) {
    return this.http.put(`${environment.apiUrl}/zones/user-zones/${id}`, data)
      .pipe(map((userzone) => {
        return userzone
      }))
  }


  public deleteZone( id: number) {
    return this.http.put(`${environment.apiUrl}/zones/${id}`,{is_deleted:true})
      .pipe(map((deleteZone) => {
        return deleteZone;
      }))
  }
  public deleteDistrict( id: number) {
    return this.http.put(`${environment.apiUrl}/zones/districts/${id}`,{is_deleted:true})
      .pipe(map((deleteZone) => {
        return deleteZone;
      }))
  }


  // Settings image upload
  public uploadConfigurationsImage(data: any) {
    return this.http.post(`${environment.apiUrl}/common/file-uploads`,data)
      .pipe(map((image) => {
        return image;
      }))
  }

  // Special Case, getting sub categories based on a category


  public getSubCategoriesByCategory(category_id: number) {
    return this.http.get(`${environment.apiUrl}/configurations/sub-categories-by-category/${category_id}`)
      .pipe(map((subCategories) => {
        return subCategories;
      }))
  }
  public getCountrieslist() {
    return this.http.get(`${environment.apiUrl}/core/countries`)
      .pipe(map((countries) => {
        return countries;
      }))
  }



/// for pagination

public getHotleListPaginated(page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());
  return this.http.get(`${environment.apiUrl}/residences/hotels`, {params: params})
    .pipe(map((data: any) => {

      return data?.hotels;

    }));
}


public getZoneListPaginated(page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());
  return this.http.get(`${environment.apiUrl}/zones`, {params: params})
    .pipe(map((data: any) => {
      return data?.zones;
    }));
}
public getDistrictListPaginated(page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());
  return this.http.get(`${environment.apiUrl}/zones/districts`, {params: params})
    .pipe(map((data: any) => {
      return data?.districts;
    }));
}

public getBlackListPaginated(page: number, size:number) {
  let params = new HttpParams();
  params = params.append('page', page.toString());
  params = params.append('page_size', size.toString());
  return this.http.get(`${environment.apiUrl}/guests/blacklists`, {params: params})
    .pipe(map((data: any) => {
      return data?.blacklist;
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

  return this.http.get(`${environment.apiUrl}/residences/hotels?search=${searchTerm}&page_size=${pageSize}`)
    .pipe(map((searchValue: any) => {
      return searchValue?.hotels;
    }))
}
public searchZone(searchTerm: string, currentPage: number, pageSize: number) {

  return this.http.get(`${environment.apiUrl}/zones?search=${searchTerm}&page_size=${pageSize}`)
    .pipe(map((searchValue: any) => {
      return searchValue?.zones;
    }))
}
public searchDistrict(searchTerm: string, currentPage: number, pageSize: number) {

  return this.http.get(`${environment.apiUrl}/zones/districts?search=${searchTerm}&page_size=${pageSize}`)
    .pipe(map((searchValue: any) => {
      return searchValue?.districts;
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
    `${environment.apiUrl}/residences/search-hotel`,
    data,   // request body (filters)
    { params }  // query params (pagination)
  ).pipe(
    map((data:any) => {
      return data;
    })
  );
}

public advanceSearchBalcList(data: any) {

  return this.http.post(`${environment.apiUrl}/guests/search-blacklist`, data)
    .pipe(map((blacklists) => {
      return blacklists;
    }))
}

public getResidenceUsers(residenceId: number) {
  return this.http.get(`${environment.apiUrl}/residences/residence-users/${residenceId}`)
    .pipe(map((residenceUsers) => {
      return residenceUsers;
    }));
}

public getResidenceStaffs(residenceId: number) {
  return this.http.get(`${environment.apiUrl}/residences/residence-staffs/${residenceId}`)
    .pipe(map((residenceStaffs) => {
      return residenceStaffs;
    }));
}

public getDistrictByCity(cityId: number) {
    return this.http.get(`${environment.apiUrl}/zones/districts-by-city/${cityId}`)
    .pipe(map((districts) => {
      return districts;
    }));
}
public getCityByCountry(countryId: number) {
    return this.http.get(`${environment.apiUrl}/bases/cities-by-country/${countryId}`)
    .pipe(map((cities) => {
      return cities;
    }));
}
public getDistricts() {
    return this.http.get(`${environment.apiUrl}/zones/districts?is_paginated=false`)
    .pipe(map((districts) => {
      return districts;
    }));
}

}
