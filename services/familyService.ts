import * as Crypto from "expo-crypto";
import { getIdToken, reload } from "firebase/auth";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    query,
    runTransaction,
    serverTimestamp,
    setDoc,
    Timestamp,
    where,
} from "firebase/firestore";
import { auth, db } from "./firebase";

export type MiembroFamilia = {
  uid: string;
  nombre: string;
  avatar: string;
  esAdministrador: boolean;
};

export type DatosMiFamilia = {
  id: string;
  nombre: string;
  createdBy: string;
  miembros: MiembroFamilia[];
  esAdministrador: boolean;
  miNombre: string;
  miAvatar: string;
};

export type SolicitudFamilia = {
  id: string;
  userId: string;
  familyId: string;
  nombreSolicitante: string;
  role: "parent" | "child";
  inviteCode: string;
  status: "pending" | "approved" | "rejected";
};

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
  const codigo = Crypto.randomUUID().replace(/-/g, "").toUpperCase();

  const caducidad = Timestamp.fromMillis(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await setDoc(doc(db, "familyInvites", codigo), {
    familyId,
    createdBy: user.uid,
    createdAt: serverTimestamp(),
    expiresAt: caducidad,
    active: true,
  });

  return codigo;
};

export const solicitarUnionFamilia = async (codigoIntroducido: string) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Primero debes verificar tu correo.");
  }

  await getIdToken(user, true);

  const codigo = codigoIntroducido.trim().toUpperCase();

  if (!/^[A-F0-9]{32}$/.test(codigo)) {
    throw new Error("El código de invitación no es válido.");
  }

  const invitacionRef = doc(db, "familyInvites", codigo);
  const usuarioRef = doc(db, "users", user.uid);

  return await runTransaction(db, async (transaction) => {
    const invitacionDoc = await transaction.get(invitacionRef);
    const usuarioDoc = await transaction.get(usuarioRef);

    if (!invitacionDoc.exists()) {
      throw new Error("El código no existe.");
    }

    const invitacion = invitacionDoc.data();

    if (!invitacion.active || invitacion.expiresAt.toMillis() <= Date.now()) {
      throw new Error("El código ha caducado o está desactivado.");
    }

    if (!usuarioDoc.exists()) {
      throw new Error("No se ha encontrado tu perfil.");
    }

    const datos = usuarioDoc.data();

    if (datos.familyId != null) {
      throw new Error("Ya perteneces a una familia.");
    }

    const familyId = invitacion.familyId as string;

    const solicitudRef = doc(db, "familyRequests", `${familyId}_${user.uid}`);

    transaction.set(solicitudRef, {
      userId: user.uid,
      familyId,
      role: datos.role,
      nombreSolicitante: datos.nombreCompleto,
      inviteCode: codigo,
      status: "pending",
      requestedAt: serverTimestamp(),
    });

    return familyId;
  });
};

export const obtenerSolicitudesPendientes = async (
  familyId: string,
): Promise<SolicitudFamilia[]> => {
  const solicitudesQuery = query(
    collection(db, "familyRequests"),
    where("familyId", "==", familyId),
    where("status", "==", "pending"),
  );

  const resultado = await getDocs(solicitudesQuery);

  return resultado.docs.map((documento) => {
    const datos = documento.data();

    return {
      id: documento.id,
      userId: datos.userId as string,
      familyId: datos.familyId as string,
      nombreSolicitante: datos.nombreSolicitante as string,
      role: datos.role as "parent" | "child",
      inviteCode: datos.inviteCode as string,
      status: datos.status as SolicitudFamilia["status"],
    };
  });
};

