import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderComparisonChartComponent } from './order-comparison-chart.component';

describe('OrderComparisonChartComponent', () => {
  let component: OrderComparisonChartComponent;
  let fixture: ComponentFixture<OrderComparisonChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderComparisonChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrderComparisonChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
