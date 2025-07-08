# Block Life Organizer

A modern, full-stack calendar and productivity app with user authentication, recurring events, custom categories, notifications, and mobile support.

---

## Features
- User registration/login (JWT, MongoDB)
- Password reset via email (Resend)
- CRUD for events (with recurring support)
- Custom and default categories
- Mobile responsive UI
- Secure backend (helmet, CORS, rate limiting)
- Production-ready deployment

---

## 1. Backend Setup (Node.js/Express/MongoDB)

### a. Variables de entorno
Crea un archivo `.env` en la carpeta `backend/` con:
```env
MONGODB_URI=tu_uri_de_mongodb
JWT_SECRET=una_clave_secreta_fuerte
CORS_ORIGIN=https://tu-dominio-frontend.com
PORT=4000
RESEND_API_KEY=tu_api_key_de_resend
RESEND_FROM_EMAIL=tu_email_verificado@tudominio.com
```

### b. Instalación y ejecución
```bash
cd backend
npm install
npm run start # o npm run dev para desarrollo
```

### c. Despliegue recomendado
- Render, Railway, Fly.io, Heroku, etc.
- Configura las variables de entorno en el panel del proveedor.
- Asegúrate de que el puerto sea el 4000 (o el que elijas en `.env`).
- El backend debe estar accesible por HTTPS.

---

## 2. Frontend Setup (React/Vite)

### a. Variables de entorno
Crea un archivo `.env` en la raíz del frontend con:
```env
VITE_API_URL=https://tu-backend-en-produccion.com/api
```

### b. Instalación y build
```bash
npm install
npm run build
```

### c. Despliegue recomendado
- Vercel, Netlify, Firebase Hosting, etc.
- Sube la carpeta `dist/` generada por Vite.
- Configura el dominio y asegúrate de que apunte al build de producción.

---

## 3. Pruebas finales
- Regístrate, inicia sesión, crea, edita y elimina eventos y categorías.
- Prueba el flujo de recuperación de contraseña.
- Prueba en móvil y escritorio.
- Verifica que los emails de Resend lleguen correctamente.
- Verifica que los eventos se guardan y muestran correctamente.

---

## 4. Seguridad y buenas prácticas
- Nunca subas `.env` real a GitHub.
- Usa contraseñas fuertes para JWT y MongoDB.
- Limita el CORS solo a tu frontend.
- Activa backups automáticos en MongoDB Atlas.
- Agrega monitoreo/logs (Sentry, LogRocket, etc.).
- Configura HTTPS y redirección de HTTP a HTTPS.

---

## 5. Soporte y mejoras
- Si quieres Docker, CI/CD, o integración con otros servicios, puedes agregarlo fácilmente.
- Para nuevas features, abre un issue o pull request.

---

## 6. Créditos
Desarrollado por [Tu Nombre o Equipo].

---

¡Listo para organizar tu vida como nunca antes! 🚀
