// =============================================================================
// SERVIDOR API REST CON EXPRESS - GESTIÓN DE USUARIOS
// =============================================================================

// 1. Importar la librería express
const express = require('express');

// 2. Crear una instancia de la aplicación Express
const app = express();

// 3. Definir el puerto de escucha
const PUERTO = process.env.PORT || 3000;

// =============================================================================
// MIDDLEWARES
// =============================================================================

// express.json(): Permite que Express entienda el cuerpo de las peticiones en formato JSON (req.body)
app.use(express.json());

// Middleware CORS: Permite peticiones si abres el HTML desde Live Server (puerto 5500 u otros)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// express.static('public'): Sirve archivos estáticos (HTML, CSS, JS) desde la carpeta "public"
app.use(express.static('public'));

// =============================================================================
// "BASE DE DATOS" EN MEMORIA (Array)
// =============================================================================

// Array que almacenará temporalmente los usuarios mientras el servidor esté encendido
let usuarios = [
  { id: 1, nombre: 'Ana García', email: 'ana.garcia@example.com' },
  { id: 2, nombre: 'Carlos López', email: 'carlos.lopez@example.com' }
];

// Variable para generar IDs únicos autoincrementales
let ultimoId = 2;

// =============================================================================
// ENDPOINTS DE LA API REST
// =============================================================================

/**
 * 1. GET /usuarios
 * Descripción: Obtiene la lista completa de usuarios registrados.
 * Código de estado: 200 OK
 */
app.get('/usuarios', (req, res) => {
  res.status(200).json(usuarios);
});

/**
 * 2. GET /usuarios/:id
 * Descripción: Obtiene un único usuario filtrado por su ID.
 * Códigos de estado:
 *   - 200 OK: Si el usuario existe.
 *   - 404 Not Found: Si el usuario no fue encontrado.
 */
app.get('/usuarios/:id', (req, res) => {
  const idBuscado = parseInt(req.params.id, 10);

  // Buscar el usuario en el array
  const usuario = usuarios.find(u => u.id === idBuscado);

  // Si no se encuentra, respondemos con código 404
  if (!usuario) {
    return res.status(404).json({
      mensaje: `Usuario con id ${idBuscado} no encontrado`
    });
  }

  // Si se encuentra, lo devolvemos con código 200
  res.status(200).json(usuario);
});

/**
 * 3. POST /usuarios
 * Descripción: Registra un nuevo usuario.
 * Body esperado: { "nombre": "Juan", "email": "juan@example.com" }
 * Códigos de estado:
 *   - 201 Created: Usuario creado exitosamente.
 *   - 400 Bad Request: Faltan datos obligatorios (nombre o email).
 */
app.post('/usuarios', (req, res) => {
  const { nombre, email } = req.body;

  // Validación: Comprobar que nombre y email existan y no sean cadenas vacías
  if (!nombre || !nombre.trim() || !email || !email.trim()) {
    return res.status(400).json({
      mensaje: 'El nombre y el email son obligatorios para crear el usuario'
    });
  }

  // Incrementar el ID para que sea único
  ultimoId++;

  // Crear el nuevo objeto de usuario
  const nuevoUsuario = {
    id: ultimoId,
    nombre: nombre.trim(),
    email: email.trim()
  };

  // Agregar al array en memoria
  usuarios.push(nuevoUsuario);

  // Responder con código 201 Created y el nuevo recurso creado
  res.status(201).json({
    mensaje: 'Usuario creado exitosamente',
    usuario: nuevoUsuario
  });
});

/**
 * 4. PUT /usuarios/:id
 * Descripción: Actualiza los datos de un usuario existente.
 * Body esperado: { "nombre": "Nuevo Nombre", "email": "nuevo@example.com" }
 * Códigos de estado:
 *   - 200 OK: Usuario actualizado con éxito.
 *   - 400 Bad Request: Datos incompletos en el body.
 *   - 404 Not Found: Si no existe el usuario con ese ID.
 */
app.put('/usuarios/:id', (req, res) => {
  const idBuscado = parseInt(req.params.id, 10);
  const { nombre, email } = req.body;

  // Validación de body: nombre y email obligatorios
  if (!nombre || !nombre.trim() || !email || !email.trim()) {
    return res.status(400).json({
      mensaje: 'El nombre y el email son obligatorios para actualizar el usuario'
    });
  }

  // Buscar el usuario por ID
  const usuario = usuarios.find(u => u.id === idBuscado);

  // Si no existe, responder 404
  if (!usuario) {
    return res.status(404).json({
      mensaje: `Usuario con id ${idBuscado} no encontrado`
    });
  }

  // Actualizar los valores en memoria
  usuario.nombre = nombre.trim();
  usuario.email = email.trim();

  // Responder 200 OK con el usuario actualizado
  res.status(200).json({
    mensaje: 'Usuario actualizado exitosamente',
    usuario: usuario
  });
});

/**
 * 5. DELETE /usuarios/:id
 * Descripción: Elimina un usuario por su ID.
 * Códigos de estado:
 *   - 200 OK: Usuario eliminado con éxito.
 *   - 404 Not Found: Si el ID no existe.
 */
app.delete('/usuarios/:id', (req, res) => {
  const idBuscado = parseInt(req.params.id, 10);

  // Buscar la posición (índice) del usuario en el array
  const indice = usuarios.findIndex(u => u.id === idBuscado);

  // Si no existe, responder 404
  if (indice === -1) {
    return res.status(404).json({
      mensaje: `Usuario con id ${idBuscado} no encontrado`
    });
  }

  // Extraer y eliminar del array
  const [usuarioEliminado] = usuarios.splice(indice, 1);

  // Responder 200 OK
  res.status(200).json({
    mensaje: 'Usuario eliminado exitosamente',
    usuario: usuarioEliminado
  });
});

// =============================================================================
// INICIAR EL SERVIDOR
// =============================================================================
app.listen(PUERTO, () => {
  console.log(`==================================================`);
  console.log(`🚀 Servidor ejecutándose en http://localhost:${PUERTO}`);
  console.log(`🌐 Frontend disponible en http://localhost:${PUERTO}`);
  console.log(`📡 Endpoints REST en http://localhost:${PUERTO}/usuarios`);
  console.log(`==================================================`);
});
