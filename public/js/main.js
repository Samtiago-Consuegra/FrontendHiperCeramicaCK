document.addEventListener("DOMContentLoaded", () => {
  // 🔧 Detectar entorno (local o producción)
  const backendUrl = window.location.hostname.includes("localhost")
    ? "http://127.0.0.1:5000"
    : "https://tu-backend.onrender.com"; // ⚠️ reemplaza con tu dominio real de Render

  const userToggle = document.getElementById("user-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  if (userToggle) {
    userToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });
  }

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

  // 🔐 Validar sesión activa
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
    if (partes.length >= 2) {
      return (partes[0][0] + partes[1][0]).toUpperCase();
    } else if (partes.length === 1) {
      return partes[0][0].toUpperCase();
    }
    return "U";
  }

  // 🔒 Control de roles
  if (rol_id === 2) {
    console.log("Empleado → acceso limitado");
    const linkCitas = document.getElementById("linkcitas");
    const linkEmpleados = document.getElementById("link-empleados");
    const linkReportes = document.getElementById("link-reportes");
    [linkCitas, linkEmpleados, linkReportes].forEach((el) => el?.classList.add("disabled"));
  } else if (rol_id === 3) {
    console.log("Bodeguero → acceso limitado");
    const linkDashboard = document.getElementById("link-dashboard");
    const linkEmpleados = document.getElementById("link-empleados");
    const linkCitas = document.getElementById("linkcitas");
    const linkReportes = document.getElementById("link-reportes");
    const linkChatbot = document.getElementById("link-chatbot");
    [linkDashboard, linkEmpleados, linkCitas, linkReportes, linkChatbot].forEach((el) =>
      el?.classList.add("disabled")
    );
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage !== "inventario.html") {
      window.location.href = "inventario.html";
    }
  }

  // 🚪 Cerrar sesión
  const cerrarSesion = document.getElementById("cerrar-sesion");
  cerrarSesion?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });

  const token = localStorage.getItem("access_token");
  if (!token) return;

  const ventasDiaMonto = document.getElementById("ventas-dia-monto");
  const fechaDiaEl = document.getElementById("fecha-dia");
  const verDetallesBtn = document.getElementById("ver-detalles");

  const fechaHoy = new Date();
  const fechaISO = fechaHoy.toISOString().split("T")[0];
  if (fechaDiaEl) fechaDiaEl.textContent = fechaHoy.toLocaleDateString("es-CO");

  const ventasMesEl = document.getElementById("ventas-mes-monto");
  const verDetallesMesBtn = document.getElementById("ver-detalles-mes");
  const selectMes = document.getElementById("select-mes");
  const selectAnio = document.getElementById("select-anio");
  const meses = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  let mes = fechaHoy.getMonth() + 1;
  let anio = fechaHoy.getFullYear();

  function formatoCOP(valor) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(valor);
  }

  // 📊 Obtener ventas del día
  function cargarVentasDia() {
    fetch(`${backendUrl}/api/ventas/dia?fecha=${fechaISO}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const total = data?.reduce((acc, v) => acc + Number(v.subtotal || 0), 0) || 0;
        ventasDiaMonto.textContent = formatoCOP(total);
      })
      .catch((err) => {
        console.error("Error al obtener ventas del día:", err);
        ventasDiaMonto.textContent = "$0";
      });
  }

  // 📆 Obtener ventas del mes
  function cargarVentasMes() {
    fetch(`${backendUrl}/api/ventas/mes?mes=${mes}&anio=${anio}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const total = data?.reduce((acc, v) => acc + Number(v.subtotal || 0), 0) || 0;
        ventasMesEl.textContent = formatoCOP(total);
      })
      .catch((err) => {
        console.error("Error al obtener ventas del mes:", err);
        ventasMesEl.textContent = "$0";
      });
  }

  // 🧾 Inventario bajo
  fetch(`${backendUrl}/api/inventario/bajo`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then((res) => res.json())
    .then((data) => {
      const tbody = document.getElementById("tabla-inventario");
      if (!tbody) return;

      tbody.innerHTML = "";
      data.forEach((p) => {
        const estado = p.stock <= p.stock_minimo ? "bajo" : "ok";
        const fila = `
          <tr>
            <td>${p.nombre}</td>
            <td>${p.categoria}</td>
            <td>${p.marca}</td>
            <td>${formatoCOP(Number(p.precio || 0))}</td>
            <td>${p.stock}</td>
            <td><span class="estado ${estado}">${estado === "bajo" ? "Bajo" : "Óptimo"}</span></td>
          </tr>`;
        tbody.insertAdjacentHTML("beforeend", fila);
      });

      if ($.fn.DataTable.isDataTable("#tabla-inventario-dt")) {
        $("#tabla-inventario-dt").DataTable().destroy();
      }

      const tabla = $("#tabla-inventario-dt").DataTable({
        pagingType: "simple_numbers",
        pageLength: 10,
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json",
        },
      });

      tabla.on("draw", function () {
        $(".dataTables_paginate span a").not(".current").hide();
      });
    })
    .catch((err) => console.error("Error al cargar inventario bajo:", err));

  cargarVentasDia();
  cargarVentasMes();
});
