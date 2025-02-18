import { TestBed } from '@angular/core/testing';

import { CtoService } from './cto.service';

describe('CtoService', () => {
  let service: CtoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CtoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
