import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGuestUserComponent } from './create-guest-user.component';

describe('CreateGuestUserComponent', () => {
  let component: CreateGuestUserComponent;
  let fixture: ComponentFixture<CreateGuestUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CreateGuestUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateGuestUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
