import { inject, Injectable } from '@angular/core';
import {
  Auth,
  authState,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  User,
  user,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { firstValueFrom, map, Observable, pipe, take } from 'rxjs';
import {
  Firestore,
  addDoc,
  collection,
  collectionData,
  query,
  where,
  updateDoc,
  doc,
  arrayUnion,
  docData,
  setDoc,
} from '@angular/fire/firestore';
import { Storage } from '@angular/fire/storage';
import { handleErrorNotification } from '../../utils/errorHandler';


@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private router = inject(Router);
  private auth = inject(Auth);
  public firestore = inject(Firestore);
  public storage = inject(Storage);
  
  private provider = new GoogleAuthProvider();
  public user$ = user(this.auth);
  public authState$: Observable<User | null> = authState(this.auth);

  constructor() {}

  public logInWithGoogle() {
    signInWithPopup(this.auth, this.provider)
      .then((result) => {
        this.router.navigate(['/library']);
      })
      .catch((error) => {
        console.log('Error a iniciar sesion: ', error);
      });
  }

  public logOut() {
    this.auth
      .signOut()
      .then((result) => {
        this.router.navigate(['/login']);
      })
      .catch((error) => {
        console.log('Error a iniciar sesion: ', error);
      });
  }

  public async getUid(): Promise<string> {
    const uid = firstValueFrom(this.user$)
      .then((result: any) => {
        return result.uid;
      })
      .catch((err) => {
        throw err;
      });
    return uid;
  }

  public  registerWithEmailPassword(form: any): Promise<void> {
    return createUserWithEmailAndPassword(this.auth, form.email, form.password)
      .then((result) => {
        console.log('User registered successfully:', result.user);
        // Optional: Add additional user info to Firestore or another database service
        // this.addUserInfoToFirestore(result.user);
        this.router.navigate(['/library']); // Redirect after successful registration
      })
      .catch((error) => {
        console.error('Error al registrar usuario: ', error);
        const errorMessage = handleErrorNotification(error.code)
        throw errorMessage; // Rethrow the error if you want to handle it in the component
      });
  }

  public loginWithEmailPassword(email: string, password: string): Promise<void> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        console.log('Usuario inició sesión con éxito:', result.user);
        this.router.navigate(['/library']); // Cambia a la ruta que desees después del inicio de sesión
      })
      .catch((error: any) => {
        console.error('Error al iniciar sesión: ', error);
        const errorMessage = handleErrorNotification(error.code)
        throw errorMessage; // Lanza una nueva excepción que puede ser capturada en el componente
      });
  }
  
}
