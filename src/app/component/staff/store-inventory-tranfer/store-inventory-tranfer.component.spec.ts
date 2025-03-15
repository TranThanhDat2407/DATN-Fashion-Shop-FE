import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreInventoryTranferComponent } from './store-inventory-tranfer.component';

describe('StoreInventoryTranferComponent', () => {
  let component: StoreInventoryTranferComponent;
  let fixture: ComponentFixture<StoreInventoryTranferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreInventoryTranferComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreInventoryTranferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
