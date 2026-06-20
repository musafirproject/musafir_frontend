import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHotelComponent } from './view-hotel.component';

describe('ViewWebconfigComponent', () => {
  let component: ViewHotelComponent;
  let fixture: ComponentFixture<ViewHotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewHotelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewHotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
