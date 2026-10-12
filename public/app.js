// =============================================================================
// LÓGICA JAVASCRIPT DEL CLIENTE (CRUD CON FETCH)
// =============================================================================

// URL base de los endpoints de la API:
// - Si abres con Live Server (puerto 5500) o file://, apuntará a http://localhost:3000/usuarios
// - Si lo abres desde Express (puerto 3000), usará la ruta relativa '/usuarios'
const API_URL = (window.location.port === '3000') 
  ? '/usuarios' 
  : 'http://localhost:3000/usuarios';

// Elementos del DOM
const formulario = document.getElementById('formularioUsuario');
const inputId = document.getElementById('usuarioId');
const inputNombre = document.getElementById('nombre');
const inputEmail = document.getElementById('email');
const btnSubmit = document.getElementById('btnSubmit');
const btnCancelar = document.getElementById('btnCancelar');
const formTitulo = document.getElementById('formTitulo');
const listaUsuarios = document.getElementById('listaUsuarios');
const sinUsuarios = document.getElementById('sinUsuarios');
const contadorUsuarios = document.getElementById('contadorUsuarios');
const mensajeAlerta = document.getElementById('mensajeAlerta');

// =============================================================================
// 1. OBTENER Y LISTAR TODOS LOS USUARIOS (GET)
// =============================================================================
async function obtenerUsuarios() {
  try {
    const respuesta = await fetch(API_URL);
    
    if (!respuesta.ok) {
      throw new Error(`El servidor respondió con código ${respuesta.status}`);
    }

    const usuarios = await respuesta.json();
    renderizarUsuarios(usuarios);
  } catch (error) {
    mostrarNotificacion('Error al conectar con la API (¿Ejecutaste "node index.js"?): ' + error.message, 'error');
  }
}

// Renderizar la lista de usuarios en el HTML
function renderizarUsuarios(usuarios) {
  listaUsuarios.innerHTML = '';
  contadorUsuarios.textContent = `${usuarios.length} ${usuarios.length === 1 ? 'usuario' : 'usuarios'}`;

  if (usuarios.length === 0) {
    sinUsuarios.style.display = 'block';
    return;
  }

  sinUsuarios.style.display = 'none';

  usuarios.forEach(usuario => {
    const li = document.createElement('li');
    li.className = 'user-item';

    li.innerHTML = `
      <div class="user-info">
        <span class="user-id-badge">#${usuario.id}</span>
        <div class="user-details">
          <h4>${escapeHtml(usuario.nombre)}</h4>
          <p>${escapeHtml(usuario.email)}</p>
        </div>
      </div>
      <div class="user-actions">
        <button class="btn btn-sm btn-edit" onclick="iniciarEdicion(${usuario.id}, '${escapeHtml(usuario.nombre)}', '${escapeHtml(usuario.email)}')">
          ✏️ Editar
        </button>
        <button class="btn btn-sm btn-delete" onclick="eliminarUsuario(${usuario.id})">
          ✕
        </button>
      </div>
    `;

    listaUsuarios.appendChild(li);
  });
}

// =============================================================================
// 2. CREAR (POST) O ACTUALIZAR (PUT) USUARIO AL ENVIAR FORMULARIO
// =============================================================================
formulario.addEventListener('submit', async (e) => {
  e.preventDefault();

  const id = inputId.value;
  const nombre = inputNombre.value.trim();
  const email = inputEmail.value.trim();

  // Validación básica del lado cliente
  if (!nombre || !email) {
    mostrarNotificacion('Por favor completa todos los campos requeridos', 'error');
    return;
  }

  const datosUsuario = { nombre, email };

  try {
    if (id) {
      // -----------------------------------------------------------------
      // MODO EDICIÓN: PUT /usuarios/:id
      // -----------------------------------------------------------------
      const respuesta = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || 'Error al actualizar');
      }

      mostrarNotificacion('Usuario actualizado exitosamente', 'exito');
      cancelarEdicion();
    } else {
      // -----------------------------------------------------------------
      // MODO CREACIÓN: POST /usuarios
      // -----------------------------------------------------------------
      const respuesta = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosUsuario)
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(data.mensaje || 'Error al guardar');
      }

      mostrarNotificacion('Usuario creado exitosamente', 'exito');
      formulario.reset();
    }

    // Refrescar lista después de crear o actualizar
    await obtenerUsuarios();

  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
});

// =============================================================================
// 3. EDITAR USUARIO (Cargar datos en el formulario para PUT)
// =============================================================================
window.iniciarEdicion = function(id, nombre, email) {
  inputId.value = id;
  inputNombre.value = nombre;
  inputEmail.value = email;

  // Cambiar aspecto del formulario para modo edición
  btnSubmit.textContent = 'Actualizar';
  formTitulo.textContent = `✏️ Editando Usuario #${id}`;
  btnCancelar.style.display = 'inline-flex';

  inputNombre.focus();
};

// Cancelar modo edición
function cancelarEdicion() {
  inputId.value = '';
  formulario.reset();
  btnSubmit.textContent = 'Guardar';
  formTitulo.textContent = '➕ Registrar Nuevo Usuario';
  btnCancelar.style.display = 'none';
}

btnCancelar.addEventListener('click', cancelarEdicion);

// =============================================================================
// 4. ELIMINAR USUARIO (DELETE)
// =============================================================================
window.eliminarUsuario = async function(id) {
  const confirmar = confirm(`¿Estás seguro de que deseas eliminar al usuario #${id}?`);
  if (!confirmar) return;

  try {
    const respuesta = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.mensaje || 'Error al eliminar');
    }

    mostrarNotificacion('Usuario eliminado correctamente', 'exito');

    // Si se eliminó el que se estaba editando, restaurar formulario
    if (inputId.value == id) {
      cancelarEdicion();
    }

    // Refrescar lista
    await obtenerUsuarios();

  } catch (error) {
    mostrarNotificacion(error.message, 'error');
  }
};

// =============================================================================
// UTILIDADES: Notificaciones y escape de caracteres HTML
// =============================================================================
function mostrarNotificacion(texto, tipo = 'exito') {
  mensajeAlerta.textContent = texto;
  mensajeAlerta.className = tipo === 'exito' ? 'alerta-exito' : 'alerta-error';
  mensajeAlerta.style.display = 'block';

  setTimeout(() => {
    mensajeAlerta.style.display = 'none';
  }, 3500);
}

function escapeHtml(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// Cargar usuarios cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', obtenerUsuarios);
