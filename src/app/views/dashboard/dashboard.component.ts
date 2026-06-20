import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnInit,
  ViewChild
} from '@angular/core';

import {
  ApexAxisChartSeries,
  ApexChart,
  ChartComponent,
  ApexDataLabels,
  ApexXAxis,
  ApexPlotOptions,
  ApexResponsive,
  ApexNonAxisChartSeries,
  ApexStroke,
  ApexFill,
  ApexTitleSubtitle,
  ApexGrid,
  ApexTheme,
  ApexYAxis,
  ApexLegend,
} from 'ng-apexcharts';

import { DashboardService, ExpiryItem, KPIResponse, VisaExpiryResponse } from './dashboard.service';
import { finalize, forkJoin, Subject, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../auth/auth.service';
import { GuestService } from '../guests/services/guest.service';
import { Router } from '@angular/router';

const ric = (cb: () => void) => {
  if (typeof window !== 'undefined' && window.requestIdleCallback) {
    return window.requestIdleCallback(cb);
  }
  return window.setTimeout(cb, 60);
};

export type ChartOptions = {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  chart: ApexChart;
  dataLabels?: ApexDataLabels;
  plotOptions?: ApexPlotOptions;
  xaxis?: ApexXAxis;
  responsive?: ApexResponsive[];
  labels?: any;
  stroke?: ApexStroke;
  fill?: ApexFill;
  grid?: ApexGrid;
  title?: ApexTitleSubtitle;
  theme?: ApexTheme;
  yaxis?: ApexYAxis;
  legend?: ApexLegend;
  colors?: string[];
};

@Component({
  selector: 'dashboard',
  templateUrl: './dashboard.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardComponent implements OnInit {
  @ViewChild('chart') chart!: ChartComponent;

  // Loading flags
  public statsLoading = true;
  public chartsLoading = true;
  public role: any;
  // Raw data holders
  public statData: any;
  public current_month!: string;
  public current_year!: number;

  public selectedResidenceType: string = 'HOTEL';
  public selectedCheckinResidenceType: string | null = 'HOTEL';
  public selectedProductivityResidenceType: string | null = 'HOTEL';
  public selectedNationalityResidenceType: string | null = 'HOTEL';
  public selectedRepeatResidenceType: string | null = 'HOTEL';
  public occPeriod: 'weekly' | 'monthly' | 'yearly' = 'monthly';
  public occResidenceType?: string | null = 'HOTEL';
  public selectedBlacklistResidenceType?: string | null = 'HOTEL';
  public selectedCheckoutsResidenceType?: string | null = 'HOTEL';
  public selectedWorkloadResidenceType?: string | null = 'HOTEL';
  public workloadLimit = 10;
  public occLimit = 10;

  public loading = true;
  public error: string | null = null;
  public todayRegistrations = 0;
  public todayCheckouts = 0;
  public activeNow = 0;
  public avgStay30 = 0;
  public nationalsPct = 0;
  public foreignersPct = 0;
  public topPerformers: KPIResponse['top_performers'] = [];
  public bottomPerformers: KPIResponse['bottom_performers'] = [];

  // Visa expiry
  public expiring7Count = 0;
  public expiring30Count = 0;
  public list7: ExpiryItem[] = [];
  public list30: ExpiryItem[] = [];

  // settings
  public windowDays = 30;
  public topN = 10;
  public includeZero = true;

  private destroy$ = new Subject<void>();

  public residenceTypes = [
    {
      key: 'HOTEL', value: 'Hotel'
    },
    {
      key: 'HOSTEL', value: 'Hostel'
    },
    {
      key: 'GUEST_HOUSE', value: 'Guest House'
    },
    {
      key: 'MUSAFIR_KHANA', value: 'Musafir Khana'
    },
    {
      key: 'HOUSE', value: 'House'
    },
    {
      key: 'RENT_ROOM', value: 'Rent Room'
    },
    {
      key: 'COMPANY', value: 'Company'
    },
  ]

  public chartOptions?: Partial<ChartOptions>;
  public chartOptionsMonthly?: Partial<ChartOptions>;
  public chartOptionsStaff?: Partial<ChartOptions>;
  public genderChartOptions?: Partial<ChartOptions>;
  public genderChartOptionsYearly?: Partial<ChartOptions>;
  public monthlyStatisticsChartOptions?: Partial<ChartOptions>;
  public guestTypeChartOptions?: Partial<ChartOptions>;
  public guestTypeChartOptionsAnnulay?: Partial<ChartOptions>;
  public userRolechartOptions?: Partial<ChartOptions>;
  public guestHotelChartOptions?: Partial<ChartOptions>;
  public hotelTypeChartOptions?: Partial<ChartOptions>;
  public userZoneChartOptions?: Partial<ChartOptions>;
  public guestProvinceChartOptions?: Partial<ChartOptions>;
  public guestBlacklistedGuestsChartOptions?: Partial<ChartOptions>;
  public guestZonePercentChartOptions: Partial<ChartOptions> | null = null;
  public guestZoneCountChartOptions: Partial<ChartOptions> | null = null;

  public occCapacityOptions: any;         
  public stayDurationOptions: any;         
  public checkinHeatmapOptions: any;     
  public checkoutHeatmapOptions: any;      
  public blacklistFunnelOptions: any;      
  public escalationSLAOptions: any;        
  public productivityOptions: any;       
  public nationalityMixOptions: any;     
  public apiSloOptions: any;
  public guestRepeatOptions: any;         
  public cohortHeatmapOptions: any;      
  public agentFunnelOptions: any;         
  public agentAHTOptions: any;            
  public residencyOccTrendOptions: any;   
  public noShowOptions: any;              
  public blacklistTrendOptions: any | null = null;
  public staffWorkloadOptions: any | null = null;

  public vipTable: Array<{ name: string; visits: number; lastVisit: string; residency: string }>;


  public dataCompletenessRows: Array<{ residency: string; required: number; present: number }>;
  public edgeCollectors: Array<{ name: string; lastHeartbeatMin: number; queue: number }>;
  expiredPastCount: any;
  listExpiredPast: any;
  constructor(
    private service: DashboardService,
    private cdr: ChangeDetectorRef,
    private guestService: GuestService,
    private ngZone: NgZone,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.getAuthUser();
    this.fetchData();
    this.service.getStatistics()
      .pipe(finalize(() => { this.statsLoading = false; this.cdr.markForCheck(); }))
      .subscribe({
        next: (stats: any) => {
          this.statData = stats;
          this.cdr.markForCheck();
        },
        error: (err) => console.error('stats error', err)
      });

    ric(() => this.loadCharts());
  }



  public getAuthUser() {
    this.authService.getCurrentUser()
      .subscribe({
        next: (user: any) => {
          this.role = user?.authenticatedUser?.role?.code;
          this.cdr.detectChanges();

        }
      })
  }
  private loadCharts() {
    this.chartsLoading = true;

    this.ngZone.runOutsideAngular(() => {
      forkJoin({
        hotelGuests: this.service.getHotelGuestStatistics(),   // yearly map
        staff: this.service.getStaffStatistics(),              // yearly map
        gender: this.service.getGuestsByGender(),              // { current_month, current_year, month, year }
        userZones: this.service.getUserZonesStatistics(),      // map
        guestCity: this.service.getGuestsCountByCity(),        // map
        guestType: this.service.getGuestsCountByGuestType(),   // { current_month, current_year }
        guestMonth: this.service.getGuestsCountByMonth(),      // { Jan: n, ... }
        guestByHotel: this.service.getGuestsByHotel('HOTEL'),  // { current_month: [{x,y}], current_year: [{x,y}] }
        userRoles: this.service.getUserCountByRole(),          // map
        guestZone: this.service.getGuestByZoneStatistics()
      })
        .pipe(finalize(() => {
          this.ngZone.run(() => {
            this.chartsLoading = false;
            this.cdr.markForCheck();
          });
        }))
        .subscribe({
          next: (res: any) => {
            // primitives
            this.current_month = res.gender?.month;
            this.current_year = res.gender?.year;

            // 1st wave (fast)
            this.buildFirstWave(res);

            // 2nd wave (idle): include Average Stay Duration here
            ric(() => {
              this.buildSecondWave(res);
              // 🔽 Average Stay Duration: load with year + optional residence type
              this.loadAverageStayChart(this.current_year);
              this.loadCheckinHeatmapCurrentMonth(this.selectedCheckinResidenceType);
              this.loadGuestCareProductivityTop();
              this.loadNationalityMixTop();
              this.loadOccupancyTrend();
              this.loadCheckoutPeaks();
              this.loadBlacklistTrend();
              this.loadStaffWorkload();
              // this.loadRepeatVisitRate();
            });

            // final defer
            ric(() => this.loadDeferredCharts());
          },
          error: (err) => console.error('charts error', err)
        });
    });
  }


  private loadAverageStayChart(year?: number, typeKey?: string | null) {
    this.stayDurationOptions = null; // show skeleton
    this.service.getAverageStayDurationPerResidenceType(year ?? this.current_year)
      .subscribe((payload: { categories: string[], series: { name: string; data: number[] }[] }) => {
        this.initializeAverageStayDuration(payload); // uses your initializer we defined earlier
        this.cdr.markForCheck();
      });
  }


  private initGuestResidencyAgentExtras() {
    // 1) Repeat visit rate by month (line %)
    this.guestRepeatOptions = {
      series: [{ name: 'Repeat Rate %', data: [12, 14, 13, 16, 18, 21, 20, 22, 24, 23, 25, 27] }],
      chart: { type: 'line', height: 300, zoom: { enabled: false } },
      stroke: { curve: 'smooth', width: 3 },
      dataLabels: { enabled: false },
      yaxis: { labels: { formatter: (v: number) => `${v}%` }, max: 40 },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] }
    };

    // 2) Cohort retention heatmap (cohort month → retention % after N months)
    // Rows are cohorts (by signup/check-in month), columns are months 0..5 retention.
    this.cohortHeatmapOptions = {
      chart: { type: 'heatmap', height: 330 },
      dataLabels: { enabled: false },
      xaxis: { categories: ['M0', 'M1', 'M2', 'M3', 'M4', 'M5'] },
      colors: ['#008FFB'],
      series: [
        { name: 'Cohort Apr', data: [100, 58, 44, 33, 27, 21] },
        { name: 'Cohort May', data: [100, 60, 46, 34, 28, 22] },
        { name: 'Cohort Jun', data: [100, 62, 48, 36, 29, 24] },
        { name: 'Cohort Jul', data: [100, 63, 49, 37, 31, 25] }
      ],
      tooltip: { y: { formatter: (v: number) => `${v}%` } }
    };

    // 3) Guest_care conversion funnel per agent (stacked bar)
    // Stages: Inquiries → Contacted → Booked → Checked-in
    this.agentFunnelOptions = {
      series: [
        { name: 'Inquiries', data: [220, 180, 160, 140, 125] },
        { name: 'Contacted', data: [200, 165, 150, 130, 115] },
        { name: 'Booked', data: [150, 130, 120, 100, 90] },
        { name: 'Checked-in', data: [120, 105, 95, 78, 70] }
      ],
      chart: { type: 'bar', height: 340, stacked: true },
      plotOptions: { bar: { horizontal: true, barHeight: '70%' } },
      dataLabels: { enabled: false },
      xaxis: { categories: ['Fatima N.', 'Ahmad S.', 'Zainab R.', 'Omid K.', 'Sahar T.'] },
      legend: { position: 'top' }
    };

    // 4) Avg Handling Time (AHT) by agent (minutes)
    this.agentAHTOptions = {
      series: [{ name: 'AHT (min)', data: [6.2, 7.8, 5.9, 8.5, 6.7] }],
      chart: { type: 'bar', height: 300 },
      plotOptions: { bar: { horizontal: false, columnWidth: '45%' } },
      dataLabels: { enabled: true },
      xaxis: { categories: ['Fatima N.', 'Ahmad S.', 'Zainab R.', 'Omid K.', 'Sahar T.'] }
    };

    // 5) Occupancy trend (top 3 residencies) stacked area
    this.residencyOccTrendOptions = {
      series: [
        { name: 'Hotel Ariana', data: [70, 72, 75, 80, 84, 88, 90] },
        { name: 'City Guest House', data: [40, 42, 44, 47, 49, 50, 52] },
        { name: 'Kabul Hostel', data: [85, 86, 87, 89, 92, 93, 94] }
      ],
      chart: { type: 'area', height: 320, stacked: true },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      xaxis: { categories: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'Today'] },
      yaxis: { labels: { formatter: (v: number) => `${v}%` }, max: 100 }
    };

    // 6) No-show rate by residency (%)
    this.noShowOptions = {
      series: [{ name: 'No-show %', data: [3.5, 5.2, 2.1, 4.4, 6.0, 1.9] }],
      chart: { type: 'bar', height: 300 },
      plotOptions: { bar: { horizontal: true, barHeight: '65%' } },
      dataLabels: { enabled: true, formatter: (v: number) => `${v}%` },
      xaxis: { categories: ['Hotel Ariana', 'City Guest House', 'Kabul Hostel', 'Musafir Khana 3', 'Company Resid.', 'Guest House East'] },
      yaxis: { max: 10 }
    };

    // 7) VIP/high-value guests table
    this.vipTable = [
      { name: 'Mohammad A.', visits: 14, lastVisit: '2025-09-22', residency: 'Hotel Ariana' },
      { name: 'Laila H.', visits: 11, lastVisit: '2025-09-20', residency: 'Kabul Hostel' },
      { name: 'Haroon R.', visits: 9, lastVisit: '2025-09-19', residency: 'City Guest House' },
      { name: 'Sana K.', visits: 8, lastVisit: '2025-09-18', residency: 'Musafir Khana 3' },
      { name: 'Bilal S.', visits: 8, lastVisit: '2025-09-16', residency: 'Guest House East' }
    ];
  }

  private initExtraDemoCharts() {
    // 1) Live Occupancy vs Capacity (bar with goals)
    this.occCapacityOptions = {
      series: [{
        name: 'Occupancy',
        data: [
          { x: 'Hotel Ariana', y: 82, goals: [{ name: 'Capacity', value: 100 }] },
          { x: 'City Guest House', y: 45, goals: [{ name: 'Capacity', value: 60 }] },
          { x: 'Kabul Hostel', y: 95, goals: [{ name: 'Capacity', value: 90 }] },
          { x: 'Musafir Khana 3', y: 55, goals: [{ name: 'Capacity', value: 80 }] },
          { x: 'Company Resid.', y: 30, goals: [{ name: 'Capacity', value: 50 }] }
        ]
      }],
      chart: { type: 'bar', height: 360, animations: { enabled: true } },
      plotOptions: { bar: { horizontal: true, barHeight: '70%' } },
      dataLabels: { enabled: true },
      legend: { show: true },
    };

    // 2) Avg Stay Duration (days) per type
    this.stayDurationOptions = {
      series: [{ name: 'Avg Days', data: [2.1, 1.4, 3.6, 4.2, 2.9] }],
      chart: { type: 'bar', height: 320 },
      xaxis: { categories: ['Hotel', 'Guest House', 'Hostel', 'Musafir Khana', 'Company'] },
      dataLabels: { enabled: false },
    };

    // 3) Check-in Peaks Heatmap (hour vs weekday)
    this.checkinHeatmapOptions = {
      chart: { type: 'heatmap', height: 360 },
      dataLabels: { enabled: false },
      xaxis: { categories: ['00', '03', '06', '09', '12', '15', '18', '21'] },
      series: [
        { name: 'Sat', data: [3, 5, 6, 20, 35, 18, 12, 4] },
        { name: 'Sun', data: [2, 4, 5, 18, 32, 22, 14, 6] },
        { name: 'Mon', data: [1, 3, 4, 15, 28, 25, 16, 7] },
        { name: 'Tue', data: [1, 2, 4, 14, 26, 24, 18, 6] },
        { name: 'Wed', data: [2, 3, 5, 16, 27, 23, 17, 5] },
        { name: 'Thu', data: [2, 4, 6, 17, 30, 20, 15, 5] },
        { name: 'Fri', data: [3, 6, 7, 22, 34, 19, 12, 3] },
      ]
    };

    // 4) Blacklist Funnel (horizontal bar)
    this.blacklistFunnelOptions = {
      series: [{ name: 'Count', data: [120, 90, 55, 40] }],
      chart: { type: 'bar', height: 320 },
      plotOptions: { bar: { horizontal: true, distributed: true } },
      xaxis: { categories: ['Matches', 'Reviewed', 'Confirmed', 'Blocked'] },
      dataLabels: { enabled: true }
    };

    // 5) Escalation SLA Gauge (radialBar)
    this.escalationSLAOptions = {
      series: [88], // % within SLA in last 30 days
      chart: { type: 'radialBar', height: 300 },
      plotOptions: {
        radialBar: {
          hollow: { size: '60%' },
          dataLabels: {
            name: { show: true, offsetY: 10, text: 'SLA Met' },
            value: { show: true, fontSize: '26px' }
          }
        }
      }
    };

    // 6) GuestCare Productivity Leaderboard
    this.productivityOptions = {
      series: [{ name: 'Check-ins', data: [210, 180, 165, 140, 120] }],
      chart: { type: 'bar', height: 320 },
      plotOptions: { bar: { horizontal: true, barHeight: '65%' } },
      xaxis: { categories: ['Fatima N.', 'Ahmad S.', 'Zainab R.', 'Omid K.', 'Sahar T.'] },
      dataLabels: { enabled: true }
    };

    // 7) Nationality Mix (stacked area)
    this.nationalityMixOptions = {
      series: [
        { name: 'AF', data: [40, 45, 38, 50, 55, 60, 58, 62, 59, 65, 68, 70] },
        { name: 'PK', data: [10, 12, 11, 13, 14, 15, 15, 16, 17, 16, 17, 18] },
        { name: 'IR', data: [8, 9, 10, 10, 11, 12, 12, 13, 13, 14, 14, 15] },
        { name: 'IN', data: [6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 12] },
        { name: 'Other', data: [4, 5, 5, 6, 6, 7, 7, 8, 8, 8, 9, 9] }
      ],
      chart: { type: 'area', height: 340, stacked: true },
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      xaxis: { categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
    };

    // 8) API SLOs (latency + error%) dual axis
    this.apiSloOptions = {
      series: [
        { name: 'Latency p95 (ms)', type: 'line', data: [320, 280, 300, 260, 240, 220, 210] },
        { name: 'Error Rate (%)', type: 'column', data: [1.8, 1.2, 1.5, 1.0, 0.9, 0.7, 0.6] }
      ],
      chart: { height: 340, type: 'line', stacked: false },
      stroke: { width: [3, 0] },
      dataLabels: { enabled: false },
      xaxis: { categories: ['T-6', 'T-5', 'T-4', 'T-3', 'T-2', 'T-1', 'Today'] },
      yaxis: [
        { seriesName: 'Latency p95 (ms)', title: { text: 'ms' } },
        { seriesName: 'Error Rate (%)', opposite: true, title: { text: '%' } }
      ]
    };

    // 9) Data completeness scorecard (table)
    this.dataCompletenessRows = [
      { residency: 'Hotel Ariana', required: 100, present: 94 },
      { residency: 'City Guest House', required: 60, present: 55 },
      { residency: 'Kabul Hostel', required: 90, present: 82 },
      { residency: 'Musafir Khana 3', required: 80, present: 61 },
      { residency: 'Company Resid.', required: 50, present: 43 },
    ];

    // 10) Edge collectors health (table)
    this.edgeCollectors = [
      { name: 'KBL Airport', lastHeartbeatMin: 2, queue: 0 },
      { name: 'HER Airport', lastHeartbeatMin: 7, queue: 3 },
      { name: 'TOR Border', lastHeartbeatMin: 28, queue: 17 },
      { name: 'HJP Border', lastHeartbeatMin: 1, queue: 0 }
    ];
  }

  /** Build the cheapest charts first to get UI interactive quickly */
  private buildFirstWave(res: any) {
    // Monthly line
    this.initializeStatisticsChartOptionsCurrentYear(res.guestMonth || {});
    // Donuts
    this.initializeGuestTypeStatistics((res.guestType && res.guestType.current_month) || {});
    this.initializeGuestTypeStatisticsAnnulaly((res.guestType && res.guestType.current_year) || {});
    this.initializeDonutChartOptions(res.userRoles || {});
    // Bars
    this.initializeStaffChartOptions(this.getLastNRecords((res.staff && res.staff.current_year) || {}, 140));
    this.initializeGuestProvinceChartOptions(this.getLastNRecords(res.guestCity || {}, 50));
    this.initializeZoneChart(res.userZones || {});
    this.initializeGuestZonePercentChart(res.guestZone);
    this.initializeGuestZoneCountChart(res.guestZone);
  }

  /** Build heavier charts (treemap/radialBar) in a second idle slot */
  private buildSecondWave(res: any) {
    this.initializeChartOptionsCurrentMonth((res.guestByHotel && res.guestByHotel.current_month) || []);
    this.initializeChartOptionsCurrentYear((res.guestByHotel && res.guestByHotel.current_year) || []);
    this.initializeGenderChartOptionsCurrentMonth((res.gender && res.gender.current_month) || {});
    this.initializeGenderChartOptionsCurrentYear((res.gender && res.gender.current_year) || {});
    this.initializeHotelGuestChart((res.hotelGuests && res.hotelGuests.current_year) || {});
    // this.initExtraDemoCharts();
    // this.initGuestResidencyAgentExtras();


    this.ngZone.run(() => this.cdr.markForCheck());
  }

  /** Very last wave: heaviest/most categories */
  private loadDeferredCharts() {
    this.ngZone.runOutsideAngular(() => {
      forkJoin({
        hotelType: this.service.getHotelTypeStatistics(),
        blacklisted: this.service.getBlacklistedGuestStatistics()
      }).subscribe({
        next: (x: any) => {
          const hotelTop = this.getTopNByValue((x.hotelType && x.hotelType.current_year) || {}, 10);
          const blackTop = this.getTopNByValue(x.blacklisted || {}, 30);
          this.initializeHotelTypeChartYearly(hotelTop);
          this.initializeBlacklistedGuestsChartOptions(blackTop);
          this.ngZone.run(() => this.cdr.markForCheck());
        },
        error: (err) => console.error('deferred charts error', err)
      });
    });
  }

  // ---------------- helpers ----------------

  private getLastNRecords(data: Record<string, number>, n: number): Record<string, number> {
    const entries = Object.entries(data);
    const sliced = entries.slice(-n);
    return sliced.reduce((acc, [k, v]) => (acc[k] = v as number, acc), {} as Record<string, number>);
  }

  private getTopNByValue(data: Record<string, number>, n: number) {
    return Object.entries(data)
      .sort((a, b) => (b[1] as number) - (a[1] as number))
      .slice(0, n)
      .reduce((acc, [k, v]) => (acc[k] = v as number, acc), {} as Record<string, number>);
  }


  private baseChart(height: number, type: ApexChart['type']): ApexChart {
    return {
      height,
      type,
      animations: { enabled: false },
      toolbar: { show: false }
    };
  }

  initializeHotelGuestChart(data: { [key: string]: number }) {
    const categories = Object.keys(data);
    const seriesData = Object.values(data);
    const total = seriesData.reduce((a: number, b: number) => a + b, 0) || 1;
    const seriesPct = seriesData.map(v => (v / total) * 100);

    this.guestHotelChartOptions = {
      series: seriesPct,
      chart: this.baseChart(360, 'radialBar'),
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { fontSize: '14px' },
            value: { fontSize: '12px' },
            total: {
              show: true,
              label: 'Total',
              formatter: () => `${total}`
            }
          }
        }
      },
      labels: categories
    };
  }

  public onResidenceTypeChange(type: any) {
    this.service.getGuestsByHotel(type?.target?.value)
      .subscribe({
        next: (res: any) => {
          this.initializeChartOptionsCurrentMonth(res?.current_month || []);
          this.cdr.markForCheck();

        }
      })
  }
  public onStaffResidenceTypeChange(type: any) {
    this.service.getStaffByResidence(type?.target?.value)
      .subscribe({
        next: (res: any) => {
          this.initializeStaffChartOptions(res?.current_year || []);
          this.cdr.markForCheck();

        }
      })
  }


  public onGuestCareResidenceChange(type: any) {
    this.service.getGuestCareProductivity(10, type?.target?.value)
      .subscribe({
        next: (res: any) => {
          this.initializeProductivityTop(res || []);
          this.cdr.markForCheck();

        }
      })
  }
  public onNationalityMixResidencyType(type: any) {
    this.service.getNationalityMix(10, type?.target?.value)
      .subscribe({
        next: (res: any) => {
          this.initializeNationalityMixPyramid(res || []);
          this.cdr.markForCheck();
        }
      })
  }




  onCheckinResidenceTypeChange(typeKey) {
    this.selectedCheckinResidenceType = typeKey?.target.value;
    this.loadCheckinHeatmapCurrentMonth(this.selectedCheckinResidenceType);
    this.cdr.markForCheck();
  }


  initializeHotelTypeChartYearly(data: { [key: string]: number }) {
    const categories = Object.keys(data);
    const seriesData = Object.values(data);

    this.hotelTypeChartOptions = {
      series: seriesData,
      chart: this.baseChart(420, 'polarArea'),
      labels: categories,
      stroke: { colors: ['#fff'] },
      fill: { opacity: 0.85 },
      responsive: [
        { breakpoint: 576, options: { chart: { height: 260 } } }
      ],
      legend: { show: true }
    };
  }

  initializeZoneChart(data: { [key: string]: number }) {
    const categories = Object.keys(data);
    const seriesData = Object.values(data);
    this.userZoneChartOptions = {
      series: seriesData,
      chart: this.baseChart(360, 'polarArea'),
      labels: categories,
      stroke: { colors: ['#fff'] },
      fill: { opacity: 0.85 },
      legend: { show: true }
    };
  }

  initializeGuestZonePercentChart(res) {
    const zones = Object.keys(res.data);
    const seriesData = zones.map((z) => res.data[z].percentage);

    this.guestZonePercentChartOptions = {
      series: seriesData,
      chart: this.baseChart(360, 'polarArea'),
      labels: zones,
      stroke: { colors: ['#fff'] },
      fill: { opacity: 0.85 },
      legend: { show: true },
    };
  }

  initializeGuestZoneCountChart(res) {
    const zones = Object.keys(res.data);
    const seriesData = zones.map((z) => res.data[z].count);

    this.guestZoneCountChartOptions = {
      series: seriesData,
      chart: this.baseChart(360, 'polarArea'),
      labels: zones,
      stroke: { colors: ['#fff'] },
      fill: { opacity: 0.85 },
      legend: { show: true },
    };
  }

  initializeStaffChartOptions(data: { [key: string]: number }) {
    const categories = Object.keys(data);
    const seriesData = Object.values(data);
    this.chartOptionsStaff = {
      series: [{ name: 'Staff', data: seriesData }],
      chart: this.baseChart(320, 'bar'),
      plotOptions: { bar: { horizontal: false, barHeight: '70%' } },
      dataLabels: { enabled: false },
      xaxis: { categories, labels: { rotate: -45, trim: false } },
      yaxis: { labels: { style: { fontSize: '11px' } } },
      grid: { padding: { right: 8 } }
    };
  }

  private provinceKey(name: string) {
    // turn "Kabul" or "KABUL" or "Kābul Province" → "kabul"
    return name.toLowerCase().replace(/\s+province$/i, '').replace(/\s+/g, '_');
  }
  initializeGuestProvinceChartOptions(data: { [key: string]: number }) {
    const rawCategories = Object.keys(data);
    const categories = rawCategories.map(
      k => this.translate.instant(`PROVINCES.${this.provinceKey(k)}`)
    );
    const seriesData = Object.values(data);

    this.guestProvinceChartOptions = {
      series: [{ name: this.translate.instant('DASH.guests'), data: seriesData }],
      chart: this.baseChart(420, 'bar'),
      plotOptions: { bar: { horizontal: false, barHeight: '70%' } },
      dataLabels: { enabled: false },
      xaxis: { categories, labels: { rotate: -45, trim: false } },
      yaxis: { labels: { style: { fontSize: '11px' } } }
    };
  }


  initializeBlacklistedGuestsChartOptions(data: { [key: string]: number }) {
    const categories = Object.keys(data);
    const seriesData = Object.values(data);
    this.guestBlacklistedGuestsChartOptions = {
      series: [{ name: 'Blacklisted', data: seriesData }],
      chart: this.baseChart(420, 'bar'),
      plotOptions: { bar: { horizontal: false, barHeight: '70%' } },
      dataLabels: { enabled: false },
      xaxis: { categories, labels: { rotate: -45, trim: false } },
      yaxis: { labels: { style: { fontSize: '11px' } } }
    };
  }

  initializeChartOptionsCurrentMonth(data: Array<{ x: string; y: number }>) {

    this.chartOptionsMonthly = {
      series: [{ data: data.map(i => ({ x: i.x, y: i.y })) }],
      chart: this.baseChart(420, 'treemap'),
      plotOptions: { treemap: { distributed: true } },
      dataLabels: { enabled: true }
    };
  }

  initializeChartOptionsCurrentYear(data: Array<{ x: string; y: number }>) {
    this.chartOptions = {
      series: [{ data: data.map(i => ({ x: i.x, y: i.y })) }],
      chart: this.baseChart(420, 'treemap'),
      plotOptions: { treemap: { distributed: true } },
      dataLabels: { enabled: false }
    };
  }

  initializeGenderChartOptionsCurrentMonth(data: { [key: string]: number }) {
    const labels = Object.keys(data);
    const vals = Object.values(data);
    const total = vals.reduce((a: number, b: number) => a + b, 0) || 1;
    const pct = vals.map(v => (v / total) * 100);

    this.genderChartOptions = {
      series: pct,
      chart: this.baseChart(320, 'radialBar'),
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { fontSize: '14px' },
            value: { fontSize: '12px' },
            total: { show: true, label: 'Total', formatter: () => `${total}` }
          }
        }
      },
      labels
    };
  }

  initializeGenderChartOptionsCurrentYear(data: { [key: string]: number }) {
    const labels = Object.keys(data);
    const vals = Object.values(data);
    const total = vals.reduce((a: number, b: number) => a + b, 0) || 1;
    const pct = vals.map(v => (v / total) * 100);

    this.genderChartOptionsYearly = {
      series: pct,
      chart: this.baseChart(320, 'radialBar'),
      plotOptions: {
        radialBar: {
          dataLabels: {
            name: { fontSize: '14px' },
            value: { fontSize: '12px' },
            total: { show: true, label: 'Total', formatter: () => `${total}` }
          }
        }
      },
      labels
    };
  }

  initializeStatisticsChartOptionsCurrentYear(data: { [key: string]: number }) {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const values = months.map(m => data[m] || 0);
    this.monthlyStatisticsChartOptions = {
      series: [{ name: 'Guests', data: values }],
      chart: this.baseChart(320, 'line'),
      dataLabels: { enabled: false },
      stroke: { curve: 'smooth' },
      xaxis: { categories: months },
      grid: { row: { colors: ['#f3f3f3', 'transparent'], opacity: 0.4 } }
    };
  }

  initializeGuestTypeStatistics(data: { [key: string]: number }) {
    const rawKeys = Object.keys(data);
    const values = Object.values(data);

    // Map raw keys to translated labels
    const labels = rawKeys.map(k =>
      this.translate ? this.translate.instant('GUEST_TYPE.' + k) : k
    );

    this.guestTypeChartOptions = {
      series: values,
      chart: this.baseChart(280, 'donut'),
      labels,
      legend: { show: true }
    };
  }


  initializeGuestTypeStatisticsAnnulaly(data: { [key: string]: number }) {
    const rawKeys = Object.keys(data);
    const values = Object.values(data);

    const labels = rawKeys.map(k =>
      this.translate ? this.translate.instant('GUEST_TYPE.' + k) : k
    );
    this.guestTypeChartOptionsAnnulay = {
      series: values,
      chart: this.baseChart(280, 'donut'),
      labels,
      legend: { show: true }
    };
  }

  initializeDonutChartOptions(data: { [key: string]: number }) {
    const labels = Object.keys(data);
    const values = Object.values(data);
    this.userRolechartOptions = {
      series: values,
      chart: this.baseChart(280, 'donut'),
      labels,
      legend: { show: true }
    };
  }

  initializeAverageStayDuration(payload: {
    categories: string[];
    series: { name: string; data: number[] }[];
  }, translateLabels = true) {
    const cats = (payload?.categories || []).map(k =>
      translateLabels && this.translate
        ? this.translate.instant('RESIDENCE_TYPE.' + k) // e.g., HOTEL -> “Hotel”
        : k
    );

    this.stayDurationOptions = {
      chart: this.baseChart(320, 'bar'),
      series: payload?.series || [],

      xaxis: {
        categories: cats,
        labels: { rotate: -25, trim: true }
      },

      dataLabels: { enabled: false },

      plotOptions: {
        bar: {
          columnWidth: '50%',
          borderRadius: 4
        }
      },

      tooltip: {
        y: {
          formatter: (val: number) => `${(val ?? 0).toFixed(2)} ${this.translate ? this.translate.instant('GL.days') : 'days'}`
        }
      },

      yaxis: {
        title: { text: this.translate ? this.translate.instant('DASH.avg_stay_days') : 'Avg stay (days)' },
        decimalsInFloat: 2,
        min: 0
      },

      legend: { show: false }, // single series: AVG_STAY_DAYS
      responsive: [
        { breakpoint: 576, options: { chart: { height: 280 }, xaxis: { labels: { rotate: 0 } } } }
      ]
    };
  }

  private loadCheckinHeatmapCurrentMonth(typeKey?: string | null) {
    this.checkinHeatmapOptions = null; // show skeleton
    this.service.getCheckinHeatmap(typeKey || undefined)
      .subscribe((res: any) => {
        this.initializeCheckinHeatmapByDay(res); // same initializer you already have
        this.cdr.markForCheck();
      });
  }

  // component.ts
  initializeCheckinHeatmapByDay(payload: { series: any[]; meta?: any }, translateLabels = true) {
    const series = (payload?.series || []).map(s => {
      const name = translateLabels && this.translate
        ? this.translate.instant('WEEKDAY.' + s.name)   // e.g., WEEKDAY.MON
        : s.name;
      return { ...s, name };
    });

    // X is "01".."31" coming from each data point's x; xaxis kept as category
    this.checkinHeatmapOptions = {
      chart: this.baseChart(320, 'heatmap'),
      series,
      dataLabels: { enabled: false },
      xaxis: {
        type: 'category',
        // optional: show fixed labels from meta.days to ensure consistent order
        categories: payload?.meta?.days || undefined,
        labels: { rotate: 0 }
      },
      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          radius: 2
          // you can add colorScale.ranges here if you want buckets
        }
      },
      tooltip: {
        y: {
          formatter: (val: number) =>
            `${val ?? 0} ${this.translate ? this.translate.instant('GL.checkins') : 'check-ins'}`
        }
      },
      legend: { show: true, position: 'bottom' },
      responsive: [{ breakpoint: 576, options: { chart: { height: 280 } } }]
    };
  }


  initializeProductivityTop(payload: { categories: string[]; residences?: string[]; series: any[] }) {
    const names = payload?.categories || [];
    const homes = payload?.residences || [];

    // Combine for x-axis labels: "Name — Residence"
    const categories = names.map((n, i) => {
      const res = homes[i] || '—';
      return `${n} — ${res}`;
    });

    this.productivityOptions = {
      chart: this.baseChart(320, 'bar'),
      series: payload?.series || [],
      xaxis: {
        categories,
        labels: { rotate: -15, trim: true }
      },
      dataLabels: { enabled: false },
      plotOptions: {
        bar: {
          columnWidth: '45%',
          borderRadius: 4,
          distributed: false,
          // Optional: horizontal looks great for long labels
          horizontal: true,
          barHeight: '70%',
        }
      },
      tooltip: {
        y: {
          formatter: (val: number, opts: any) => {
            const idx = opts.dataPointIndex;
            const nm = names[idx] ?? '';
            const res = homes[idx] ?? '—';
            const cases = val ?? 0;
            const casesLabel = this.translate ? this.translate.instant('GL.cases') : 'cases';
            return `${nm}<br/>${res}<br/><b>${cases}</b> ${casesLabel}`;
          }
        }
      },
      legend: { show: false },
      responsive: [{ breakpoint: 576, options: { chart: { height: 280 } } }]
    };
  }



  private loadGuestCareProductivityTop() {
    this.productivityOptions = null; // skeleton
    this.service.getGuestCareProductivity(10, this.selectedProductivityResidenceType || undefined)
      .subscribe((res: any) => {
        this.initializeProductivityTop(res);
        this.cdr.markForCheck();
      });
  }



  public initializeNationalityMixPyramid(payload: {
    categories: string[];
    series: { name: string; data: number[] }[];
  }) {
    const cats = payload?.categories || [];
    const vals = payload?.series?.[0]?.data || [];

    // 1) pair, filter UNK/empty/zero
    const pairs = cats.map((c, i) => ({
      code: c,
      value: Number(vals[i] || 0)
    }))
      .filter(p => p.code && p.code !== 'UNK' && p.value > 0);

    // 2) sort descending for a nice funnel shape
    pairs.sort((a, b) => b.value - a.value);

    // 3) labels (translated if you have COUNTRY.<code> keys)
    const categories = pairs.map(p =>
      this.translate ? this.translate.instant('COUNTRY.' + p.code) : p.code
    );

    // 4) values for the series
    const data = pairs.map(p => p.value);

    const total = data.reduce((s, n) => s + n, 0);

    // 5) build Apex options (matches docs)
    this.nationalityMixOptions = {
      series: [{ name: '', data }],
      chart: {
        type: 'bar',
        height: 350
      },
      plotOptions: {
        bar: {
          borderRadius: 0,
          horizontal: false,
          distributed: true,
          barHeight: '80%',
          // key bit for pyramid look:
          isFunnel: false as any
        }
      },
      // optional color palette (same count as your top N)
      colors: [
        '#FF4D4F', // 1 - Strong red (most important)
        '#FF7A45', // 2 - Orange
        '#FFA940', // 3 - Amber
        '#FFC53D', // 4 - Gold
        '#40A9FF', // 5 - Blue medium
        '#69C0FF', // 6 - Light blue
        '#5CDBD3', // 7 - Teal
        '#95DE64', // 8 - Light green
        '#B7EB8F', // 9 - Softer green
        '#D9F7BE', // 10 - Very soft green (least important)
        '#EDEDED'  // 11 - “Others” (neutral gray)
      ],
      dataLabels: {
        enabled: true,
        formatter: (_val: number, opt: any) => categories[opt.dataPointIndex] || '',
        dropShadow: { enabled: true }
      },
      title: {
        text: this.translate ? this.translate.instant('DASH.nationality_mix_top') : 'Nationality Mix (Top 10)',
        align: 'center'
      },
      xaxis: {
        categories  // used by dataLabels formatter too
      },
      tooltip: {
        y: {
          formatter: (val: number, { dataPointIndex }: any) => {
            const pct = total ? Math.round((val / total) * 100) : 0;
            const label = categories[dataPointIndex] ?? '';
            const guestsTxt = this.translate ? this.translate.instant('GL.guests') : 'guests';
            return `${label}: ${val} ${guestsTxt} (${pct}%)`;
          }
        }
      },
      legend: { show: false }
    };
  }



  private loadNationalityMixTop(residenceType?: string) {
    this.nationalityMixOptions = null;
    this.service.getNationalityMix(20, residenceType)
      .subscribe((res: any) => {
        this.initializeNationalityMixPyramid(res);  // ⬅️ switch to pyramid
        this.cdr.markForCheck();
      });
  }


  public initializeOccupancyHeatmap(payload: { labels: string[]; series: Array<{ name: string; data: number[] }> }) {
    const labels = payload?.labels || [];
    const incoming = payload?.series || [];

    const shaped = incoming
      .map(s => ({
        name: s.name,
        total: (s.data || []).reduce((a, b) => a + (Number(b) || 0), 0),
        data: labels.map((x, i) => ({ x, y: Number(s.data?.[i] ?? 0) }))
      }))
      .sort((a, b) => b.total - a.total)
      .map(({ name, data }) => ({ name, data }));

    this.residencyOccTrendOptions = {
      chart: this.baseChart(360, 'heatmap'),
      series: shaped,

      dataLabels: { enabled: false },

      plotOptions: {
        heatmap: {
          shadeIntensity: 0.5,
          useFillColorAsStroke: false,
          radius: 2,
          colorScale: {
            ranges: [
              { from: 0, to: 0, name: '0', color: '#f2f2f2' },
              { from: 1, to: 5, name: '1–5' },
              { from: 6, to: 15, name: '6–15' },
              { from: 16, to: 40, name: '16–40' },
              { from: 41, to: 100000, name: '41+' }
            ]
          }
        }
      },

      xaxis: { type: 'category', categories: labels, labels: { rotate: 0 } },

      yaxis: {
        labels: {
          formatter: (val: string) => (val?.length > 18 ? val.slice(0, 18) + '…' : val)
        }
      },

      tooltip: {
        y: {
          formatter: (val: number, { seriesIndex }: any) => {
            const name = shaped[seriesIndex]?.name ?? '';
            return `${name}: ${val}`;
          }
        }
      },

      // keep it tidy on small screens
      responsive: [{ breakpoint: 576, options: { chart: { height: 300 } } }]
    };
  }


  public loadOccupancyTrend() {
    this.residencyOccTrendOptions = null;
    this.service.getOccupancyTrendResidence({
      period: this.occPeriod,
      residence_type: this.occResidenceType,
      limit: this.occLimit
    }).subscribe((res: any) => {
      this.initializeOccupancyHeatmap(res);
      this.cdr.markForCheck();
    });
  }
  onOccResidenceTypeChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.occResidenceType = v !== 'null' ? v : undefined;
    this.loadOccupancyTrend();
  }

  onOccLimitChange(e: Event) {
    const v = Number((e.target as HTMLSelectElement).value);
    this.occLimit = [10, 20, 30, 40, 50].includes(v) ? v : 10;
    this.loadOccupancyTrend();
  }

  onOccPeriodChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value as 'weekly' | 'monthly' | 'yearly';
    this.occPeriod = v;
    this.loadOccupancyTrend();
  }



  initializeCheckoutPeaksHeatmap(payload: { days: string[]; series: any[] }) {
    const categories = payload?.days ?? [];
    const shaped = (payload?.series ?? []).map((s) => ({
      name: s.name,
      data: (s.data ?? []).map((p: any) => ({ x: String(p.x), y: Number(p.y || 0) }))
    }));

    this.checkoutHeatmapOptions = {
      chart: this.baseChart(360, 'heatmap'),
      series: shaped,
      xaxis: { categories, labels: { rotate: 0 } },
      dataLabels: { enabled: false },
      plotOptions: {
        heatmap: {
          colorScale: {
            ranges: [
              { from: 0, to: 0, color: '#f2f2f2', name: '0' },
              { from: 1, to: 5, name: '1–5' },
              { from: 6, to: 12, name: '6–12' },
              { from: 13, to: 30, name: '13–30' }
            ]
          }
        }
      },
      tooltip: { y: { formatter: (v: number) => `${v}` } },
      responsive: [{ breakpoint: 576, options: { chart: { height: 320 } } }]
    };
  }



  public loadCheckoutPeaks() {
    this.checkinHeatmapOptions = null;
    this.service.getCheckoutpeaks(this.selectedCheckoutsResidenceType)
      .subscribe((res: any) => {
        this.initializeCheckoutPeaksHeatmap(res);
        this.cdr.markForCheck();
      });
  }

  public onCheckoutResidenceTypeChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.selectedCheckoutsResidenceType = v !== 'null' ? v : undefined;
    this.loadCheckoutPeaks();
  }




  initializeBlacklistTrend(payload: { months: number[]; series: any[] }) {
    const months = payload?.months ?? [];
    const cats = months.map((m) => this.translate?.instant?.('MONTH.' + m) ?? String(m));

    this.blacklistTrendOptions = {
      chart: this.baseChart(300, 'bar'),
      series: payload?.series ?? [],
      xaxis: { categories: cats },
      plotOptions: { bar: { columnWidth: '55%', borderRadius: 4 } },
      dataLabels: { enabled: false },
      tooltip: { y: { formatter: (v: number) => `${v}` } }
    };
  }


  public loadBlacklistTrend() {
    this.blacklistTrendOptions = null;
    this.service.getBlacklistTrends(this.selectedBlacklistResidenceType)
      .subscribe((res: any) => {
        this.initializeBlacklistTrend(res);
        this.cdr.markForCheck();
      });
  }


  public onBlacklistResidenceTypeChange(type: any) {

    this.service.getBlacklistTrends(type?.target?.value)
      .subscribe({
        next: (res: any) => {
          this.initializeBlacklistTrend(res || []);
          this.cdr.markForCheck();
        }
      })
  }



  public initializeStaffWorkloadStacked(payload: {
    days: string[];
    series: Array<{ id?: number; name?: string; residence?: string; data?: Array<{ x: string | number; y: number }> }>;
  }) {
    const categories: string[] = (payload?.days ?? []).map(d => String(d ?? ''));
    const dayIndex = new Map(categories.map((d, i) => [d, i]));

    const outSeries = (payload?.series ?? []).map((s) => {
      const vals = Array<number>(categories.length).fill(0);
      for (const pt of (s?.data ?? [])) {
        const x = String(pt?.x ?? '');
        const idx = dayIndex.get(x);
        if (idx != null) vals[idx] = Number(pt?.y ?? 0);
      }

      const baseName = String(s?.name ?? '—');
      const res = s?.residence ? ` — ${s.residence}` : '';
      const displayName = `${baseName}${res}`;

      const dataWithMeta = vals.map((y, i) => ({
        x: categories[i],
        y,
        meta: { residence: s?.residence ?? null, staff: baseName }
      }));

      return {
        name: displayName,      // legend will show the name with residence
        data: dataWithMeta,
        id: s?.id
      } as any;
    });

    this.staffWorkloadOptions = {
      chart: { ...this.baseChart(380, 'bar'), stacked: true, stackType: 'normal' },
      title: { text: '' }, subtitle: { text: '' },

      series: outSeries,

      plotOptions: { bar: { horizontal: false, columnWidth: '65%' } },
      dataLabels: { enabled: false },
      stroke: { show: true, width: 1 },

      xaxis: { categories, tickPlacement: 'between', labels: { rotate: 0 } },
      yaxis: { labels: { formatter: (v: number) => `${Math.round(v)}` } },

      legend: { show: true, position: 'top', horizontalAlign: 'left' },

      tooltip: {
        shared: false, // read per point meta
        intersect: true,
        custom: ({ seriesIndex, dataPointIndex, w }: any) => {
          const point = w?.config?.series?.[seriesIndex]?.data?.[dataPointIndex];
          const staff = point?.meta?.staff ?? '';
          const res = point?.meta?.residence ? ` — ${point.meta.residence}` : '';
          const day = categories[dataPointIndex] ?? '';
          const val = point?.y ?? 0;
          return `
          <div class="apex-tooltip p-2">
            <div><strong>${staff}</strong>${res}</div>
            <div>Day ${day}: <strong>${val}</strong></div>
          </div>`;
        }
      },

      responsive: [
        { breakpoint: 992, options: { chart: { height: 360 }, plotOptions: { bar: { columnWidth: '70%' } } } },
        { breakpoint: 576, options: { chart: { height: 320 }, legend: { position: 'bottom' } } }
      ]
    };
  }



  public loadStaffWorkload() {
    this.staffWorkloadOptions = null;
    this.service.getStaffWorkloads({
      residence_type: this.selectedWorkloadResidenceType,
      limit: this.workloadLimit
    }).subscribe((res: any) => {
      this.initializeStaffWorkloadStacked(res || []);
      this.cdr.markForCheck();
    });
  }

  onWorkloadResidenceTypeChange(e: Event) {
    const v = (e.target as HTMLSelectElement).value;
    this.selectedWorkloadResidenceType = v !== 'null' ? v : undefined;
    this.loadStaffWorkload();
  }
  onWorkloadLimitChange(e: Event) {
    const n = Number((e.target as HTMLSelectElement).value);
    this.workloadLimit = [5, 10, 15, 20, 30, 40, 50].includes(n) ? n : 10;
    this.loadStaffWorkload();
  }


  fetchData(): void {
    this.loading = true;
    this.error = null;

    forkJoin({
      kpis: this.service.kpis({ window_days: this.windowDays, top_n: this.topN, include_zero: this.includeZero }),
      expired: this.guestService.getVisaStatus('expired'),
      visa: this.service.visaExpiry(10)
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ kpis, visa, expired }) => {

          this.applyKPI(kpis);
          this.applyVisa(visa);
          this.applyExpiredVisa(expired);
          this.loading = false;
        },
        error: (err) => {
          this.error = err?.error?.error || err?.message || 'Failed to load KPIs';
          this.loading = false;
        }
      });
  }

  private applyKPI(res: KPIResponse) {
    this.todayRegistrations = res.kpis.today_registrations;
    this.todayCheckouts = res.kpis.today_checkouts;
    this.activeNow = res.kpis.active_now;
    this.avgStay30 = res.kpis.avg_stay_30d;
    this.nationalsPct = res.kpis.nationals_pct;
    this.foreignersPct = res.kpis.foreigners_pct;

    this.topPerformers = res.top_performers || [];
    this.bottomPerformers = res.bottom_performers || [];
  }

  private applyVisa(res: VisaExpiryResponse) {
    this.expiring7Count = res.counts.expiring_7d;
    this.expiring30Count = res.counts.expiring_30d;
    this.list7 = res.lists.next_7d || [];
    this.list30 = res.lists.next_30d || [];

  }

  private applyExpiredVisa(res: any) {
    this.expiredPastCount = res?.count;
    this.listExpiredPast = res?.results;

  }

  trackById = (_: number, item: any) => item?.hotel_id ?? item?.visa_id ?? item?.guest_id;

  public performanceFullList(type: 'top' | 'bottom') {
    this.router.navigate(['/settings/residence-performance'], {
      queryParams: {
        type: type,
        window_days: this.windowDays
      }
    });

  }

  public visaFullList(scope: '7' | '30' | 'expired') {
    this.router.navigate([`/guests/${scope}/visa-expiry`]);
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


}
