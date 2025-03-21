import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonthlyRevenueChartComponent } from './monthly-revenue-chart.component';

describe('MonthlyRevenueChartComponent', () => {
  let component: MonthlyRevenueChartComponent;
  let fixture: ComponentFixture<MonthlyRevenueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonthlyRevenueChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonthlyRevenueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
