import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GuestUserComponent } from './guest-user.component';

describe('GuestUserComponent', () => {
  let component: GuestUserComponent;
  let fixture: ComponentFixture<GuestUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GuestUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GuestUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
