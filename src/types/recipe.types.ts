export interface Recipe {
  recipeId?: string;
  name?: string;
}

export interface UserRecipes {
  recipeIdList?: Recipe[] | [];
  uid?: string;
}

export interface Ingredient {
  name?: string,
  quantity?: number,
  measure?: 'oz' | 'ml',
  isNew?: boolean
}

export interface RecipeInfo {
  recipeId?: string;
  photoUrl?: string;
  name?: string;
  preparation?: string;
  ingredients?: Ingredient[] | []
}