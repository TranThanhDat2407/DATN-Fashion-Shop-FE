import { Component } from '@angular/core';
import {RouterLink, RouterLinkActive, RouterOutlet} from '@angular/router';
import {StoreHeaderComponent} from '../store-header/store-header.component';

@Component({
  selector: 'app-store-statistic',
  standalone: true,
  imports: [
    RouterOutlet,
    StoreHeaderComponent,
    RouterLinkActive,
    RouterLink
  ],
  templateUrl: './store-statistic.component.html',
  styleUrl: './store-statistic.component.scss'
})
export class StoreStatisticComponent {

}
