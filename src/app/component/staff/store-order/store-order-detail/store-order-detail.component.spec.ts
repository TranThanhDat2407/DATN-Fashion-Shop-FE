import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreOrderDetailComponent } from './store-order-detail.component';

describe('StoreOrderDetailComponent', () => {
  let component: StoreOrderDetailComponent;
  let fixture: ComponentFixture<StoreOrderDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreOrderDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreOrderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
