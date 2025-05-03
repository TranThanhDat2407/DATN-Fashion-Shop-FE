import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreStatisticalComponent } from './store-statistical.component';

describe('StoreStatisticalComponent', () => {
  let component: StoreStatisticalComponent;
  let fixture: ComponentFixture<StoreStatisticalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreStatisticalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreStatisticalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
