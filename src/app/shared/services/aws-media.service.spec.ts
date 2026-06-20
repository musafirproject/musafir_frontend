import { TestBed } from '@angular/core/testing';

import { AwsMediaService } from './aws-media.service';

describe('AwsMediaService', () => {
  let service: AwsMediaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AwsMediaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
