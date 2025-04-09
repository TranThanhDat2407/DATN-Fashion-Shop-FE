import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDateRangeStatisticComponent } from './store-date-range-statistic.component';

describe('StoreDateRangeStatisticComponent', () => {
  let component: StoreDateRangeStatisticComponent;
  let fixture: ComponentFixture<StoreDateRangeStatisticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreDateRangeStatisticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreDateRangeStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
