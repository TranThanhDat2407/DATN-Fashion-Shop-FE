import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalResetPasswordFailComponent } from './modal-reset-password-fail.component';

describe('ModalResetPasswordFailComponent', () => {
  let component: ModalResetPasswordFailComponent;
  let fixture: ComponentFixture<ModalResetPasswordFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalResetPasswordFailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalResetPasswordFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
