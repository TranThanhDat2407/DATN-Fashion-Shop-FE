import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateRangeStatisticComponent } from './date-range-statistic.component';

describe('DateRangeStatisticComponent', () => {
  let component: DateRangeStatisticComponent;
  let fixture: ComponentFixture<DateRangeStatisticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DateRangeStatisticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DateRangeStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
