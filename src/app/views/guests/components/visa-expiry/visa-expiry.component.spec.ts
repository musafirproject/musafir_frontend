import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisaExpiryComponent } from './visa-expiry.component';

describe('VisaExpiryComponent', () => {
  let component: VisaExpiryComponent;
  let fixture: ComponentFixture<VisaExpiryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisaExpiryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VisaExpiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
