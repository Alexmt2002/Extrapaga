
import { auth, db } from "./firebase";
import { getIdToken, reload } from "firebase/auth";
import {
  addDoc,
  collection,
  doc,
  query,
  where,
  getDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

export type HijoAsignable = {
  uid: string;
  nombre: string;
  avatar: string;
};

type CrearTareaParams = {
  titulo: string;
  descripcion: string;
  assignedTo: string;
  recompensaCentimos: number;
};
export type Tarea = {
  id: string;
  titulo: string;
  descripcion: string;
  familyId: string;
  createdBy: string;
  assignedTo: string;
  recompensaCentimos: number;
  estado: "pending" | "review" | "approved" | "rejected";
  createdAt?: Date;
};

export type ResultadoTareas = {
  tareas: Tarea[];
  esAdministrador: boolean;
  tieneFamilia: boolean;
};

// Obtener los hijos de la familia
export const obtenerHijosFamilia = async (): Promise<HijoAsignable[]> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  const usuarioDoc = await getDoc(doc(db, "users", user.uid));

  if (!usuarioDoc.exists()) {
    throw new Error("No se ha encontrado tu perfil.");
  }

  const familyId = usuarioDoc.data().familyId;

  if (!familyId) {
    throw new Error("No perteneces a ninguna familia.");
  }

  const familiaDoc = await getDoc(doc(db, "families", familyId));

  if (!familiaDoc.exists()) {
    throw new Error("No se ha encontrado la familia.");
  }

  const familia = familiaDoc.data();

  const adminIds: string[] = familia.adminIds ?? [];
  const memberIds: string[] = familia.memberIds ?? [];

  if (!adminIds.includes(user.uid)) {
    throw new Error("Solo los administradores pueden crear tareas.");
  }

  // En nuestro sistema, los padres aprobados son administradores.
  // Por eso obtenemos los miembros que no son administradores.
  const hijosIds = memberIds.filter(
    (uid) => !adminIds.includes(uid)
  );

  const hijos = await Promise.all(
    hijosIds.map(async (uid) => {
      const perfilDoc = await getDoc(
        doc(db, "publicProfiles", uid)
      );

      const datos = perfilDoc.exists() ? perfilDoc.data() : null;

      return {
        uid,
        nombre: datos?.nombre ?? "Perfil pendiente",
        avatar: datos?.avatar ?? "👤",
      };
    })
  );

  return hijos;
};

// Crear una tarea
export const crearTarea = async ({
  titulo,
  descripcion,
  assignedTo,
  recompensaCentimos,
}: CrearTareaParams) => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  const tituloLimpio = titulo.trim();
  const descripcionLimpia = descripcion.trim();

  if (!tituloLimpio || tituloLimpio.length > 100) {
    throw new Error("Introduce un título válido.");
  }

  if (descripcionLimpia.length > 1000) {
    throw new Error("La descripción es demasiado larga.");
  }

  if (
    !Number.isInteger(recompensaCentimos) ||
    recompensaCentimos < 0 ||
    recompensaCentimos > 100000
  ) {
    throw new Error("La recompensa debe estar entre 0 y 1000 €.");
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Debes verificar tu correo.");
  }

  await getIdToken(user, true);

  const usuarioDoc = await getDoc(doc(db, "users", user.uid));

  if (!usuarioDoc.exists()) {
    throw new Error("No se ha encontrado tu perfil.");
  }

  const familyId = usuarioDoc.data().familyId;

  if (!familyId) {
    throw new Error("No perteneces a ninguna familia.");
  }

  const familiaDoc = await getDoc(doc(db, "families", familyId));

  if (!familiaDoc.exists()) {
    throw new Error("La familia no existe.");
  }

  const familia = familiaDoc.data();

  if (!familia.adminIds.includes(user.uid)) {
    throw new Error("No tienes permisos para crear tareas.");
  }

  if (
    !familia.memberIds.includes(assignedTo) ||
    familia.adminIds.includes(assignedTo)
  ) {
    throw new Error("Selecciona un hijo válido de tu familia.");
  }

  const tareaRef = await addDoc(collection(db, "tasks"), {
    titulo: tituloLimpio,
    descripcion: descripcionLimpia,
    familyId,
    createdBy: user.uid,
    assignedTo,
    recompensaCentimos,
    estado: "pending",
    createdAt: serverTimestamp(),
  });

  return tareaRef.id;
};
export const obtenerMisTareas = async (): Promise<ResultadoTareas> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Debes verificar tu correo.");
  }

  await getIdToken(user, true);

  // 1. Consultar la familia del usuario
  const usuarioDoc = await getDoc(doc(db, "users", user.uid));

  if (!usuarioDoc.exists()) {
    throw new Error("No existe tu perfil.");
  }

  const familyId = usuarioDoc.data().familyId;

  if (!familyId) {
    return {
      tareas: [],
      esAdministrador: false,
      tieneFamilia: false,
    };
  }

  // 2. Comprobar si es administrador
  const familiaDoc = await getDoc(doc(db, "families", familyId));

  if (!familiaDoc.exists()) {
    throw new Error("No se encuentra tu familia.");
  }

  const familia = familiaDoc.data();
  const esAdministrador =
    (familia.adminIds as string[]).includes(user.uid);

  // 3. Preparar la consulta correspondiente
  const consulta = esAdministrador
    ? query(
        collection(db, "tasks"),
        where("familyId", "==", familyId)
      )
    : query(
        collection(db, "tasks"),
        where("familyId", "==", familyId),
        where("assignedTo", "==", user.uid)
      );

  const resultado = await getDocs(consulta);

  // 4. Convertir documentos a objetos Tarea
  const tareas: Tarea[] = resultado.docs.map((documento) => {
    const datos = documento.data();

    return {
      id: documento.id,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      familyId: datos.familyId,
      createdBy: datos.createdBy,
      assignedTo: datos.assignedTo,
      recompensaCentimos: datos.recompensaCentimos,
      estado: datos.estado,
      createdAt: datos.createdAt?.toDate(),
    };
  });

  // Ordenar de más reciente a más antigua
  tareas.sort(
    (a, b) =>
      (b.createdAt?.getTime() ?? 0) -
      (a.createdAt?.getTime() ?? 0)
  );

  return {
    tareas,
    esAdministrador,
    tieneFamilia: true,
  };
};
