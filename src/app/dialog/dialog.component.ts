import { Component, Inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { IngredientListComponent } from './ingredient-list/ingredient-list.component';
import { Observable } from 'rxjs';
import { Ingredient } from '../../types/recipe.types';

@Component({
  selector: 'app-dialog',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
    IngredientListComponent,
  ],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.css',
})
export class DialogComponent {
  recipeForm: FormGroup;
  ingredients: Ingredient[] = [];
  imageSelected!: File;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.recipeForm = this.createForm();
  }

  onFileSelected(event: any) {
    this.imageSelected = event.target.files[0];
  }

  private createForm() {
    if (this.data.recipeInfo) {
      return (this.recipeForm = this.fb.group({
        name: [this.data.recipeInfo.name, Validators.required],
        preparation: [this.data.recipeInfo.preparation],
      }));
    } else {
      return (this.recipeForm = this.fb.group({
        name: ['', Validators.required],
        preparation: [''],
      }));
    }
  }

  onSubmit(): void {
    if (this.recipeForm.valid) {
      let recipeData = this.recipeForm.value;
      recipeData.ingredients = this.ingredients;
      recipeData.photoUrl = this.imageSelected;
      this.dialogRef.close(recipeData);
    }
  }
  closeDialog(): void {
    this.dialogRef.close();
  }

  handleIngredientsChange(ingredients: Ingredient[]) {
    this.ingredients = ingredients;
  }
}
