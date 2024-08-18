export const handleErrorNotification = (errorCode: any) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      return new Error('Email no válido.');
    case 'auth/user-disabled':
      return new Error('La cuenta de usuario ha sido deshabilitada.');
    case 'auth/user-not-found':
      return new Error('No se encontró usuario con este email.');
    case 'auth/wrong-password':
      return new Error('La contraseña es incorrecta.');
    case 'auth/too-many-requests':
      return new Error('Demasiadas peticiones, restablezca contraseña');
    case 'auth/email-already-in-use':
      return new Error('Ya se esta usando este email');
    default:
      return new Error('Error de inicio de sesión.');
  }
};
