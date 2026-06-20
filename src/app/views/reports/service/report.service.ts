import { HttpClient, HttpEvent, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JobProgressService } from '@app/shared/services/job-progress.service';
import { RequestProgressService } from '@app/shared/services/request-progress.service';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, filter, finalize, interval, map, Observable, of, shareReplay, switchMap, takeWhile, tap, throwError, timer } from 'rxjs';
import { environment } from 'src/environments/environment';


type JobState = 'queued' | 'running' | 'retrying' | 'finished' | 'failed' | 'unknown';
interface JobProgress { current?: number; total?: number; percent?: number; message?: string | null; }
interface JobStatusResponse {
  task_id: string;
  state: string;        // Celery state
  status: JobState;     // normalized status (from your API)
  progress: JobProgress | null;
  file_url?: string | null;
  error_message?: string | null;
}
interface CreateJobResponse {
  mode: 'async';
  task_id: string;
  status_url: string;
  message: string;
}
interface AsyncKickoffResponse {
  mode?: 'async';
  task_id: string;
  status_url: string;
  message?: string;
}

interface ReportJobStatus {
  task_id: string;
  state: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  info?: { current?: number; total?: number; status?: string };
  job_status?: 'processing' | 'completed' | 'failed' | null;
  file_url?: string | null;
  error_message?: string | null;
}

export interface CreateAsyncJobResponse {
  task_id: string;
  status_url: string;
  message?: string;
}
type ReportFormat = 'pdf' | 'excel';
@Injectable({
  providedIn: 'root'
})
export class ReportService {

  constructor(
    private http: HttpClient,
    private toastr: ToastrService,
    private translate: TranslateService,
    private progress: RequestProgressService,
    private jobs: JobProgressService
  ) { }

  private triggerDownload(fileUrl: string, filename?: string) {
    const a = document.createElement('a');
    a.href = fileUrl;
    if (filename) a.download = filename; // optional; S3 Content-Disposition already set
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }
  trackJob(taskId: string, statusUrl: string, label: string = 'Generating report') {
    this.jobs.upsert(taskId, { id: taskId, label, state: 'queued', percent: null, message: 'Queued…' });

    // poll every 1.2s
    return interval(1200).pipe(
      switchMap(() => this.http.get<any>(statusUrl).pipe(
        catchError(err => of({ error: true, err }))
      )),
      tap((res: any) => {
        if (res?.error) {
          this.jobs.fail(taskId, 'Network error');
          return;
        }
        const state = (res.state || '').toLowerCase();   // PENDING/PROGRESS/SUCCESS/FAILURE...
        const info = res.progress || res.info || null;   // server meta

        // map server state -> UI
        if (state === 'pending' || state === 'received' || state === 'started' || state === 'progress' || state === 'running') {
          const percent = info?.percent ?? (info?.current && info?.total ? Math.round((info.current / info.total) * 100) : null);
          const label = info?.message || info?.status || 'Processing…';
          this.jobs.upsert(taskId, { state: 'running', percent: percent ?? null, message: label });
        } else if (state === 'retry' || state === 'retrying') {
          this.jobs.upsert(taskId, { state: 'retrying', percent: null, message: 'Retrying…' });
        } else if (state === 'success' || state === 'finished') {
          const url = res.file_url || res.download_url || null;
          this.jobs.complete(taskId, url || undefined);
          this.triggerDownload(url, 'GUEST REPORT');
        } else if (state === 'failure' || state === 'failed' || state === 'revoked') {
          const msg = res.error_message || 'Failed';
          this.jobs.fail(taskId, msg);
        } else {
          // unknown -> treat as running indeterminate
          this.jobs.upsert(taskId, { state: 'running', percent: null, message: 'Processing…' });
        }
      }),
      // stop polling when finished/failed (service removes later)
      takeWhile((res: any) => {
        const s = (res?.state || '').toLowerCase();
        return !(s === 'success' || s === 'finished' || s === 'failure' || s === 'failed' || s === 'revoked');
      }, true)
    );
  }

  private pollStatus(statusUrl: string, intervalMs = 1500, timeoutMs = 20 * 60 * 1000): Observable<ReportJobStatus> {
    const start = Date.now();
    return timer(0, intervalMs).pipe(
      switchMap(() => this.http.get<ReportJobStatus>(statusUrl)),
      takeWhile((s) => {
        const done = s.file_url || s.job_status === 'completed' || s.state === 'SUCCESS' || s.job_status === 'failed' || s.state === 'FAILURE';
        const timedOut = Date.now() - start > timeoutMs;
        return !done && !timedOut;
      }, true), // include the last value (done/failed) in the stream
      catchError(err => throwError(() => err)),
    );
  }

