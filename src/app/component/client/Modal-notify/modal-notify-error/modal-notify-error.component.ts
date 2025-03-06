import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-notify-error',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './modal-notify-error.component.html',
  styleUrl: './modal-notify-error.component.scss'
})
export class ModalNotifyErrorComponent implements OnChanges {
  @Input() isModalOpen: boolean = false;
  isFadingOut: boolean = false;
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges) {
    // Sửa lỗi: Đúng tên biến @Input
    if (changes['isModalOpen'] && this.isModalOpen) {
      this.autoCloseModal();
    }
  }

  autoCloseModal() {
    setTimeout(() => {
      this.isFadingOut = true;
      this.cdr.detectChanges();

      setTimeout(() => {
        this.isModalOpen = false;
        this.isFadingOut = false;
        this.cdr.detectChanges();
      }, 500);
    }, 1500);
  }

  openModal() {
    this.isModalOpen = true;
    this.isFadingOut = false;
    this.autoCloseModal();
  }
}
