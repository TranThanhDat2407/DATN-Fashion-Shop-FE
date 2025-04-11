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
import { LocationServiceService } from '../../../../services/client/LocationService/location-service.service';

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
  selectedDistrict: number | null = null;
  selectedWard: number | null = null;
  wards: any[] = [];
  districts: any[] = [];
  selectedProvince: number | null = null;
  provinces: any[] = [];

  constructor(private fb: FormBuilder,
    private toastService: ToastrService,
    private storeService: StoreService,
    private routerActivated: ActivatedRoute,
    private diaLog: MatDialog,
    private locationService: LocationServiceService,



  ) { }

  ngOnInit(): void {
    this.getProvinces();
    this.getIdFromRouter();
  

    this.storeForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ỹ0-9\\s.,-_]+$')]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      email: ['', [Validators.required, Validators.email]],
      openHour: ['', [Validators.required]],
      closeHour: ['', [Validators.required]],
      street: ['', [Validators.required, Validators.pattern('^[a-zA-ZÀ-ỹ0-9\\s.,-_]+$')]],
      fullAddress: [{ value: '', disabled: true }],
      city: ['', Validators.required],
      district: ['', Validators.required],
      ward: ['', Validators.required],
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
  getProvinces() {
    this.locationService.getProvinces().subscribe(
      (response) => {
        this.provinces = response.data;
      },
      (error) => {
        console.error("Lỗi khi lấy danh sách tỉnh:", error);
      }
    );
  }
  onDistrictChange(event: any) {
    const districtCode = (event.target.value)
    if (!districtCode || this.selectedDistrict === districtCode) return;
    this.selectedDistrict = districtCode;
    this.selectedWard = null;
    this.wards = [];

    // Gán tên quận vào NewAddress.district
    if (this.selectedDistrict) {
      console.log("🏙 Quận/Huyện đã chọn:", this.selectedDistrict);

      this.locationService.getWards(this.selectedDistrict).subscribe(
        (response) => {
          if (response && response.data) {
            this.wards = response.data; // API trả về object chứa `data`
          } else {
            this.wards = response.wards || []; // Kiểm tra fallback
          }

          console.log("📍 Danh sách phường/xã:", this.wards);
        },
        (error) => {
          console.error("❌ Lỗi khi lấy danh sách phường/xã:", error);
          this.wards = []; // Reset danh sách khi lỗi
        }
      );
    }
  }
  getIdFromRouter(): void {
    this.getProvinces()

    this.routerActivated.params.subscribe(params => {
      this.storeId = Number(params['id']) || 0;
      if (this.storeId !== 0 || this.storeId !== undefined || this.storeId !== null) {
        this.loadDataEditStore(this.storeId)
      } else {
        console.log('Khong co IdStore')
      }
    })

  }

  onProvinceChange(event: any) {
    const provinceCode = Number(event.target.value);
    if (!provinceCode || provinceCode === this.selectedProvince) return;
    this.selectedProvince = provinceCode; // Chỉ lưu mã tỉnh (số)

    // Cập nhật NewssAddress.province
    const selectedProvinceObj = this.provinces.find(p => p.ProvinceID === this.selectedProvince);
    this.selectedDistrict = null;
    this.selectedWard = null;
    this.wards = [];
    this.districts = [];
    // Gọi API lấy danh sách quận/huyện
    if (this.selectedProvince) {
      console.log("📍 Tỉnh đã chọn:", this.selectedProvince);

      this.locationService.getDistricts(this.selectedProvince).subscribe(
        (response) => {
          if (response && response.data) {
            this.districts = response.data; // API trả về object chứa `data`
          } else {
            this.districts = response.districts || []; // Kiểm tra fallback
          }

          console.log("🏠 Danh sách quận/huyện:", this.districts);
        },
        (error) => {
          console.error("❌ Lỗi khi lấy danh sách quận/huyện:", error);
          this.districts = []; // Reset danh sách khi lỗi
        }
      );
    }
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
  onWardChange(event: any) {
    const wardCode = (event.target.value)
    if (!wardCode || this.selectedWard === wardCode) return;
    this.selectedWard = wardCode;
    console.log(this.selectedWard)
    // Gán tên phường vào NewAddress.ward
    const selectedWardObj = this.wards.find(w => w.WardCode == wardCode);

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
        const city = this.provinces.find(c => c.ProvinceName === this.dataEdit?.city )
        console.log('jkojijin ',city)
        console.log('jkojijin ',this.dataEdit?.city)
        console.log('jkojijin ',this.provinces)


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
    const wardCode = this.storeForm.get('ward')?.value;
    const districtCode = this.storeForm.get('district')?.value;
    const cityCode = this.storeForm.get('city')?.value;

    const wardName = this.wards.find(w => w.WardCode == wardCode)?.WardName || '';
    const districtName = this.districts.find(d => d.DistrictID == districtCode)?.DistrictName || '';
    const cityName = this.provinces.find(p => p.ProvinceID == cityCode)?.ProvinceName || '';

    const fullAddress = [street, wardName, districtName, cityName].filter(Boolean).join(', ');
    this.storeForm.patchValue({ fullAddress }, { emitEvent: false });
  }


  eventApply() {
    console.log(this.storeId);
    if (this.storeId !== undefined && this.storeId !== null && this.storeId !== 0) {
      this.updateStore();
    } else {
      this.createStoress();
    }
  }


  createStore() {
    // console.log('createStore() called:', this.storeForm.value);

    // if (this.storeForm.invalid) {
    //   this.toastService.error('Invalid form! Please check again.', 'Error', { timeOut: 3000 });
    //   this.storeForm.markAllAsTouched(); // hiển thị hết lỗi nếu người dùng chưa chạm vào các trường
    //   return;
    // }

    // const openHourStr = this.storeForm.get('openHour')?.value;
    // const closeHourStr = this.storeForm.get('closeHour')?.value;

    // if (!openHourStr || !closeHourStr) {
    //   this.toastService.error('Please fill in both open and close hours.', 'Error', { timeOut: 3000 });
    //   return;
    // }

    // const openHour = new Date(`1970-01-01T${openHourStr}`);
    // const closeHour = new Date(`1970-01-01T${closeHourStr}`);

    // if (closeHour <= openHour) {
    //   this.toastService.error('Close hour must be later than open hour.', 'Error', { timeOut: 3000 });
    //   return;
    // }

    // Cập nhật lại fullAddress trước khi gửi lên
    const province = this.provinces.find(p => p.ProvinceID === this.selectedProvince);
    const district = this.districts.find(d => d.DistrictID === Number(this.selectedDistrict));
    const ward = this.wards.find(w => w.WardCode === this.selectedWard);

    console.log('province:', province);
    console.log('district:', district);
    console.log('ward:', ward);

    if (!province || !district || !ward) {
      this.toastService.error('Vui lòng chọn đầy đủ địa chỉ (Tỉnh, Quận, Phường).', 'Lỗi');
      return;
    }

    const street = this.storeForm.get('street')?.value || '';
    const fullAddress = `${street}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;
    this.storeForm.patchValue({ fullAddress });
    console.log(fullAddress)
    this.storeForm.patchValue({ fullAddress });

    this.storeService.createStore(this.storeForm.value).subscribe({
      next: () => {
        this.toastService.success('Store created successfully!', 'Success', { timeOut: 3000 });
        this.storeForm.reset();
        this.wards = [];
        this.districts = [];
      },
      error: (err) => {
        this.toastService.error('Failed to create store. Please try again.', 'Error', { timeOut: 3000 });
        console.error('Error creating store:', err);
      }
    });
  }

  createStoress(): void {
    if (this.storeForm.invalid) {
      this.storeForm.markAllAsTouched();
      return;
    }

    const street = this.storeForm.get('street')?.value || '';
    const province = this.provinces.find(p => p.ProvinceID === this.selectedProvince);
    const district = this.districts.find(d => d.DistrictID === Number(this.selectedDistrict));
    const ward = this.wards.find(w => w.WardCode === this.selectedWard);
    const fullAddress = `${street}, ${ward.WardName}, ${district.DistrictName}, ${province.ProvinceName}`;
    this.storeForm.patchValue({ fullAddress });

    const storeData = {
      name: this.storeForm.value.name,
      email: this.storeForm.value.email,
      phone: this.storeForm.value.phoneNumber,
      openHour: this.storeForm.value.openHour,
      closeHour: this.storeForm.value.closeHour,
      isActive: this.storeForm.value.isActive,
      fullAddress: this.storeForm.value.fullAddress,
      street: this.storeForm.value.street,
      ward: ward?.WardName || '',              // Lấy tên phường
      district: district?.DistrictName || '',  // Lấy tên quận/huyện
      city: province?.ProvinceName || ''       // Lấy tên tỉnh/thành phố
    };

    this.storeService.createStore(storeData).subscribe({
      next: (response) => {
         this.toastService.success('Store created successfully!', 'Success', { timeOut: 3000 });
        this.storeForm.reset();
        this.selectedProvince = null;
        this.selectedDistrict = null;
        this.selectedWard = null;
      },
      error: (error) => {
        this.toastService.error('Failed to create store. Please try again.', 'Error', { timeOut: 3000 });

        console.error('❌ Lỗi khi tạo store:', error);
      }
    });
  }



}
