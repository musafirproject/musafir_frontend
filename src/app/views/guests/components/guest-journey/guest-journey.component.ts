import {
  Component,
  Input,
  OnChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { DashboardService } from '@app/views/dashboard/dashboard.service';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexDataLabels,
  ApexFill,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexPlotOptions,
  ApexStroke,
  ApexLegend,
} from 'ng-apexcharts';
import { finalize } from 'rxjs/operators';

export type JourneyChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  plotOptions: ApexPlotOptions;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  fill: ApexFill;
  tooltip: ApexTooltip;
  legend: ApexLegend;
};

@Component({
  selector: 'app-guest-journey',
  templateUrl: './guest-journey.component.html',
  styleUrls: ['./guest-journey.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestJourneyComponent implements OnChanges {
  @Input() guestId!: number;

  public options: Partial<JourneyChartOptions> | null = null;
  public loading = false;
  public error = false;

  // 👇 tweak these if needed
  private readonly MAX_STAYS = 200;      // hard cap of rows to plot
  private readonly LABEL_THRESHOLD = 40; // disable labels when too many

  constructor(
    private service: DashboardService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnChanges(): void {
    if (!this.guestId) return;
    this.fetch();
  }

  private fetch(): void {
    this.loading = true;
    this.error = false;
    this.options = null;
    this.cdr.markForCheck();

    this.service
      .getGuestJourney(this.guestId)
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (payload: any) => {
          let built: Partial<JourneyChartOptions> | null = null;
          try {
            built = this.buildOptionsFromPayload(payload);
          } catch (e) {
            console.error('Error building journey chart options:', e);
            built = null;
          }

          this.options = built ?? this.buildOptionsFromPayload(this.samplePayload());
          this.cdr.markForCheck();

          setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
        },
        error: (err) => {
          console.error('journey api error', err);
          this.error = true;
        },
      });
  }

  private buildOptionsFromPayload(payload: any): Partial<JourneyChartOptions> | null {
    const staysRaw = Array.isArray(payload?.stays) ? payload.stays : [];

    // Map + filter invalid rows
    let data = staysRaw
      .map((s: any, idx: number) => {
        const start = s?.checkin ? Date.parse(s.checkin) : NaN;
        const end = s?.checkout ? Date.parse(s.checkout) : NaN;
        if (isNaN(start) || isNaN(end)) return null;

        return {
          x:
            (s?.residence_title || '—').toString().slice(0, 60) ||
            `#${idx + 1}`,
          y: [start, end] as [number, number],
          fillColor: this.colorByResidenceType(s?.residence_type),
        };
      })
      .filter(Boolean) as Array<{ x: string; y: [number, number]; fillColor?: string }>;

    if (!data.length) return null;

    data.sort((a, b) => a.y[0] - b.y[0]);

    if (data.length > this.MAX_STAYS) {
      data = data.slice(data.length - this.MAX_STAYS);
    }

    const series: ApexAxisChartSeries = [{ name: 'Stay', data }];

    const tooManyRows = data.length > this.LABEL_THRESHOLD;

    return {
      series,
      chart: {
        type: 'rangeBar',
        height: 360,
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 600,
        },
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          barHeight: '28%',
          rangeBarGroupRows: true,
        },
      },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false,
          hideOverlappingLabels: true,
        },
        tooltip: { enabled: false },
      },
      yaxis: {
        labels: {
          maxWidth: 260,
        },
      },
      dataLabels: {
        enabled: !tooManyRows,
        formatter: (_: any, opts: any) => {
          try {
            const item =
              opts?.w?.config?.series?.[opts.seriesIndex]?.data?.[
                opts.dataPointIndex
              ];
            if (!item || !Array.isArray(item.y)) return '';
            const [start, end] = item.y;
            const sd = new Date(start);
            const ed = new Date(end);
            return `${sd.toLocaleDateString()} → ${ed.toLocaleDateString()}`;
          } catch {
            return '';
          }
        },
        style: { fontSize: '11px' },
        background: {
          enabled: true,
          foreColor: '#333',
          borderRadius: 4,
          padding: 4,
          opacity: 0.85,
        },
      },
      stroke: {
        show: true,
        width: 12,
        colors: ['transparent'],
      },
      fill: {
        type: 'solid',
        opacity: 0.5,
      },
      tooltip: {
        x: {
          show: true,
          formatter: (val: number) => {
            try {
              return new Date(val).toLocaleString();
            } catch {
              return '';
            }
          },
        },
        y: {
          formatter: (range: any) => {
            try {
              if (!Array.isArray(range)) return '';
              const [start, end] = range;
              return `${new Date(start).toLocaleString()} → ${new Date(
                end
              ).toLocaleString()}`;
            } catch {
              return '';
            }
          },
          title: { formatter: () => 'Stay' },
        },
        custom: ({ seriesIndex, dataPointIndex, w }) => {
          try {
            const item =
              w?.config?.series?.[seriesIndex]?.data?.[dataPointIndex];
            if (!item || !Array.isArray(item.y)) return '';
            const [start, end] = item.y;
            const title =
              (item.x ?? '').toString().slice(0, 80) || 'Residence';
            return `
              <div class="apx-tooltip">
                <div class="tt-title">${title}</div>
                <div class="tt-row"><b>Check-in:</b> ${new Date(
                  start
                ).toLocaleString()}</div>
                <div class="tt-row"><b>Check-out:</b> ${new Date(
                  end
                ).toLocaleString()}</div>
              </div>
            `;
          } catch {
            return '';
          }
        },
      },
      legend: { show: false },
    };
  }

  private colorByResidenceType(rt?: string): string | undefined {
    switch (rt) {
      case 'HOTEL':
        return '#2E86DE';
      case 'HOSTEL':
        return '#10B981';
      case 'GUEST_HOUSE':
        return '#8B5CF6';
      case 'MUSAFIR_KHANA':
        return '#F59E0B';
      case 'HOUSE':
        return '#EF4444';
      case 'RENT_ROOM':
        return '#14B8A6';
      case 'COMPANY':
        return '#A3A3A3';
      default:
        return undefined;
    }
  }

  private samplePayload() {
    const now = Date.now();
    const d = (days: number) => now + days * 24 * 3600 * 1000;
    return {
      stays: [
        {
          residence_title: 'Sample Hotel',
          residence_type: 'HOTEL',
          checkin: new Date(d(-8)).toISOString(),
          checkout: new Date(d(-6)).toISOString(),
        },
        {
          residence_title: 'Sample Hostel',
          residence_type: 'HOSTEL',
          checkin: new Date(d(-5)).toISOString(),
          checkout: new Date(d(-3)).toISOString(),
        },
        {
          residence_title: 'Sample Guest',
          residence_type: 'GUEST_HOUSE',
          checkin: new Date(d(-2)).toISOString(),
          checkout: new Date(d(-1)).toISOString(),
        },
      ],
    };
  }
}
