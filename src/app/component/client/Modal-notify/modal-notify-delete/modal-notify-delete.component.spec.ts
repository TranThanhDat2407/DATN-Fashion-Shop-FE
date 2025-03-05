import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalNotifyDeleteComponent } from './modal-notify-delete.component';

describe('ModalNotifyDeleteComponent', () => {
  let component: ModalNotifyDeleteComponent;
  let fixture: ComponentFixture<ModalNotifyDeleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalNotifyDeleteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalNotifyDeleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
