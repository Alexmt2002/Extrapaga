//Para un futuro cuando le implemente las imagenes para las fotos de perfil
import { auth } from "./firebase";
import { getIdToken, reload } from "firebase/auth";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadString,
} from "firebase/storage";
import type { ImagePickerAsset } from "expo-image-picker";

const storage = getStorage();

export const subirFotoPerfil = async (
  imagen: ImagePickerAsset
): Promise<string> => {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("Debes iniciar sesión.");
  }

  await reload(user);

  if (!user.emailVerified) {
    throw new Error("Debes verificar tu correo.");
  }

  await getIdToken(user, true);

  if (!imagen.base64) {
    throw new Error("No se han podido leer los datos de la imagen.");
  }

  const tipo = imagen.mimeType ?? "image/jpeg";

  const extensiones: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  };

  const extension = extensiones[tipo];

  if (!extension) {
    throw new Error("Selecciona una imagen JPG, PNG o WebP.");
  }

  // Limitar aproximadamente el tamaño a 5 MB.
  const bytesEstimados =
    Math.floor(imagen.base64.length * 3 / 4);

  if (bytesEstimados > 5 * 1024 * 1024) {
    throw new Error("La fotografía no puede superar los 5 MB.");
  }

  const ruta = `avatars/${user.uid}/profile-${Date.now()}.${extension}`;

  const fotoRef = ref(storage, ruta);

  // Subir los datos de la imagen a Firebase Storage.
  await uploadString(
    fotoRef,
    imagen.base64,
    "base64",
    { contentType: tipo }
  );

  // Obtener la URL que utilizaremos en Firestore.
  return await getDownloadURL(fotoRef);
};
