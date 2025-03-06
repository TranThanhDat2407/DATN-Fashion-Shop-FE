import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelNotifySuccsessComponent } from './model-notify-succsess.component';

describe('ModelNotifySuccsessComponent', () => {
  let component: ModelNotifySuccsessComponent;
  let fixture: ComponentFixture<ModelNotifySuccsessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelNotifySuccsessComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelNotifySuccsessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
