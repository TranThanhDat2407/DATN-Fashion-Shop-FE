import {Component, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {CheckoutService} from '../../../../services/checkout/checkout.service';
import {CommonModule, NgClass, NgIf} from "@angular/common";
import {AddressDTO} from '../../../../dto/address/AddressDTO';
import {NavigationService} from '../../../../services/Navigation/navigation.service';
import {HttpClient} from '@angular/common/http';
import {AddressServiceService} from '../../../../services/client/AddressService/address-service.service';
import {TokenService} from '../../../../services/token/token.service';
import {LocationServiceService} from '../../../../services/client/LocationService/location-service.service';
import {ApiResponse} from '../../../../dto/Response/ApiResponse';
import {FormsModule} from '@angular/forms';
import {ShippingService} from '../../../../services/client/ShippingService/shipping-service.service';
import {CartDTO} from '../../../../dto/CartDTO';

@Component({
  selector: 'app-shipping',
  standalone: true,
  imports: [
    NgIf,
    NgClass, CommonModule, FormsModule, RouterLink,
  ],
  templateUrl: './shipping.component.html',
  styleUrl: './shipping.component.scss'
})
export class ShippingComponent implements OnInit{

  shippingFee: any | null;
  cartData: CartDTO | null = null;
  selectedAddressId: any = null;
  selectedShippingMethod: number  = 1; // Mặc định chọn Method 1
  address: AddressDTO[] | null = null; // Khai báo đối tượng address (có thể null nếu chưa có dữ liệu)
  userId: number | null = null; // userId ban đầu là null
  provinces: any[] = [];
  districts: any[] = [];
  wards: any[] = [];
  selected : boolean = false;
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

  shippingMethods = [
    { id: 1, name: 'Giao hàng nhanh' },
    { id: 2, name: 'Nhận tại cửa hàng' },
  ];



  constructor(private router: Router, private checkoutService: CheckoutService,
              private navigationService: NavigationService,
              private http: HttpClient, // Khai báo HttpClient để gọi API
              private addressService: AddressServiceService,
              private tokenService: TokenService,
              private locationService: LocationServiceService,
              private shippingService : ShippingService
  ) {}

  ngOnInit() {
    this.getProvinces();
    this.userId = this.tokenService.getUserId() // Gọi API khi component được khởi tạo
    this.getAddress();
    document.addEventListener('shown.bs.modal', function () {
      document.querySelectorAll('.modal-backdrop').forEach(backdrop => backdrop.remove());
    });



  }
  getProvinces() {
    this.locationService.getProvinces().subscribe(
      (response) => {
        this.provinces = response.data;
        console.log(this.provinces)

      },
      (error) => {
        console.error("Lỗi khi lấy danh sách tỉnh:", error);
      }
    );
  }



  getAddress() {
    if (this.userId !== null) {
      this.addressService.getAddressByUserId(this.userId).subscribe(
        (response: ApiResponse<AddressDTO[]>) => {
          this.address = response.data; // Gán toàn bộ response vào address
          console.log(this.address)
        },
        (error) => {
          console.error('Lỗi khi lấy địa chỉ:', error);
        }
      );
    } else {
      console.error('Không tìm thấy userId trong localStorage');
    }
  }



  onProvinceChange(event: any) {
    const provinceCode = Number(event.target.value);
    if (!provinceCode || provinceCode === this.selectedProvince) return;
    this.selectedProvince = provinceCode; // Chỉ lưu mã tỉnh (số)

    // Cập nhật NewAddress.province
    const selectedProvinceObj = this.provinces.find(p =>  p.ProvinceID ===  this.selectedProvince);
    this.NewAddress.province = selectedProvinceObj ? selectedProvinceObj.ProvinceName : '';
    // Reset quận/huyện và phường/xã
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
  onDistrictChange(event: any) {
    const districtCode = (event.target.value)
    if (!districtCode || this.selectedDistrict === districtCode) return;
    this.selectedDistrict = districtCode;
    this.selectedWard = null;
    this.wards = [];

    // Gán tên quận vào NewAddress.district
    const selectedDistrictObj = this.districts.find(d => d.DistrictID == districtCode);
    this.NewAddress.district = selectedDistrictObj ? selectedDistrictObj.DistrictName : '';
    // Gọi API lấy danh sách phường/xã
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
  onWardChange(event: any) {
    const wardCode = (event.target.value)
    if (!wardCode || this.selectedWard === wardCode) return;
    this.selectedWard = wardCode;
    console.log(this.selectedWard)
    // Gán tên phường vào NewAddress.ward
    const selectedWardObj = this.wards.find(w => w.WardCode == wardCode);
    this.NewAddress.ward = selectedWardObj ? selectedWardObj.WardName : '';
    console.log(this.NewAddress)
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
  isAddressDuplicate(): boolean {
    // @ts-ignore
    return this.address.some(existingAddress =>
      existingAddress.province === this.NewAddress.province &&
      existingAddress.district === this.NewAddress.district &&
      existingAddress.ward === this.NewAddress.ward &&
      existingAddress.street === this.NewAddress.street
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



  getShippingFee() {
    if (this.selectedAddressId && this.selectedShippingMethod && this.address) {
      const selectedAddress = this.address.find(a => a.id === this.selectedAddressId);

      if (!selectedAddress) {
        console.error("Không tìm thấy địa chỉ!");
        return;
      }

      this.shippingService.calculateShippingFee(selectedAddress, this.cartData)
        .subscribe(
          (fee) => {
            this.shippingFee = fee;
            console.log("Phí vận chuyển ShippingComponent:", this.shippingFee);

            this.updateShippingInfo();
          },

          (error) => {
            console.error("Lỗi khi lấy phí vận chuyển:", error);
          }
        );
    }
  }



  selectAddress(addr: AddressDTO) {
    this.selectedAddressId = addr.id;
    this.updateShippingInfo();
    this.getShippingFee();
  }

  selectShippingMethod(methodId: number) {
    this.selectedShippingMethod = methodId;
    this.updateShippingInfo();
    this.getShippingFee();
  }

  updateShippingInfo() {
    if (this.selectedAddressId && this.selectedShippingMethod) {
      const selectedAddress = this.address?.find(a => a.id === this.selectedAddressId);

      const shippingData = ({
        addressId: this.selectedAddressId,
        receiverName: `${selectedAddress?.firstName} ${selectedAddress?.lastName}`,
        receiverPhone: selectedAddress?.phoneNumber || '',
        shippingMethodId: this.selectedShippingMethod,
        shippingFee: this.shippingFee ?? 0
      });
      console.log('ShippingComponent - Gửi shippingFee:', shippingData);
      this.checkoutService.setShippingFee(shippingData);
    }
  }



  confirmCheckout() {
    if (!this.selectedAddressId) {
      alert("Vui lòng chọn địa chỉ giao hàng!");
      return;
    }
    const selectedAddress = this.address?.find(a => a.id === this.selectedAddressId);
    console.log("Địa chỉ giao hàng:", selectedAddress?.street ); // Lấy địa chỉ street
  }






}

