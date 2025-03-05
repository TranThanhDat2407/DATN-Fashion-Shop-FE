import { Component } from '@angular/core';
import {BarChartComponent} from '../../admin/chart/bar-chart/bar-chart.component';
import {DoughnutChartComponent} from '../../admin/chart/doughnut-chart/doughnut-chart.component';
import {HeaderAdminComponent} from '../../admin/header-admin/header-admin.component';
import {LineChartComponent} from '../../admin/chart/line-chart/line-chart.component';
import {TableComponent} from '../../admin/table/table.component';
import {StoreHeaderComponent} from '../store-header/store-header.component';
import {TableDataModel} from '../../admin/dashboard/dashboard.component';

@Component({
  selector: 'app-store-dashboard',
  standalone: true,
  imports: [
    BarChartComponent,
    DoughnutChartComponent,
    HeaderAdminComponent,
    LineChartComponent,
    TableComponent,
    StoreHeaderComponent
  ],
  templateUrl: './store-dashboard.component.html',
  styleUrl: './store-dashboard.component.scss'
})
export class StoreDashboardComponent {
  labels = ['Jan', 'Feb', 'Mar', 'Apr'];
  data = [65, 59, 80, 81]


  lable2 = ['Jan', 'Feb', 'Mar'];
  lable_col = ['Order Qty  ', "Revenue"];
  data2 = [12, 19, 3];
  data_dou2 = [8, 15, 26];


  headers: string[] = ['id', 'name', 'imageUrl'  , 'parentsName', 'createAt', 'updateAt', ];




  dataTable: TableDataModel[] = [
    {
      id: 1,
      name: 'Product A',
      imageUrl: 'https://im.uniqlo.com/global-cms/spa/res5531725dc496187c0b233c84e865bdd8fr.png',
      isActive: true,
      parentsID: 101,
      parentsName: 'Category A',
      createAt: '2024-01-01T12:00:00Z',
      updateAt: '2024-01-10T12:00:00Z'
    },
    {
      id: 2,
      name: 'Product B',
      imageUrl: 'https://im.uniqlo.com/global-cms/spa/res5531725dc496187c0b233c84e865bdd8fr.png',
      isActive: false,
      parentsID: 102,
      parentsName: 'Category B',
      createAt: '2024-01-05T10:30:00Z',
      updateAt: '2024-01-15T14:00:00Z'
    },
    {
      id: 3,
      name: 'Product C',
      imageUrl: 'https://im.uniqlo.com/global-cms/spa/res5531725dc496187c0b233c84e865bdd8fr.png',
      isActive: true,
      parentsID: 103,
      parentsName: 'Category C',
      createAt: '2024-02-01T08:00:00Z',
      updateAt: '2024-02-10T09:30:00Z'
    }
  ];


  constructor() { }

  ngOnInit(): void {

  }
}
