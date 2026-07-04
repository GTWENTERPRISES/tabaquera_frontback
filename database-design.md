# Diseño de Base de Datos - Sistema de Trazabilidad Tabaquera

## 1. Diagrama Entidad-Relación (ER)

```
┌──────────────┐
│   usuarios   │
└──────┬───────┘
       │ 1
       │
       │ N
┌──────▼──────────┐      ┌───────────────┐      ┌───────────────┐
│  lotes          │      │  etapas       │      │  proveedores  │
└──────┬──────────┘      └───────┬───────┘      └───────┬───────┘
       │                         │                         │
       │ N                       │ N                       │
       │                         │                         │
┌──────▼──────────┐      ┌──────▼──────────┐      ┌──────▼──────────┐
│  movimientos    │      │  historial_etapas│      │  inspecciones_calidad │
└──────┬──────────┘      └──────────────────┘      └──────┬──────────┘
       │                                                  │
       │ N                                                │ N
       │                                                  │
┌──────▼──────────┐                              ┌──────────▼──────────┐
│  observaciones  │                              │  evidencias_calidad  │
└─────────────────┘                              └─────────────────────┘
                                                           │
                                                           │ N
                                                           │
                                                    ┌──────▼──────────┐
                                                    │  checklist_calidad │
                                                    └─────────────────┘
```

## 2. Tablas y Campos

---

### 2.1 Tabla: `usuarios`
Almacena la información de los usuarios del sistema.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único del usuario (UUID)                   |
| `nombres`           | VARCHAR(100)       | NO    |       | Nombres del usuario                           |
| `apellidos`         | VARCHAR(100)       | NO    |       | Apellidos del usuario                         |
| `username`          | VARCHAR(50)        | NO    | UNIQ  | Nombre de usuario para login                  |
| `email`             | VARCHAR(100)       | NO    | UNIQ  | Correo electrónico                            |
| `telefono`          | VARCHAR(20)        | SI    |       | Número de teléfono                            |
| `contrasena`        | VARCHAR(255)       | NO    |       | Contraseña encriptada                         |
| `rol`               | ENUM               | NO    |       | Rol: `admin`, `supervisor`, `operator`, `quality` |
| `departamento`      | VARCHAR(100)       | NO    |       | Departamento: `recepcion`, `clasificacion`, `seleccion`, `empaque`, `distribucion`, `calidad`, `administracion` |
| `activo`            | BOOLEAN            | NO    |       | Estado: `true` (activo), `false` (inactivo)  |
| `avatar`            | VARCHAR(255)       | SI    |       | URL del avatar                                |
| `created_at`        | DATETIME           | NO    |       | Fecha de creación                             |
| `updated_at`        | DATETIME           | NO    |       | Fecha de última actualización                 |
| `last_access`       | DATETIME           | SI    |       | Último acceso                                 |

---

### 2.2 Tabla: `proveedores`
Almacena la información de los proveedores de tabaco.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único del proveedor (UUID)                 |
| `nombre`            | VARCHAR(200)       | NO    |       | Nombre del proveedor                          |
| `contacto`          | VARCHAR(100)       | SI    |       | Persona de contacto                           |
| `telefono`          | VARCHAR(20)        | SI    |       | Teléfono del proveedor                        |
| `email`             | VARCHAR(100)       | SI    |       | Correo electrónico                            |
| `direccion`         | TEXT               | SI    |       | Dirección física                              |
| `origen`            | VARCHAR(100)       | NO    |       | Origen/región del tabaco                      |
| `created_at`        | DATETIME           | NO    |       | Fecha de creación                             |
| `updated_at`        | DATETIME           | NO    |       | Fecha de última actualización                 |

---

### 2.3 Tabla: `etapas`
Define las etapas del proceso productivo.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único de la etapa (UUID)                   |
| `nombre`            | VARCHAR(50)        | NO    | UNIQ  | Nombre: `recepcion`, `clasificacion`, `seleccion`, `empaque`, `distribucion` |
| `nombre_visible`    | VARCHAR(100)       | NO    |       | Nombre amigable para mostrar                  |
| `orden`             | INT                | NO    |       | Orden de ejecución (1-5)                      |
| `tiempo_maximo_horas` | INT             | SI    |       | Tiempo máximo esperado en horas               |
| `descripcion`       | TEXT               | SI    |       | Descripción de la etapa                       |
| `created_at`        | DATETIME           | NO    |       | Fecha de creación                             |

