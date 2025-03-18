import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreInventoryTransferDetailComponent } from './store-inventory-transfer-detail.component';

describe('StoreInventoryTransferDetailComponent', () => {
  let component: StoreInventoryTransferDetailComponent;
  let fixture: ComponentFixture<StoreInventoryTransferDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreInventoryTransferDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreInventoryTransferDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
