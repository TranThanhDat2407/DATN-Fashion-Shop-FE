import {Component, OnInit} from '@angular/core';
import {HeaderAdminComponent} from '../header-admin/header-admin.component';
import {RouterLink, RouterOutlet} from '@angular/router';
import {StoreService} from '../../../services/client/store/store.service';

@Component({
  selector: 'app-store-statistical',
  standalone: true,
  imports: [
    HeaderAdminComponent,
    RouterOutlet,
    RouterLink
  ],
  templateUrl: './store-statistical.component.html',
  styleUrl: './store-statistical.component.scss'
})
export class StoreStatisticalComponent{

}
