import { Component } from '@angular/core';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-check-size',
  standalone: true,
  imports: [
    NgForOf,
    NgClass
  ],
  templateUrl: './check-size.component.html',
  styleUrl: './check-size.component.scss'
})
export class CheckSizeComponent {
  product = {
    image: "https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/474175/item/vngoods_01_474175_3x4.jpg?width=250",
    name: "Áo Khoác Chống UV Bỏ Túi",
    code: "474175",
    gender: "Nữ",
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  }

  sizeDetails = {
    title: ["Kích thước", "Dài thân", "Rộng thân", "Dài tay từ giữa sau"], // Default headers
    value: [
      {
        size: "XS",
        details: [60.0, 55, 77.0],
      },
      {
        size: "S",
        details: [62.0, 57, 78.5],
      },
      {
        size: "M",
        details: [63.5, 59, 80.0],
      },
      {
        size: "L",
        details: [65.5, 61, 81.5],
      },
      {
        size: "XL",
        details: [67.5, 64, 82.5],
      },
      {
        size: "XXL",
        details: [69.5, 67, 84.0],
      },
    ],
  };

  selectedSize: string = 'M'; // Default selected size

  selectSize(size: string): void {
    this.selectedSize = size;
  }
}
