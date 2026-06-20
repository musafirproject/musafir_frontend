import { TestBed } from '@angular/core/testing';

import { RequestProgressService } from './request-progress.service';

describe('RequestProgressService', () => {
  let service: RequestProgressService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RequestProgressService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
