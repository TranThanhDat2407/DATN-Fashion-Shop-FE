import { Component } from '@angular/core';
import {MatTable} from '@angular/material/table';
import {MatIcon} from '@angular/material/icon';

@Component({
  selector: 'app-edit-coupon',
  standalone: true,
  imports: [
    MatTable,
    MatIcon
  ],
  templateUrl: './edit-coupon.component.html',
  styleUrl: './edit-coupon.component.scss'
})
export class EditCouponComponent {

}
