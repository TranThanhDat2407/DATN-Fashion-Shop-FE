import { CommonModule } from '@angular/common';
import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-model-notify-succsess',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './model-notify-succsess.component.html',
  styleUrl: './model-notify-succsess.component.scss'
})
export class ModelNotifySuccsessComponent implements OnChanges {
  @Input() isModalOpenaa: boolean = false;
  isFadingOut: boolean = false;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isModalOpenaa'] && this.isModalOpenaa) {
      this.autoCloseModal();
    }
  }

  autoCloseModal() {
    setTimeout(() => {
      this.isFadingOut = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.isModalOpenaa = false;
        this.isFadingOut = false;
        this.cdr.detectChanges();
      }, 500);
    }, 1500);
  }

  openModal() {
    this.isModalOpenaa = true;
    this.isFadingOut = false;
    this.autoCloseModal();
  }
}
