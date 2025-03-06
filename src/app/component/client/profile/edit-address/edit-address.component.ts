import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {RouterLink, RouterLinkActive} from '@angular/router';
import {NavigationService} from '../../../../services/Navigation/navigation.service';
import {AddressDTO} from '../../../../dto/address/AddressDTO';
import {HttpClient} from '@angular/common/http';
import {AddressServiceService} from '../../../../services/client/AddressService/address-service.service';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {TokenService} from '../../../../services/token/token.service';
import {CommonModule, JsonPipe, NgClass, NgForOf} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {LocationServiceService} from '../../../../services/client/LocationService/location-service.service';
import {forkJoin, Observable, of} from 'rxjs';


@Component({
  selector: 'app-edit-address',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgForOf, FormsModule, NgClass, JsonPipe],
  templateUrl: './edit-address.component.html',
  styleUrl: './edit-address.component.scss'
})
export class EditAddressComponent implements OnInit{
  address: AddressDTO[] | null = null; // Khai báo đối tượng address (có thể null nếu chưa có dữ liệu)
  userId: number | null = null; // userId ban đầu là null
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  selectedProvince: number | null = null;
  selectedDistrict: number | null = null;
  selectedWard : number | null = null;
  isUpdate: boolean = false; // Xác định trạng thái cập nhật


  NewAddress: AddressDTO = {
    id: 0,
    street: '',
    district: '',
    ward: '',
    province: '',
    latitude: 0,
    longitude: 0,
    phoneNumber: '',
    firstName: '',
    lastName: '',
    isDefault: false
  };


  constructor(
    private navigationService: NavigationService,
    private http: HttpClient, // Khai báo HttpClient để gọi API
    private addressService: AddressServiceService,
    private tokenService: TokenService,
    private locationService: LocationServiceService,

  ) {}

  ngOnInit() {
    this.getProvinces();
    this.userId = this.tokenService.getUserId() // Gọi API khi component được khởi tạo
    this.getAddress();

  }

  addNewAddress() {
    if (this.isAddressDuplicate()) {
      alert('Địa chỉ này đã tồn tại!');
      return;
    }
    if (!this.userId) {
      console.error('Không tìm thấy userId!');
      return;
    }
    this.addressService.addAddress(this.userId, this.NewAddress).subscribe({
      next: (response: ApiResponse<AddressDTO>) => {
        if (response && response.data) {
          console.log('Thêm địa chỉ thành công:', response.data);
          this.getAddress();
          // Reset form
          this.NewAddress = {
            id: 0,
            street: '',
            district: '',
            ward: '',
            province: '',
            latitude: 0,
            longitude: 0,
            phoneNumber: '',
            firstName: '',
            lastName: '',
            isDefault: false
          };
          this.selectedProvince = null
          this.selectedDistrict = null;
          this.selectedWard = null;
          this.districts = [];
          this.wards  = [];
        } else {
          console.error('Thêm địa chỉ thất bại!');
          console.log(response.data)
        }
      },
      error: (err) => {
        console.error('Lỗi khi thêm địa chỉ:', err);
      }
    });
  }

  // Gọi service để lấy địa chỉ theo userId
  getAddress() {
    if (this.userId !== null) {
      this.addressService.getAddressByUserId(this.userId).subscribe(
        (response: ApiResponse<AddressDTO[]>) => {
          this.address = response.data; // Gán toàn bộ response vào address
        },
        (error) => {
          console.error('Lỗi khi lấy địa chỉ:', error);
        }
      );
    } else {
      console.error('Không tìm thấy userId trong localStorage');
    }
  }
  isAddressDuplicate(): boolean {
    // @ts-ignore
    return this.address.some(existingAddress =>
      existingAddress.province === this.NewAddress.province &&
      existingAddress.district === this.NewAddress.district &&
      existingAddress.ward === this.NewAddress.ward &&
      existingAddress.street === this.NewAddress.street
    );
  }
  onAddressDefaultChange(selectedAddress: AddressDTO) {
    // Đặt tất cả các địa chỉ còn lại thành không phải mặc định
    // @ts-ignore
    this.address.forEach(address => {
      if (address !== selectedAddress) {
        address.isDefault = false;
      }
    });

    // Đặt địa chỉ được chọn làm mặc định
    selectedAddress.isDefault = true;

    // Gọi API cập nhật địa chỉ mặc định
    this.updateDefaultAddress(selectedAddress.id,this.tokenService.getUserId() // Gọi API khi component được khởi tạo
    );
  }

