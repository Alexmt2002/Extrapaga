
import { auth, db } from "./firebase";
import * as Crypto from "expo-crypto";
import {
  collection,
   getDoc,
  setDoc,
  Timestamp,
  query,
  where,
  getDocs,
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

export const generarCodigoInvitacion = async () => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Debes verificar tu correo.");
  }

  await getIdToken(user, true);

  // Obtener la familia del administrador
  const usuarioDoc = await getDoc(doc(db, "users", user.uid));

  if (!usuarioDoc.exists()) {
    throw new Error("Usuario no encontrado.");
  }

  const familyId = usuarioDoc.data().familyId;

  if (!familyId) {
    throw new Error("Todavía no perteneces a una familia.");
  }

  const familiaDoc = await getDoc(doc(db, "families", familyId));

  if (!familiaDoc.exists()) {
    throw new Error("Familia no encontrada.");
  }

  const administradores = familiaDoc.data().adminIds as string[];

  if (!administradores.includes(user.uid)) {
    throw new Error("No tienes permisos de administrador.");
  }

  // Código aleatorio de alta entropía
  const codigo = Crypto.randomUUID()
    .replace(/-/g, "")
    .toUpperCase();

  const caducidad = Timestamp.fromMillis(
    Date.now() + 7 * 24 * 60 * 60 * 1000
  );

  await setDoc(doc(db, "familyInvites", codigo), {
    familyId,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    expiresAt: caducidad,
    active: true,
  });

  return codigo;
};

export const solicitarUnionFamilia = async (
  codigoIntroducido: string
) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Primero debes verificar tu correo.");
  }

  await getIdToken(user, true);

  const codigo = codigoIntroducido
    .trim()
    .toUpperCase();

  if (!/^[A-F0-9]{32}$/.test(codigo)) {
    throw new Error("El código de invitación no es válido.");
  }

  const invitacionRef = doc(db, "familyInvites", codigo);
  const usuarioRef = doc(db, "users", user.uid);

  // Una solicitud tiene su propio identificador
  const solicitudRef = doc(collection(db, "familyRequests"));

  const familyId = await runTransaction(db, async (transaction) => {
    const invitacionDoc = await transaction.get(invitacionRef);
    const usuarioDoc = await transaction.get(usuarioRef);

    if (!invitacionDoc.exists()) {
      throw new Error("El código no existe.");
    }

    const invitacion = invitacionDoc.data();

    if (!invitacion.active) {
      throw new Error("La invitación está desactivada.");
    }

    if (invitacion.expiresAt.toMillis() <= Date.now()) {
      throw new Error("El código ha caducado.");
    }

    if (!usuarioDoc.exists()) {
      throw new Error("No se ha encontrado tu perfil.");
    }

    const datosUsuario = usuarioDoc.data();

    if (datosUsuario.familyId != null) {
      throw new Error("Ya perteneces a una familia.");
    }

    // const familiaRef = doc(db, "families", invitacion.familyId);
    // const familiaDoc = await transaction.get(familiaRef);

    // if (!familiaDoc.exists()) {
    //   throw new Error("La familia ya no existe.");
    // }

    transaction.set(solicitudRef, {
      userId: user.uid,
      familyId: invitacion.familyId,
      role: datosUsuario.role,
      inviteCode: codigo,
      status: "pending",
      requestedAt: serverTimestamp(),
    });

    return invitacion.familyId as string;
  });

  return familyId;
};

export const obtenerSolicitudesPendientes = async (
  familyId: string
) => {
  const solicitudesQuery = query(
    collection(db, "familyRequests"),
    where("familyId", "==", familyId),
    where("status", "==", "pending")
  );

  const resultado = await getDocs(solicitudesQuery);

  return resultado.docs.map((solicitud) => ({
    id: solicitud.id,
    ...solicitud.data(),
  }));
};


