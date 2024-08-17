import { inject, Injectable } from '@angular/core';
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
  arrayRemove,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from '@angular/fire/storage';
import {
  UserRecipes,
  RecipeInfo,
  Recipe,
  Ingredient,
} from '../../../types/recipe.types';
import { IngredientListComponent } from '../../dialog/ingredient-list/ingredient-list.component';
@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  constructor(private authService: AuthService) {}

  public getAllRecipeNamesById(): Promise<Observable<UserRecipes>> {
    return this.authService.getUid().then((uid) => {
      const userRecipeHeaderCollection = doc(
        this.authService.firestore,
        'recipesHeaders',
        uid
      );

      let recipesCollection = docData(
        userRecipeHeaderCollection
      ) as Observable<UserRecipes>;

      return recipesCollection;
    });
  }

  public async addNewRecipeById(uid: string, newRecipe: RecipeInfo) {
    console.log('Empezando a añadir receta');
    const recipeCollection = collection(this.authService.firestore, `recipes`);

    try {
      let uploadImage = '';
      if (newRecipe.photoUrl) {
        uploadImage = await this.uploadFile(newRecipe.photoUrl, uid);
      }
      const defaultRecipeTemplate: any = {
        photoUrl: uploadImage, // Esta será la URL obtenida del método de subida
        name: newRecipe.name,
        preparation: newRecipe.preparation,
        ingredients: newRecipe.ingredients,
      };

      const docRef = await addDoc(recipeCollection, defaultRecipeTemplate);
      console.log('Documento añadido con ID: ', docRef.id);

      this.addRecipeIdToHeaders(docRef.id, newRecipe.name as string, uid);
    } catch (error) {
      console.error('Error añadiendo documento o subiendo imagen: ', error);
    }
  }

  private async uploadFile(input: any, uid: string): Promise<string> {
    if (!input) {
      throw new Error('No file provided');
    }

    const storageRef = ref(this.authService.storage, `${uid}/${input.name}`);
    try {
      // Subir el archivo
      const uploadTaskSnapshot = await uploadBytes(storageRef, input);
      console.log('Imagen subida correctamente');

      // Obtener la URL de descarga
      const downloadUrl = await getDownloadURL(uploadTaskSnapshot.ref);
      console.log('URL obtenida:', downloadUrl);
      return downloadUrl;
    } catch (error) {
      console.error('Error subiendo el archivo:', error);
      throw error; // Propagar el error para manejarlo en el método que llama a uploadFile
    }
  }

  private async addRecipeIdToHeaders(
    id: string,
    name: string,
    uid: string | undefined
  ) {
    const recipeHeadersDocRef = doc(
      this.authService.firestore,
      'recipesHeaders',
      uid as string
    ); // Reemplaza 'someHeaderId' con el ID correcto del documento

    try {
      await updateDoc(recipeHeadersDocRef, {
        recipeIdList: arrayUnion({ recipeId: id, name: name }),
      });
      console.log('ID de receta añadido a recipeHeaders');
    } catch (error) {
      console.error('Error actualizando recipeHeaders: ', error);
      console.log('Creando coleccion nueva');
      this.createRecipeIdHeader(uid as string, id, name);
    }
  }

  private async createRecipeIdHeader(
    uid: string,
    recipeId: string,
    name: string
  ) {
    const recipeHeadersCollectionRef = collection(
      this.authService.firestore,
      'recipesHeaders'
    );
    const recipeHeaderDocRef = doc(recipeHeadersCollectionRef, uid);

    try {
      await setDoc(recipeHeaderDocRef, {
        recipeIdList: [{ recipeId: recipeId, name: name }],
        uid: uid,
      });
      console.log('ID de receta añadido a recipeHeaders');
    } catch (error) {
      console.error('Error actualizando recipeHeaders: ', error);
      console.log('Creando colección nueva');
    }
  }

  public getRecipeById(id: string): Observable<DocumentData | undefined> {
    const docRef = doc(this.authService.firestore, 'recipes', id);
    const docPromise = getDoc(docRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          return docSnap.data();
        } else {
          console.log('No such document!');
          return undefined;
        }
      })
      .catch((error) => {
        console.error('Error getting document:', error);
        throw error;
      });

    return from(docPromise);
  }

  public getIngredientsById(id: string): Observable<any | undefined> {
    const ingredientsDocRef = doc(
      this.authService.firestore,
      'ingredients',
      id
    );
    const ingredientsPromise = getDoc(ingredientsDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          // Asumimos que los ingredientes están en un campo array llamado 'ingredients'
          return docSnap.data();
        } else {
          console.log('No se encontró el documento de ingredientes');
          return undefined;
        }
      })
      .catch((error) => {
        console.error('Error al obtener el documento de ingredientes:', error);
        throw error;
      });

    return from(ingredientsPromise);
  }

  public async addNewIngredients(newIngredients: string[], uid: string) {
    const firestore = this.authService.firestore; // Asume que Firestore está inyectado en AuthService
    const ingredientRef = doc(firestore, 'ingredients', uid);

    // Primero, intenta obtener el documento
    const docSnap = await getDoc(ingredientRef);

    if (docSnap.exists()) {
      // Si el documento existe, actualiza con nuevos ingredientes
      updateDoc(ingredientRef, {
        ingredients: arrayUnion(...newIngredients),
      })
        .then(() => {
          console.log('Ingredientes actualizados correctamente');
        })
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
    const uid = await this.authService.getUid();
    const docRef = doc(this.authService.firestore, `recipesHeaders/${uid}`);

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

        console.log('Receta eliminada correctamente.');
      } else {
        console.log('No se encontró el documento.');
      }
    } catch (error) {
      console.error('Error al eliminar la receta: ', error);
    }
  }

  public updateRecipe(editedRecipe: any, uid: string) {
    const recipeCollection = collection(
      this.authService.firestore,
      `recipes/${uid}`
    );
  }
}
