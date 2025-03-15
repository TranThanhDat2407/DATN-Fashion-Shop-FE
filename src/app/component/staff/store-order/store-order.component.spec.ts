import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreOrderComponent } from './store-order.component';

describe('StoreOrderComponent', () => {
  let component: StoreOrderComponent;
  let fixture: ComponentFixture<StoreOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
