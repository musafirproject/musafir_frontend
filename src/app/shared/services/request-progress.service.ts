import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

interface ProgressState {
  active: {
    mode: 'determinate' | 'indeterminate';
    percent: number;
    label: string;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class RequestProgressService {
  private stateSubject = new BehaviorSubject<ProgressState>({ active: null });
  public state$: Observable<ProgressState> = this.stateSubject.asObservable();

  setLabel(label: string | null): void {
    const current = this.stateSubject.value.active;
    if (label === null) {
      this.stateSubject.next({ active: null });
    } else if (current) {
      this.stateSubject.next({
        active: { ...current, label }
      });
    } else {
      this.stateSubject.next({
        active: { mode: 'indeterminate', percent: 0, label }
      });
    }
  }

  setMode(mode: 'determinate' | 'indeterminate'): void {
    const current = this.stateSubject.value.active;
    if (current) {
      this.stateSubject.next({
        active: { ...current, mode }
      });
    }
  }

  setPercent(percent: number): void {
    const current = this.stateSubject.value.active;
    if (current) {
      this.stateSubject.next({
        active: { ...current, percent, mode: 'determinate' }
      });
    }
  }

  clear(): void {
    this.stateSubject.next({ active: null });
  }
}
