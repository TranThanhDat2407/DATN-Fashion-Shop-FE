import { Component } from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-modal-otp-success',
  standalone: true,
  imports: [
    TranslatePipe,
    NgClass
  ],
  templateUrl: './modal-otp-success.component.html',
  styleUrl: './modal-otp-success.component.scss'
})
export class ModalOtpSuccessComponent {
  isModalOpen : boolean = true



  ngOnInit(): void {
    document.body.classList.add('modal-open');
    setTimeout(() => {
      this.isModalOpen = false;
      document.body.classList.remove('modal-open');
    }, 1500);
  }


  openModal() {
    this.isModalOpen = true;
  }
}
