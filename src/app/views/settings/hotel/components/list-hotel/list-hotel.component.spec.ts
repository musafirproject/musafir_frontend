import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListhotelComponent } from './list-hotel.component';

describe('ListWebconfigComponent', () => {
  let component: ListhotelComponent;
  let fixture: ComponentFixture<ListhotelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListhotelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListhotelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
