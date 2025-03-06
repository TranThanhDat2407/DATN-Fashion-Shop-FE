import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreInventoryComponent } from './store-inventory.component';

describe('StoreInventoryComponent', () => {
  let component: StoreInventoryComponent;
  let fixture: ComponentFixture<StoreInventoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreInventoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
