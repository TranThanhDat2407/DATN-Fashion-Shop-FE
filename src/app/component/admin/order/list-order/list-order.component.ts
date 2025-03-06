import { Component } from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalNotifyLoginComponent } from '../../../client/Modal-notify/modal-notify-login/modal-notify-login.component';

@Component({
  selector: 'app-list-order',
  standalone: true,
  imports: [HeaderAdminComponent, CommonModule, FormsModule],
  templateUrl: './list-order.component.html',
  styleUrl: './list-order.component.scss'
})
export class ListOrderComponent {
  isOpen: boolean = false; // Thêm biến này vào
  searchText: string = ''; // Lưu trữ giá trị tìm kiếm
  selectedItem: any = null; // Item được chọn

  products = [
    { id: 1, name: 'Áo thun', image: 'https://image.uniqlo.com/UQ/ST3/vn/imagesgoods/465207/sub/vngoods_465207_sub1_3x4.jpg?width=369' },
    { id: 2, name: 'Quần jean', image: 'https://api.fastretailing.com/ugc/v1/uq/vn/SR_IMAGES/ugc_stylehint_uq_vn_photo_240522_1346376_c-600-800' },
    { id: 3, name: 'Giày sneaker', image: 'https://image.uniqlo.com/UQ/ST3/AsianCommon/imagesgoods/465207/sub/goods_465207_sub15_3x4.jpg?width=369' },
    { id: 4, name: 'Túi xách', image: 'https://api.fastretailing.com/ugc/v1/uq/vn/SR_IMAGES/ugc_stylehint_uq_vn_photo_240508_1333565_c-600-800' },
  ];
  get filteredProducts() {
    const search = this.removeVietnameseTones(this.searchText.trim().toLowerCase());

    return this.products.filter((product) =>
      this.removeVietnameseTones(product.name.toLowerCase()).includes(search)
    );
  }

  // Hàm loại bỏ dấu tiếng Việt
  removeVietnameseTones(str: string): string {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d").replace(/Đ/g, "D");
  }


  selectItem(item: any) {
    this.selectedItem = item;
    console.log(item.id)
  }

}
