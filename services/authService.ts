// services/authService.ts

import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

type RegisterChildParams = {
    username: string;
    nombreCompleto: string;
    fecha: Date;
    email: string;
    password: string;
};

export const registerChild = async ({
    username,
    nombreCompleto,
    fecha,
    email,
    password
}: RegisterChildParams) => {
    try {
        // 1️ Crear usuario en Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // 2️ Guardar datos en Firestore
        await setDoc(doc(db, "users", user.uid), {
            username,
            nombreCompleto,
            email,
            fechaNacimiento: Timestamp.fromDate(fecha),

            //  claves importantes
            role: "child",
            familyId: null,

            //  metadata
            createdAt: Timestamp.now()
        });

        return user;

    } catch (error: any) {

        //  Manejo de errores comunes
        if (error.code === "auth/email-already-in-use") {
            throw new Error("El correo ya está registrado");
        }

        if (error.code === "auth/invalid-email") {
            throw new Error("El correo no es válido");
        }

        if (error.code === "auth/weak-password") {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }

        // error genérico
        throw new Error("Error al crear la cuenta");
    }
};