export const responderSolicitudFamilia = async (
  solicitudId: string,
  aceptar: boolean,
) => {
  const admin = auth.currentUser;

  if (!admin) {
    throw new Error("Debes iniciar sesión.");
  }

  await reload(admin);

  if (!admin.emailVerified) {
    throw new Error("Debes verificar tu correo.");
  }

  await getIdToken(admin, true);

  const solicitudRef = doc(db, "familyRequests", solicitudId);

  await runTransaction(db, async (transaction) => {
    // 1. Consultar solicitud
    const solicitudDoc = await transaction.get(solicitudRef);

    if (!solicitudDoc.exists()) {
      throw new Error("La solicitud no existe.");
    }

    const solicitud = solicitudDoc.data();

    if (solicitud.status !== "pending") {
      throw new Error("Esta solicitud ya se ha gestionado.");
    }

    const familyId = solicitud.familyId as string;
    const userId = solicitud.userId as string;

    if (solicitudId !== `${familyId}_${userId}`) {
      throw new Error("Identificador de solicitud no válido.");
    }

    const familiaRef = doc(db, "families", familyId);
    const usuarioRef = doc(db, "users", userId);

    // 2. Consultar familia y solicitante
    const familiaDoc = await transaction.get(familiaRef);
    // const usuarioDoc = await transaction.get(usuarioRef);

    if (!familiaDoc.exists()) {
      throw new Error("La familia no existe.");
    }

    // if (!usuarioDoc.exists()) {
    //   throw new Error("El usuario no existe.");
    // }

    const familia = familiaDoc.data();
    // const usuario = usuarioDoc.data();

    const adminIds = familia.adminIds as string[];
    const memberIds = familia.memberIds as string[];

    // 3. Comprobar permisos
    if (!adminIds.includes(admin.uid)) {
      throw new Error("No eres administrador de esta familia.");
    }

    if (!["parent", "child"].includes(solicitud.role)) {
      throw new Error("El rol de la solicitud no es válido.");
    }

    if (memberIds.includes(userId)) {
      throw new Error("El usuario ya aparece como miembro.");
    }

    // 4. Rechazar: cambiar únicamente la solicitud
    if (!aceptar) {
      transaction.update(solicitudRef, {
        status: "rejected",
        reviewedBy: admin.uid,
        reviewedAt: serverTimestamp(),
      });

      return;
    }

    // 5. Aceptar: actualizar la familia
    const nuevosMiembros = [...memberIds, userId];

    const nuevosAdministradores =
      solicitud.role === "parent" ? [...adminIds, userId] : adminIds;

    transaction.update(familiaRef, {
      memberIds: nuevosMiembros,
      adminIds: nuevosAdministradores,
      lastApprovedUserId: userId,
    });

    // 6. Asociar usuario con familia
    transaction.update(usuarioRef, {
      familyId,
    });

    // 7. Marcar solicitud aprobada
    transaction.update(solicitudRef, {
      status: "approved",
      reviewedBy: admin.uid,
      reviewedAt: serverTimestamp(),
    });
  });
};

export const obtenerMiFamilia = async (): Promise<DatosMiFamilia | null> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Debes verificar tu correo.");
  }

  await getIdToken(user, true);

  // 1. Obtener los datos de mi usuario
  const usuarioDoc = await getDoc(doc(db, "users", user.uid));

  if (!usuarioDoc.exists()) {
    throw new Error("No se ha encontrado tu perfil.");
  }

  const misDatos = usuarioDoc.data();
  const familyId = misDatos.familyId;

  if (!familyId || typeof familyId !== "string") {
    return null;
  }

  // 2. Obtener mi familia
  const familiaDoc = await getDoc(doc(db, "families", familyId));

  if (!familiaDoc.exists()) {
    throw new Error("No se ha encontrado tu familia.");
  }

  const familia = familiaDoc.data();

  const memberIds: string[] = familia.memberIds ?? [];
  const adminIds: string[] = familia.adminIds ?? [];

  if (!memberIds.includes(user.uid)) {
    throw new Error("No perteneces a esta familia.");
  }

  // 3. Crear o actualizar mi perfil familiar visible
  const miNombre = misDatos.nombreCompleto || "Mi cuenta";
  const miAvatar = misDatos.avatar || "👤";

  const miPerfilRef = doc(db, "publicProfiles", user.uid);

  console.log("1. Intentando leer mi perfil público");

  const usuarioActual = auth.currentUser;

  if (!usuarioActual) {
    throw new Error("No hay ningún usuario autenticado.");
  }

  const tokenActual = await usuarioActual.getIdTokenResult(true);

  console.log("UID autenticado AHORA:", usuarioActual.uid);
  console.log("UID del documento:", miPerfilRef.id);
  console.log("¿Coinciden?", usuarioActual.uid === miPerfilRef.id);
  console.log("Correo verificado AHORA:", tokenActual.claims.email_verified);
  console.log("Proyecto Firebase:", db.app.options.projectId);

  const miPerfilDoc = await getDoc(miPerfilRef);

  console.log("2. Mi perfil público se ha leído correctamente");

  if (
    !miPerfilDoc.exists() ||
    miPerfilDoc.data().nombre !== miNombre ||
    miPerfilDoc.data().avatar !== miAvatar
  ) {
    console.log("3. Intentando guardar mi perfil público");

    await setDoc(miPerfilRef, {
      nombre: miNombre,
      avatar: miAvatar,
    });

    console.log("4. Mi perfil público se ha guardado correctamente");
  }

  // 4. Obtener el nombre y avatar de todos los miembros
  const miembros = await Promise.all(
    memberIds.map(async (uid): Promise<MiembroFamilia> => {
      console.log("5. Intentando leer perfil familiar:", uid);

      const perfilDoc = await getDoc(doc(db, "publicProfiles", uid));

      console.log("6. Perfil familiar leído:", uid);

      const perfil = perfilDoc.exists() ? perfilDoc.data() : null;

      return {
        uid,
        nombre: perfil?.nombre ?? "Perfil pendiente",
        avatar: perfil?.avatar ?? "👤",
        esAdministrador: adminIds.includes(uid),
      };
    }),
  );

  return {
    id: familiaDoc.id,
    nombre: familia.nombre,
    createdBy: familia.createdBy,
    miembros,
    esAdministrador: adminIds.includes(user.uid),
    miNombre,
    miAvatar,
  };
};