  private filenameFromHeadersOrHint(resp: HttpResponse<Blob>, hint: string): string {
    const cd = resp.headers?.get('Content-Disposition') || '';
    const m = /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i.exec(cd);
    const serverName = decodeURIComponent(m?.[1] || m?.[2] || '');
    return (serverName || hint || 'download').replace(/[/\\?%*:|"<>]/g, '_');
  }

  /** Save a blob via a temporary <a> tag (no external libs). */
  private saveBlobResponse(resp: HttpResponse<Blob>, filenameHint: string) {
    const blob = resp.body!;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = this.filenameFromHeadersOrHint(resp, filenameHint);
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  /** Map your logical format to a sensible default MIME (only used as a fallback). */
  private mimeFor(format: ReportFormat): string {
    return format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }


  private startAsyncReportAndDownload(
    kickoffUrl: string,
    fileNameHint: string,
    format: ReportFormat
  ): Observable<void> {
    // 1) Try to start async
    return this.http.get<AsyncKickoffResponse>(`${kickoffUrl}?async=1`, { observe: 'body' }).pipe(
      switchMap((kick) => {
        // If the backend provided task_id & status_url, go async path
        if (kick?.task_id && kick?.status_url) {
          // 2) Poll until completed, then download the file
          return this.pollStatus(kick.status_url).pipe(
            filter(s => Boolean(s.file_url) || s.job_status === 'failed' || s.state === 'FAILURE'),
            switchMap((finalStatus) => {
              if (!finalStatus.file_url) {
                return throwError(() => new Error(finalStatus.error_message || 'Report generation failed'));
              }
              return this.http.get(finalStatus.file_url, {
                responseType: 'blob',
                observe: 'response' // we want headers for filename
              });
            }),
            map((resp) => {
              // Some storages may give generic content-type; we don't rely on it here
              if (!(resp instanceof HttpResponse)) return;
              this.saveBlobResponse(resp, fileNameHint || `report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
            })
          );
        }

        // No task info returned — backend probably responded synchronously.
        // Refetch as Blob so we can save it properly with headers:
        return this.http.get(kickoffUrl, {
          responseType: 'blob',
          observe: 'response'
        }).pipe(
          map((resp) => {
            if (!(resp instanceof HttpResponse)) return;
            this.saveBlobResponse(resp, fileNameHint || `report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
          })
        );
      }),
      // Be nice to callers; share result if multiple subscribers attach.
      shareReplay({ bufferSize: 1, refCount: false }),
      catchError((err) => {
        // optional: plug in your toast/translate here
        // this.toastr.error('Download failed');
        return throwError(() => err);
      })
    );
  }


  public startAsyncReport(create$: Observable<CreateAsyncJobResponse>, label = 'Generating report') {
    return create$.pipe(
      tap(res => {
        // register job immediately (queued)
        this.jobs.upsert(res.task_id, { id: res.task_id, label, state: 'queued', percent: null, message: res.message ?? 'Queued…' });
      }),
      switchMap(res =>
        // begin polling until finished/failed
        this.trackJob(res.task_id, res.status_url, label)
      )
    );
  }

  // guest report by guest type
  public createGuestRangeReport(format: 'pdf' | 'excel', _title: string, start?: string | null, end?: string | null, guestType?: string | null) {
    // Build your existing backend URL. `?async=1` tells server to enqueue.
    const s = start ?? '-';
    const e = end ?? '-';
    const gt = guestType ?? '-';
    const url = `${environment.apiUrl}/reports/guestlist-type/${format}/${s}/${e}/${gt}?async=1`;
    return this.http.get<CreateAsyncJobResponse>(url);
  }

  /** Poll a job status_url until finished/failed, updating the progress service. */
  public pollJob(statusUrl: string, pollMs = 1500): Observable<JobStatusResponse> {
    // show an indeterminate bar first
    this.progress.setLabel('Preparing report…');

    return timer(0, pollMs).pipe(
      switchMap(() => this.http.get<JobStatusResponse>(statusUrl)),
      map(res => {
        // update progress bar
        const p = res.progress || {};
        const percent = typeof p.percent === 'number'
          ? p.percent
          : (p.current != null && p.total ? Math.round((p.current / p.total) * 100) : 0);

        if (res.status === 'running' || res.status === 'queued' || res.status === 'retrying') {
          if (percent && percent > 0) {
            this.progress.setMode('determinate');
            this.progress.setPercent(percent);
          } else {
            this.progress.setMode('indeterminate');
          }
          this.progress.setLabel(p.message || 'Working…');
        }

        return res;
      }),
      // keep the last terminal emission
      takeWhile(res => res.status !== 'finished' && res.status !== 'failed', true),
      finalize(() => {
        // leave the bar at 100 for a beat; caller can clear when download starts
      }),
      catchError(err => {
        this.progress.setLabel('Failed');
        return throwError(() => err);
      })
    );
  }


  public createGuestDailyReport(format: string, fileName: string, start_date: string, geust_type: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-type-daily/${format}/${start_date}/${geust_type}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createGuestReport(format: string, fileName: string, data: any) {
    this.http.post(`${environment.apiUrl}/reports/geust-report`, data, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {

          if (response != null) {


            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }

  /// guest report by gender

  // Returns { task_id, status_url, ... } like your existing createGuestRangeReport
  public createGuestRangeReportByGender(
    format: 'pdf' | 'excel',
    _title: string,                       // kept for parity; not sent to backend
    start?: string | null,
    end?: string | null,
    guestGender?: string | null
  ) {
    const s = start ?? '-';
    const e = end ?? '-';
    const gg = guestGender ?? '-';
    const url = `${environment.apiUrl}/reports/guestlist-gender/${format}/${s}/${e}/${gg}?async=1`;
    return this.http.get<CreateAsyncJobResponse>(url);
  }

  public createGuestDailyReportByGender(format: string, fileName: string, start_date: string, guest_gender: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-gender-daily/${format}/${start_date}/${guest_gender}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }



  // guest report by hotel
  public createGuestRangeReportByHotel(
    format: 'pdf' | 'excel',
    _title: string,                      // kept for parity; not sent
    start?: string | null,
    end?: string | null,
    guestHotel?: string | number | null
  ) {
    const s = start ?? '-';
    const e = end ?? '-';
    const gh = (guestHotel ?? '-').toString();
    const url = `${environment.apiUrl}/reports/guestlist-hotel/${format}/${s}/${e}/${gh}?async=1`;
    return this.http.get<CreateAsyncJobResponse>(url);
  }


createTopResidenceReport(
  format: 'pdf' | 'excel',
  windowDays: number,
  topN: number,
  includeZero: boolean
): Observable<CreateAsyncJobResponse> {
  let params = new HttpParams()
    .set('report_format', format)
    .set('window_days', String(windowDays))
    .set('top_n', String(topN))
    .set('include_zero', String(includeZero))
    .set('async', '1');

  // Make sure apiUrl matches your Django route (often includes /api)
  const url = `${environment.apiUrl}/reports/top-residence`;
  return this.http.get<CreateAsyncJobResponse>(url, { params });
}


  public createGuestDailyReportByHotel(format: string, fileName: string, start_date: string, guest_gender: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-hotel-daily/${format}/${start_date}/${guest_gender}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }

  /// guest report by user

  public createGuestRangeReportByUser(format: string, fileName: string, start_date: string, end_date: string, user: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-user/${format}/${start_date}/${end_date}/${user}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createGuestDailyReportByUser(format: string, fileName: string, start_date: string, user: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-user-daily/${format}/${start_date}/${user}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }


  // Guest report by city and address type
  public createGuestRangeReportByCity(format: string, fileName: string, start_date: string, end_date: string, city: string, address_type: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-city/${format}/${start_date}/${end_date}/${city}/${address_type}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createGuestDailyReportByCity(format: string, fileName: string, start_date: string, city: string, address_type: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-city-daily/${format}/${start_date}/${city}/${address_type}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  // Guest report by city and address type
  public createGuestRangeReportByResidnece(format: string, fileName: string, start_date: string, end_date: string, guest_resident: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-hotel-type/${format}/${start_date}/${end_date}/${guest_resident}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createGuestDailyReportByResidence(format: string, fileName: string, start_date: string, guest_resident: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-hotel-type-daily/${format}/${start_date}/${guest_resident}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }


  // individual guest print
  // Guest report by city and address type
  public printIndividualGuest(format: string, fileName: string, guest_id: string) {
    this.http.get(`${environment.apiUrl}/reports/individual-guest-print/${format}/${guest_id}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public printGuestHistory(format: string, fileName: string, nid: string) {
    this.http.get(`${environment.apiUrl}/reports/guest-history-report/${format}/${nid}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }

  // staff reports

  public createStaffDailyReport(format: string, fileName: string, start_date: string) {
    this.http.get(`${environment.apiUrl}/reports/staff-daily-report/${format}/${start_date}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createStaffTotalReport(format: string, fileName: string) {
    this.http.get(`${environment.apiUrl}/reports/staff-total-report/${format}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createStaffRangeReport(format: string, fileName: string, start_date: string, end_date: string) {
    this.http.get(`${environment.apiUrl}/reports/staff-range-report/${format}/${start_date}/${end_date}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createStaffbyHotelDailyReport(format: string, fileName: string, start_date: string, staff_hotel: string) {
    this.http.get(`${environment.apiUrl}/reports/staff-hotel-daily/${format}/${start_date}/${staff_hotel}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createStaffbyHotelRangeReport(format: string, fileName: string, start_date: string, end_date: string, staff_hotel: string) {
    this.http.get(`${environment.apiUrl}/reports/staff-hotel-range/${format}/${start_date}/${end_date}/${staff_hotel}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }

  public createStaffbyHotelTypeDailyReport(format: string, fileName: string, start_date: string, hotel_type: string) {
    this.http.get(`${environment.apiUrl}/reports/staff-hoteltype-daily/${format}/${start_date}/${hotel_type}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createStaffbyHotelTypeRangeReport(format: string, fileName: string, start_date: string, end_date: string, hotel_type: string) {
    this.http.get(`${environment.apiUrl}/reports/staff-hoteltype-range/${format}/${start_date}/${end_date}/${hotel_type}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }

  public createStaffbyGenderDailyReport(format: string, fileName: string, start_date: string, gender: string) {
    this.http.get(`${environment.apiUrl}/reports/staff-gender-daily/${format}/${start_date}/${gender}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createStaffbyGenderRangeReport(format: string, fileName: string, start_date: string, end_date: string, gender: string) {
    this.http.get(`${environment.apiUrl}/reports/staff-gender-range/${format}/${start_date}/${end_date}/${gender}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }

  // hotel reports
  public createResidenceDailyReport(format: string, fileName: string, start_date: string) {
    this.http.get(`${environment.apiUrl}/reports/residence-daily/${format}/${start_date}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createResidencebyTypeDailyReport(format: string, fileName: string, start_date: string, hotel_type: string) {
    this.http.get(`${environment.apiUrl}/reports/residence-daily-type/${format}/${start_date}/${hotel_type}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }

  public createResidenceRangeReport(format: string, fileName: string, start_date: string, end_date: string) {
    this.http.get(`${environment.apiUrl}/reports/residence-range/${format}/${start_date}/${end_date}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createResidencebyTypeRangeReport(format: string, fileName: string, start_date: string, end_date: string, hotel_type: string) {
    this.http.get(`${environment.apiUrl}/reports/residence-range-type/${format}/${start_date}/${end_date}/${hotel_type}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createGuestByZoneRangeReport(format: string, fileName: string, start_date: string, end_date: string, zone_id: string) {
    this.http.get(`${environment.apiUrl}/reports/guest-by-zone-range/${format}/${start_date}/${end_date}/${zone_id}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createGuestByCountryRangeReport(format: string, fileName: string, start_date: string, end_date: string, country: string, address_type: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-country/${format}/${start_date}/${end_date}/${country}/${address_type}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createGuestByZoneDailyReport(format: string, fileName: string, start_date: string, zone_id: string) {
    this.http.get(`${environment.apiUrl}/reports/guest-by-zone-daily/${format}/${start_date}/${zone_id}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }
  public createGuestByCountryDailyReport(format: string, fileName: string, start_date: string, country: string, address_type: string) {
    this.http.get(`${environment.apiUrl}/reports/guestlist-country-daily/${format}/${start_date}/${country}/${address_type}`, { responseType: 'blob' })
      .subscribe({
        next: (response: any) => {
          if (response != null) {

            if (format == 'pdf') {
              const blob = new Blob([response], { type: 'application/pdf' });
              this.openFileInNewTab(blob, fileName, 'pdf');
            } else if (format == 'excel') {
              const blob = new Blob([response], { type: 'application/ms-excel' })
              this.openFileInNewTab(blob, fileName, 'excel');
            }

          } else {
            this.translate.get('TR.no_data').subscribe((message: string) => {
              this.translate.get('TR.WARNING_TITLE').subscribe((title: string) => {
                this.toastr.warning(message, title);
              });
            });
          }
        }
      })
  }



  openFileInNewTab(blob: Blob, filename: string, fileType: string) {
    const url = URL.createObjectURL(blob)
    const file = document.createElement('a');
    file.href = url;
    file.target = '_blank'
    if (fileType == 'pdf') {

      file.download = filename + '.pdf';
    } else if (fileType == 'excel') {
      file.download = filename + '.xlsx';
    }
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: true,
      cancelable: true
    });
    file.dispatchEvent(clickEvent)
  }

}
