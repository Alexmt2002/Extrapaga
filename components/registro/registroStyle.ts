import { Colors } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },

  scroll: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },

  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  content: {
    alignItems: "center",
    maxWidth: 400,
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: Colors.light.text2,
  },

  input: {
    width: "100%",
    minHeight: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 10,
    justifyContent: "center",
  },

  passwordRequirements: {
    width: "100%",
    marginTop: -5,
    marginBottom: 15,
    gap: 5,
  },

  createButton: {
    marginTop: 20,
    marginBottom: 20,
  },

  logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
  },

  selectorRol: {
    width: "100%",
    alignItems: "center",
  },

  descripcion: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#666",
  },

  tarjetaRol: {
    width: "100%",
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#ddd",
    marginBottom: 20,
    backgroundColor: "#F4FAF4",
  },

  tarjetaSeleccionada: {
    borderColor: "#66BB6A",
    backgroundColor: "#E8F5E9",
  },

  nombreRol: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#2E7D32",
  },

  botonesNavegacion: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 20,
    marginBottom: 20,
  },

  botonAtras: {
    flex: 1,
    width: "auto",
    backgroundColor: "#E8F5E9",
    borderWidth: 1,
    borderColor: "#5EC287",
  },

  textoBotonAtras: {
    color: "#2E7D32",
  },

  botonContinuar: {
    flex: 1,
    width: "auto",
    backgroundColor: "#5EC287",
  },
  botonContinuar1: {
    maxWidth: "100%",
    width: "100%",
    backgroundColor: "#5EC287",
  },

  avatarPrincipal: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#E8F5E9",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginBottom: 25,
    borderWidth: 3,
    borderColor: "#5EC287",
  },

  imagenPerfil: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
  },

  avatarTexto: {
    fontSize: 70,
  },

  subtituloAvatar: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 15,
  },

  listaAvatares: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 25,
  },

  avatarOpcion: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F4FAF4",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ddd",
  },

  avatarSeleccionado: {
    borderColor: "#5EC287",
    backgroundColor: "#E8F5E9",
  },

  avatarEmoji: {
    fontSize: 35,
  },

  botonFoto: {
    backgroundColor: "#5EC287",
    marginBottom: 20,
  },

  textoPredeterminado: {
    color: "#2E7D32",
    textDecorationLine: "underline",
    marginBottom: 20,
  },

  textoInformativo: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 18,
    lineHeight: 21,
  },
});
