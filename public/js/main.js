document.addEventListener("DOMContentLoaded", () => {
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
  const currentPage = window.location.pathname.split("/").pop();
  if (currentPage !== "inventario.html") {
    window.location.href = "inventario.html";
  }
  } else if (rol_id === 1) {
  console.log("Administrador detectado → Acceso completo");
}

  const cerrarSesion = document.getElementById("cerrar-sesion");
  if (cerrarSesion) {
    cerrarSesion.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

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
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
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

  function cargarVentasDia() {
    fetch(`/api/ventas/dia?fecha=${fechaISO}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        let total = data?.reduce((acc, v) => acc + Number(v.subtotal || 0), 0) || 0;
        ventasDiaMonto.textContent = formatoCOP(total);
      })
      .catch((err) => {
        console.error("Error al obtener ventas del día:", err);
        ventasDiaMonto.textContent = "$0";
      });
  }

  function cargarVentasMes() {
    fetch(`/api/ventas/mes?mes=${mes}&anio=${anio}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        let total = data?.reduce((acc, v) => acc + Number(v.subtotal || 0), 0) || 0;
        ventasMesEl.textContent = formatoCOP(total);
      })
      .catch((err) => {
        console.error("Error al obtener ventas del mes:", err);
        ventasMesEl.textContent = "$0";
      });
  }

  function verificarFuturoYActualizar() {
    const fechaActual = new Date();
    const anioActual = fechaActual.getFullYear();
    const mesActual = fechaActual.getMonth() + 1;

    if (anio > anioActual || (anio === anioActual && mes > mesActual)) {
      ventasMesEl.textContent = "$0";
      return;
    }
    cargarVentasMes();
  }

  if (selectMes) {
    meses.forEach((m, i) => {
      const option = document.createElement("option");
      option.value = i + 1;
      option.textContent = m;
      if (i + 1 === mes) option.selected = true;
      selectMes.appendChild(option);
    });

    selectMes.addEventListener("change", () => {
      mes = parseInt(selectMes.value);
      verificarFuturoYActualizar();
    });
  }

  if (selectAnio) {
    const anioActual = new Date().getFullYear();
    for (let y = 2020; y <= anioActual + 50; y++) {
      const option = document.createElement("option");
      option.value = y;
      option.textContent = y;
      if (y === anioActual) option.selected = true;
      selectAnio.appendChild(option);
    }

    selectAnio.addEventListener("change", () => {
      anio = parseInt(selectAnio.value);
      verificarFuturoYActualizar();
    });
  }

  cargarVentasDia();
  cargarVentasMes();
  
if (verDetallesMesBtn) {
  verDetallesMesBtn.addEventListener("click", (e) => {
    e.preventDefault();
    fetch(`/api/ventas/mes?mes=${mes}&anio=${anio}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        tablaVentasDetalles.innerHTML = "";
        tituloDetalles.textContent = `Detalles de ventas - ${meses[mes - 1]} ${anio}`;

        if (!data || data.length === 0) {
          tablaVentasDetalles.innerHTML = `<tr><td colspan="5">No hay ventas registradas este mes.</td></tr>`;
        } else {
          data.forEach((v) => {
            tablaVentasDetalles.innerHTML += `
              <tr>
                <td>${v.cliente}</td>
                <td>${v.producto}</td>
                <td>${v.cantidad}</td>
                <td>${formatoCOP(Number(v.subtotal || 0))}</td>
                <td>${v.fecha}</td>
              </tr>`;
          });
        }

        const modalContent = document.querySelector("#modal-detalles .modal-content");
        let exportBtn = document.getElementById("exportar-pdf-mes");
        if (!exportBtn) {
          exportBtn = document.createElement("button");
          exportBtn.id = "exportar-pdf-mes";
          exportBtn.textContent = "Facturacion Venta-Mes";
          exportBtn.className = "boton-negro";
          exportBtn.style.marginBottom = "10px";
          modalContent.insertBefore(exportBtn, modalContent.querySelector("table"));
        }

        exportBtn.onclick = () => {
          const { jsPDF } = window.jspdf;
          const doc = new jsPDF();

          doc.setFontSize(14);
          doc.text("Cerámicas UK", 14, 15);
          doc.setFontSize(10);
          doc.text("Dirección: Calle 31 Cra 23, Ciudad: Barranquilla", 14, 21);
          doc.text("Tel: (+57) 3252014785", 14, 26);
          doc.text("Correo: CeramicasUKBarranquilla@gmail.com", 14, 31);

          doc.setFontSize(16);
          doc.text(`Factura de Ventas - ${meses[mes - 1]} ${anio}`, 14, 45);

          const filas = [];
          let totalMes = 0;

          document.querySelectorAll("#tabla-ventas-detalles tr").forEach((tr) => {
            const celdas = Array.from(tr.querySelectorAll("td")).map(td => td.textContent.trim());
            if (celdas.length === 5) {
              filas.push(celdas);
              const raw = celdas[3].replace(/[^\d.,-]/g, "").trim();
              let n = raw.replace(/\./g, "").replace(/,/g, ".");
              totalMes += parseFloat(n) || 0;
            }
          });

          doc.autoTable({
            startY: 55,
            head: [["Cliente", "Producto", "Cantidad", "Total", "Fecha"]],
            body: filas,
            theme: "grid",
            styles: { fontSize: 10, halign: "center" },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          });

          const finalY = doc.lastAutoTable.finalY + 8;
          doc.autoTable({
            startY: finalY,
            body: [["Total del Mes", formatoCOP(totalMes)]],
            theme: "grid",
            styles: { halign: "right", fontSize: 11 },
            columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
            tableWidth: 70,
            margin: { left: 125 },
            headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          });

          doc.setFontSize(9);
          doc.text("Generado por Cerámicas UK", 14, doc.lastAutoTable.finalY + 15);
          
          const nombreArchivo = `ventames/factura_mes_${mes}_${anio}.pdf`;
          doc.save(nombreArchivo);
        };

        modal.style.display = "flex";
      })
      .catch((err) => console.error("Error al obtener ventas del mes:", err));
  });
}

  const modal = document.getElementById("modal-detalles");
  const cerrarModalBtn = document.getElementById("cerrar-modal");
  const tablaVentasDetalles = document.getElementById("tabla-ventas-detalles");
  const tituloDetalles = document.getElementById("titulo-detalles");

  if (verDetallesBtn) {
    verDetallesBtn.addEventListener("click", (e) => {
      e.preventDefault();
      fetch(`/api/ventas/dia?fecha=${fechaISO}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          tablaVentasDetalles.innerHTML = "";
          tituloDetalles.textContent = `Detalles de ventas - ${fechaHoy.toLocaleDateString("es-CO")}`;

          if (!data || data.length === 0) {
            tablaVentasDetalles.innerHTML = `<tr><td colspan="5">No hay ventas registradas hoy.</td></tr>`;
          } else {
            data.forEach((v) => {
              tablaVentasDetalles.innerHTML += `
                <tr>
                  <td>${v.cliente}</td>
                  <td>${v.producto}</td>
                  <td>${v.cantidad}</td>
                  <td>${formatoCOP(Number(v.subtotal || 0))}</td>
                  <td>${v.fecha}</td>
                </tr>`;
            });
          }
          modal.style.display = "flex";
        })
        .catch((err) => console.error("Error al obtener ventas del día:", err));
    });
  }

  if (cerrarModalBtn) {
    cerrarModalBtn.addEventListener("click", () => {
      modal.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
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

fetch("/api/inventario/bajo", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
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
        </tr>
      `;
      tbody.insertAdjacentHTML("beforeend", fila);
    });

    if ($.fn.DataTable.isDataTable("#tabla-inventario-dt")) {
      $("#tabla-inventario-dt").DataTable().destroy();
    }

    const tabla = $("#tabla-inventario-dt").DataTable({
      pagingType: "simple_numbers",
      pageLength: 10,
      lengthMenu: [10, 20, 50],
      language: {
        url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json",
      },
      initComplete: function () {
        const searchInput = document.querySelector('#tabla-inventario-dt_filter input');
        if (searchInput) {
          searchInput.placeholder = "";
        }
      },
    });

    tabla.on("draw", function () {
      $(".dataTables_paginate span a").not(".current").hide();
    });
  })
  .catch((err) => console.error("Error al cargar inventario bajo:", err));
});
