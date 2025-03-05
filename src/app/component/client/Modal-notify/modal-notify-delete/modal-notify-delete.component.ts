import { Component } from '@angular/core';
import { DialogComponent } from '../../../admin/dialog/dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-modal-notify-delete',
  standalone: true,
  imports: [CommonModule, MatDialogModule,TranslateModule],
  templateUrl: './modal-notify-delete.component.html',
  styleUrl: './modal-notify-delete.component.scss'
})
export class ModalNotifyDeleteComponent {
  isModalOpen: boolean = true
  constructor(
    public dialogRef: MatDialogRef<DialogComponent>,


  ) {

  }
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
