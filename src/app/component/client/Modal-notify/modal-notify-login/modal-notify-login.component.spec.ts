import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotifyLoginComponent } from './modal-notify-login.component';

describe('ModalNotifyLoginComponent', () => {
  let component: ModalNotifyLoginComponent;
  let fixture: ComponentFixture<ModalNotifyLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNotifyLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNotifyLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
