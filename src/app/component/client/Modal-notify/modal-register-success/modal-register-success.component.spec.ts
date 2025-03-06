import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRegisterSuccessComponent } from './modal-register-success.component';

describe('ModalRegisterSuccessComponent', () => {
  let component: ModalRegisterSuccessComponent;
  let fixture: ComponentFixture<ModalRegisterSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRegisterSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRegisterSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
