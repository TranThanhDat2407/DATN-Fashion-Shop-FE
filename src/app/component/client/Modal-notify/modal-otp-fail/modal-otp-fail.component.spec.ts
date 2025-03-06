import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalOtpFailComponent } from './modal-otp-fail.component';

describe('ModalOtpFailComponent', () => {
  let component: ModalOtpFailComponent;
  let fixture: ComponentFixture<ModalOtpFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalOtpFailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalOtpFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
