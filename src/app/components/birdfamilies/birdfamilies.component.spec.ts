import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdfamiliesComponent } from './birdfamilies.component';

describe('BirdfamiliesComponent', () => {
  let component: BirdfamiliesComponent;
  let fixture: ComponentFixture<BirdfamiliesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirdfamiliesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirdfamiliesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
