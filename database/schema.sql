-- 1. Tabla Usuario final
CREATE TABLE usuario (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(120) NOT NULL,
    apellido VARCHAR(120) NOT NULL,
    email VARCHAR(190) NOT NULL UNIQUE,
    contrasena VARCHAR(256) NOT NULL,
    salt VARCHAR(64) NOT NULL,
    es_admin BOOLEAN NOT NULL DEFAULT FALSE,
    es_activo BOOLEAN NOT NULL DEFAULT TRUE
);

-- 2. Tabla Riesgo
CREATE TABLE riesgo (
    id TINYINT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(255) NOT NULL
);

-- 3. Tabla Categoria
CREATE TABLE categoria (
    id TINYINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT NOT NULL,
    id_riesgo TINYINT NOT NULL,
    senales TEXT,
    prevencion TEXT,
    acciones TEXT,
    ejemplos TEXT,
    CONSTRAINT fk_categoria_riesgo FOREIGN KEY (id_riesgo) REFERENCES riesgo(id)
);

-- 4. Tabla Estatus
CREATE TABLE estatus (
    id TINYINT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(100) NOT NULL
);

-- 5. Tabla Incident
CREATE TABLE incidente (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    id_categoria TINYINT NOT NULL,
    nombre_atacante VARCHAR(255),
    telefono VARCHAR(20),
    correo VARCHAR(190),
    user_red VARCHAR(120),
    red_social VARCHAR(120),
    descripcion TEXT NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    id_usuario BIGINT NOT NULL,
    supervisor BIGINT,
    id_estatus TINYINT NOT NULL,
    es_anonimo BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_incidente_categoria FOREIGN KEY (id_categoria) REFERENCES categoria(id),
    CONSTRAINT fk_incidente_usuario FOREIGN KEY (id_usuario) REFERENCES usuario(id),
    CONSTRAINT fk_incidente_supervisor FOREIGN KEY (supervisor) REFERENCES usuario(id),
    CONSTRAINT fk_incidente_estatus FOREIGN KEY (id_estatus) REFERENCES estatus(id)
);

-- 6. Tabla Evidencia
CREATE TABLE evidencia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    id_incidente BIGINT NOT NULL,
    url VARCHAR(500) NOT NULL,
    CONSTRAINT fk_evidencia_incidente FOREIGN KEY (id_incidente) REFERENCES incidente(id)
);