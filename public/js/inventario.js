document.addEventListener("DOMContentLoaded", () => {
  // 🔧 Detectar si está en local o producción
  const backendUrl = window.location.hostname.includes("localhost")
    ? "http://127.0.0.1:5000"
    : "https://backendhiperceramicack.onrender.com"; // ⬅️ cambia por tu URL real de Render

  const form = document.getElementById("form-producto");
  const btnModificar = document.getElementById("btn-modificar");
  const btnEliminar = document.getElementById("btn-eliminar");
  const token = localStorage.getItem("access_token");

  if (!token) window.location.href = "login.html";

  let productosData = [];
  let tabla = null;

  // 🧾 Agregar producto
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const producto = getProductoForm();

    try {
      const res = await fetch(`${backendUrl}/api/inventario`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });

      if (!res.ok) throw new Error("Error al guardar el producto");

      alert("✅ Producto agregado correctamente");
      form.reset();
      cargarProductos();
    } catch (err) {
      console.error(err);
      alert("❌ Error al agregar el producto");
    }
  });

  // ✏️ Modificar producto
  btnModificar?.addEventListener("click", async () => {
    const producto = getProductoForm();

    if (!producto.codigo) {
      alert("Debes ingresar el código del producto a modificar");
      return;
    }

    try {
      const res = await fetch(`${backendUrl}/api/inventario/${producto.codigo}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(producto),
      });

      if (!res.ok) throw new Error("Error al modificar el producto");

      alert("✅ Producto modificado correctamente");
      form.reset();
      cargarProductos();
    } catch (err) {
      console.error(err);
      alert("❌ Error al modificar el producto");
    }
  });

  // 🗑️ Eliminar producto
  btnEliminar?.addEventListener("click", async () => {
    const codigo = form.codigo.value;

    if (!codigo) {
      alert("Debes ingresar el código del producto a eliminar");
      return;
    }

    if (!confirm("¿Seguro que deseas eliminar este producto?")) return;

    try {
      const res = await fetch(`${backendUrl}/api/inventario/${codigo}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Error al eliminar el producto");

      alert("🗑️ Producto eliminado correctamente");
      form.reset();
      cargarProductos();
    } catch (err) {
      console.error(err);
      alert("❌ Error al eliminar el producto");
    }
  });

  function getProductoForm() {
    const formData = new FormData(form);
    const producto = {};
    formData.forEach((val, key) => (producto[key] = val));
    return producto;
  }

  // 👤 Menú de usuario
  const userToggle = document.getElementById("user-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  userToggle?.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (event) => {
    if (
      userToggle &&
      dropdownMenu &&
      !userToggle.contains(event.target) &&
      !dropdownMenu.contains(event.target)
    ) {
      dropdownMenu.style.display = "none";
    }
  });

  // 👤 Perfil del usuario (idéntico a versiones previas)
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
      .map((p) => p[0])
      .join("")
      .toUpperCase(),
    telefono: localStorage.getItem("telefono") || "(+57) 3252014785",
    ultimoAcceso:
      localStorage.getItem("ultimoAcceso") || new Date().toLocaleString(),
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
      document.getElementById("perfil-departamento").textContent =
        usuario.departamento;
      document.getElementById("perfil-fecha").textContent =
        usuario.fechaContratacion;
      const permisos = document.getElementById("perfil-permisos");
      permisos.style.display = usuario.rol_id === 1 ? "block" : "none";
      modalPerfil.style.display = "flex";
    });
  }

  cerrarPerfil?.addEventListener("click", () => {
    modalPerfil.style.display = "none";
  });

  cerrarSesionBtn?.addEventListener("click", () => {
    localStorage.clear();
    window.location.href = "login.html";
  });

  // ⚙️ Tabla de productos
  function initDataTable() {
    if ($.fn.DataTable.isDataTable("#tabla-inventario")) {
      $("#tabla-inventario").DataTable().destroy();
    }

    tabla = $("#tabla-inventario").DataTable({
      pageLength: 10,
      lengthMenu: [10, 20, 50],
      pagingType: "simple_numbers",
      language: {
        url: "https://cdn.datatables.net/plug-ins/2.0.2/i18n/es-ES.json",
      },
      initComplete: function () {
        const searchInput = document.querySelector(
          "#tabla-inventario_filter input"
        );
        if (searchInput) searchInput.placeholder = "Buscar Producto";
      },
    });
  }

  function renderTabla(productos) {
    if (!tabla) initDataTable();
    tabla.clear();
    productos.forEach((p) => {
      tabla.row.add([
        p.codigo,
        p.nombre,
        p.categoria,
        p.marca,
        p.proveedor,
        p.precio,
        p.stock,
        p.estado_stock,
        p.calidad,
      ]);
    });
    tabla.draw();
  }

  // 🔄 Cargar productos
  async function cargarProductos() {
    try {
      const res = await fetch(`${backendUrl}/api/inventario`);
      if (!res.ok) throw new Error("Error al obtener inventario");
      const productos = await res.json();
      productosData = productos;
      renderTabla(productos);
    } catch (err) {
      console.error("Error al cargar productos:", err);
    }
  }

  cargarProductos();
});
