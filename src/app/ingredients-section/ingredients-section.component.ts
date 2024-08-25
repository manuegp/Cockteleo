import { Component } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { RecipeService } from '../services/recipes/recipe.service';
import { Ingredient } from '../../types/recipe.types';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule, MatListOption } from '@angular/material/list';
import { SnackbarService } from '../services/snackbar/snackbar.service';

@Component({
  selector: 'app-ingredients-section',
  standalone: true,
  imports: [
    MatExpansionModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
  ],
  templateUrl: './ingredients-section.component.html',
  styleUrl: './ingredients-section.component.css',
})
export class IngredientsSectionComponent {
  ingredients: Ingredient[] | undefined;
  newIngredient: string = '';
  constructor(
    private recipeService: RecipeService,
    private snackbarService: SnackbarService
  ) {
    this.loadIngredients();
  }

  private loadIngredients() {
    this.recipeService.getIngredientsById().subscribe({
      next: (data) => {
        console.log('Ingredients data:', data);
        this.ingredients = data.ingredients
      },
      error: (error) => {
        console.error('Error fetching ingredients:', error);
      }
    });
  }

  public addIngredient() {
    try {
      if (this.newIngredient.trim().length > 0) {
      console.log('Adding ingredient:', this.newIngredient);
      this.snackbarService.openRecipeSnackbar('Añadiendo ingrediente');
      this.recipeService.addNewIngredients([this.newIngredient]).then(() => {
        this.snackbarService.openRecipeSnackbar('Ingrediente añadido');
        this.newIngredient = '';
        
      })
    }
    } catch (error) {
      this.snackbarService.openRecipeErrorSnackbar('Error al añadir ingrediente');
    }
    
  }

  public deleteIngredients(ingredients: MatListOption[]) {
    const ingredientsValue = ingredients.map((ingredient) => {
      return ingredient.value;
    });
    this.snackbarService.openRecipeSnackbar('Borrando ingredientes');
    this.recipeService.deleteIngredients(ingredientsValue).then(() => {
      this.snackbarService.openRecipeSnackbar('Ingredientes borrados');
      
    });
  }
}
