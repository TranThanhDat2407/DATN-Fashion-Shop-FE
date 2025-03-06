import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalResetPasswordSuccessComponent } from './modal-reset-password-success.component';

describe('ModalResetPasswordSuccessComponent', () => {
  let component: ModalResetPasswordSuccessComponent;
  let fixture: ComponentFixture<ModalResetPasswordSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalResetPasswordSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalResetPasswordSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
