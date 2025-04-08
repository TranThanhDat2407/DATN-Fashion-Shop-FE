import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDailyChartComponent } from './store-daily-chart.component';

describe('StoreDailyChartComponent', () => {
  let component: StoreDailyChartComponent;
  let fixture: ComponentFixture<StoreDailyChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreDailyChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreDailyChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
