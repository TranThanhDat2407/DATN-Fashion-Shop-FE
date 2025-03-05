import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRegisterFailComponent } from './modal-register-fail.component';

describe('ModalRegisterFailComponent', () => {
  let component: ModalRegisterFailComponent;
  let fixture: ComponentFixture<ModalRegisterFailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRegisterFailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRegisterFailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
