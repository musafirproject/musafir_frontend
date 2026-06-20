import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestHistoryComponent } from './guest-history.component';

describe('GuestHistoryComponent', () => {
  let component: GuestHistoryComponent;
  let fixture: ComponentFixture<GuestHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuestHistoryComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
