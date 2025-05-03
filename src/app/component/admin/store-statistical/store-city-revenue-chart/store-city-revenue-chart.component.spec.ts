import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCityRevenueChartComponent } from './store-city-revenue-chart.component';

describe('StoreCityRevenueChartComponent', () => {
  let component: StoreCityRevenueChartComponent;
  let fixture: ComponentFixture<StoreCityRevenueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreCityRevenueChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreCityRevenueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
