
import { auth, db } from "./firebase";
import { getIdToken, reload } from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from "firebase/firestore";

// Crear o sincronizar el perfil público
export const sincronizarPerfilPublico = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Primero debes verificar tu correo.");
  }

  await getIdToken(user, true);

  // Obtener los datos privados del usuario
  const usuarioRef = doc(db, "users", user.uid);
  const usuarioDoc = await getDoc(usuarioRef);

  if (!usuarioDoc.exists()) {
    throw new Error("No se ha encontrado tu perfil.");
  }

  const datos = usuarioDoc.data();

  // Valores que coinciden con nuestras reglas
  const nombre = datos.nombreCompleto;
  const avatar =
    typeof datos.avatar === "string"
      ? datos.avatar
      : "👤";

  if (typeof nombre !== "string" || !nombre.trim()) {
    throw new Error("El nombre del usuario no es válido.");
  }

  // Crear el documento o actualizarlo si ya existe
  const perfilRef = doc(db, "publicProfiles", user.uid);

  await setDoc(perfilRef, {
    nombre,
    avatar,
  });
};

// Actualizar el nombre o avatar del usuario
export const actualizarDatosPerfil = async (
  nombreCompleto: string,
  avatar: string
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  const nombre = nombreCompleto.trim();

  if (!nombre || nombre.length > 100) {
    throw new Error("Introduce un nombre válido.");
  }

  if (!avatar.trim()) {
    throw new Error("Selecciona un avatar.");
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Debes verificar tu correo.");
  }

  await getIdToken(user, true);

  // 1. Actualizar los datos privados
  await updateDoc(doc(db, "users", user.uid), {
    nombreCompleto: nombre,
    avatar,
  });

  // 2. Actualizar los datos públicos
  await sincronizarPerfilPublico();
};
