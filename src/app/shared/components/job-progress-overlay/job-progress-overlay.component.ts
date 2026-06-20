import { CommonModule } from '@angular/common';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { JobProgress, JobProgressService } from '@app/shared/services/job-progress.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-progress-overlay',
  templateUrl: './job-progress-overlay.component.html',
  styleUrls: ['./job-progress-overlay.component.css'],
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class JobProgressOverlayComponent {
  jobs$: Observable<JobProgress[]> = this.progress.jobs$;
  constructor(public progress: JobProgressService) {}

  trackById = (_: number, j: JobProgress) => j.id;
}
