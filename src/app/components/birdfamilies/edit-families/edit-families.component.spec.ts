import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFamiliesComponent } from './edit-families.component';

describe('EditFamiliesComponent', () => {
  let component: EditFamiliesComponent;
  let fixture: ComponentFixture<EditFamiliesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFamiliesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFamiliesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
