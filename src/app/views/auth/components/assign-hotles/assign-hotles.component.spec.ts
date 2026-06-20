import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignHotlesComponent } from './assign-hotles.component';

describe('AssignHotlesComponent', () => {
  let component: AssignHotlesComponent;
  let fixture: ComponentFixture<AssignHotlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AssignHotlesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignHotlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
