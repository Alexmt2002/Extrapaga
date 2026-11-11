# Arquitectura actual

```mermaid
flowchart TD
    U[Usuario]

    subgraph APP["Cliente · Expo / React Native"]
        R["Expo Router"]
        S["app/index.tsx<br/>Splash: redirige a login"]
        L["app/login.tsx<br/>Pantalla de inicio de sesión"]
        C["app/CrearCuenta.tsx<br/>Formulario de registro"]
        P["app/perfil.tsx<br/>Pantalla placeholder"]
        T["app/tareas.tsx<br/>Pantalla placeholder"]
        CT["app/creartareas.tsx<br/>Pantalla placeholder"]
        UI["components · constants<br/>Componentes y tema compartidos"]

        R --> S
        S -->|tras el splash| L
        L -->|botones actuales| C
        C -->|registro correcto| P
        R -. rutas disponibles .-> T
        R -. rutas disponibles .-> CT
        L --- UI
        C --- UI
    end

    subgraph SERVICES["Capa de servicios"]
        AS["services/authService.ts<br/>Valida contraseña y registra usuario"]
        FB["services/firebase.ts<br/>Inicializa Firebase"]
    end

    subgraph FIREBASE["Firebase"]
        AUTH["Firebase Authentication<br/>Crea la cuenta"]
        DB["Cloud Firestore<br/>users/{uid}: perfil"]
    end

    U --> R
    C -->|registerUser| AS
    AS --> FB
    FB --> AUTH
    FB --> DB
    AS -->|1. crear cuenta| AUTH
    AS -->|2. guardar perfil| DB

    TS["services/taskService.ts<br/>Sin funcionalidad implementada"]
    TS -.-> T
    TS -.-> CT
```

## Alcance del diagrama

- El arranque muestra el splash y después siempre redirige a `login`.
- El formulario de registro valida los datos, crea la cuenta en Firebase Authentication y guarda el perfil en Firestore.
- La pantalla de inicio de sesión todavía no está conectada a Firebase; sus botones navegan actualmente al formulario de registro.
- Las pantallas de perfil y tareas son placeholders. `taskService.ts` no implementa operaciones de tareas.
