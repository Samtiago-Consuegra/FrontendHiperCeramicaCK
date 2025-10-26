document.addEventListener("DOMContentLoaded", () => {
  const userToggle = document.getElementById("user-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

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
    if (partes.length >= 2)
      return (partes[0][0] + partes[1][0]).toUpperCase();
    else if (partes.length === 1) return partes[0][0].toUpperCase();
    return "U";
  }

const verPerfilBtn = document.getElementById("ver-perfil");
const modalPerfil = document.getElementById("modal-perfil");
const cerrarPerfil = document.getElementById("cerrar-perfil");
const cerrarSesionBtn = document.getElementById("cerrar-sesion-btn");
const usuario = {
  nombre: localStorage.getItem("nombre") || "Usuario desconocido",
  correo: localStorage.getItem("correo") || "correo@empresa.com",
  rol: localStorage.getItem("rol") || "Rol no definido",
  rol_id: parseInt(localStorage.getItem("rol_id")) || 0,
  iniciales: (localStorage.getItem("nombre") || "U D")
    .split(" ")
    .map(p => p[0])
    .join("")
    .toUpperCase(),
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

    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.querySelector(".tab[data-tab='informacion']").classList.add("active");
    document.getElementById("informacion").classList.add("active");
  });
}

if (cerrarPerfil) {
  cerrarPerfil.addEventListener("click", () => {
    modalPerfil.style.display = "none";
  });
}

window.addEventListener("click", (e) => {
  if (e.target === modalPerfil) {
    modalPerfil.style.display = "none";
  }
});

if (cerrarSesionBtn) {
  cerrarSesionBtn.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });
}

