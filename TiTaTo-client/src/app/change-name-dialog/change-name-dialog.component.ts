import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

export interface DialogData {
  name: string;
  newName: string;
}

@Component({
  selector: 'app-change-name-dialog',
  templateUrl: './change-name-dialog.component.html',
  styleUrls: ['./change-name-dialog.component.css']
})
export class ChangeNameDialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ChangeNameDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
