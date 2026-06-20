import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditZoneComponent } from './edit-zone.component';

describe('EditZoneComponent', () => {
  let component: EditZoneComponent;
  let fixture: ComponentFixture<EditZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditZoneComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
