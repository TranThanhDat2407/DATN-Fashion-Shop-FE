import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WeeklyRevenueChartComponent } from './weekly-revenue-chart.component';

describe('WeeklyRevenueChartComponent', () => {
  let component: WeeklyRevenueChartComponent;
  let fixture: ComponentFixture<WeeklyRevenueChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WeeklyRevenueChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WeeklyRevenueChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
