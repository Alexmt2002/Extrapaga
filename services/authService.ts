import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

type RegisterUserParams = {
  username: string;
  nombreCompleto: string;
  fecha: Date;
  email: string;
  password: string;
};

// Comprueba los requisitos de la contraseña
const validarPassword = (password: string): string[] => {
  const errores: string[] = [];

  if (password.length <= 8) {
    errores.push("La contraseña debe tener más de 8 caracteres.");
  }

  if (!/[A-Z]/.test(password)) {
    errores.push("La contraseña debe incluir al menos una letra mayúscula.");
  }

  if (!/[0-9]/.test(password)) {
    errores.push("La contraseña debe incluir al menos un número.");
  }

  return errores;
};

export const registerUser = async ({
  username,
  nombreCompleto,
  fecha,
  email,
  password,
}: RegisterUserParams) => {
  // 1. Validar la contraseña antes de crear la cuenta
  const erroresPassword = validarPassword(password);

  if (erroresPassword.length > 0) {
    throw new Error(erroresPassword.join("\n"));
  }

  // 2. Crear la cuenta en Firebase Authentication
  let user;

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    user = userCredential.user;
  } catch (error: any) {
    switch (error.code) {
      case "auth/email-already-in-use":
        throw new Error("El correo ya está registrado");

      case "auth/invalid-email":
        throw new Error("El correo no es válido");

      case "auth/weak-password":
        throw new Error("La contraseña no cumple los requisitos");

      default:
        throw new Error("No se ha podido crear la cuenta");
    }
  }

  // 3. Guardar el perfil en Cloud Firestore
  try {
    await setDoc(doc(db, "users", user.uid), {
      username: username.trim(),
      nombreCompleto: nombreCompleto.trim(),
      email: user.email,
      fechaNacimiento: Timestamp.fromDate(fecha),
      createdAt: Timestamp.now(),
    });
  } catch (error) {
    // La cuenta de Authentication ya puede existir.
    console.error("Error al guardar el perfil:", error);
    throw error;
  }

  return user;
};
