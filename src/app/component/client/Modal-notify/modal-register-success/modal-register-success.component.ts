import {Component, OnInit} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-modal-register-success',
  standalone: true,
  imports: [
    TranslatePipe,
    NgClass
  ],
  templateUrl: './modal-register-success.component.html',
  styleUrl: './modal-register-success.component.scss'
})
export class ModalRegisterSuccessComponent implements OnInit{
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
