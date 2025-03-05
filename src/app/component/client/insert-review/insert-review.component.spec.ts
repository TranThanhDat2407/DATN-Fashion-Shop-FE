import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InsertReviewComponent } from './insert-review.component';

describe('InsertReviewComponent', () => {
  let component: InsertReviewComponent;
  let fixture: ComponentFixture<InsertReviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InsertReviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InsertReviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
