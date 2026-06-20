import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResidencePerformanceComponent } from './residence-performance.component';

describe('ResidencePerformanceComponent', () => {
  let component: ResidencePerformanceComponent;
  let fixture: ComponentFixture<ResidencePerformanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ResidencePerformanceComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResidencePerformanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
