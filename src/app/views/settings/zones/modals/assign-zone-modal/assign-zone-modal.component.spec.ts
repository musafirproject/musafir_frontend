import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignZoneModalComponent } from './assign-zone-modal.component';

describe('AssignZoneModalComponent', () => {
  let component: AssignZoneModalComponent;
  let fixture: ComponentFixture<AssignZoneModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignZoneModalComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignZoneModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
