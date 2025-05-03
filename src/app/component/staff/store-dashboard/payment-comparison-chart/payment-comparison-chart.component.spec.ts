import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentComparisonChartComponent } from './payment-comparison-chart.component';

describe('PaymentComparisonChartComponent', () => {
  let component: PaymentComparisonChartComponent;
  let fixture: ComponentFixture<PaymentComparisonChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaymentComparisonChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PaymentComparisonChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
