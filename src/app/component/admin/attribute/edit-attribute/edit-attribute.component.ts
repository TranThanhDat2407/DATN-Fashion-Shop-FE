import { Attribute, Component, OnInit } from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../../button/button.component';
import { ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Color } from '../../../../models/AttributeValue/Color';

import { PageResponse } from '../../../../dto/Response/page-response';
import { catchError, firstValueFrom, forkJoin, map, Observable, of } from 'rxjs';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { Size } from '../../../../models/AttributeValue/Size';
import { AttributeService } from '../../../../services/admin/AttributeService/attribute.service';
export interface Attribute_value {
  valueName: string,
  sortOrder: number
}

@Component({
  selector: 'app-edit-attribute',
  standalone: true,
  imports: [HeaderAdminComponent, CommonModule, FormsModule, ButtonComponent],
  templateUrl: './edit-attribute.component.html',
  styleUrl: './edit-attribute.component.scss'
})
export class EditAttributeComponent implements OnInit {
  sizeId: number = 0
  colorId: number = 0
  dataColor: Color[] | null = null
  dataSize: Size[] | null = null

  nameColor: string = ''
  nameSize: string = ''
  imageUrl: string | ArrayBuffer | null =
    'https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg';
  selectedFile: File | null = null;
  newColor: Attribute_value = {
    valueName: '',
    sortOrder: 0
  }
  newSize: Attribute_value = {
    valueName: '',
    sortOrder: 1
  }

  constructor(
    private router: ActivatedRoute,
    private toastService: ToastrService,
    private attributeService: AttributeService
  ) { }
  async ngOnInit(): Promise<void> {
    this.getIdsFromRouter(); // Lấy ID trước

    await this.fetchAttributeValue(); // Đợi dữ liệu từ API

    // Gọi editColorById sau khi có dữ liệu
    if (this.colorId) {
      this.editColorById(this.colorId);
    }
    if (this.sizeId) {
      this.editSizeById(this.sizeId);
    }
  }




  async fetchAttributeValue(): Promise<void> {
    const callApis = {
      dataColor: this.getColors(0, 10, 'id', 'desc', '').pipe(catchError(() => of(null))),
      dataSize: this.getSizes(0, 10, 'id', 'desc', '').pipe(catchError(() => of(null))),
    }

    const response = await firstValueFrom(forkJoin(callApis));
    this.dataColor = response.dataColor?.content.flat() || []
    this.dataSize = response.dataSize?.content.flat() || []
    // console.log(this.dataColor)
  }
  getIdsFromRouter(): void {
    const id = this.router.snapshot.paramMap.get('id');

    if (window.location.pathname.includes('/edit_attribute/color/')) {
      this.colorId = Number(id)
      console.log('colorId : ' + this.colorId)
    } else if (window.location.pathname.includes('/edit_attribute/size/')) {
      this.sizeId = Number(id)
      console.log('sizeId : ' + this.sizeId)
    } else {
      console.log('ko thay id')
    }
  }
  editColorById(id: number): void {
    if (id === 0) {
      console.log("Id = 0 ");
      return;
    }
    if (!this.dataColor || this.dataColor.length === 0) {
      console.log("Dữ liệu chưa load xong");
      return;
    }

    const color = this.dataColor.find(item => item.id === id);
    if (!color) {
      console.log(`Color ID Not Found  ${color!.id}`);
      return;
    }

    this.nameColor = color.valueName;
    this.newColor.valueName = color.valueImg
    this.imageUrl = 'http://localhost:8080/uploads/images/products/colors/' + color.valueImg;
    console.log("nameColor:", this.imageUrl);
  }


  editSizeById(id: number): void {
    if (id === 0) {
      console.log("Id = 0 ");
      return;
    }
    if (!this.dataSize || this.dataSize.length === 0) {
      console.log("Dữ liệu chưa load xong");
      return;
    }

    const size = this.dataSize.find(item => item.id === id);
    if (!size) {
      console.log("Không tìm thấy size với ID:");
      return;
    }

    this.nameSize = size.valueName;
  }


  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log(this.selectedFile)

