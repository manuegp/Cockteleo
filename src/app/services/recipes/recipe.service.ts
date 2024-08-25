import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { catchError, from, map, Observable, Subscriber } from 'rxjs';
import { docData, getDoc, getDocs, onSnapshot, query } from '@angular/fire/firestore';
import {
  doc,
  collection,
  addDoc,
  updateDoc,
  arrayUnion,
  setDoc,
  DocumentData,
  deleteDoc,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import {
  UserRecipes,
  RecipeInfo,
  Ingredient,
} from '../../../types/recipe.types';
import { SnackbarService } from '../snackbar/snackbar.service';
import { removeIsNewField } from '../../utils/utils';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  constructor(
    private authService: AuthService,
    private snackBarService: SnackbarService
  ) {}

  public getAllRecipeNamesById(): Observable<UserRecipes> {
    const userRecipeHeaderCollection = doc(
      this.authService.firestore,
      'recipesHeaders',
      this.authService.currentUserUid!
    );

    return docData(userRecipeHeaderCollection) as Observable<UserRecipes>;
  }

  public async addNewRecipeById(newRecipe: RecipeInfo) {
    this.snackBarService.openRecipeSnackbar('Añadiendo receta...');
    const recipeCollection = collection(this.authService.firestore, `recipes`);
    const cleanIngredients = removeIsNewField(
      newRecipe.ingredients as Ingredient[]
    );
    try {
      let uploadImage = '';
      if (newRecipe.photoUrl) {
        uploadImage = await this.uploadFile(newRecipe.photoUrl);
      }
      const defaultRecipeTemplate: any = {
        photoUrl: uploadImage, // Esta será la URL obtenida del método de subida
        name: newRecipe.name,
        preparation: newRecipe.preparation,
        ingredients: cleanIngredients,
      };

      const docRef = await addDoc(recipeCollection, defaultRecipeTemplate);

      this.addRecipeIdToHeaders(docRef.id, newRecipe.name as string);
    } catch (error) {
      this.snackBarService.openErrorRecipe('Error al añadir la receta');
      console.error('Error añadiendo documento o subiendo imagen: ', error);
    }
  }

  private async uploadFile(input: any): Promise<string> {
    if (!input) {
      throw new Error('No file provided');
    }

    const storageRef = ref(
      this.authService.storage,
      `${this.authService.currentUserUid!}/${input.name}`
    );
    try {
      // Subir el archivo
      const uploadTaskSnapshot = await uploadBytes(storageRef, input);

      // Obtener la URL de descarga
      const downloadUrl = await getDownloadURL(uploadTaskSnapshot.ref);

      return downloadUrl;
    } catch (error) {
      console.error('Error subiendo el archivo:', error);
      throw error; // Propagar el error para manejarlo en el método que llama a uploadFile
    }
  }

  private async addRecipeIdToHeaders(id: string, name: string) {
    const recipeHeadersDocRef = doc(
      this.authService.firestore,
      'recipesHeaders',
      this.authService.currentUserUid!
    ); // Reemplaza 'someHeaderId' con el ID correcto del documento

    try {
      await updateDoc(recipeHeadersDocRef, {
        recipeIdList: arrayUnion({ recipeId: id, name: name }),
      }).then(() => {
        this.snackBarService.openRecipeSnackbar('Receta añadida');
      });
    } catch (error) {
      console.error('Error actualizando recipeHeaders: ', error);
      this.createRecipeIdHeader(id, name);
    }
  }

  private async createRecipeIdHeader(recipeId: string, name: string) {
    const recipeHeadersCollectionRef = collection(
      this.authService.firestore,
      'recipesHeaders'
    );
    const recipeHeaderDocRef = doc(
      recipeHeadersCollectionRef,
      this.authService.currentUserUid!
    );

    try {
      await setDoc(recipeHeaderDocRef, {
        recipeIdList: [{ recipeId: recipeId, name: name }],
        uid: this.authService.currentUserUid!,
      }).then(() => {
        this.snackBarService.openRecipeSnackbar('Receta añadida');
      });
    } catch (error) {
      this.snackBarService.openErrorRecipe('Error al añadir la receta');
      console.error('Error actualizando recipeHeaders: ', error);
    }
  }

  public getRecipeById(id: string): Observable<DocumentData | undefined> {
    const docRef = doc(this.authService.firestore, 'recipes', id);
    const docPromise = getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          return undefined;
        }
      })
      .catch((error) => {
        console.error('Error getting document:', error);
        throw error;
      });

    return from(docPromise);
  }

  public getIngredientsById(): Observable<any> {
    return new Observable((subscriber: Subscriber<any>) => {
      const ingredientsDocRef = doc(
        this.authService.firestore,
        'ingredients',
        this.authService.currentUserUid!
      );

      const unsubscribe = onSnapshot(ingredientsDocRef, (doc) => {
        if (doc.exists()) {
          subscriber.next(doc.data());
        } else {
          subscriber.next(undefined);  // O manejar como creas conveniente
        }
      }, (error) => {
        subscriber.error(error);
      });

      // Función de limpieza cuando el Observable se complete o se desuscriba
      return () => {
        unsubscribe();
      };
    });
  }

  public async addNewIngredients(newIngredients: string[]): Promise<any> {
    const ingredientRef = doc(
      this.authService.firestore,
      'ingredients',
      this.authService.currentUserUid!
    );

    // Primero, intenta obtener el documento
    const docSnap = await getDoc(ingredientRef);

    if (docSnap.exists()) {
      // Si el documento existe, actualiza con nuevos ingredientes
      updateDoc(ingredientRef, {
        ingredients: arrayUnion(...newIngredients),
      })
        .then(() => {})
        .catch((error) => {
          console.error('Error al actualizar ingredientes: ', error);
        });
    } else {
      // Si el documento no existe, créalo con los ingredientes iniciales
      setDoc(ingredientRef, {
        ingredients: newIngredients,
      })
        .then(() => {
          console.log('Documento creado y ingredientes añadidos correctamente');
        })
        .catch((error) => {
          console.error('Error al crear el documento de ingredientes: ', error);
        });
    }
  }

  public async deleteRecipeById(id: string) {
    return deleteDoc(doc(this.authService.firestore, 'recipes', id)).then(
      () => {
        this.cleanRecipeHeadersByUid(id);
      }
    );
  }

  private async cleanRecipeHeadersByUid(id: string): Promise<any> {
    const docRef = doc(
      this.authService.firestore,
      `recipesHeaders/${this.authService.currentUserUid!}`
    );

    try {
      // Primero, obtenemos el documento
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        // Filtramos el array para quitar el objeto con el recipeId especificado
        const updatedRecipes = docSnap
          .data()
          ['recipeIdList'].filter((item: any) => item.recipeId !== id);

        // Actualizamos el documento con el nuevo array
        await updateDoc(docRef, {
          recipeIdList: updatedRecipes,
        }).then(() => {
          this.snackBarService.openRecipeSnackbar('Receta borrada');
        });
      }
    } catch (error) {
      console.error('Error al eliminar la receta: ', error);
      this.snackBarService.openRecipeErrorSnackbar('Error al borrar');
    }
  }

  public async updateRecipe(
    editedRecipe: any,
    recipeId: string
  ): Promise<void> {
    const recipeDoc = doc(this.authService.firestore, 'recipes', recipeId);
    this.snackBarService.openRecipeSnackbar('Actualizando receta...');
    try {
      // Preparar el objeto de actualización solo con los campos que existen
      const updateData: any = {};

      if (editedRecipe.name) {
        updateData.name = editedRecipe.name;
      }
      if (editedRecipe.preparation) {
        updateData.preparation = editedRecipe.preparation;
      }
      if (editedRecipe.ingredients) {
        updateData.ingredients = editedRecipe.ingredients;
      }
      if (editedRecipe.photoUrl) {
        // Suponiendo que `uploadFile` retorna la URL de la imagen subida
        const uploadedImageUrl = await this.uploadFile(editedRecipe.photoUrl);
        updateData.photoUrl = uploadedImageUrl;
      }

      // Solo llamar a updateDoc si hay algo que actualizar
      if (Object.keys(updateData).length > 0) {
        await updateDoc(recipeDoc, updateData).then((_result) => {
          this.updateRecipeName(recipeId, editedRecipe.name);
        });
      } else {
        console.log('No hay cambios que actualizar.');
      }
    } catch (error) {
      this.snackBarService.openRecipeErrorSnackbar(
        'Error al actualizar receta'
      );
      console.error('Error actualizando documento o subiendo imagen: ', error);
    }
  }

  private async updateRecipeName(recipeId: string, newName: string) {
    try {
      const recipesHeadersRef = collection(
        this.authService.firestore,
        'recipesHeaders'
      );
      const q = query(recipesHeadersRef);
      const querySnapshot = await getDocs(q);

      // Buscar todos los documentos
      querySnapshot.forEach(async (docSnapshot) => {
        if (docSnapshot.exists()) {
          // Buscar en la lista de recetas por el recipeId correspondiente
          const recipeList = docSnapshot.data()['recipeIdList'];
          let found = false;

          for (let i = 0; i < recipeList.length; i++) {
            if (recipeList[i].recipeId === recipeId) {
              // Si encontramos el recipeId, actualizamos el nombre
              recipeList[i].name = newName;
              found = true;
              break;
            }
          }

          // Si encontramos y actualizamos el nombre, actualizamos el documento
          if (found) {
            await updateDoc(
              doc(this.authService.firestore, 'recipesHeaders', docSnapshot.id),
              {
                recipeIdList: recipeList,
              }
            ).then(() => {
              this.snackBarService.openRecipeSnackbar('Receta actualiza');
            });
            console.log(`Updated recipe name for ${recipeId} to ${newName}`);
          }
        }
      });
    } catch (error) {
      this.snackBarService.openErrorRecipe('Error al borrar la receta');
    }
  }

  public async deleteIngredients(deleteIngredients: string[]): Promise<void> {
    const ingredientRef = doc(
      this.authService.firestore,
      'ingredients',
      this.authService.currentUserUid!
    );

    try {
      const ingredientsSnap = await getDoc(ingredientRef);

      if (ingredientsSnap.exists()) {
        const ingredients = ingredientsSnap.data()['ingredients']; // Asegúrate de que la clave es correcta
        const updatedIngredients = ingredients.filter(
          (ingredient: any) => !deleteIngredients.includes(ingredient)
        );

        await updateDoc(ingredientRef, {
          ingredients: updatedIngredients,
        });
      } else {
        console.log('No existing document found!');
      }
    } catch (error) {
      console.error('Error al actualizar ingredientes: ', error);
    }
  }
}
