import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { HeaderComponent } from "../../../client/header/header.component";
import { ButtonComponent } from "../../button/button.component";
import { ToastrService } from 'ngx-toastr';
import { StoreService } from '../../../../services/client/store/store.service';
import { catchError, map, Observable, of } from 'rxjs';
import { ListStoreDTO } from '../../../../dto/ListStoreDTO';
import { response } from 'express';
import { ApiResponse } from '../../../../dto/Response/ApiResponse';
import { ActivatedRoute } from '@angular/router';
import { Store } from '../../../../models/Store/Store';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../dialog/dialog.component';

@Component({
  selector: 'app-edit-store',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderAdminComponent, HeaderComponent, ReactiveFormsModule, ButtonComponent],
  templateUrl: './edit-store.component.html',
  styleUrls: ['./edit-store.component.scss'] // Sửa từ styleUrl thành styleUrls
})
export class EditStoreComponent implements OnInit {
  storeForm!: FormGroup;
  dataEdit: ListStoreDTO | null = null

  storeId: number = 0
  constructor(private fb: FormBuilder,
    private toastService: ToastrService,
    private storeService: StoreService,
    private routerActivated: ActivatedRoute,
    private diaLog: MatDialog,


  ) { }

  ngOnInit(): void {
    this.getIdFromRouter();

    this.storeForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ỹ0-9\\s.,-_]+$')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      email: ['', [Validators.required, Validators.email]],
      openHour: ['', [Validators.required]],
      closeHour: ['', [Validators.required]],
      street: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ỹ0-9\\s.,-_]+$')]],
      ward: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ỹ0-9\\s.,-_]+$')]],
      district: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ỹ0-9\\s.,-_]+$')]],
      city: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ỹ0-9\\s.,-_]+$')]],
      fullAddress: [{ value: '', disabled: true }],
      isActive: [true]
    });


    this.storeForm.get('closeHour')?.valueChanges.subscribe(closeHour => {
      const openHour = this.storeForm.get('openHour')?.value;

      if (this.storeId === 0 && openHour && closeHour) {
        const openDate = new Date(openHour);
        const closeDate = new Date(closeHour);

        const isSameDate =
          openDate.getFullYear() === closeDate.getFullYear() &&
          openDate.getMonth() === closeDate.getMonth() &&
          openDate.getDate() === closeDate.getDate();

        if (!isSameDate) {
          this.storeForm.get('closeHour')?.setErrors({ invalidDate: true });
        } else {

          if (closeDate.getTime() <= openDate.getTime()) {
            this.storeForm.get('closeHour')?.setErrors({ invalidTime: true });
          } else {
            this.storeForm.get('closeHour')?.setErrors(null);
          }
        }
      }
    });


    // Tự động cập nhật địa chỉ đầy đủ
    ['street', 'ward', 'district', 'city'].forEach(field => {
      this.storeForm.get(field)?.valueChanges.subscribe(() => this.updateFullAddress());
    });
  }

  getIdFromRouter(): void {
    this.routerActivated.params.subscribe(params => {
      this.storeId = Number(params['id']) || 0;
      if (this.storeId !== 0 || this.storeId !== undefined || this.storeId !== null) {
        this.loadDataEditStore(this.storeId)
      } else {
        console.log('Khong co IdStore')
      }
    })

  }
  updateStore(): void {

    if (!this.isValidForm()) {
      return; // Dừng lại nếu form không hợp lệ
    }

    const openHourFormatted = this.convertToISO(this.storeForm.value.openHour);
    const closeHourFormatted = this.convertToISO(this.storeForm.value.closeHour);

    const exempleDataStore: any = {
      id: this.storeId,
      name: this.storeForm.value.name,
      email: this.storeForm.value.email,
      phoneNumber: this.storeForm.value.phoneNumber,
      latitude: 0,
      longitude: 0,
      isActive: this.storeForm.value.isActive,
      street: this.storeForm.value.street,
      ward: this.storeForm.value.ward,
      district: this.storeForm.value.district,
      city: this.storeForm.value.city,
      openHour: openHourFormatted,
      closeHour: closeHourFormatted,
      full_address: this.storeForm.getRawValue().fullAddress,
      distance: null
    };

    console.log('update', exempleDataStore);

    this.storeService.updateStore(this.storeId, exempleDataStore).subscribe({
      next: () => {
        this.toastService.success('Store updated successfully!', 'Success', { timeOut: 3000 });
        this.storeForm.reset();
        console.log('Valid data:', this.storeForm.value);
      },
      error: (err) => {
        this.toastService.error('Failed to update store. Please try again.', 'Error', { timeOut: 3000 });
        console.error('Error creating store:', err);
      }
    })

    // this.storeForm.controls['fullAddress'].disable();
  }



  private isValidForm(): boolean {
    const controls = this.storeForm.controls;

    if (!this.storeForm.value.name || !controls['name'].valid) {
      console.log("Lỗi: Tên không hợp lệ!");
      return false;
    }

    if (!this.storeForm.value.email || !controls['email'].valid) {
      console.log("Lỗi: Email không hợp lệ!");
      return false;
    }

    if (!this.storeForm.value.phoneNumber || !controls['phoneNumber'].valid) {
      console.log("Lỗi: Số điện thoại không hợp lệ!");
      return false;
    }

    // if (!this.storeForm.value.openHour || !controls['openHour'].valid) {
    //   console.log("Lỗi: Giờ mở cửa không hợp lệ!");
    //   return false;
    // }

    // if (!this.storeForm.value.closeHour || !controls['closeHour'].valid) {
    //   console.log("Lỗi: Giờ đóng cửa không hợp lệ!");
    //   return false;
    // }

    if (!this.storeForm.getRawValue().fullAddress) {
      console.log("Lỗi: Địa chỉ không hợp lệ!");
      return false;
    }

    return true;
  }

  convertToISO(time: string): string {
    if (!time) return new Date().toISOString(); // Nếu không có giá trị, lấy thời gian hiện tại

    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();

    now.setUTCHours(hours, minutes, 0, 0); // Đặt giờ, phút, giây, mili giây
    return now.toISOString();
  }


  loadDataEditStore(storeId: number): void {
    if (storeId === 0) return

    this.storeService.editStore(storeId).subscribe(
      (response) => {
        this.dataEdit = response.data;

        this.storeForm.patchValue({
          name: this.dataEdit.name,
          email: this.dataEdit.email,
          phoneNumber: this.dataEdit.phone,
          openHour: this.formatTime(this.dataEdit.openHour),  // Format lại
          closeHour: this.formatTime(this.dataEdit.closeHour),  // Format lại
          isActive: this.dataEdit.isActive,
          fullAddress: this.dataEdit.fullAddress,
          street: this.dataEdit.street,
          ward: this.dataEdit.ward,
          district: this.dataEdit.district,
          city: this.dataEdit.city,
        });

        // this.storeForm.get('fullAddress')?.enable();
        // this.storeForm.get('street')?.disable();
        // this.storeForm.get('ward')?.disable();
        // this.storeForm.get('district')?.disable();
        // this.storeForm.get('city')?.disable();

        const fullAddress = this.dataEdit.fullAddress;
        this.storeForm.patchValue({ fullAddress }, { emitEvent: true });


        console.log('this.dataEdit', this.dataEdit.fullAddress);
      }
    );
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return '';
    return new Date(dateString).toISOString().slice(0, 16);
  }
  formatTime(time: string): string {
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/; // Định dạng HH:mm
    if (!timePattern.test(time)) {
      throw new Error(`Invalid time format: ${time}`);
    }
    return time;
  }


  getEditStore(storeId: number): Observable<ListStoreDTO | null> {
    return this.storeService.editStore(storeId).pipe(
      map((response: ApiResponse<ListStoreDTO>) => response.data ?? null)
      , catchError(() => of(null))
    )
  }

  updateFullAddress() {
    const street = this.storeForm.get('street')?.value || '';
    const ward = this.storeForm.get('ward')?.value || '';
    const district = this.storeForm.get('district')?.value || '';
    const city = this.storeForm.get('city')?.value || '';

    const fullAddress = [street, ward, district, city].filter(Boolean).join(', ');
    this.storeForm.patchValue({ fullAddress }, { emitEvent: false }); // Sử dụng patchValue để tránh lỗi
  }

  eventApply() {
    console.log(this.storeId);
    if (this.storeId !== undefined && this.storeId !== null && this.storeId !== 0) {
      this.updateStore();
    } else {
      this.createStore();
    }
  }


  createStore() {
    console.log('create', this.storeForm.value)
    if (this.storeForm.valid) {
      const openHour = new Date(this.storeForm.get('openHour')?.value);
      const closeHour = new Date(this.storeForm.get('closeHour')?.value);

      if (
        openHour.getFullYear() !== closeHour.getFullYear() ||
        openHour.getMonth() !== closeHour.getMonth() ||
        openHour.getDate() !== closeHour.getDate()
      ) {
        this.toastService.error('Open and close hours must be on the same day.', 'Error', { timeOut: 3000 });
        return;
      }

      if (closeHour <= openHour) {
        this.toastService.error('Close hour must be later than open hour.', 'Error', { timeOut: 3000 });
        return;
      }

      this.storeService.createStore(this.storeForm.value).subscribe({
        next: () => {
          this.toastService.success('Store created successfully!', 'Success', { timeOut: 3000 });
          this.storeForm.reset();
          console.log('Valid data:', this.storeForm.value);
        },
        error: (err) => {
          this.toastService.error('Failed to create store. Please try again.', 'Error', { timeOut: 3000 });
          console.error('Error creating store:', err);
        }
      });
    } else {
      this.toastService.error('Invalid form! Please check again.', 'Error', { timeOut: 3000 });
    }
  }

}
