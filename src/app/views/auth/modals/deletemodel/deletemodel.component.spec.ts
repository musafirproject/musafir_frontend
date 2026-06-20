import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeletemodelComponent } from './deletemodel.component';

describe('DeletemodelComponent', () => {
  let component: DeletemodelComponent;
  let fixture: ComponentFixture<DeletemodelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DeletemodelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeletemodelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
