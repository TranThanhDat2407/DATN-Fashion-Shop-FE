import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EnterUserComponent } from './enter-user.component';

describe('EnterUserComponent', () => {
  let component: EnterUserComponent;
  let fixture: ComponentFixture<EnterUserComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EnterUserComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EnterUserComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