      const reader = new FileReader();
      reader.onload = () => {
        this.imageUrl = reader.result;
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  createSize = (): void => {
    if (this.sizeId !== 0) {
      this.toastService.error('Please complete update|', "Error", { timeOut: 3000 });
      return;
    }
    const sampleSize: Attribute_value = {
      valueName: this.nameSize,
      sortOrder: 0
    };

    if (sampleSize.valueName === '') {
      this.toastService.error('Name color is emty', "Error", { timeOut: 3000 });
      return;
    }

    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(sampleSize)], { type: 'application/json' }));
    this.attributeService.createSize(formData).subscribe({
      next: response => {
        this.resetSizeForm()
        this.toastService.success('Success', 'Size created successfully!', { timeOut: 3000 });

      },
      error: error => {
        this.toastService.error('Error', 'There was an error creating the Size.', { timeOut: 3000 });
        console.log(error);
      }
    });
  };
  createColor = (): void => {
    if (this.colorId !== 0) {
      this.toastService.error('Please complete update|', "Error", { timeOut: 3000 });
      return;
    }
    if (!this.validateColor()) return; // Kiểm tra file trước khi tiếp tục

    const sampleColor: Attribute_value = {
      valueName: this.nameColor,
      sortOrder: 0
    };
    if (!this.selectedFile) {
      this.toastService.error('Please select an image file!', "Error", { timeOut: 3000 });
      return;
    }
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(sampleColor)], { type: 'application/json' }));
    formData.append('colorImage', this.selectedFile);

    this.attributeService.createColor(formData).subscribe({
      next: response => {
        this.resetColorForm()
        this.toastService.success('Success', 'Color created successfully!', { timeOut: 3000 });
        this.nameSize = ''
      },
      error: error => {
        this.toastService.error('Error', 'There was an error creating the Color.', { timeOut: 3000 });
        console.log(error);
      }
    });
  };

  updateColor = (): void => {
    if (this.sizeId !== 0) {
      this.toastService.error('Please complete update|', "Error", { timeOut: 3000 });
      return;
    }
    const sampleColor: Attribute_value = {
      valueName: this.nameColor,
      sortOrder: 0
    };

    if (sampleColor.valueName === '') {
      this.toastService.error('Error', 'Color isEmty!', { timeOut: 3000 });
      return
    }
    this.attributeService.updateColor(this.colorId, sampleColor, this.selectedFile ?? undefined).subscribe({
      next: response => {
        this.toastService.success('Success', 'Color updated successfully!', { timeOut: 3000 });
        console.log(response)
        this.resetColorForm();
      },
      error: error => {
        this.toastService.error('Error', 'Có lỗi xảy ra khi cập nhật danh mục.', { timeOut: 3000 });
        console.error(error);
      }
    });
  };
  updateSize = (): void => {

    const sampleSize: Attribute_value = {
      valueName: this.nameSize,
      sortOrder: 0
    };

    if (sampleSize.valueName === '') {
      this.toastService.error('Error', 'Size isEmty!', { timeOut: 3000 });
      return
    }
    this.attributeService.updateSize(this.sizeId, sampleSize).subscribe({
      next: response => {
        this.toastService.success('Success', 'Size updated successfully!', { timeOut: 3000 });
        console.log(response)
        this.nameSize = ''
      },
      error: error => {
        this.toastService.error('Error', 'Có lỗi xảy ra khi cập nhật danh mục.', { timeOut: 3000 });
        console.error(error);
      }
    });
  };

  validateColor(): boolean {

    const sampleColor: Attribute_value = {
      valueName: this.nameColor,
      sortOrder: 0
    };
    if (!this.selectedFile && sampleColor.valueName === '') {
      this.toastService.error('Color is Empty!', "Error", { timeOut: 3000 });
      return false;
    }
    if (!this.selectedFile) {
      this.toastService.error('Please select an image file!', "Error", { timeOut: 3000 });
      return false;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(this.selectedFile.type)) {
      this.toastService.error('Only image files (PNG, JPG, JPEG, WEBP) are allowed.', "Error", { timeOut: 3000 });
      return false;
    }

    if (this.selectedFile.size > maxSize) {
      this.toastService.error('The image size must not exceed 5MB!', "Error", { timeOut: 3000 });
      return false;
    }
    if (sampleColor.valueName === '') {
      this.toastService.error('Name color is emty', "Error", { timeOut: 3000 });
      return false;
    }


    return true;
  }

  getColors(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    name: string
  ): Observable<PageResponse<Color[]> | null> {
    return this.attributeService.getColors(page, size, sortBy, sortDir, name).pipe(
      map((response: ApiResponse<PageResponse<Color[]>>) => response.data),
      catchError(() => of(null))
    )
  }

  getSizes(
    page: number,
    size: number,
    sortBy: string,
    sortDir: string,
    name: string
  ): Observable<PageResponse<Size[]> | null> {
    return this.attributeService.getSizes(page, size, sortBy, sortDir, name).pipe(
      map((response: ApiResponse<PageResponse<Size[]>>) => response.data),
      catchError(() => of(null))
    )
  }


  resetColorForm() {
    this.newColor = {
      valueName: '',
      sortOrder: 0
    };
    this.selectedFile = null;
    // this.imageUrl = 'https://thumb.ac-illust.com/b1/b170870007dfa419295d949814474ab2_t.jpeg';
    // this.nameColor = ''

  }
  resetSizeForm() {

    this.newSize = {
      valueName: '',
      sortOrder: 0
    };
    // this.nameSize = ''

  }

}
