export const handleErrorNotification = (errorCode: any) => {
  switch (errorCode) {
    case 'auth/invalid-email':
      throw new Error('Email no válido.');
    case 'auth/user-disabled':
      throw new Error('La cuenta de usuario ha sido deshabilitada.');
    case 'auth/user-not-found':
      throw new Error('No se encontró usuario con este email.');
    case 'auth/wrong-password':
      throw new Error('La contraseña es incorrecta.');
    case 'auth/too-many-requests':
      throw new Error('Demasiadas peticiones, restablezca contraseña');
    case 'auth/email-already-in-use':
      throw new Error('Ya se esta usando este email');
    default:
      throw new Error('Error de inicio de sesión.');
  }
};
