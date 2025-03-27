import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCategoryForProductComponent } from './edit-category-for-product.component';

describe('EditCategoryForProductComponent', () => {
  let component: EditCategoryForProductComponent;
  let fixture: ComponentFixture<EditCategoryForProductComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCategoryForProductComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCategoryForProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
