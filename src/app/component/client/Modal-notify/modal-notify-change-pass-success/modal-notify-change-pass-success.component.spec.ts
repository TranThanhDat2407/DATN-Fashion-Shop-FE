import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotifyChangePassSuccessComponent } from './modal-notify-change-pass-success.component';

describe('ModalNotifyChangePassSuccessComponent', () => {
  let component: ModalNotifyChangePassSuccessComponent;
  let fixture: ComponentFixture<ModalNotifyChangePassSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNotifyChangePassSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNotifyChangePassSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
