import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProductVariantComponent } from './edit-product-variant.component';

describe('EditProductVariantComponent', () => {
  let component: EditProductVariantComponent;
  let fixture: ComponentFixture<EditProductVariantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditProductVariantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProductVariantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
