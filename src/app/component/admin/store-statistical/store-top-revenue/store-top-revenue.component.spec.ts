import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreTopRevenueComponent } from './store-top-revenue.component';

describe('StoreTopRevenueComponent', () => {
  let component: StoreTopRevenueComponent;
  let fixture: ComponentFixture<StoreTopRevenueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreTopRevenueComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreTopRevenueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
