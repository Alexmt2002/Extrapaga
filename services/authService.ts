// authService.ts
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export const registerChild = async ({
    username,
    nombreCompleto,
    fecha,
    email,
    password
}: {
    username: string;
    nombreCompleto: string;
    fecha: Date;
    email: string;
    password: string;
}) => {
    try {
        // 1️⃣ Crear usuario en Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            email,
            password
        );

        const user = userCredential.user;

        // 2️⃣ Guardar datos en Firestore
        await setDoc(doc(db, "hijos", user.uid), {
            username,
            nombreCompleto,
            fechaNacimiento: Timestamp.fromDate(fecha),
            email,
            createdAt: Timestamp.now()
        });

        return user;

    } catch (error) {
        throw error;
    }
};