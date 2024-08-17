import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';

import { libraryGuard } from './library.guard';

describe('libraryGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) => 
      TestBed.runInInjectionContext(() => libraryGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