document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  const cerrarSesion = document.getElementById("cerrar-sesion");
  if (cerrarSesion) {
    cerrarSesion.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  let empleadosOriginales = [];

function cargarEmpleados() {
  fetch("/api/empleados")
    .then((res) => res.json())
    .then((data) => {
      empleadosOriginales = data;
      mostrarEmpleados(data);

      if ($.fn.DataTable.isDataTable("#tablaEmpleados")) {
        $("#tablaEmpleados").DataTable().destroy();
      }

      const tabla = $("#tablaEmpleados").DataTable({
        pageLength: 10,
        lengthMenu: [10, 20, 50],
        pagingType: "simple_numbers",
        language: {
          decimal: ",",
          thousands: ".",
          processing: "Procesando...",
          search: "Buscar:",
          lengthMenu: "Mostrar _MENU_ registros",
          info: "Mostrando _START_ a _END_ de _TOTAL_ registros",
          infoEmpty: "Mostrando 0 a 0 de 0 registros",
          infoFiltered: "(filtrado de _MAX_ empleados en total)",
          loadingRecords: "Cargando...",
          zeroRecords: "No se encontraron empleados",
          emptyTable: "No hay empleados registrados",
          paginate: {
            previous: "Anterior",
            next: "Siguiente"
          },
        },
        initComplete: function () {
          const searchInput = document.querySelector('#tablaEmpleados_filter input');
          if (searchInput) {
            searchInput.placeholder = "Buscar Empleado";
          }
        }
      });
      tabla.on('draw', function () {
        $('.dataTables_paginate span a').not('.current').hide();
      });
    })
    .catch((err) => {
      console.error(err);
      document.getElementById("tablaEmpleadosBody").innerHTML = `
        <tr><td colspan="7">Error al cargar los empleados.</td></tr>`;
    });
}

cargarEmpleados();

function mostrarEmpleados(empleados) {
  const tbody = document.getElementById("tablaEmpleadosBody");
  tbody.innerHTML = "";
  if (empleados.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7">No hay empleados registrados.</td></tr>`;
    return;
  }
  empleados.forEach((emp) => {
    const tr = document.createElement("tr");
    const estadoClass =
      emp.estado.toLowerCase() === "activo"
        ? "estado-activo"
        : "estado-inactivo";
    tr.innerHTML = `
      <td>${emp.nombre} ${emp.apellido}</td>
      <td>${emp.cedula || ""}</td>
      <td>${emp.correo}</td>
      <td>${emp.telefono}</td>
      <td>${emp.rol}</td>
      <td class="${estadoClass}">${emp.estado}</td>
      <td class="ver-detalle">
        <div class="accion-editar">
          <a href="#" data-id="${emp.id}" class="editar">Editar</a>
        </div>
        <div class="accion-eliminar">
          <a href="#" data-id="${emp.id}" class="eliminar">Eliminar</a>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

    document.querySelectorAll(".editar").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const emp = empleadosOriginales.find((emp) => emp.id == btn.dataset.id);
        if (!emp) return;
        document.getElementById("nombre").value =
          emp.nombre + " " + emp.apellido;
        document.getElementById("cedula").value = emp.cedula || "";
        document.getElementById("correo").value = emp.correo;
        document.getElementById("password").value = "";
        document.getElementById("telefono").value = emp.telefono || "";
        document.getElementById("direccion").value = emp.direccion || "";
        document.getElementById("rol").value =
          emp.rol === "Administrador" ? "Administrador" : "Empleado";
        document.getElementById("agregarEmpleado").dataset.editId = emp.id;
      });
    });

    document.querySelectorAll(".eliminar").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.preventDefault();
        const id = btn.dataset.id;
        if (!confirm("¿Seguro que deseas eliminar este empleado?")) return;
        fetch(`/api/empleados/${id}`, {
          method: "DELETE",
        })
          .then((res) => res.json())
          .then(() => {
            empleadosOriginales = empleadosOriginales.filter(
              (emp) => emp.id != id
            );
            mostrarEmpleados(empleadosOriginales);
          })
          .catch((err) => console.error(err));
      });
    });
  }

const adminSection = document.getElementById("admin-section");
  if (rol_id === 2) {
    console.log("Empleado detectado → Bloqueando secciones");
    const linkCitas = document.getElementById("linkcitas");
    const linkEmpleados = document.getElementById("link-empleados");
    const linkReportes = document.getElementById("link-reportes");
    if (linkCitas) linkCitas.classList.add("disabled");
    if (linkEmpleados) linkEmpleados.classList.add("disabled");
    if (linkReportes) linkReportes.classList.add("disabled");
    } else if (rol_id === 1) {
    console.log("Administrador detectado → Acceso completo");
    if (adminSection) adminSection.style.display = "block";
  }

  if (rol_id === 3) {
    console.log("Bodeguero detectado → Bloqueando secciones");
    const linkDashboard = document.getElementById("link-dashboard");
    const linkEmpleados = document.getElementById("link-empleados");
    const linkCitas = document.getElementById("linkcitas");
    const linkReportes = document.getElementById("link-reportes");
    const linkChatbot = document.getElementById("link-chatbot");
    if (linkDashboard) linkDashboard.classList.add("disabled");
    if (linkEmpleados) linkEmpleados.classList.add("disabled");
    if (linkCitas) linkCitas.classList.add("disabled");
    if (linkReportes) linkReportes.classList.add("disabled");
    if (linkChatbot) linkChatbot.classList.add("disabled");
  }else if (rol_id === 1) {
    console.log("Administrador detectado → Acceso completo");
    if (adminSection) adminSection.style.display = "block";
  }

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

    if (idEditar) {
      fetch(`/api/empleados/${idEditar}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then(() => {
          empleadosOriginales = empleadosOriginales.map((emp) =>
            emp.id == idEditar ? { ...emp, ...data } : emp
          );
          mostrarEmpleados(empleadosOriginales);
          document.getElementById("agregarEmpleado").dataset.editId = "";
        })
        .catch((err) => console.error(err));
    } else {
      fetch("/api/empleados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
        .then((res) => res.json())
        .then((nuevo) => {
          empleadosOriginales.push({
            ...data,
            id: nuevo.id || Date.now(), 
            nombre: data.nombre_apellido.split(" ")[0],
            apellido: data.nombre_apellido.split(" ")[1] || "",
            estado: "Activo",
            rol: data.rol_id === 1 ? "Administrador" : "Empleado",
          });
          mostrarEmpleados(empleadosOriginales);
        })
        .catch((err) => console.error(err));
    }

    ["nombre", "cedula", "correo", "password", "telefono", "direccion"].forEach(
      (id) => (document.getElementById(id).value = "")
    );
  });
});
