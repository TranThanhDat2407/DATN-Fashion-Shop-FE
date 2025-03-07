import {ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {TranslateModule} from '@ngx-translate/core';
import {CommonModule, NgClass, NgIf} from '@angular/common';

@Component({
  selector: 'app-modal-register-success',
  standalone: true,
  imports: [
    TranslateModule,
    NgClass,
    NgIf,
    CommonModule
  ],
  templateUrl: './modal-register-success.component.html',
  styleUrl: './modal-register-success.component.scss'
})
export class ModalRegisterSuccessComponent implements OnChanges {
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
    }, 3000);
  }

  openModal() {
    this.isModalOpenaa = true;
    this.isFadingOut = false;
    this.autoCloseModal();
  }
}
