import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { from, Observable } from 'rxjs';
import { docData, getDoc } from '@angular/fire/firestore';
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
import { UserRecipes, RecipeInfo } from '../../../types/recipe.types';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  constructor(private authService: AuthService) {}

  public getAllRecipeNamesById(): Observable<UserRecipes> {
    const userRecipeHeaderCollection = doc(
      this.authService.firestore,
      'recipesHeaders',
      this.authService.currentUserUid!
    );

    return docData(userRecipeHeaderCollection) as Observable<UserRecipes>;
  }

  public async addNewRecipeById(uid: string, newRecipe: RecipeInfo) {
    const recipeCollection = collection(this.authService.firestore, `recipes`);

    try {
      let uploadImage = '';
      if (newRecipe.photoUrl) {
        uploadImage = await this.uploadFile(newRecipe.photoUrl);
      }
      const defaultRecipeTemplate: any = {
        photoUrl: uploadImage, // Esta será la URL obtenida del método de subida
        name: newRecipe.name,
        preparation: newRecipe.preparation,
        ingredients: newRecipe.ingredients,
      };

      const docRef = await addDoc(recipeCollection, defaultRecipeTemplate);

      this.addRecipeIdToHeaders(docRef.id, newRecipe.name as string);
    } catch (error) {
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
      });
    } catch (error) {
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

  public getIngredientsById(): Observable<any | undefined> {
    const ingredientsDocRef = doc(
      this.authService.firestore,
      'ingredients',
      this.authService.currentUserUid!
    );
    const ingredientsPromise = getDoc(ingredientsDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          // Asumimos que los ingredientes están en un campo array llamado 'ingredients'
          return docSnap.data();
        } else {
          return undefined;
        }
      })
      .catch((error) => {
        console.error('Error al obtener el documento de ingredientes:', error);
        throw error;
      });

    return from(ingredientsPromise);
  }

  public async addNewIngredients(newIngredients: string[]) {
    const firestore = this.authService.firestore; // Asume que Firestore está inyectado en AuthService
    const ingredientRef = doc(
      firestore,
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
    await deleteDoc(doc(this.authService.firestore, 'recipes', id)).then(() => {
      this.cleanRecipeHeadersByUid(id);
    });
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
        });
      }
    } catch (error) {
      console.error('Error al eliminar la receta: ', error);
    }
  }

  public updateRecipe(editedRecipe: any) {
    const recipeCollection = collection(
      this.authService.firestore,
      `recipes/${this.authService.currentUserUid!}`
    );
  }
}
