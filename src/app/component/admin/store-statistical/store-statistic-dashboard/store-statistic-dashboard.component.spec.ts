import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreStatisticDashboardComponent } from './store-statistic-dashboard.component';

describe('StoreStatisticDashboardComponent', () => {
  let component: StoreStatisticDashboardComponent;
  let fixture: ComponentFixture<StoreStatisticDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreStatisticDashboardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreStatisticDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
