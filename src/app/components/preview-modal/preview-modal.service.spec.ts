import { TestBed } from '@angular/core/testing';

import { PreviewModalService } from './preview-modal.service';

describe('PreviewModalService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: PreviewModalService = TestBed.get(PreviewModalService);
    expect(service).toBeTruthy();
  });
});
