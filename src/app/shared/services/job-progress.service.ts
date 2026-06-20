import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type JobState = 'queued'|'running'|'retrying'|'finished'|'failed';
export interface JobProgress {
  id: string;
  label: string;
  state: JobState;
  percent: number | null;     
  message?: string | null;
  fileUrl?: string | null;
}

@Injectable({ providedIn: 'root' })
export class JobProgressService {
  private jobs = new Map<string, JobProgress>();
  private subject = new BehaviorSubject<JobProgress[]>([]);
  public readonly jobs$: Observable<JobProgress[]> = this.subject.asObservable();

  upsert(id: string, patch: Partial<JobProgress>) {
    const curr = this.jobs.get(id) ?? {
      id, label: 'Preparing…', state: 'queued' as JobState, percent: null, message: null, fileUrl: null
    };
    const next = { ...curr, ...patch };
    this.jobs.set(id, next);
    this.emit();
  }

  complete(id: string, fileUrl?: string) {
    const curr = this.jobs.get(id);
    if (!curr) return;
    this.jobs.set(id, { ...curr, state: 'finished', percent: 100, message: 'Done', fileUrl: fileUrl ?? curr.fileUrl ?? null });
    this.emit();
    setTimeout(() => this.remove(id), 4000);
  }

  fail(id: string, message?: string) {
    const curr = this.jobs.get(id);
    if (!curr) return;
    this.jobs.set(id, { ...curr, state: 'failed', percent: null, message: message ?? 'Failed' });
    this.emit();
    setTimeout(() => this.remove(id), 8000);
  }

  remove(id: string) {
    if (this.jobs.delete(id)) this.emit();
  }

  clearAll() {
    this.jobs.clear();
    this.emit();
  }

  private emit() {
    this.subject.next(Array.from(this.jobs.values()));
  }
}
