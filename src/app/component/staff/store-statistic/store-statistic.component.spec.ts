import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreStatisticComponent } from './store-statistic.component';

describe('StoreStatisticComponent', () => {
  let component: StoreStatisticComponent;
  let fixture: ComponentFixture<StoreStatisticComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreStatisticComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreStatisticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
