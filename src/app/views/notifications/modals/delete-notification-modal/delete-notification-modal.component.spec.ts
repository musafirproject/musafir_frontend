import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteNotificationModalComponent } from './delete-notification-modal.component';

describe('DeleteNotificationModalComponent', () => {
  let component: DeleteNotificationModalComponent;
  let fixture: ComponentFixture<DeleteNotificationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeleteNotificationModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeleteNotificationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
