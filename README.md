# Evaluación Módulo 5 – App Móvil React Native

Aplicación desarrollada como parte de la evaluación del Módulo 5, por **Roberto Agreda** y **Fabiola Deleón**. Esta app móvil está construida con **React Native** y utiliza **Firebase** para la gestión de datos y autenticación.

## 🛠️ Tecnologías utilizadas

- **React Native (Expo o CLI)** → para la interfaz móvil.  
- **Firebase Firestore** → base de datos en la nube.  
- **@react-native-picker/picker** → para el combo box en el formulario de edición.  

## 📂 Estructura del proyecto

```bash
.
├── components/
│   └── CardProductos.js    # Componente de tarjeta (mostrar, editar, eliminar)
├── screens/
│   └── ProductosScreen.js  # Pantalla principal que lista los productos
├── config/
│   └── firebase.js         # Configuración de Firebase
├── App.js                  # Punto de entrada de la app
└── README.md               # Documentación del proyecto

## 🚀 Instalación

1. Clona el repositorio:
   ```bash
   git clone https://github.com/Agreda73/evaluacio_Modulo5_Roberto-Agreda-20200718_Fabiola-Deleon-20230036.git
   cd evaluacio_Modulo5_Roberto-Agreda-20200718_Fabiola-Deleon-20230036

- Instala las dependencias:
npm install
- Configura tu archivo .env con las credenciales de Firebase:
FIREBASE_API_KEY=tu_api_key
FIREBASE_AUTH_DOMAIN=tu_auth_domain
FIREBASE_PROJECT_ID=tu_project_id
...


- Inicia la app:
npx expo start


## 🔧 Funcionalidades principales
- Registro y login de usuarios con Firebase Auth
- Navegación entre pantallas usando Native Stack
- Acceso a imágenes desde galería o cámara
- Lectura y escritura de datos en Firestore
- Manejo seguro de variables de entorno

## 👥 Autores
- Roberto Agreda 20200718
- Fabiola Deleón 20230033

##  🎥 link del video 


