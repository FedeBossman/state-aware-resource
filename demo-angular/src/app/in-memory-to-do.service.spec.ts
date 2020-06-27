import { TestBed } from '@angular/core/testing';

import { InMemoryToDoService } from './in-memory-to-do.service';

describe('InMemoryToDoService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InMemoryToDoService = TestBed.get(InMemoryToDoService);
    expect(service).toBeTruthy();
  });
});
