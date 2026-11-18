
import { auth, db } from "./firebase";
import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { getIdToken, reload } from "firebase/auth";

export const crearFamilia = async (nombreFamilia: string) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  const nombre = nombreFamilia.trim();

  if (!nombre || nombre.length > 60) {
    throw new Error("Introduce un nombre válido para la familia.");
  }

  // Comprobar que el correo está verificado
  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Primero debes verificar tu correo.");
  }

  // Actualizar el token utilizado por las reglas de Firebase
  await getIdToken(user, true);

  const familiaRef = doc(collection(db, "families"));
  const usuarioRef = doc(db, "users", user.uid);

  await runTransaction(db, async (transaction) => {
    const usuarioDoc = await transaction.get(usuarioRef);

    if (!usuarioDoc.exists()) {
      throw new Error("No se ha encontrado tu perfil.");
    }

    const datosUsuario = usuarioDoc.data();

    if (datosUsuario.role !== "parent") {
      throw new Error("Solo un padre o tutor puede crear una familia.");
    }

    if (datosUsuario.familyId != null) {
      throw new Error("Ya perteneces a una familia.");
    }

    // Crear la familia
    transaction.set(familiaRef, {
      nombre,
      imagenURL: null,
      createdBy: user.uid,
      createdAt: serverTimestamp(),
      adminIds: [user.uid],
      memberIds: [user.uid],
    });

    // Vincular el padre con la familia
    transaction.update(usuarioRef, {
      familyId: familiaRef.id,
    });
  });

  return familiaRef.id;
};
