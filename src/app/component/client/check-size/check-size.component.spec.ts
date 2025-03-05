import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckSizeComponent } from './check-size.component';

describe('CheckSizeComponent', () => {
  let component: CheckSizeComponent;
  let fixture: ComponentFixture<CheckSizeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckSizeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckSizeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
