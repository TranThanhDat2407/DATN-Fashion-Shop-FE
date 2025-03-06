import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOtpSuccessComponent } from './modal-otp-success.component';

describe('ModalOtpSuccessComponent', () => {
  let component: ModalOtpSuccessComponent;
  let fixture: ComponentFixture<ModalOtpSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOtpSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOtpSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
