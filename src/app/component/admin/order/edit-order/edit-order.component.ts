import { Component } from '@angular/core';
import {ButtonComponent} from "../../button/button.component";
import {FormsModule} from "@angular/forms";
import {HeaderAdminComponent} from "../../header-admin/header-admin.component";
import {NgIf} from '@angular/common';
import {TableComponent} from '../../table/table.component';

@Component({
  selector: 'app-edit-order',
  standalone: true,
  imports: [
    ButtonComponent,
    FormsModule,
    HeaderAdminComponent,
    NgIf,
    TableComponent
  ],
  templateUrl: './edit-order.component.html',
  styleUrl: './edit-order.component.scss'
})
export class EditOrderComponent {

}
