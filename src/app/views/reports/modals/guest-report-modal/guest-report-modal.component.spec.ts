import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestReportModalComponent } from './guest-report-modal.component';

describe('UserReportModalComponent', () => {
  let component: GuestReportModalComponent;
  let fixture: ComponentFixture<GuestReportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuestReportModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestReportModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
