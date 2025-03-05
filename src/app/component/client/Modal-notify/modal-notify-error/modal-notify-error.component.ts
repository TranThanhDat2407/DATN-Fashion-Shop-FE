import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-notify-error',
  standalone: true,
  imports: [CommonModule,TranslateModule],
  templateUrl: './modal-notify-error.component.html',
  styleUrl: './modal-notify-error.component.scss'
})
export class ModalNotifyErrorComponent implements OnInit {
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
