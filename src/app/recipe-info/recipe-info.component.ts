import { Component, inject, Input,  OnChanges, OnInit, SimpleChanges } from '@angular/core';
import {MatIconModule} from '@angular/material/icon'
import { RecipeInfo } from '../../types/recipe.types';
import { RecipeService } from '../services/recipes/recipe.service'; 
import { DialogComponent } from '../dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../services/auth/auth.service';

@Component({
  selector: 'app-recipe-info',
  standalone: true,
  imports: [MatIconModule, DialogComponent],

  templateUrl: './recipe-info.component.html',
  styleUrl: './recipe-info.component.css'
})
export class RecipeInfoComponent implements OnInit, OnChanges {
  readonly dialog = inject(MatDialog);
  @Input() recipeId!: string |undefined;
  public recipe : RecipeInfo | undefined
  constructor(private recipeService: RecipeService, private authService: AuthService){}

  ngOnInit(): void {
    this.loadRecipe()
  }

  ngOnChanges(changes: SimpleChanges){
    this.loadRecipe()
  }

  private loadRecipe(){
    this.recipeService.getRecipeById(this.recipeId as string).subscribe({
      next: async recipe => {
        this.recipe = recipe as RecipeInfo;
      },
      error: error => {
        console.error('Error al obtener la receta:', error);
      }
    })
    
  }

  public deleteRecipe():void{
    this.recipeService.deleteRecipeById(this.recipeId as string)
  }

  public async editRecipe(): Promise<void> {
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '800px',
      maxWidth: '90vw', // Asegura que el diálogo no exceda el 90% del ancho de la ventana
      maxHeight: '90vh', // Asegura que el diálogo no exceda el 90% del alto de la ventana
      panelClass: 'custom-dialog-container', // Clase personalizada para estilos adicionales

      data: { typeDialog: `Editar receta`, recipeInfo: this.recipe },
    });
    dialogRef.afterClosed().subscribe((editedRecipe: RecipeInfo) => {
      console.log(editedRecipe)
    });
  }

}
