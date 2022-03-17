import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditHotspotComponent } from './edit-hotspot.component';

describe('EditHotspotComponent', () => {
  let component: EditHotspotComponent;
  let fixture: ComponentFixture<EditHotspotComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditHotspotComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditHotspotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
