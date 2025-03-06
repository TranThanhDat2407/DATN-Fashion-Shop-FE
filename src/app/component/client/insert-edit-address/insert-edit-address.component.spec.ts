import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertEditAddressComponent } from './insert-edit-address.component';

describe('InsertEditAddressComponent', () => {
  let component: InsertEditAddressComponent;
  let fixture: ComponentFixture<InsertEditAddressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertEditAddressComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertEditAddressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
