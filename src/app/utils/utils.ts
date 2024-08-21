import { Ingredient } from "../../types/recipe.types";

export const checkNewIngredients = (RecipeIngredients: Ingredient[]): string[] => {
  const newIngredients = RecipeIngredients.filter(
      (ingredient) => ingredient.isNew === true
  );

  const newIngredientNames = newIngredients.map(
      (ingredient) => ingredient.name!
  );

  return newIngredientNames;
}

export const removeIsNewField = (ingredients:Ingredient[])=> {
  return ingredients.map(ingredient => {
      // Crear una copia del objeto para evitar mutar el objeto original
      const { isNew, ...rest } = ingredient;
      return rest;
  });
}
