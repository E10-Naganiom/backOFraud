# oFraud Backend - API REST

Backend del sistema oFraud desarrollado con NestJS, TypeScript y MySQL. Proporciona una API REST completa para la gestión de incidentes de ciberdelitos.

## 📋 Tabla de Contenidos

- [Requisitos Previos](#requisitos-previos)
- [Tecnologías](#tecnologías)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Base de Datos](#base-de-datos)
- [Autenticación](#autenticación)
- [Solución de Problemas](#solución-de-problemas)

---

## 🔧 Requisitos Previos

Antes de instalar el backend, asegúrese de tener instalado:

- **Node.js**: v18.0.0 o superior
- **npm**: v9.0.0 o superior (viene con Node.js)
- **MySQL**: v8.0 o superior
- **Git**: Para clonar el repositorio

### Verificar instalaciones:

```bash
node --version
npm --version
mysql --version
```

---

## 🛠 Tecnologías

- **Framework**: NestJS 10.x
- **Lenguaje**: TypeScript
- **Base de Datos**: MySQL 8.0
- **Autenticación**: JWT (JSON Web Tokens)
- **Validación**: class-validator, class-transformer
- **Documentación**: Swagger/OpenAPI

---

## 📦 Instalación

### 1. Clonar el repositorio

```bash
git clone <https://github.com/E10-Naganiom/backOFraud>
cd backend
```

### 2. Instalar dependencias

```bash
npm install
```

Este comando instalará todas las dependencias necesarias definidas en `package.json`.

---

## ⚙️ Configuración

### 1. Configurar Base de Datos MySQL

#### Crear la base de datos:

```sql
CREATE DATABASE ofraud CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### Importar el esquema:

Si tiene un archivo SQL con el esquema:

```bash
mysql -u root -p ofraud < database/schema.sql
```

O ejecute manualmente el script de creación de tablas que se encuentra en la documentación del proyecto.

### 2. Configurar variables de entorno

Cree un archivo `.env` en la raíz del proyecto backend:

```bash
cp .env.example .env
```

Edite el archivo `.env` con sus configuraciones:

```env
# Configuración del Servidor
PORT=3000
NODE_ENV=development

# Configuración de Base de Datos
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=tu_contraseña_mysql
DB_NAME=ofraud

# Configuración JWT
JWT_SECRET=tu_secreto_jwt_muy_seguro_cambialo
JWT_REFRESH_SECRET=tu_secreto_refresh_muy_seguro_cambialo
JWT_EXPIRATION=24h

# CORS (Orígenes permitidos)
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

⚠️ **IMPORTANTE**: 
- Cambie `JWT_SECRET` y `JWT_REFRESH_SECRET` por valores seguros únicos
- En producción, use `NODE_ENV=production`
- Configure `CORS_ORIGIN` con las URLs de su frontend

---

## 🚀 Ejecución

### Modo Desarrollo (con hot-reload)

```bash
npm run start:dev
```

El servidor se iniciará en `http://localhost:3000` (o el puerto configurado en `.env`)

### Modo Producción

```bash
# Compilar el proyecto
npm run build

# Ejecutar en producción
npm run start:prod
```

### Verificar que el servidor está corriendo

Abra su navegador en:
- **API**: `http://localhost:3000`
- **Documentación Swagger**: `http://localhost:3000/docs`

Debería ver la documentación interactiva de la API.

---

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── auth/                    # Módulo de autenticación (JWT, login)
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── token.service.ts
│   │   └── guards/              # Guards de autenticación
│   ├── users/                   # Módulo de gestión de usuarios
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   ├── incidents/               # Módulo de incidentes
│   │   ├── incidents.controller.ts
│   │   ├── incidents.service.ts
│   │   ├── incidents.repository.ts
│   │   └── dto/
│   ├── categories/              # Módulo de categorías
│   │   ├── categories.controller.ts
│   │   ├── categories.service.ts
│   │   └── dto/
│   ├── evidence/                # Módulo de evidencias
│   │   ├── evidence.controller.ts
│   │   └── evidence.service.ts
│   ├── admin/                   # Módulo de administración
│   │   └── admin.controller.ts
│   ├── common/                  # Utilidades comunes
│   │   ├── decorators/
│   │   └── filters/
│   ├── app.module.ts            # Módulo principal
│   └── main.ts                  # Punto de entrada
├── public/                      # Archivos estáticos (evidencias)
│   └── uploads/
├── .env                         # Variables de entorno
├── .env.example                 # Ejemplo de variables
├── package.json
└── tsconfig.json
```

---

## 🔌 API Endpoints

### Documentación Completa

La documentación completa e interactiva está disponible en Swagger:

**URL**: `http://localhost:3000/docs`

### Endpoints Principales

#### Autenticación

```
POST   /auth/login              # Iniciar sesión
POST   /auth/register           # Registrar usuario
GET    /auth/profile            # Obtener perfil del usuario autenticado
```

#### Usuarios

```
GET    /users                   # Obtener todos los usuarios
GET    /users/:id               # Obtener usuario por ID
POST   /users                   # Crear nuevo usuario
PUT    /users/:id               # Actualizar usuario
```

#### Admin - Usuarios

```
GET    /admin/user/list         # Listar todos los usuarios (Admin)
GET    /admin/user/:id          # Obtener usuario por ID (Admin)
PUT    /admin/user/:id          # Actualizar usuario (Admin)
PATCH  /admin/user/:id/inactivate  # Inactivar usuario (Admin)
```

#### Incidentes

```
GET    /incidents               # Obtener incidentes del usuario
GET    /incidents/:id           # Obtener incidente por ID
POST   /incidents               # Crear nuevo incidente
PUT    /incidents/:id           # Actualizar incidente
```

#### Admin - Incidentes

```
GET    /admin/incidents/list           # Listar todos los incidentes
GET    /admin/incidents/list/pending   # Listar incidentes pendientes
GET    /admin/incidents/list/approved  # Listar incidentes aprobados
GET    /admin/incidents/list/rejected  # Listar incidentes rechazados
GET    /admin/incidents/:id            # Obtener incidente por ID
PATCH  /admin/incidents/:id/evaluate   # Evaluar incidente (aprobar/rechazar)
```

#### Estadísticas

```
GET    /incidents/statistics/summary   # Obtener estadísticas generales
```

#### Categorías

```
GET    /categories              # Obtener todas las categorías
GET    /categories/:id          # Obtener categoría por ID
POST   /admin/categories        # Crear categoría (Admin)
PUT    /admin/categories/:id    # Actualizar categoría (Admin)
DELETE /admin/categories/:id    # Eliminar categoría (Admin)
```

---

## 🗄️ Base de Datos

### Estructura Principal

**Tablas principales:**

- `usuario`: Almacena información de usuarios y administradores
- `incidente`: Registros de incidentes reportados
- `categoria`: Tipos de ciberdelitos
- `estatus`: Estados de los incidentes (Pendiente, Aprobado, Rechazado)
- `evidencia`: Archivos de evidencia asociados a incidentes

### Migrar/Actualizar Base de Datos

Si necesita actualizar el esquema de la base de datos:

```bash
# Ejecutar migraciones (si las hay)
npm run migration:run

# Revertir última migración
npm run migration:revert
```

---

## 🔐 Autenticación

### Sistema JWT

El backend usa **JSON Web Tokens (JWT)** para autenticación:

1. **Login**: El usuario envía credenciales a `/auth/login`
2. **Token**: El backend retorna un `access_token` y `refresh_token`
3. **Autenticación**: Las peticiones subsecuentes incluyen el token en el header:
   ```
   Authorization: Bearer <access_token>
   ```

### Duración de Tokens

- **Access Token**: 24 horas (configurable en `.env`)
- **Refresh Token**: 7 días

### Rutas Protegidas

Las rutas con el prefijo `/admin/*` requieren:
- Token JWT válido
- Usuario con `is_admin: true`

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"

**Causa**: MySQL no está corriendo o credenciales incorrectas.

**Solución**:
1. Verifique que MySQL está corriendo:
   ```bash
   sudo systemctl status mysql    # Linux
   brew services list             # macOS
   ```
2. Verifique las credenciales en `.env`
3. Verifique que la base de datos existe:
   ```bash
   mysql -u root -p -e "SHOW DATABASES;"
   ```

### Error: "Port 3000 already in use"

**Solución**: Cambie el puerto en `.env`:
```env
PORT=3001
```

### Error: "JWT Secret is not defined"

**Solución**: Asegúrese de que `.env` tiene configurado:
```env
JWT_SECRET=tu_secreto_aqui
```

### Error de CORS

**Causa**: El frontend no está en la lista de orígenes permitidos.

**Solución**: Agregue la URL del frontend en `src/main.ts`:
```typescript
app.enableCors({
  origin: ['http://localhost:3000', 'http://tu-frontend-url.com'],
  credentials: true,
});
```

---

## 📞 Soporte

Para problemas técnicos o consultas:
- **Email**: soporte@ofraud.com
- **Documentación**: Ver Swagger en `/docs`

---

## 📝 Notas Adicionales

### Producción

Para deploy en producción:

1. Configure `NODE_ENV=production` en `.env`
2. Use un secreto JWT fuerte y único
3. Configure HTTPS
4. Use un proceso manager como PM2:
   ```bash
   npm install -g pm2
   pm2 start dist/main.js --name ofraud-api
   ```
5. Configure un proxy reverso (Nginx/Apache)

### Seguridad

- ✅ Las contraseñas se hashean con salt antes de almacenarse
- ✅ Los tokens JWT expiran automáticamente
- ✅ Las rutas de admin están protegidas
- ✅ Validación de datos en todos los endpoints

---

**Versión**: 1.0.0  
**Autores**: Santiago Niño, Gabriel Gutiérrez, Omar Llano, Alejandro Vargas  
**Última actualización**: 2025