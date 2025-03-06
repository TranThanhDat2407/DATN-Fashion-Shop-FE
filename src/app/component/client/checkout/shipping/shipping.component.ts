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

