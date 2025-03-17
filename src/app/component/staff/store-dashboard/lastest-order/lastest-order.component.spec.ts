import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LastestOrderComponent } from './lastest-order.component';

describe('LastestOrderComponent', () => {
  let component: LastestOrderComponent;
  let fixture: ComponentFixture<LastestOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LastestOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LastestOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
