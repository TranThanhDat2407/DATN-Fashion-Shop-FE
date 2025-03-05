import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TestStaffComponent } from './test-staff.component';

describe('TestStaffComponent', () => {
  let component: TestStaffComponent;
  let fixture: ComponentFixture<TestStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestStaffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TestStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
