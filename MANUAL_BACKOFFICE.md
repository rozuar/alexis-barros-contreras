# Manual de Usuario - Backoffice Alexis Art

## Tabla de Contenidos

1. [Introduccion](#1-introduccion)
2. [Acceso al Sistema](#2-acceso-al-sistema)
3. [Panel Principal - Lista de Obras](#3-panel-principal---lista-de-obras)
4. [Crear Nueva Obra](#4-crear-nueva-obra)
5. [Editar Obra](#5-editar-obra)
6. [Gestion de Imagenes](#6-gestion-de-imagenes)
7. [Campos del Formulario](#7-campos-del-formulario)
8. [Preguntas Frecuentes](#8-preguntas-frecuentes)

---

## 1. Introduccion

El Backoffice de Alexis Art es un panel de administracion que permite gestionar el portafolio de obras de arte. Desde aqui puedes:

- Ver todas las obras registradas
- Crear nuevas obras
- Editar metadatos de obras existentes
- Subir y eliminar imagenes
- Gestionar bitacoras y descripciones

---

## 2. Acceso al Sistema

### 2.1 Pantalla de Login

Al ingresar al backoffice, veras la pantalla de inicio de sesion.

**Credenciales de acceso:**
- **Usuario:** `admin`
- **Contraseña:** `admin123`

**Pasos para ingresar:**

1. Abre el navegador y accede a la URL del backoffice
2. Ingresa el nombre de usuario en el campo "Usuario"
3. Ingresa la contraseña en el campo "Contraseña"
4. Haz clic en el boton **"Ingresar"**

> **Nota:** Tambien puedes usar el boton "Usuario de Prueba" para llenar automaticamente las credenciales de prueba.

### 2.2 Cerrar Sesion

Para cerrar sesion, haz clic en el boton **"Cerrar sesion"** ubicado en la esquina superior derecha del panel principal.

---

## 3. Panel Principal - Lista de Obras

Una vez que inicias sesion, veras el panel principal con la lista de todas las obras.

### 3.1 Elementos del Panel

| Elemento | Descripcion |
|----------|-------------|
| **Titulo "Obras"** | Encabezado principal con contador de obras totales |
| **Boton "+ Nueva Obra"** | Abre el modal para crear una nueva obra |
| **Lista de obras** | Tarjetas con preview de cada obra |
| **Boton "Cerrar sesion"** | Cierra la sesion actual |

### 3.2 Tarjeta de Obra

Cada obra se muestra como una tarjeta con:

- **Imagen miniatura:** Preview de la imagen principal
- **Titulo:** Nombre de la obra
- **Fecha:** Rango de fechas de creacion
- **Estado:** Indicador "En progreso" si la obra no esta terminada

### 3.3 Acceder a una Obra

Haz clic en cualquier tarjeta de obra para abrir el editor y ver/modificar sus detalles.

---

## 4. Crear Nueva Obra

### 4.1 Abrir el Modal de Creacion

1. En el panel principal, haz clic en el boton **"+ Nueva Obra"**
2. Se abrira un modal solicitando el nombre de la nueva obra

### 4.2 Ingresar el Nombre

1. Escribe el nombre de la obra en el campo de texto
2. El sistema validara automaticamente que el nombre no este en uso
3. Si el nombre ya existe, veras un mensaje de error

### 4.3 Confirmar Creacion

1. Una vez que el nombre sea valido, haz clic en **"Crear"**
2. La obra se creara y seras redirigido al editor
3. El nombre puede quedar vacio inicialmente (se puede completar despues)

### 4.4 Cancelar

Si deseas cancelar, haz clic en **"Cancelar"** o fuera del modal.

---

## 5. Editar Obra

### 5.1 Estructura del Editor

El editor de obra tiene dos secciones principales:

**Columna Izquierda - Formulario:**
- Campos para editar metadatos de la obra
- Boton para guardar cambios

**Columna Derecha - Imagenes:**
- Galeria de imagenes de la obra
- Boton para subir nuevas imagenes

### 5.2 Guardar Cambios

1. Realiza las modificaciones necesarias en los campos
2. Haz clic en el boton **"Guardar cambios"**
3. Espera a que aparezca el mensaje de confirmacion
4. Los cambios se guardaran en el servidor

### 5.3 Volver al Listado

Haz clic en el enlace **"<- Volver al listado"** en la parte superior izquierda para regresar al panel principal.

---

## 6. Gestion de Imagenes

### 6.1 Subir Imagenes

1. En la seccion de imagenes, haz clic en **"Subir imagenes"**
2. Selecciona uno o varios archivos de tu computadora
3. Las imagenes se subiran automaticamente
4. Espera a que se complete la carga

**Formatos permitidos:**
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)

**Limite de tamaño:** Maximo 10 MB por imagen

### 6.2 Establecer Imagen Principal

La imagen principal es la que se muestra como miniatura en el listado y como portada.

**Para establecer la imagen principal:**

1. En la galeria, haz clic sobre la imagen que deseas como principal
2. La imagen seleccionada se marcara con un borde destacado
3. Guarda los cambios para confirmar

### 6.3 Eliminar Imagenes

1. Pasa el cursor sobre la imagen que deseas eliminar
2. Haz clic en el icono de eliminar (X o papelera)
3. Confirma la eliminacion en el dialogo

**Opciones de eliminacion:**
- **Solo remover de la entrada:** Desvincula la imagen de la obra pero no la borra del servidor
- **Eliminar del servidor:** Borra la imagen permanentemente

> **Advertencia:** La eliminacion del servidor es permanente y no se puede deshacer.

---

## 7. Campos del Formulario

### 7.1 Nombre/Titulo

- **Descripcion:** Nombre unico de la obra
- **Validacion:** No puede repetirse con otra obra existente
- **Obligatorio:** No (puede estar vacio temporalmente)

### 7.2 Lugar de Pintado

- **Descripcion:** Ubicacion donde se creo la obra
- **Ejemplo:** "Taller de Santiago", "Plein air - Parque Nacional"
- **Obligatorio:** No

### 7.3 Fecha de Inicio

- **Descripcion:** Fecha en que se comenzo la obra
- **Formato:** AAAA-MM-DD (selector de fecha)
- **Obligatorio:** No

### 7.4 Fecha de Fin

- **Descripcion:** Fecha en que se termino la obra
- **Formato:** AAAA-MM-DD (selector de fecha)
- **Nota:** Se deshabilita si "Obra en progreso" esta marcada
- **Obligatorio:** No

### 7.5 Obra en Progreso

- **Descripcion:** Checkbox que indica si la obra aun no esta terminada
- **Efecto:** Al marcar, se deshabilita el campo "Fecha de fin"
- **Visualizacion:** Las obras en progreso muestran una etiqueta especial en el listado

### 7.6 Descripcion Detallada

- **Descripcion:** Texto extenso que describe la obra
- **Uso:** Se muestra en el sitio publico cuando el visitante ve el detalle de la obra
- **Formato:** Texto plano (area de texto grande)
- **Obligatorio:** No

### 7.7 Bitacora

- **Descripcion:** Notas del proceso de creacion
- **Uso:** Registro personal del artista sobre la creacion de la obra
- **Formato:** Texto plano (area de texto grande)
- **Obligatorio:** No

---

## 8. Preguntas Frecuentes

### ¿Por que no puedo guardar el nombre de la obra?

El nombre debe ser unico. Si ves un error de validacion, significa que ya existe otra obra con ese nombre. Intenta con un nombre diferente.

### ¿Cuantas imagenes puedo subir por obra?

No hay un limite especifico en cantidad, pero cada imagen individual no puede superar los 10 MB.

### ¿Puedo subir videos?

Si, el sistema soporta videos. Los formatos soportados son los estandar de video web.

### ¿Que pasa si cierro el navegador sin guardar?

Los cambios no guardados se perderan. Asegurate de hacer clic en "Guardar cambios" antes de salir.

### ¿Como se ve la obra en el sitio publico?

Los visitantes del sitio web veran:
- La imagen principal como portada
- El titulo de la obra
- La descripcion detallada
- La galeria completa de imagenes
- La bitacora (si tiene contenido)
- Las fechas de creacion

### ¿Puedo recuperar una imagen eliminada del servidor?

No. La eliminacion del servidor es permanente. Solo usa esta opcion si estas seguro de que no necesitas la imagen.

### Mi sesion expiro, ¿que hago?

Simplemente vuelve a iniciar sesion con tus credenciales en la pagina de login.

---

## Soporte

Si tienes problemas tecnicos o preguntas adicionales, contacta al administrador del sistema.

---

*Manual actualizado: Enero 2026*