---

### 2.4 Tabla: `lotes`
Almacena la información principal de los lotes de tabaco.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único del lote (UUID)                      |
| `codigo`            | VARCHAR(50)        | NO    | UNIQ  | Código único: `LT-2026-001`                   |
| `qr_code`           | VARCHAR(255)       | NO    | UNIQ  | Código QR asociado                            |
| `proveedor_id`      | VARCHAR(36)        | NO    | FK    | ID del proveedor                              |
| `origen`            | VARCHAR(100)       | NO    |       | Origen del lote                               |
| `variedad`          | VARCHAR(100)       | NO    |       | Variedad de tabaco                            |
| `peso_inicial_kg`   | DECIMAL(10,2)      | NO    |       | Peso inicial en kilogramos                    |
| `peso_actual_kg`    | DECIMAL(10,2)      | NO    |       | Peso actual en kilogramos                     |
| `cantidad_bultos`   | INT                | NO    |       | Cantidad de bultos                            |
| `etapa_actual_id`   | VARCHAR(36)        | NO    | FK    | ID de la etapa actual                         |
| `estado`            | ENUM               | NO    |       | Estado: `active`, `completed`, `on_hold`, `rejected`, `in_production`, `waiting` |
| `responsable_id`    | VARCHAR(36)        | SI    | FK    | ID del usuario responsable actual             |
| `observaciones`     | TEXT               | SI    |       | Observaciones generales                       |
| `fecha_ingreso`     | DATETIME           | NO    |       | Fecha de ingreso al sistema                   |
| `fecha_completado`  | DATETIME           | SI    |       | Fecha de finalización                         |
| `total_tiempo_minutos` | INT             | SI    |       | Tiempo total transcurrido en minutos          |
| `created_at`        | DATETIME           | NO    |       | Fecha de creación                             |
| `updated_at`        | DATETIME           | NO    |       | Fecha de última actualización                 |

---

### 2.5 Tabla: `historial_etapas`
Registra el paso de cada lote por cada etapa.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único (UUID)                               |
| `lote_id`           | VARCHAR(36)        | NO    | FK    | ID del lote                                   |
| `etapa_id`          | VARCHAR(36)        | NO    | FK    | ID de la etapa                                |
| `usuario_id`        | VARCHAR(36)        | NO    | FK    | ID del usuario responsable                    |
| `fecha_inicio`      | DATETIME           | NO    |       | Fecha de inicio de la etapa                   |
| `fecha_fin`         | DATETIME           | SI    |       | Fecha de fin de la etapa                      |
| `duracion_minutos`  | INT                | SI    |       | Duración total en minutos                     |
| `observaciones`     | TEXT               | SI    |       | Observaciones de la etapa                     |
| `created_at`        | DATETIME           | NO    |       | Fecha de creación                             |

---

