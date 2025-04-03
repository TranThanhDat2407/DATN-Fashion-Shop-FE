import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MomoSuccessComponent } from './momo-success.component';

describe('MomoSuccessComponent', () => {
  let component: MomoSuccessComponent;
  let fixture: ComponentFixture<MomoSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MomoSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MomoSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
