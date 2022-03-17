import { TestBed } from '@angular/core/testing';

import { BirdfamiliesService } from './birdfamilies.service';

describe('BirdfamiliesService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BirdfamiliesService = TestBed.get(BirdfamiliesService);
    expect(service).toBeTruthy();
  });
});
