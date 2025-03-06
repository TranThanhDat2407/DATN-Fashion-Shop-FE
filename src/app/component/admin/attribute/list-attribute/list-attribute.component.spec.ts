import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListAttributeComponent } from './list-attribute.component';

describe('ListAttributeComponent', () => {
  let component: ListAttributeComponent;
  let fixture: ComponentFixture<ListAttributeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListAttributeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListAttributeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
