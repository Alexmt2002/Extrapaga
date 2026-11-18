import { useState } from "react";

export default function useRegistro() {
  // Datos personales
  const [username, setUsername] = useState("");
  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");

  // Fecha de nacimiento
  const [open, setOpen] = useState(false);
  const [fecha, setFecha] = useState<Date | undefined>(undefined);

  // Navegación y rol
  const [paso, setPaso] = useState(1);
  const [rol, setRol] = useState<"parent" | "child" | null>(null);

  // Avatar y fotografía
  const [avatar, setAvatar] = useState<string | null>(null);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);

  // Comprobaciones de la contraseña
  const tieneLongitudValida = password.length > 8;
  const tieneMayuscula = /[A-Z]/.test(password);
  const tieneNumero = /[0-9]/.test(password);

  const [cargando, setCargando] = useState(false);

  return {
    username,
    setUsername,
    nombreCompleto,
    setNombreCompleto,
    email,
    setEmail,
    password,
    setPassword,
    repeatPassword,
    setRepeatPassword,

    open,
    setOpen,
    fecha,
    setFecha,

    paso,
    setPaso,
    rol,
    setRol,

    avatar,
    setAvatar,
    fotoPerfil,
    setFotoPerfil,

    tieneLongitudValida,
    tieneMayuscula,
    tieneNumero,

    cargando,
    setCargando,
  };
}
