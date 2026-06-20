import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobProgressOverlayComponent } from './job-progress-overlay.component';

describe('JobProgressOverlayComponent', () => {
  let component: JobProgressOverlayComponent;
  let fixture: ComponentFixture<JobProgressOverlayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ JobProgressOverlayComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobProgressOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
