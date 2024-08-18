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
  UserCredential,
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
  public user$ = user(this.auth);
  public currentUserUid: string | null = null;

  constructor() {
    this.initializeUserUid();
  }
  private initializeUserUid() {
    this.user$.subscribe((user: any) => {
      if (user) {
        this.currentUserUid = user.uid; // Almacenar el UID cuando el usuario esté autenticado
        console.log('Usuario autenticado con UID:', this.currentUserUid);
      } else {
        this.currentUserUid = null; // Limpiar el UID cuando no hay usuario autenticado
        console.log('No hay usuario autenticado.');
      }
    });
  }
  // public logInWithGoogle() {
  //   signInWithPopup(this.auth, this.provider)
  //     .then((result) => {
  //       this.router.navigate(['/library']);
  //     })
  //     .catch((error) => {
  //       console.log('Error a iniciar sesion: ', error);
  //     });
  // }

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

  public registerWithEmailPassword(form: any): Promise<UserCredential> {
    return createUserWithEmailAndPassword(this.auth, form.email, form.password)
      .then((result) => {
        console.log('User registered successfully:', result.user);
        // Optional: Add additional user info to Firestore or another database service
        // this.addUserInfoToFirestore(result.user);
        this.router.navigate(['/library']); // Redirect after successful registration
        return result;
      })
      .catch((error) => {
        console.error('Error al registrar usuario: ', error);
        const errorMessage = handleErrorNotification(error.code);
        throw errorMessage; // Rethrow the error if you want to handle it in the component
      });
  }

  public loginWithEmailPassword(
    email: string,
    password: string
  ): Promise<UserCredential> {
    return signInWithEmailAndPassword(this.auth, email, password)
      .then((result) => {
        console.log('Usuario inició sesión con éxito:', result.user);
        this.router.navigate(['/library']); // Navegar a la ruta deseada después del inicio de sesión
        return result; // Devolver el resultado para encadenar promesas
      })
      .catch((error) => {
        console.error('Error al iniciar sesión: ', error);
        const errorMessage = handleErrorNotification(error.code);
        throw errorMessage; // Lanzar el error para que sea capturado en el componente
      });
  }
}
