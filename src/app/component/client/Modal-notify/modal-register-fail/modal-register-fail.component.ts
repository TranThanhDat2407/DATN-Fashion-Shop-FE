import {Component, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-modal-register-fail',
  standalone: true,
  imports: [
    TranslatePipe,
    NgClass
  ],
  templateUrl: './modal-register-fail.component.html',
  styleUrl: './modal-register-fail.component.scss'
})
export class ModalRegisterFailComponent implements OnInit{
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
