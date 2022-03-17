import { TestBed } from '@angular/core/testing';

import { HotspotService } from './hotspot.service';

describe('HotspotService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: HotspotService = TestBed.get(HotspotService);
    expect(service).toBeTruthy();
  });
});
