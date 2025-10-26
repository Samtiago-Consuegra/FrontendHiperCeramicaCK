document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form-producto");
  const btnModificar = document.getElementById("btn-modificar");
  const btnEliminar = document.getElementById("btn-eliminar");
  const token = localStorage.getItem("access_token");

  if (!token) window.location.href = "login.html";

  let productosData = [];
  let tabla = null;

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const producto = getProductoForm();

    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto)
      });

      if (!res.ok) throw new Error("Error al guardar el producto");

      alert("Producto agregado correctamente");
      form.reset();
      cargarProductos();
    } catch (err) {
      console.error(err);
      alert("Error al agregar el producto");
    }
  });

  btnModificar?.addEventListener("click", async () => {
    const producto = getProductoForm();

    if (!producto.codigo) {
      alert("Debes ingresar el código del producto a modificar");
      return;
    }

    try {
      const res = await fetch(`/api/inventario/${producto.codigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto)
      });

      if (!res.ok) throw new Error("Error al modificar el producto");

      alert("Producto modificado correctamente");
      form.reset();
      cargarProductos();
    } catch (err) {
      console.error(err);
      alert("Error al modificar el producto");
    }
  });

  btnEliminar?.addEventListener("click", async () => {
    const codigo = form.codigo.value;

    if (!codigo) {
      alert("Debes ingresar el código del producto a eliminar");
      return;
    }

    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      const res = await fetch(`/api/inventario/${codigo}`, {
        method: "DELETE"
      });

      if (!res.ok) throw new Error("Error al eliminar el producto");

      alert("Producto eliminado correctamente");
      form.reset();
      cargarProductos();
    } catch (err) {
      console.error(err);
      alert("Error al eliminar el producto");
    }
  });

  function getProductoForm() {
    const formData = new FormData(form);
    const producto = {};
    formData.forEach((val, key) => producto[key] = val);
    return producto;
  }

  const userToggle = document.getElementById("user-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  userToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (event) => {
    if (!userToggle.contains(event.target) && !dropdownMenu.contains(event.target)) {
      dropdownMenu.style.display = "none";
    }
  });

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

  document.querySelectorAll('.user-avatar').forEach(el => {
    el.textContent = iniciales;
  });

  function getIniciales(nombreCompleto) {
    const partes = nombreCompleto.trim().split(" ");
    if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
    else if (partes.length === 1) return partes[0][0].toUpperCase();
    return "U";
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

  const cerrarSesion = document.getElementById("cerrar-sesion");
  cerrarSesion?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });

function initDataTable() {
  if ($.fn.DataTable.isDataTable("#tabla-inventario")) {
    $("#tabla-inventario").DataTable().destroy();
  }

  tabla = $("#tabla-inventario").DataTable({
    pageLength: 10,
    lengthMenu: [10, 20, 50],
    pagingType: "simple_numbers",
    language: {
      decimal: ",",
      thousands: ".",
      processing: "Procesando...",
      search: "Buscar:",
      lengthMenu: "Mostrar _MENU_ registros",
      info: "Mostrando de _START_ a _END_ de _TOTAL_ registros",
      infoEmpty: "Mostrando 0 a 0 de 0 registros",
      infoFiltered: "(filtrado de _MAX_ registros en total)",
      loadingRecords: "Cargando...",
      zeroRecords: "No se encontraron resultados",
      emptyTable: "No hay datos disponibles en la tabla",
      paginate: {
        first: "Primero",
        previous: "Anterior",
        next: "Siguiente",
        last: "Último"
      },
      aria: {
        sortAscending: ": activar para ordenar la columna ascendente",
        sortDescending: ": activar para ordenar la columna descendente"
      }
    },
    initComplete: function () {
      const searchInput = document.querySelector('#tabla-inventario_filter input');
      if (searchInput) {
        searchInput.placeholder = "Buscar Producto";
      }
    }
  });
  tabla.on('draw', function () {
    $('.dataTables_paginate span a').not('.current').hide();
  });
}

  function renderTabla(productos) {
    if (!tabla) initDataTable();
    tabla.clear();
    productos.forEach(p => {
      tabla.row.add([
        p.codigo,
        p.nombre,
        p.categoria,
        p.marca,
        p.proveedor,
        p.precio,
        p.stock,
        p.estado_stock,
        p.calidad
      ]);
    });
    tabla.draw();
  }

  async function cargarProductos() {
    try {
      const res = await fetch("/api/inventario");
      const productos = await res.json();
      productosData = productos;
      renderTabla(productos);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  }

  cargarProductos();
});