  editAddress(address: AddressDTO) {
    this.isUpdate = true
    this.NewAddress = { ...address }; // Sao chép dữ liệu vào form
    // Tìm mã tỉnh dựa trên tên
    const provinceObj = this.provinces.find(p => p.name === address.province);
    this.selectedProvince = provinceObj ? provinceObj.code : null;
    if (this.selectedProvince) {
      this.locationService.getDistricts(this.selectedProvince).subscribe(data => {
        this.districts = data.districts || [];
        console.log("Danh sách quận/huyện:", this.districts);
        const districtObj = this.districts.find(d => d.name === address.district);
        this.selectedDistrict = districtObj ? Number(districtObj.code) : null;
        if (this.selectedDistrict) {
          this.locationService.getWards(this.selectedDistrict).subscribe(wardData => {
            this.wards = wardData.wards || [];

            // Tìm mã phường/xã
            const wardObj = this.wards.find(w => w.name === address.ward);
            this.selectedWard = wardObj ? wardObj.code : null;

          });
        }
      });
    }

  }
  updateAddress() {
    if (!this.userId || !this.NewAddress.id) {
      console.error('Không tìm thấy userId hoặc addressId!');
      return;
    }

    this.addressService.updateAddress(this.tokenService.getUserId(), this.NewAddress.id, this.NewAddress).subscribe({
      next: (response: ApiResponse<AddressDTO>) => {
        if (response && response.data) {
          alert('Cập nhật địa chỉ thành công:');
          this.getAddress();
          this.resetForm(); // Reset form sau khi cập nhật xong
        } else {
          alert('Cập nhật địa chỉ thất bại!');
        }
      },
      error: (err) => {
        console.error('Lỗi khi cập nhật địa chỉ:', err);
      }
    });
  }


  resetForm() {
    this.NewAddress = {
      id: 0,
      street: '',
      district: '',
      ward: '',
      province: '',
      latitude: 0,
      longitude: 0,
      phoneNumber: '',
      firstName: '',
      lastName: '',
      isDefault: false
    };
    this.isUpdate = false; // Chuyển về chế độ thêm mới
    this.selectedProvince = null;
    this.selectedDistrict = null;
    this.selectedWard = null;
    this.districts = [];
    this.wards = [];
  }








  onProvinceChange(event: any) {
    const provinceCode = Number(event.target.value);
    if (!provinceCode || provinceCode === this.selectedProvince) return;
    this.selectedProvince = provinceCode; // Chỉ lưu mã tỉnh (số)

    // Cập nhật NewAddress.province
    const selectedProvinceObj = this.provinces.find(p =>  p.code ===  this.selectedProvince);
    this.NewAddress.province = selectedProvinceObj ? selectedProvinceObj.name : '';
    // Reset quận/huyện và phường/xã
    this.selectedDistrict = null;
    this.selectedWard = null;
    this.wards = [];
    this.districts = [];
    // Gọi API lấy danh sách quận/huyện
    if (this.selectedProvince) {
      this.locationService.getDistricts(this.selectedProvince).subscribe(
        data => {
          this.districts = data.districts || [];
        },
        error => {
          console.error("Lỗi khi lấy danh sách quận/huyện:", error);
        }
      );
    }
  }
  onDistrictChange(event: any) {
    const districtCode = (event.target.value)
    if (!districtCode || this.selectedDistrict === districtCode) return;
    this.selectedDistrict = districtCode;
    this.selectedWard = null;
    this.wards = [];

    // Gán tên quận vào NewAddress.district
    const selectedDistrictObj = this.districts.find(d => d.code == districtCode);
    this.NewAddress.district = selectedDistrictObj ? selectedDistrictObj.name : '';
    // Gọi API lấy danh sách phường/xã
    if (this.selectedDistrict) {
      this.locationService.getWards(this.selectedDistrict).subscribe(data => {
        this.wards = data.wards || [];
      });
    }
  }
  onWardChange(event: any) {
    const wardCode = (event.target.value)
    if (!wardCode || this.selectedWard === wardCode) return;
    this.selectedWard = wardCode;
    // Gán tên phường vào NewAddress.ward
    const selectedWardObj = this.wards.find(w => w.code == wardCode);
    this.NewAddress.ward = selectedWardObj ? selectedWardObj.name : '';
    console.log(this.NewAddress)
  }






















  updateDefaultAddress(addressId: number, userId: number) {
    this.addressService.setDefaultAddress(addressId, userId).subscribe(
      response => {
        console.log('Cập nhật địa chỉ mặc định thành công');
      },
      error => {
        console.error('Lỗi khi cập nhật địa chỉ mặc định');
      }
    );
  }

  confirmDelete(address: AddressDTO) {
    if (address.isDefault) {

      alert("Bạn không thể xóa địa chỉ này vì nó là địa chỉ mặc định.");
      return;

    } else {
      if (confirm('Bạn có chắc chắn muốn xóa địa chỉ này không?')) {
        this.deleteAddress(address.id);
      }
    }
  }


  deleteAddress(addressId: number) {
    if (this.userId !== null) {
      this.addressService.deleteAddress(this.userId, addressId).subscribe(
        (response) => {
          console.log('Xóa địa chỉ thành công:', response.message);
          this.getAddress(); // Cập nhật lại danh sách địa chỉ
        },
        (error) => {
          console.error('Lỗi khi xóa địa chỉ:', error);
        }
      );
    }
  }
  getProvinces() {
    this.locationService.getProvinces().subscribe(
      (response) => {
        this.provinces = response;

      },
      (error) => {
        console.error("Lỗi khi lấy danh sách tỉnh:", error);
      }
    );
  }

  protected readonly console = console;
}
