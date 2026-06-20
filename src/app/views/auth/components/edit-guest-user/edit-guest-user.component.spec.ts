import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditGuestUserComponent } from './edit-guest-user.component';

describe('ViewGuestUserComponent', () => {
  let component: EditGuestUserComponent;
  let fixture: ComponentFixture<EditGuestUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditGuestUserComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditGuestUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
