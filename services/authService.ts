
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

export const registerUser = async ({
    username,
    nombreCompleto,
    fecha,
    email,
    password
}: RegisterUserParams) => {
    // 1. Crear la cuenta en Firebase Authentication
    let user;

    try {
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email.trim(),
            password
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

    // 2. Guardar el perfil en Cloud Firestore
    try {
        await setDoc(doc(db, "users", user.uid), {
            username: username.trim(),
            nombreCompleto: nombreCompleto.trim(),
            email: user.email,
            fechaNacimiento: Timestamp.fromDate(fecha),
            createdAt: Timestamp.now()
        });
    } catch (error) {
        // La cuenta de Authentication ya puede existir.
        // No ocultamos el error original de Firestore.
        console.error("Error al guardar el perfil:", error);
        throw error;
    }

    return user;
};
