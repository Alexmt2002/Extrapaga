import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  Timestamp,
  where
} from "firebase/firestore";
import { auth, db } from "./firebase";

type RegisterUserParams = {
  username: string;
  nombreCompleto: string;
  fecha: Date;
  email: string;
  password: string;
};
type LoginUserParams = {
  username: string;
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
  const normalizedUsername = username.trim().toLowerCase();

  // 1. Validar username

  if (normalizedUsername.includes("/")) {
    throw new Error("El nombre de usuario no puede contener /.");
  }

  // 2. Validar contraseña
  const erroresPassword = validarPassword(password);

  if (erroresPassword.length > 0) {
    throw new Error(erroresPassword.join("\n"));
  }

  // 3. Crear cuenta en Firebase Authentication
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
        throw new Error("El correo ya está registrado.");

      case "auth/invalid-email":
        throw new Error("El correo no es válido.");

      case "auth/weak-password":
        throw new Error("La contraseña no cumple los requisitos.");

      default:
        throw new Error("No se ha podido crear la cuenta.");
    }
  }

  // 4. Reservar username y guardar perfil
  try {
    await runTransaction(db, async (transaction) => {
      const usernameRef = doc(db, "usernames", normalizedUsername);
      const usernameDoc = await transaction.get(usernameRef);

      if (usernameDoc.exists()) {
        throw new Error("Este nombre de usuario ya está registrado.");
      }

      const userRef = doc(db, "users", user.uid);

      // Reservar el username
      transaction.set(usernameRef, {
        uid: user.uid,
      });

      // Guardar el perfil
      transaction.set(userRef, {
        username: normalizedUsername,
        nombreCompleto: nombreCompleto.trim(),
        email: user.email,
        fechaNacimiento: Timestamp.fromDate(fecha),
        createdAt: Timestamp.now(),
      });
    });
  } catch (error) {
    // Si falla Firestore, intentamos eliminar la cuenta recién creada
    try {
      await deleteUser(user);
    } catch (deleteError) {
      console.error(
        "No se pudo eliminar la cuenta de Authentication:",
        deleteError,
      );
    }

    throw error;
  }

  return user;
};

export const loginUser = async ({ username, password }: LoginUserParams) => {
  const normalizedUsername = username.trim();

  if (!normalizedUsername || !password) {
    throw new Error("Debes indicar el nombre de usuario y la contraseña.");
  }

  const users = await getDocs(
    query(collection(db, "users"), where("username", "==", normalizedUsername)),
  );

  if (users.size !== 1) {
    throw new Error("Usuario o contraseña incorrectos.");
  }

  const email = users.docs[0].data().email;

  if (typeof email !== "string" || !email.trim()) {
    throw new Error("La cuenta no tiene un correo asociado válido.");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email.trim(),
      password,
    );

    return userCredential.user;
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          throw new Error("Usuario o contraseña incorrectos.");
      }
    }

    throw error;
  }
};
