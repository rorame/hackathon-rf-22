import { Component, Inject } from '@angular/core';
import {
  FormGroup,
  FormBuilder,
  Validators,
  NgForm,
  FormControl,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { News } from '../hello.component/hello.component.component';
import { PostsService } from '../hello.component/hello.service';

@Component({
  selector: 'app-mat-input-prompt',
  templateUrl: './mat-input-prompt.component.html',
  styleUrls: ['./mat-input-prompt.component.scss'],
})
export class MatInputPromptComponent {
  form: FormGroup;

  constructor(
    private postsService: PostsService,
    private fb: FormBuilder,
    @Inject(MAT_DIALOG_DATA) data: News,
    public dialogRef: MatDialogRef<MatInputPromptComponent>
  ) {
    this.form = this.fb.group({
      title: [`${data.title}`, Validators.required],
      description: [`${data.description}`, Validators.required],
      location: [`${data.location}`, Validators.required],
      cataclysmic_type: [`${data.cataclysmic_type}`, Validators.required],
      src: [`${data.cataclysmic_type}`],
      id: [`${data.id}`],
    });
  }

  submit(form: NgForm) {
    this.postsService.update(form);
    this.dialogRef.close({
      clicked: 'submit',
      form: form,
    });
  }
}
