import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestJourneyComponent } from './guest-journey.component';

describe('GuestJourneyComponent', () => {
  let component: GuestJourneyComponent;
  let fixture: ComponentFixture<GuestJourneyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuestJourneyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestJourneyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
