import { Component, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StoreService } from '../../../services/client/store/store.service';
import { StoreDetailDTO } from '../../../dto/StoreDetailDTO';
import mapboxgl from 'mapbox-gl';

@Component({
  selector: 'app-store-detail',
  templateUrl: './store-detail.component.html',
  standalone: true,
  styleUrls: ['./store-detail.component.scss']
})
export class StoreDetailComponent implements OnInit{
  store: StoreDetailDTO | null = null;
  map!: mapboxgl.Map;
  mapboxToken = 'pk.eyJ1IjoidHJhbnRoYW5oZGF0MzQ3IiwiYSI6ImNtNzhueGJ6NDB4bTAycnB1Ym10dHJyOTgifQ.pAmMfJSWMUS5PXuncjIrOg'; // 🔹 Thay bằng token thật của bạn

  constructor(
    private storeService: StoreService,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    const storeId = Number(this.route.snapshot.paramMap.get('storeId'));
    if (storeId) {
      this.getStoreDetail(storeId);
    }
  }

  getStoreDetail(storeId: number): void {
    this.storeService.getStoreDetail(storeId).subscribe(
      (response) => {
        if (response?.data) {
          this.store = response.data;
          this.initializeMap();
        }
      },
      (error) => {
        console.error('Lỗi khi lấy dữ liệu cửa hàng:', error);
      }
    );
  }

  initializeMap(): void {
    // Kiểm tra xem window có tồn tại không
    if (typeof window === 'undefined') {
      return;
    }

    // Kiểm tra nếu không có tọa độ
    if (!this.store?.latitude || !this.store?.longitude) {
      console.error('Không có tọa độ để hiển thị bản đồ.');
      return;
    }

    // Kiểm tra và in tọa độ ra console để xác nhận
    console.log('Tọa độ của cửa hàng:', this.store.latitude, this.store.longitude);

    // Khởi tạo bản đồ Mapbox
    this.map = new mapboxgl.Map({
      container: 'map', // Thẻ chứa bản đồ
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [this.store.longitude, this.store.latitude], // Tọa độ trung tâm
      zoom: 16,
      accessToken: this.mapboxToken // Token Mapbox
    });

    // Kiểm tra và thêm Marker
    if (typeof mapboxgl.Marker === 'function') {
      new mapboxgl.Marker()
        .setLngLat([this.store.longitude, this.store.latitude])
        .addTo(this.map);
    } else {
      console.error('Mapbox Marker không khả dụng.');
    }
  }

}

