import { AfterViewInit, Component, OnInit } from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { TableComponent } from '../../table/table.component';

export const MOCK_USERS: User[] = [
  {
    id: 1,
    email: 'john.doe@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    phone: '1234567890',
    dateOfBirth: '1985-08-20T12:00:00Z', // Định dạng thành chuỗi
    gender: 'Male',
    isActive: true,
    createdAt: '2024-01-01T12:00:00Z',
    updatedAt: '2024-01-10T12:00:00Z',
    createdBy: 101,
    updatedBy: 102
  },
  {
    id: 2,
    email: 'jane.smith@example.com',
    password: 'password456',
    firstName: 'Jane',
    lastName: 'Smith',
    phone: '0987654321',
    dateOfBirth: '1992-05-15T12:00:00Z', // Định dạng thành chuỗi
    gender: 'Female',
    isActive: false,
    createdAt: '2024-01-02T12:00:00Z',
    updatedAt: '2024-01-11T12:00:00Z',
    createdBy: 103,
    updatedBy: 104
  },
  {
    id: 100,
    email: 'alice.brown@example.com',
    password: 'password789',
    firstName: 'Alice',
    lastName: 'Brown',
    phone: '1122334455',
    dateOfBirth: '1985-08-20T12:00:00Z', // Định dạng thành chuỗi
    gender: 'Female',
    isActive: true,
    createdAt: '2024-01-03T12:00:00Z',
    updatedAt: '2024-01-12T12:00:00Z',
    createdBy: 105,
    updatedBy: 106
  }
];

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  dateOfBirth?: string; // Đổi thành chuỗi
  gender?: string;
  isActive?: boolean;
  createdAt?: string; // Đổi thành chuỗi
  updatedAt?: string; // Đổi thành chuỗi
  createdBy?: number;
  updatedBy?: number;
}
  

@Component({
  selector: 'app-list-user',
  standalone: true,
  imports: [HeaderAdminComponent, TableComponent],
  templateUrl: './list-user.component.html',
  styleUrl: './list-user.component.scss'
})
export class ListUserComponent implements OnInit {
  checkedItems: any[] = [];   
  headerTableList: string[] = [
    'id',
    'email',
    'password',
    'firstName',
    'lastName',
    'phone',
    'dateOfBirth',
    'gender',
    'isActive',
    'createdAt',
    'updatedAt',
    'createdBy',
    'updatedBy',
    'button'
  ]

  userData: User[] = []



  ngOnInit(): void {
    this.loadUserAll()
  }

  loadUserAll() {
    this.userData = MOCK_USERS
    console.log(this.userData)
  }



  
  clickNe(id :number ) {
    console.log('Selected ID:', id);
  }
  
  

  toggleCheckbox(item: any) {
    if (!Array.isArray(this.checkedItems)) {
      this.checkedItems = [];  // Khởi tạo checkedItems nếu chưa phải là mảng
    }
  
    item.checked = !item.checked;
  
    if (item.checked) {
      this.checkedItems.push(item);
    } else {
      const index = this.checkedItems.findIndex(i => i.id === item.id);
      if (index !== -1) {
        this.checkedItems.splice(index, 1);
      }
    }
  
    console.log(item.checked);
    console.log(item.id);
    console.log(this.checkedItems);
  }
  
 


}
