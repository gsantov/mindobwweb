import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BirdSpeciesComponent } from './bird-species.component';

describe('BirdSpeciesComponent', () => {
  let component: BirdSpeciesComponent;
  let fixture: ComponentFixture<BirdSpeciesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BirdSpeciesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BirdSpeciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
