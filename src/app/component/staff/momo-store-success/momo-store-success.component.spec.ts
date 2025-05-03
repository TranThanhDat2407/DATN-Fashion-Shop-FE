import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MomoStoreSuccessComponent } from './momo-store-success.component';

describe('MomoStoreSuccessComponent', () => {
  let component: MomoStoreSuccessComponent;
  let fixture: ComponentFixture<MomoStoreSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MomoStoreSuccessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MomoStoreSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
