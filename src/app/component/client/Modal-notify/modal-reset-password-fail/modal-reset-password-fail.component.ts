import { Component } from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-modal-reset-password-fail',
  standalone: true,
  imports: [
    TranslatePipe,
    NgClass
  ],
  templateUrl: './modal-reset-password-fail.component.html',
  styleUrl: './modal-reset-password-fail.component.scss'
})
export class ModalResetPasswordFailComponent {
  isModalOpen : boolean = true
  ngOnInit(): void {
    document.body.classList.add('modal-open');
    setTimeout(() => {
      this.isModalOpen = false;
      document.body.classList.remove('modal-open'); // Cho phép cuộn khi modal đóng
    }, 1500);
  }


  openModal() {
    this.isModalOpen = true;
  }
}
