document.addEventListener("DOMContentLoaded", () => {
  // 🔧 Detectar entorno: local o producción
  const backendUrl =
    window.location.hostname.includes("localhost")
      ? "http://localhost:5000"
      : "https://backendhiperceramicack.onrender.com"; // <-- cambia esto por tu URL de Render

  const userToggle = document.getElementById("user-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  if (userToggle && dropdownMenu) {
    userToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (event) => {
      if (!userToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
        dropdownMenu.style.display = "none";
      }
    });
  }

  setInterval(() => {
    if (!localStorage.getItem("access_token")) {
      window.location.href = "login.html";
    }
  }, 2000);

  const nombre = localStorage.getItem("nombre") || "Usuario";
  const correo = localStorage.getItem("correo") || "correo@empresa.com";
  const rol_id = parseInt(localStorage.getItem("rol_id"), 10);
  const iniciales = getIniciales(nombre);

  const userNombre = document.getElementById("user-nombre");
  const userFullname = document.getElementById("user-fullname");
  const userCorreo = document.getElementById("user-correo");

  if (userNombre) userNombre.textContent = nombre;
  if (userFullname) userFullname.textContent = nombre;
  if (userCorreo) userCorreo.textContent = correo;

  document.querySelectorAll(".user-avatar").forEach((el) => {
    el.textContent = iniciales;
  });

  function getIniciales(nombreCompleto) {
    const partes = nombreCompleto.trim().split(" ");
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : partes[0][0].toUpperCase();
  }

  // 🧑 Perfil
  const verPerfilBtn = document.getElementById("ver-perfil");
  const modalPerfil = document.getElementById("modal-perfil");
  const cerrarPerfil = document.getElementById("cerrar-perfil");
  const cerrarSesionBtn = document.getElementById("cerrar-sesion-btn");

  const usuario = {
    nombre,
    correo,
    rol: localStorage.getItem("rol") || "Rol no definido",
    rol_id,
    iniciales,
    telefono: localStorage.getItem("telefono") || "(+57) 3252014785",
    ultimoAcceso: localStorage.getItem("ultimoAcceso") || new Date().toLocaleString(),
    cargo: localStorage.getItem("rol") || "Empleado",
    departamento: "Administración",
    fechaContratacion: "10 de enero de 2025",
  };

  if (verPerfilBtn) {
    verPerfilBtn.addEventListener("click", (e) => {
      e.preventDefault();

      document.getElementById("perfil-nombre-rol").innerHTML = `
        <div class="perfil-avatar">${usuario.iniciales}</div>
        <div>
          <h3>${usuario.nombre}</h3>
          <p>${usuario.rol}</p>
        </div>
      `;

      document.getElementById("perfil-nombre").textContent = usuario.nombre;
      document.getElementById("perfil-correo").textContent = usuario.correo;
      document.getElementById("perfil-telefono").textContent = usuario.telefono;
      document.getElementById("perfil-ultimo").textContent = usuario.ultimoAcceso;
      document.getElementById("perfil-cargo").textContent = usuario.cargo;
      document.getElementById("perfil-departamento").textContent = usuario.departamento;
      document.getElementById("perfil-fecha").textContent = usuario.fechaContratacion;

      const permisos = document.getElementById("perfil-permisos");
      permisos.style.display = usuario.rol_id === 1 ? "block" : "none";

      modalPerfil.style.display = "flex";
    });
  }

  if (cerrarPerfil)
    cerrarPerfil.addEventListener("click", () => (modalPerfil.style.display = "none"));

  window.addEventListener("click", (e) => {
    if (e.target === modalPerfil) modalPerfil.style.display = "none";
  });

  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  // 🧾 Cargar empleados desde el backend de Render o local
  let empleadosOriginales = [];

  function cargarEmpleados() {
    fetch(`${backendUrl}/api/empleados`)
      .then((res) => res.json())
      .then((data) => {
        empleadosOriginales = data;
        mostrarEmpleados(data);

        if ($.fn.DataTable.isDataTable("#tablaEmpleados")) {
          $("#tablaEmpleados").DataTable().destroy();
        }

        $("#tablaEmpleados").DataTable({
          pageLength: 10,
          pagingType: "simple_numbers",
          language: {
            url: "https://cdn.datatables.net/plug-ins/2.0.2/i18n/es-ES.json",
          },
        });
      })
      .catch(() => {
        document.getElementById("tablaEmpleadosBody").innerHTML =
          `<tr><td colspan="7">Error al conectar con el servidor.</td></tr>`;
      });
  }

  cargarEmpleados();

  // 🧩 Mostrar empleados
  function mostrarEmpleados(empleados) {
    const tbody = document.getElementById("tablaEmpleadosBody");
    tbody.innerHTML = "";
    if (!empleados.length) {
      tbody.innerHTML = `<tr><td colspan="7">No hay empleados registrados.</td></tr>`;
      return;
    }

    empleados.forEach((emp) => {
      const tr = document.createElement("tr");
      const estadoClass = emp.estado?.toLowerCase() === "activo" ? "estado-activo" : "estado-inactivo";
      tr.innerHTML = `
        <td>${emp.nombre} ${emp.apellido}</td>
        <td>${emp.cedula || ""}</td>
        <td>${emp.correo}</td>
        <td>${emp.telefono}</td>
        <td>${emp.rol}</td>
        <td class="${estadoClass}">${emp.estado}</td>
        <td>
          <a href="#" class="editar" data-id="${emp.id}">Editar</a> |
          <a href="#" class="eliminar" data-id="${emp.id}">Eliminar</a>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // 🔁 Guardar o editar empleado
  document.getElementById("agregarEmpleado").addEventListener("click", () => {
    const idEditar = document.getElementById("agregarEmpleado").dataset.editId;
    const data = {
      nombre_apellido: document.getElementById("nombre").value,
      cedula: document.getElementById("cedula").value,
      correo: document.getElementById("correo").value,
      contraseña: document.getElementById("password").value || "123456",
      telefono: document.getElementById("telefono").value,
      direccion: document.getElementById("direccion").value,
      rol_id:
        document.getElementById("rol").value === "Administrador" ? 1 : 2,
    };

    const method = idEditar ? "PUT" : "POST";
    const url = idEditar
      ? `${backendUrl}/api/empleados/${idEditar}`
      : `${backendUrl}/api/empleados`;

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then(() => {
        cargarEmpleados();
        ["nombre", "cedula", "correo", "password", "telefono", "direccion"].forEach(
          (id) => (document.getElementById(id).value = "")
        );
        document.getElementById("agregarEmpleado").dataset.editId = "";
      })
      .catch((err) => console.error(err));
  });
});
