import { Component } from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-modal-otp-fail',
  standalone: true,
  imports: [
    TranslatePipe,
    NgClass
  ],
  templateUrl: './modal-otp-fail.component.html',
  styleUrl: './modal-otp-fail.component.scss'
})
export class ModalOtpFailComponent {
  isModalOpen: boolean = true;

  ngOnInit(): void {
    // Ngừng cuộn trang trên toàn bộ trang
    document.documentElement.style.overflow = 'hidden';

    setTimeout(() => {
      this.isModalOpen = false;
      // Khôi phục cuộn trang khi modal đóng
      document.documentElement.style.overflow = '';
    }, 1500);
  }

  closeModal() {
    this.isModalOpen = false;
    // Khôi phục cuộn trang khi modal đóng
    document.documentElement.style.overflow = '';
  }
}
