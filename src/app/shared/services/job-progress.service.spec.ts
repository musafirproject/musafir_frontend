import { TestBed } from '@angular/core/testing';

import { JobProgressService } from './job-progress.service';

describe('JobProgressService', () => {
  let service: JobProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