### 2.6 Tabla: `movimientos`
Registra cada acción realizada sobre un lote (cambio de etapa, pausas, etc.).

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único (UUID)                               |
| `lote_id`           | VARCHAR(36)        | NO    | FK    | ID del lote                                   |
| `etapa_origen_id`   | VARCHAR(36)        | SI    | FK    | Etapa de origen (si aplica)                   |
| `etapa_destino_id`  | VARCHAR(36)        | SI    | FK    | Etapa de destino (si aplica)                  |
| `usuario_id`        | VARCHAR(36)        | NO    | FK    | ID del usuario que realizó la acción          |
| `tipo`              | ENUM               | NO    |       | Tipo: `stage_change`, `work_start`, `work_pause`, `work_resume`, `work_complete`, `observation`, `incident` |
| `fecha_inicio`      | DATETIME           | SI    |       | Fecha de inicio (para trabajo)                |
| `fecha_fin`         | DATETIME           | SI    |       | Fecha de fin (para trabajo)                   |
| `fecha_pausa`       | DATETIME           | SI    |       | Fecha de pausa                                |
| `fecha_reanudacion` | DATETIME           | SI    |       | Fecha de reanudación                          |
| `total_pausado_minutos` | INT           | SI    |       | Total de tiempo pausado en minutos            |
| `duracion_total_minutos` | INT         | SI    |       | Duración total de la actividad                |
| `es_retrasado`      | BOOLEAN            | NO    |       | Indica si hubo retraso                        |
| `motivo_retraso`    | ENUM               | SI    |       | Motivo: `machinery`, `personnel`, `raw_material`, `quality`, `other` |
| `cantidad_procesada_kg` | DECIMAL(10,2) | SI    |       | Cantidad procesada en kg                      |
| `observaciones`     | TEXT               | SI    |       | Observaciones del movimiento                  |
| `incidencias`       | JSON               | SI    |       | Lista de incidencias: `humedad`, `danos`, `retraso`, `otro` |
| `created_at`        | DATETIME           | NO    |       | Fecha y hora del movimiento                   |

---

### 2.7 Tabla: `inspecciones_calidad`
Registra las inspecciones de calidad realizadas.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único (UUID)                               |
| `lote_id`           | VARCHAR(36)        | NO    | FK    | ID del lote                                   |
| `etapa_id`          | VARCHAR(36)        | NO    | FK    | Etapa en la que se realiza la inspección      |
| `inspector_id`      | VARCHAR(36)        | NO    | FK    | ID del inspector (usuario)                    |
| `grado_calidad`     | ENUM               | NO    |       | Grado: `A`, `B`, `C`, `D`                     |
| `estado`            | ENUM               | NO    |       | Estado: `pending`, `in_progress`, `passed`, `passed_with_notes`, `failed` |
| `temperatura`       | DECIMAL(5,2)       | SI    |       | Temperatura registrada                        |
| `humedad`           | DECIMAL(5,2)       | SI    |       | Humedad registrada (%)                        |
| `peso_final_kg`     | DECIMAL(10,2)      | SI    |       | Peso final en kg                              |
| `qr_verificado`     | BOOLEAN            | NO    |       | QR verificado?                                |
| `decision_final`    | ENUM               | NO    |       | Decisión: `aprobar_lote`, `rechazar_lote`, `solicitar_correccion`, `solicitar_reinspeccion` |
| `observaciones`     | TEXT               | SI    |       | Observaciones generales                       |
| `motivos_rechazo`   | JSON               | SI    |       | Motivos: `humedad_excesiva`, `dano_fisico`, `peso_incorrecto`, `contaminacion`, `mala_clasificacion`, `otro` |
| `fecha_inicio`      | DATETIME           | NO    |       | Fecha de inicio de inspección                 |
| `fecha_fin`         | DATETIME           | SI    |       | Fecha de fin de inspección                    |
| `duracion_minutos`  | INT                | SI    |       | Duración total en minutos                     |
| `created_at`        | DATETIME           | NO    |       | Fecha de creación                             |
| `updated_at`        | DATETIME           | NO    |       | Fecha de última actualización                 |

---

### 2.8 Tabla: `checklist_calidad`
Registra el checklist de cada inspección de calidad.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único (UUID)                               |
| `inspeccion_id`     | VARCHAR(36)        | NO    | FK    | ID de la inspección                           |
| `item`              | VARCHAR(100)       | NO    |       | Item del checklist: `humedad_correcta`, `temperatura_correcta`, `peso_correcto`, `embalaje_correcto`, `etiquetado_correcto`, `qr_legible` |
| `aprobado`          | BOOLEAN            | NO    |       | ¿Aprobado?                                    |
| `observaciones`     | TEXT               | SI    |       | Observaciones del item                        |
| `created_at`        | DATETIME           | NO    |       | Fecha de creación                             |

---

