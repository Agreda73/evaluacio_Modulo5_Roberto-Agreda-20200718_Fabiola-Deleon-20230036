# Evaluación Módulo 5 – App Móvil React Native

Aplicación desarrollada como parte de la evaluación del Módulo 5, por **Roberto Agreda** y **Fabiola Deleón**. Esta app móvil está construida con **React Native** y utiliza **Firebase** para la gestión de datos y autenticación.

## 📱 Tecnologías utilizadas

- React Native
- Expo
- Firebase (Firestore y Auth)
- React Navigation (Native Stack)
- dotenv para variables de entorno
- Expo Image Picker

## 📁 Estructura del proyecto
├── assets/               # Recursos gráficos y multimedia ├── src/                 # Lógica principal de la app │   ├── components/      # Componentes reutilizables │   ├── screens/         # Pantallas de navegación │   └── firebase/        # Configuración de Firebase ├── App.js               # Punto de entrada de la app ├── .env                 # Variables de entorno ├── app.json             # Configuración de Expo ├── package.json         # Dependencias del proyecto

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
- Roberto Agreda
- Fabiola Deleón


