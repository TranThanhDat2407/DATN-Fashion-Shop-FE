import { TestBed } from '@angular/core/testing';

import { InventoryTransferService } from './inventory-transfer.service';

describe('InventoryTransferService', () => {
  let service: InventoryTransferService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InventoryTransferService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