### 2.9 Tabla: `evidencias_calidad`
Almacena las evidencias (fotos, documentos) de las inspecciones.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único (UUID)                               |
| `inspeccion_id`     | VARCHAR(36)        | NO    | FK    | ID de la inspección                           |
| `tipo`              | ENUM               | NO    |       | Tipo: `photo`, `document`                     |
| `url`               | VARCHAR(500)       | NO    |       | URL del archivo                                |
| `nombre_archivo`    | VARCHAR(255)       | NO    |       | Nombre original del archivo                   |
| `tamano_bytes`      | BIGINT             | SI    |       | Tamaño en bytes                                |
| `mime_type`         | VARCHAR(100)       | SI    |       | Tipo MIME del archivo                         |
| `uploaded_by`       | VARCHAR(36)        | NO    | FK    | ID del usuario que subió el archivo           |
| `created_at`        | DATETIME           | NO    |       | Fecha de subida                                |

---

### 2.10 Tabla: `observaciones`
Registra observaciones adicionales sobre los lotes.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único (UUID)                               |
| `lote_id`           | VARCHAR(36)        | NO    | FK    | ID del lote                                   |
| `etapa_id`          | VARCHAR(36)        | SI    | FK    | Etapa relacionada (si aplica)                 |
| `usuario_id`        | VARCHAR(36)        | NO    | FK    | ID del usuario que escribió la observación    |
| `texto`             | TEXT               | NO    |       | Contenido de la observación                   |
| `created_at`        | DATETIME           | NO    |       | Fecha de creación                             |

---

### 2.11 Tabla: `eventos_sistema`
Registro global de todas las actividades del sistema.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único (UUID)                               |
| `lote_id`           | VARCHAR(36)        | SI    | FK    | ID del lote (si aplica)                       |
| `lote_codigo`       | VARCHAR(50)        | SI    |       | Código del lote (si aplica)                   |
| `usuario_id`        | VARCHAR(36)        | NO    | FK    | ID del usuario que generó el evento           |
| `usuario_nombre`    | VARCHAR(200)       | NO    |       | Nombre del usuario                            |
| `accion`            | VARCHAR(200)       | NO    |       | Acción realizada                               |
| `detalle`           | TEXT               | NO    |       | Detalle de la acción                          |
| `tipo`              | ENUM               | NO    |       | Tipo: `lot`, `quality`, `stage`, `user`, `observation`, `alert` |
| `created_at`        | DATETIME           | NO    |       | Fecha y hora del evento                       |

---

### 2.12 Tabla: `notificaciones`
Almacena las notificaciones del sistema.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único (UUID)                               |
| `usuario_id`        | VARCHAR(36)        | NO    | FK    | Usuario destinatario                          |
| `lote_id`           | VARCHAR(36)        | SI    | FK    | Lote relacionado (si aplica)                  |
| `lote_codigo`       | VARCHAR(50)        | SI    |       | Código del lote                               |
| `tipo`              | ENUM               | NO    |       | Tipo: `info`, `warning`, `critical`           |
| `categoria`         | ENUM               | NO    |       | Categoría: `lot`, `quality`, `user`, `alert`, `production`, `admin` |
| `titulo`            | VARCHAR(200)       | NO    |       | Título de la notificación                     |
| `mensaje`           | TEXT               | NO    |       | Contenido del mensaje                         |
| `url_accion`        | VARCHAR(500)       | SI    |       | URL para acción relacionada                   |
| `leida`             | BOOLEAN            | NO    |       | ¿Notificación leída?                          |
| `created_at`        | DATETIME           | NO    |       | Fecha de creación                             |

---

### 2.13 Tabla: `configuracion_sistema`
Almacena la configuración general del sistema.

| Campo               | Tipo               | Nulo? | Clave | Descripción                                    |
|---------------------|--------------------|-------|-------|------------------------------------------------|
| `id`                | VARCHAR(36)        | NO    | PK    | ID único                                      |
| `clave`             | VARCHAR(100)       | NO    | UNIQ  | Clave de configuración                        |
| `valor`             | TEXT               | NO    |       | Valor de configuración                        |
| `descripcion`       | TEXT               | SI    |       | Descripción                                   |
| `updated_at`        | DATETIME           | NO    |       | Fecha de última actualización                 |

