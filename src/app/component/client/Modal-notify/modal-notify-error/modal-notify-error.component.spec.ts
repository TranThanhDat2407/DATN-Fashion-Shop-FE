import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotifyErrorComponent } from './modal-notify-error.component';

describe('ModalNotifyErrorComponent', () => {
  let component: ModalNotifyErrorComponent;
  let fixture: ComponentFixture<ModalNotifyErrorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNotifyErrorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNotifyErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
