import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div>
      <h3>📍 Lấy Tọa Độ</h3>

      <!-- Nhập địa chỉ -->
      <input [(ngModel)]="address" placeholder="Nhập địa chỉ" />
      <button (click)="getCoordinatesByAddress()">Lấy tọa độ từ địa chỉ</button>

      <!-- Hoặc lấy vị trí hiện tại -->
      <button (click)="getCurrentLocation()">📍 Lấy vị trí hiện tại</button>

      <p *ngIf="latitude() && longitude()">🌍 Tọa độ: {{ latitude() }}, {{ longitude() }}</p>
      <p *ngIf="errorMessage()" style="color: red;">⚠️ {{ errorMessage() }}</p>
    </div>
  `,
  styles: [
    'input { margin-right: 10px; padding: 5px; width: 250px; }',
    'button { margin: 5px; padding: 8px; cursor: pointer; }'
  ]
})
export class LocationComponent {
  address = 'Quận 5, Hồ Chí Minh'; // Địa chỉ mặc định
  latitude = signal<number | null>(null);
  longitude = signal<number | null>(null);
  errorMessage = signal<string | null>(null);

  constructor(private http: HttpClient) {}

  /** 📍 Lấy tọa độ từ Geolocation API */
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.latitude.set(position.coords.latitude);
          this.longitude.set(position.coords.longitude);
          this.errorMessage.set(null);
        },
        (error) => {
          this.errorMessage.set('Không thể lấy tọa độ: ' + error.message);
        }
      );
    } else {
      this.errorMessage.set('Trình duyệt không hỗ trợ Geolocation');
    }
  }

  /** 🗺️ Lấy tọa độ từ địa chỉ bằng OpenStreetMap (Nominatim) */
  getCoordinatesByAddress(): void {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.address)}&countrycodes=VN`;

    this.http.get<any>(url).subscribe({
      next: (response) => {
        if (response.length > 0) {
          this.latitude.set(parseFloat(response[0].lat));
          this.longitude.set(parseFloat(response[0].lon));
          this.errorMessage.set(null);
        } else {
          this.errorMessage.set('Không tìm thấy tọa độ, thử nhập địa chỉ cụ thể hơn.');
        }
      },
      error: () => {
        this.errorMessage.set('Lỗi khi gọi API.');
      }
    });
  }
}
