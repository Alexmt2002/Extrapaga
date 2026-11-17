import { FirebaseError } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, runTransaction, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

type RegisterUserParams = {
  username: string;
  nombreCompleto: string;
  fecha: Date;
  email: string;
  password: string;
  role: "parent" | "child";
  avatar: string | null;
  opcionFamilia: "crear" | "unirse" | null;
  nombreFamilia: string;
  codigoFamilia: string;
};
type LoginUserParams = {
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
  role,
  avatar,
  opcionFamilia,
  nombreFamilia,
  codigoFamilia,
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

        role,
        avatar: avatar || "👤",
        fotoURL: null,

        familyId: null,

        configuracionFamiliaPendiente: {
          opcion:
            role === "parent"
              ? opcionFamilia
              : codigoFamilia.trim()
                ? "unirse"
                : null,

          nombre:
            role === "parent" && opcionFamilia === "crear"
              ? nombreFamilia.trim()
              : null,

          codigo:
            role === "child" || opcionFamilia === "unirse"
              ? codigoFamilia.trim().toUpperCase() || null
              : null,
        },
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

export const loginUser = async ({ email, password }: LoginUserParams) => {
  const normalizedEmail = email.trim();

  if (!normalizedEmail || !password) {
    throw new Error("Debes indicar el correo electrónico y la contraseña.");
  }

  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      normalizedEmail,
      password,
    );

    return userCredential.user;
  } catch (error) {
    if (error instanceof FirebaseError) {
      switch (error.code) {
        case "auth/invalid-credential":
        case "auth/user-not-found":
        case "auth/wrong-password":
          throw new Error("Correo o contraseña incorrectos.");
      }
    }

    throw error;
  }
};

export const enviarVerificacion = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No hay ninguna sesión iniciada.");
  }

  if (user.emailVerified) {
    return;
  }

  await sendEmailVerification(user);
};

export const recuperarPassword = async (email: string) => {
  if (!email.trim()) {
    throw new Error("Introduce tu correo electrónico.");
  }

  await sendPasswordResetEmail(auth, email.trim());
};
