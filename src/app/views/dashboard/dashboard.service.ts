import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChartSeries,
  RegionData,
  OverviewData,
  RecentTransactionData,
  RecentReviewData,
  DeviceStatisticData,
  CountriesData
} from './dashboard.type';
import { environment } from 'src/environments/environment';
import { map, Observable } from 'rxjs';

interface JourneyStay {
  residence_id: number | null;
  residence_title: string | null;
  residence_type: string | null;
  checkin: string | null;    // ISO
  checkout: string | null;   // ISO or null
}

interface JourneyPayload {
  guest: { id: number };
  stays: JourneyStay[];
  timeline_start: string | null;
  timeline_end: string | null;
}

export interface KPIResponse {
  kpis: {
    today_registrations: number;
    today_checkouts: number;
    active_now: number;
    avg_stay_30d: number;
    nationals: number;
    foreigners: number;
    nationals_pct: number;
    foreigners_pct: number;
  };
  top_performers: Array<{ hotel_id: number; hotel__title: string; total: number }>;
  bottom_performers: Array<{ hotel_id: number; hotel__title: string; total: number }>;
  meta: { window_days: number; top_n: number; include_zero: boolean };
}

export interface VisaExpiryResponse {
  counts: { expiring_7d: number; expiring_30d: number };
  lists: {
    next_7d: Array<ExpiryItem>;
    next_30d: Array<ExpiryItem>;
  };
  meta: { limit: number };
}
export interface ExpiryItem {
  visa_id: number;
  guest_id: number;
  guest_name: string;
  hotel_id: number | null;
  hotel_title: string | null;
  expiry_date: string; // ISO
  days_left: number;
  actions: { open_guest: string; extend_visa: string; send_reminder: string };
}
@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  apiUrl = `/api/dashboard`;

  constructor(private http: HttpClient) { }



  getRegionMapData() {
    return this.http.get<Array<RegionData>>(`${this.apiUrl}/region-data`)
  }
  getGuestsByHotel(type?: string) {

    return this.http.get(`${environment.apiUrl}/dashboards/guestby-hotel?residence_type=${type || ''}`)
      .pipe(map((guests) => {
        return guests;
      }))
  }


  getStaffByResidence(type?: string) {
    return this.http.get(`${environment.apiUrl}/dashboards/staff-by-residence?residence_type=${type || 'HOTEL'}`)
      .pipe(map((staffs) => {
        return staffs;
      }))
  }

  getGuestsByGender() {
    return this.http.get(`${environment.apiUrl}/dashboards/guestby-gender`)
      .pipe(map((guests) => {
        return guests;
      }))
  }
  getGuestsCountByCity() {
    return this.http.get(`${environment.apiUrl}/dashboards/guestcount-city`)
      .pipe(map((guestCount) => {
        return guestCount;
      }))
  }

  //
  getBlacklistedGuestStatistics() {
    return this.http.get(`${environment.apiUrl}/dashboards/black-list-statistics`)
      .pipe(map((blacklisted) => {
        return blacklisted;
      }))
  }
  getGuestsCountByMonth() {
    return this.http.get(`${environment.apiUrl}/dashboards/guestcount-month`)
      .pipe(map((guestCount) => {
        return guestCount;
      }))
  }
  getGuestsCountByGuestType() {
    return this.http.get(`${environment.apiUrl}/dashboards/guestcount-type`)
      .pipe(map((guestCount) => {
        return guestCount;
      }))
  }


  getUserCountByRole() {
    return this.http.get(`${environment.apiUrl}/dashboards/usercount-role`)
      .pipe(map((guests) => {
        return guests;
      }))
  }
  getStatistics() {
    return this.http.get(`${environment.apiUrl}/dashboards/guest-statistics`)
      .pipe(map((count) => {
        return count;
      }))
  }
  getStaffStatistics() {
    return this.http.get(`${environment.apiUrl}/dashboards/staff-statistics`)
      .pipe(map((staff) => {
        return staff;
      }))
  }
  getHotelGuestStatistics() {
    return this.http.get(`${environment.apiUrl}/dashboards/hotel-guest-statistics`)
      .pipe(map((staff) => {
        return staff;
      }))
  }
  getHotelTypeStatistics() {
    return this.http.get(`${environment.apiUrl}/dashboards/hotel-type-statistics`)
      .pipe(map((hotel) => {
        return hotel;
      }))
  }


  getUserZonesStatistics() {
    return this.http.get(`${environment.apiUrl}/dashboards/user-zone-statistics`)
      .pipe(map((users) => {
        return users;
      }))
  }


    public getGuestByZoneStatistics() {
    return this.http.get(`${environment.apiUrl}/dashboards/guest-zone-statistics`)
      .pipe(map((users) => {
        return users;
      }))
  }



  public getAverageStayDurationPerResidenceType(year: number = 2025) {
    return this.http.get(`${environment.apiUrl}/dashboards/average-stay-duration?year=${year}`)
      .pipe(map((data) => {
        return data;
      }))
  }

  public getCheckinHeatmap(residenceType: string) {
    const params: any = {};
    if (residenceType) params.residence_type = residenceType;
    return this.http.get(`${environment.apiUrl}/dashboards/checkin-heatmap`, { params })
      .pipe(map((data) => {
        return data;
      }))
  }


  public getGuestCareProductivity(limit = 20, residenceType: string) {
    const params: any = { limit };
    if (residenceType) params.residence_type = residenceType;

    return this.http.get(`${environment.apiUrl}/dashboards/guest-care-productivity`, { params })
      .pipe(map((data) => {
        return data;
      }))
  }



  public getNationalityMix(limit = 20, residenceType: string) {
    const params: any = { limit };
    if (residenceType) params.residence_type = residenceType;

    return this.http.get(`${environment.apiUrl}/dashboards/nationality-mix`, { params })
      .pipe(map((data) => {
        return data;
      }))
  }


 

  public getOccupancyTrendResidence(params: { period?: 'weekly' | 'monthly' | 'yearly'; residence_type?: string; limit?: number } = {}) {
    return this.http.get(`${environment.apiUrl}/dashboards/occupancy-trend-residence`, { params })
      .pipe(map((data) => {
        return data;
      }))
  }

  public getCheckoutpeaks(residenceType: string) {
    const params: any = {};
    if (residenceType) params.residence_type = residenceType;

    return this.http.get(`${environment.apiUrl}/dashboards/checkout-peaks`, { params })
      .pipe(map((data) => {
        return data;
      }))
  }

  public getBlacklistTrends(residenceType: string) {
    const params: any = {};
    if (residenceType) params.residence_type = residenceType;

    return this.http.get(`${environment.apiUrl}/dashboards/blacklist-trends`, { params })
      .pipe(map((data) => {
        return data;
      }))
  }
  public getStaffWorkloads(opts: { residence_type?: string; limit?: number } = {}) {


    return this.http.get(`${environment.apiUrl}/dashboards/staff-workloads`, { params: opts as any })
      .pipe(map((data) => {
        return data;
      }))
  }


  public getGuestJourney(guestId: number, params?: { from?: string; to?: string }) {
    const httpParams: any = {};
    if (params?.from) httpParams.from = params.from;
    if (params?.to) httpParams.to = params.to;

    return this.http.get<JourneyPayload>(`${environment.apiUrl}/guests/journey/${guestId}`, { params: httpParams })
      .pipe(map((data) => {
        return data;
      }))
  }


  kpis(params: { window_days?: number; top_n?: number; include_zero?: boolean }): Observable<KPIResponse> {
    let httpParams = new HttpParams();
    if (params.window_days) httpParams = httpParams.set('window_days', String(params.window_days));
    if (params.top_n) httpParams = httpParams.set('top_n', String(params.top_n));
    if (typeof params.include_zero !== 'undefined') httpParams = httpParams.set('include_zero', String(params.include_zero));
    return this.http.get<KPIResponse>(`${environment.apiUrl}/dashboards/analytics/kpis`, { params: httpParams });
  }

  visaExpiry(limit = 10): Observable<VisaExpiryResponse> {
    const params = new HttpParams().set('limit', String(limit));
    return this.http.get<VisaExpiryResponse>(`${environment.apiUrl}/dashboards/analytics/visa-expiry`, { params });
  }

}
