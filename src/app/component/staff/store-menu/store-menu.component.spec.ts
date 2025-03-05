import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreMenuComponent } from './store-menu.component';

describe('StoreMenuComponent', () => {
  let component: StoreMenuComponent;
  let fixture: ComponentFixture<StoreMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreMenuComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
