import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckoutConfirmationComponent } from './checkout-confirmation.component';

describe('CheckoutComfirmationComponent', () => {
  let component: CheckoutConfirmationComponent;
  let fixture: ComponentFixture<CheckoutConfirmationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutConfirmationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckoutConfirmationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
