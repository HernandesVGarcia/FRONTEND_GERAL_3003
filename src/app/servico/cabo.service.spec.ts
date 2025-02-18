import { TestBed } from '@angular/core/testing';

import { CaboService } from './cabo.service';

describe('CaboService', () => {
  let service: CaboService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CaboService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
