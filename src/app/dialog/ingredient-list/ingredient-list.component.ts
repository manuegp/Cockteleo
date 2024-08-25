import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { Observable, startWith, map } from 'rxjs';
import { RecipeService } from '../../services/recipes/recipe.service';
import { AuthService } from '../../services/auth/auth.service';
import { error } from 'console';
import { Ingredient } from '../../../types/recipe.types';

@Component({
  selector: 'app-ingredient-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './ingredient-list.component.html',
  styleUrl: './ingredient-list.component.css',
})
export class IngredientListComponent implements OnInit {
  @Input() injectIngredient!: Ingredient[];
  myControl = new FormControl('');
  options: string[] = []; // List of ingredient names for autocomplete
  filteredOptions!: Observable<string[]>;
  selectedOptions: Ingredient[] = [];
  loading = false;
  error: string | null = null;

  @Output() ingredientsChange = new EventEmitter<Ingredient[]>();

  constructor(
    private recipeService: RecipeService,
  ) {
    this.initializeData();
  }

  async initializeData() {
    this.loading = true;
    this.error = null;
    try {
      this.recipeService.getIngredientsById().subscribe({
        next: (ingredients) => {
          this.options = ingredients!.ingredients!;
          this.loading = false;
        },
        error: (err) => {
          this.error = 'Error al obtener los ingredientes: ' + err.message;
          this.loading = false;
        },
      });
    } catch (err) {
      this.error = 'Error al obtener UID';
      this.loading = false;
    }
  }

  ngOnInit() {
    if (this.injectIngredient) {
      this.selectedOptions = this.injectIngredient;
    }

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value || ''))
    );
  }

  private _filter(value: string): string[] {
    const filterValue = value.trim().toLowerCase();
    let filtered = this.options.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
    if (filtered.length === 0 && filterValue) {
      filtered = [`Añadir "${value}"`];
    }
    return filtered;
  }

  // Ejemplo de adición de un ingrediente con valores predeterminados
  addOption(value: string) {
    const trimmedValue = value.trim();
    if (trimmedValue.startsWith('Añadir "')) {
      const ingredientName = trimmedValue.split('"')[1];
      this.selectedOptions.push({
        name: ingredientName,
        quantity: 1,
        measure: 'oz',
        isNew: true,
      }); // Asegura valores por defecto
    } else {
      const existingIngredient = this.selectedOptions.find(
        (i) => i.name === trimmedValue
      );
      if (!existingIngredient) {
        this.selectedOptions.push({
          name: trimmedValue,
          quantity: 1,
          measure: 'oz',
          isNew: false,
        }); // Asegura valores por defecto
      }
    }
    this.myControl.reset();
    this.ingredientsChange.emit(this.selectedOptions);
  }

  updateIngredient(index: number, quantity?: number, measure?: 'oz' | 'ml') {
    if (index > 0) {
      if (
        index >= 0 &&
        index < this.selectedOptions.length &&
        quantity !== undefined &&
        measure
      ) {
        this.selectedOptions[index].quantity = quantity;
        this.selectedOptions[index].measure = measure;
        this.ingredientsChange.emit(this.selectedOptions);
      }
    }else{
      index = 1
    }
  }

  removeItem(index: number) {
    if (index >= 0 && index < this.selectedOptions.length) {
      this.selectedOptions.splice(index, 1);
      this.ingredientsChange.emit(this.selectedOptions); // Emit on remove
    }
  }
}
