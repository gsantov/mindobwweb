import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTrailComponent } from './edit-trail.component';

describe('EditTrailComponent', () => {
  let component: EditTrailComponent;
  let fixture: ComponentFixture<EditTrailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTrailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTrailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
