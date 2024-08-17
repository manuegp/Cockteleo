import { Component, inject } from '@angular/core';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../services/auth/auth.service';
import { RecipeInfoComponent } from '../recipe-info/recipe-info.component';
import {
  Ingredient,
  Recipe,
  RecipeInfo,
  UserRecipes,
} from '../../types/recipe.types';
import { RecipeService } from '../services/recipes/recipe.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';

@Component({
  selector: 'app-library',
  standalone: true,
  templateUrl: './library.component.html',
  styleUrl: './library.component.css',
  imports: [
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatButtonModule,
    RecipeInfoComponent,
    MatExpansionModule,
    MatProgressSpinner,
    DialogComponent,
  ],
})
export class LibraryComponent {
  readonly dialog = inject(MatDialog);
  public userRecipes: UserRecipes | undefined;
  private uid: string;
  public childVisible: boolean = false;

  constructor(
    private authService: AuthService,
    private recipeService: RecipeService
  ) {
    this.uid = '';
    this.getUid()
      .then((result) => {
        this.uid = result;
        this.initializeRecipes();
      })
      .catch((err) => {
        console.log(err);
      });
      
  }

  
  

  async getUid(): Promise<any> {
    let uid = await this.authService.getUid();
    return uid;
  }

  private async initializeRecipes() {
    try {
      const recipesObservable =
        await this.recipeService.getAllRecipeNamesById();

      // Suscribirse al observable
      const subscription = recipesObservable.subscribe({
        next: async (recipes) => {
          this.userRecipes = recipes;
          if (!this.childVisible) {
            this.childVisible = true;
          }
        },
        error: (error) => {
          console.error('Error al obtener las recetas:', error);
        },
        complete: () => {
          this.childVisible = true;
          console.log('Obtención de recetas completada');
        },
      });
    } catch (error) {
      console.error('Error al inicializar las recetas:', error);
    }
  }

  public logOut(): void {
    this.authService.logOut();
  }

  public async openNewRecipeDialog(): Promise<void> {
    let uid = await this.authService.getUid();
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '800px',
      maxWidth: '90vw', // Asegura que el diálogo no exceda el 90% del ancho de la ventana
      maxHeight: '90vh', // Asegura que el diálogo no exceda el 90% del alto de la ventana
      panelClass: 'custom-dialog-container', // Clase personalizada para estilos adicionales

      data: { uid: uid, typeDialog: 'Nueva receta' },
    });
    dialogRef.afterClosed().subscribe((newRecipe: RecipeInfo) => {
      if (newRecipe) {
        if (newRecipe.ingredients) {
          this.checkAndAddNewIngredients(newRecipe.ingredients);
        }
        console.log('Se va a crear receta nueva', newRecipe);
        this.recipeService.addNewRecipeById(this.uid, newRecipe);
      }
    });
  }

  private checkAndAddNewIngredients(RecipeIngredients: Ingredient[]) {
    // Primero, filtrar para encontrar ingredientes nuevos
    const newIngredients = RecipeIngredients.filter(ingredient => ingredient.isNew === true);
    
    // Luego, transformar el array de ingredientes a un array de nombres de ingredientes
    const newIngredientNames = newIngredients.map(ingredient => ingredient.name);
    
    // Comprobar si hay nuevos ingredientes y si es así, llamar a la función para añadirlos
    if (newIngredientNames.length > 0) {
      this.recipeService.addNewIngredients(newIngredientNames as string[], this.uid);
    }
}

}
