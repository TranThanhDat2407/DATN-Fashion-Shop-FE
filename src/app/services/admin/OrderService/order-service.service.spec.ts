import { TestBed } from '@angular/core/testing';
import { OrderServiceAdmin } from './order-serviceAdmin.service';
 

describe('OrderServiceService', () => {
  let service: OrderServiceAdmin;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderServiceAdmin);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
