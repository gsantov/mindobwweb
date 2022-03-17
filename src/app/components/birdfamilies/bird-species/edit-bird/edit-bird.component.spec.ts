import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBirdComponent } from './edit-bird.component';

describe('EditBirdComponent', () => {
  let component: EditBirdComponent;
  let fixture: ComponentFixture<EditBirdComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditBirdComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditBirdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
