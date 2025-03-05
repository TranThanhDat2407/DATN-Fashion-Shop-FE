import { Component, OnInit } from '@angular/core';
import { HeaderAdminComponent } from '../../header-admin/header-admin.component';
import { AdminComponent } from "../../admin.component";
import { Router } from 'express';
import { ActivatedRoute } from '@angular/router';
import { ButtonComponent } from '../../button/button.component';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [HeaderAdminComponent, AdminComponent,ButtonComponent],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent implements OnInit{
  id!: number;

  constructor(private   route: ActivatedRoute){}


  ngOnInit(): void {
    this.id = +this.route.snapshot.paramMap.get('id')!;
    console.log('Received ID:', this.id);

  }

}
