import { Component } from '@angular/core';
import {TranslatePipe} from "@ngx-translate/core";
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-modal-reset-password-success',
  standalone: true,
  imports: [
    TranslatePipe,
    NgClass
  ],
  templateUrl: './modal-reset-password-success.component.html',
  styleUrl: './modal-reset-password-success.component.scss'
})
export class ModalResetPasswordSuccessComponent {
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