---

## 3. Relaciones entre Tablas

| Tabla Origen        | Campo FK           | Tabla Destino       | Campo PK          | Tipo Relación |
|---------------------|--------------------|---------------------|-------------------|---------------|
| `lotes`             | `proveedor_id`     | `proveedores`       | `id`              | N:1           |
| `lotes`             | `etapa_actual_id`  | `etapas`            | `id`              | N:1           |
| `lotes`             | `responsable_id`   | `usuarios`          | `id`              | N:1           |
| `historial_etapas`  | `lote_id`          | `lotes`             | `id`              | N:1           |
| `historial_etapas`  | `etapa_id`         | `etapas`            | `id`              | N:1           |
| `historial_etapas`  | `usuario_id`       | `usuarios`          | `id`              | N:1           |
| `movimientos`       | `lote_id`          | `lotes`             | `id`              | N:1           |
| `movimientos`       | `etapa_origen_id`  | `etapas`            | `id`              | N:1           |
| `movimientos`       | `etapa_destino_id` | `etapas`            | `id`              | N:1           |
| `movimientos`       | `usuario_id`       | `usuarios`          | `id`              | N:1           |
| `inspecciones_calidad` | `lote_id`       | `lotes`             | `id`              | N:1           |
| `inspecciones_calidad` | `etapa_id`      | `etapas`            | `id`              | N:1           |
| `inspecciones_calidad` | `inspector_id`  | `usuarios`          | `id`              | N:1           |
| `checklist_calidad` | `inspeccion_id`    | `inspecciones_calidad` | `id`          | N:1           |
| `evidencias_calidad`| `inspeccion_id`    | `inspecciones_calidad` | `id`          | N:1           |
| `evidencias_calidad`| `uploaded_by`      | `usuarios`          | `id`              | N:1           |
| `observaciones`     | `lote_id`          | `lotes`             | `id`              | N:1           |
| `observaciones`     | `etapa_id`         | `etapas`            | `id`              | N:1           |
| `observaciones`     | `usuario_id`       | `usuarios`          | `id`              | N:1           |
| `eventos_sistema`   | `lote_id`          | `lotes`             | `id`              | N:1           |
| `eventos_sistema`   | `usuario_id`       | `usuarios`          | `id`              | N:1           |
| `notificaciones`    | `usuario_id`       | `usuarios`          | `id`              | N:1           |
| `notificaciones`    | `lote_id`          | `lotes`             | `id`              | N:1           |

---

## 4. Índices Recomendados

```sql
-- Índices para lotes
CREATE INDEX idx_lotes_codigo ON lotes(codigo);
CREATE INDEX idx_lotes_estado ON lotes(estado);
CREATE INDEX idx_lotes_etapa_actual ON lotes(etapa_actual_id);
CREATE INDEX idx_lotes_proveedor ON lotes(proveedor_id);
CREATE INDEX idx_lotes_fecha_ingreso ON lotes(fecha_ingreso);

-- Índices para movimientos
CREATE INDEX idx_movimientos_lote ON movimientos(lote_id);
CREATE INDEX idx_movimientos_usuario ON movimientos(usuario_id);
CREATE INDEX idx_movimientos_fecha ON movimientos(created_at);

-- Índices para inspecciones
CREATE INDEX idx_inspecciones_lote ON inspecciones_calidad(lote_id);
CREATE INDEX idx_inspecciones_estado ON inspecciones_calidad(estado);
CREATE INDEX idx_inspecciones_fecha ON inspecciones_calidad(created_at);

-- Índices para eventos
CREATE INDEX idx_eventos_lote ON eventos_sistema(lote_id);
CREATE INDEX idx_eventos_usuario ON eventos_sistema(usuario_id);
CREATE INDEX idx_eventos_tipo ON eventos_sistema(tipo);
CREATE INDEX idx_eventos_fecha ON eventos_sistema(created_at);

-- Índices para notificaciones
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_leida ON notificaciones(leida);
CREATE INDEX idx_notificaciones_fecha ON notificaciones(created_at);
```
