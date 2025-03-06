import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [RouterLink, CommonModule, FormsModule],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']  // Dùng styleUrls thay vì styleUrl
})
export class ButtonComponent  {
  // @Input() eventClickBtnSave: (item?: any) => void = () => {};  
  // @Input() routerLinkStringBtnSave: string = '';
  // @Input() routerLinkActiveStringBtnSave: string = '';

  @Input() eventClickBtnAdd!: () => void; 
  @Input() routerLinkStringBtnAdd: string = '';
  @Input() routerLinkActiveStringBtnAdd: string = '';
  @Input() nameButton : string = '';


  
  // onClick() {
  //   if (this.eventClickBtnAdd) {
  //     this.eventClickBtnAdd();  // Gọi hàm từ parent component
  //   } else {
  //     console.error('eventClickBtnAdd is undefined');
  //   }
  // }
}