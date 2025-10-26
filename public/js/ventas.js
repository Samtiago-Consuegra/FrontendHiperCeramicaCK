document.addEventListener("DOMContentLoaded", () => {
  const userToggle = document.getElementById("user-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  userToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    dropdownMenu.style.display =
      dropdownMenu.style.display === "block" ? "none" : "block";
  });

  document.addEventListener("click", (event) => {
    if (
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

  document.getElementById("user-nombre").textContent = nombre;
  document.getElementById("user-fullname").textContent = nombre;
  document.getElementById("user-correo").textContent = correo;
  document
    .querySelectorAll(".user-avatar")
    .forEach((el) => (el.textContent = iniciales));

  function getIniciales(nombreCompleto) {
    const partes = nombreCompleto.trim().split(" ");
    if (partes.length >= 2)
      return (partes[0][0] + partes[1][0]).toUpperCase();
    if (partes.length === 1) return partes[0][0].toUpperCase();
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
  }

  const cerrarSesion = document.getElementById("cerrar-sesion");
  cerrarSesion.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });

  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("activo"));
      tab.classList.add("activo");
      const target = tab.dataset.tab;
      tabContents.forEach((c) => {
        c.classList.toggle("activo", c.dataset.content === target);
      });
    });
  });

  let productosVenta = [];
  document.getElementById("form-venta").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre_producto").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const precio = parseFloat(document.getElementById("precio_unitario").value);
    const categoria =
      document.getElementById("categoria").value || "General";

    productosVenta.push({
      nombre,
      cantidad,
      precio,
      categoria,
      subtotal: cantidad * precio,
    });
    actualizarResumen();
    e.target.reset();
  });

  function actualizarResumen() {
    const resumenBody = document.getElementById("resumen-body");
    resumenBody.innerHTML = "";
    let subtotal = 0;

    productosVenta.forEach((p, index) => {
      subtotal += p.subtotal;
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${p.nombre}<br><small>${p.categoria}</small></td>
        <td>${p.cantidad}</td>
        <td>$${p.precio.toFixed(2)}</td>
        <td>$${p.subtotal.toFixed(2)}</td>
        <td><button onclick="eliminarProducto(${index})">Eliminar</button></td>
      `;
      resumenBody.appendChild(row);
    });

    const iva = subtotal * 0.12;
    const total = subtotal + iva;

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("iva").textContent = iva.toFixed(2);
    document.getElementById("total-general").textContent = total.toFixed(2);
  }

  window.eliminarProducto = function (index) {
    productosVenta.splice(index, 1);
    actualizarResumen();
  };

  document.getElementById("cancelar-venta").addEventListener("click", () => {
      if (confirm("¿Seguro que deseas cancelar la venta?")) {
        productosVenta = [];
        actualizarResumen();
      }
    });

 // --- Registrar Venta ---
document.getElementById("registrar-venta").addEventListener("click", async () => {
  if (productosVenta.length === 0)
    return alert("No hay productos para registrar");

  const cliente = {
    nombre_apellido: document.getElementById("comprador").value,
    cedula: document.getElementById("cedula").value,
    correo: document.getElementById("correo").value,
    telefono: document.getElementById("telefono").value,
    direccion: document.getElementById("direccion").value,
  };

  try {
    const respCliente = await fetch("/api/clientes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
      body: JSON.stringify(cliente),
    });
    const clienteData = await respCliente.json();
    const cliente_id = clienteData.cliente_id;

    const respVenta = await fetch("/api/ventas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + localStorage.getItem("access_token"),
      },
      body: JSON.stringify({ cliente_id, productos: productosVenta }),
    });

    const ventaData = await respVenta.json();
    const venta_id = ventaData.venta_id;

    alert(`Venta registrada correctamente (ID: ${venta_id})`);

    generarFacturaPDF(cliente, productosVenta, venta_id);
    productosVenta = [];
    actualizarResumen();
    document.getElementById("form-venta").reset();

  } catch (err) {
    console.error("Error al procesar venta:", err);
    alert("Error al registrar la venta");
  }
});

// --- Generar Ventas ---
function generarFacturaPDF(cliente, productos, idVenta) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(14);
  doc.text("Cerámicas UK", 14, 15);
  doc.setFontSize(10);
  doc.text("Dirección: Calle 31 Cra 23, Ciudad: Barranquilla", 14, 21);
  doc.text("Tel: (+57) 3252014785", 14, 26);
  doc.text("Correo: CeramicasUKBarranquilla@gmail.com", 14, 31);

  doc.setFontSize(16);
  doc.text("Factura de Venta", 150, 15);
  doc.setFontSize(10);
  const fecha = new Date().toLocaleDateString();
  doc.text("Fecha: " + fecha, 150, 22);
  doc.text("Venta #" + String(idVenta).padStart(4, "0"), 150, 28);

  doc.setFontSize(12);
  doc.text("Datos del Cliente", 14, 45);
  doc.setFontSize(10);
  doc.text("Nombre: " + (cliente.nombre_apellido || "---"), 14, 51);
  doc.text("Correo: " + (cliente.correo || "---"), 14, 56);
  doc.text("Teléfono: (+57) " + (cliente.telefono || "---"), 14, 61);
  doc.text("Dirección: " + (cliente.direccion || "---"), 14, 66);

  const vendedorNombre = localStorage.getItem("nombre") || "Vendedor";
  const vendedorCorreo = localStorage.getItem("correo") || "correo@empresa.com";
  const vendedorTelefono = localStorage.getItem("telefono") || "numero";

  doc.setFontSize(12);
  doc.text("Datos del Vendedor", 150, 45);
  doc.setFontSize(10);
  doc.text("Nombre: " + vendedorNombre, 150, 51);
  doc.text("Correo: " + vendedorCorreo, 150, 56);
  doc.text("Teléfono: (+57) " + vendedorTelefono, 150, 61);

  const filas = productos.map(p => [
    p.nombre,
    p.cantidad,
    `$${p.precio.toFixed(2)}`,
    `$${p.subtotal.toFixed(2)}`
  ]);

  doc.autoTable({
    startY: 80,
    head: [["Producto", "Cantidad", "Precio Unitario", "Subtotal"]],
    body: filas,
    theme: "grid",
    styles: { fontSize: 10, halign: "center", cellPadding: 3 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
  });

  const subtotal = productos.reduce((acc, p) => acc + p.subtotal, 0);
  const iva = subtotal * 0.12;
  const total = subtotal + iva;

  let finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.autoTable({
    startY: finalY,
    body: [
      ["Subtotal", `$${subtotal.toFixed(2)}`],
      ["IVA (12%)", `$${iva.toFixed(2)}`],
      ["Total", `$${total.toFixed(2)}`],
    ],
    theme: "grid",
    styles: { halign: "right", fontSize: 11 },
    columnStyles: { 0: { halign: "left" }, 1: { halign: "right" } },
    tableWidth: 60,
    margin: { left: 135 },
  });

  finalY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(11);
  doc.text("Gracias por su compra. ¡Vuelva pronto a Cerámicas UK!", 70, finalY);
  doc.save(`factura_${String(idVenta).padStart(4, "0")}.pdf`);
}

// --- Generar cotización ---
let tablaCotizacion;
document.getElementById("generar-cotizacion").addEventListener("click", () => {
  document.getElementById("cotizacion-cliente").textContent =
    document.getElementById("comprador").value || "---";
  document.getElementById("cotizacion-correo").textContent =
    document.getElementById("correo").value || "---";
  document.getElementById("cotizacion-fecha").textContent =
    new Date().toLocaleDateString();

  const cotizacionBody = document.getElementById("cotizacion-body");
  cotizacionBody.innerHTML = "";
  let totalCot = 0;

  if (productosVenta.length > 0) {
    productosVenta.forEach((p) => {
      totalCot += p.subtotal;
      cotizacionBody.innerHTML += `
        <tr>
          <td>${p.nombre}</td>
          <td>${p.cantidad}</td>
          <td>$${p.precio.toFixed(2)}</td>
          <td>$${p.subtotal.toFixed(2)}</td>
        </tr>
      `;
    });
  } else {
    cotizacionBody.innerHTML = `
      <tr>
        <td contenteditable="true">---</td>
        <td contenteditable="true">0</td>
        <td contenteditable="true">$0.00</td>
        <td contenteditable="true">$0.00</td>
      </tr>
    `;
  }

  document.getElementById("cotizacion-total").textContent = totalCot.toFixed(2);
  if (!tablaCotizacion) {
    tablaCotizacion = new DataTable("#tabla-cotizacion", {
      paging: false,
      searching: false,
      info: false,
      language: { emptyTable: "Tabla de cotización vacía" },
    });
  } else {
    tablaCotizacion.clear().rows.add(
      Array.from(cotizacionBody.querySelectorAll("tr")).map((tr) => {
        return Array.from(tr.querySelectorAll("td")).map((td) => td.textContent);
      })
    ).draw();
  }
  document.getElementById("modal-cotizacion").style.display = "flex";
});

const inputBuscar = document.getElementById("buscar_producto");
const btnBuscar = document.getElementById("btn-buscar");
const resultadosDiv = document.getElementById("resultados-busqueda");
let tablaBusqueda;

btnBuscar.addEventListener("click", async () => {
  const termino = inputBuscar.value.trim();
  if (!termino) {
    resultadosDiv.innerHTML = "<p>Escribe algo para buscar.</p>";
    return;
  }

  try {
    const res = await fetch(`/api/inventario/buscar?q=${encodeURIComponent(termino)}`);
    const productos = await res.json();

    if (productos.length === 0) {
      resultadosDiv.innerHTML = "<p>No se encontraron productos.</p>";
      return;
    }

    resultadosDiv.innerHTML = `
      <table id="tabla-busqueda" class="display" style="width:100%">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    `;

    if (tablaBusqueda) {
      tablaBusqueda.destroy();
    }

    tablaBusqueda = $('#tabla-busqueda').DataTable({
      data: productos,
      columns: [
        { data: 'nombre' },
        { data: 'categoria' },
        { 
          data: 'precio',
          render: (data) => `$${parseFloat(data).toFixed(2)}`
        },
        {
          data: null,
          render: (data) =>
            `<button class="boton-negro seleccionar" 
                     data-nombre="${data.nombre}" 
                     data-precio="${data.precio}" 
                     data-categoria="${data.categoria}">
              Seleccionar
            </button>`
        }
      ],
    pageLength: 4,
    lengthMenu: [4, 8, 16, 22],
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
        }
      }
    });

    function ocultarNumerosPaginacion() {
      const botones = $('.dataTables_paginate span a');
      botones.hide(); 
      $('.dataTables_paginate .previous').show();
      $('.dataTables_paginate .next').show();    
      $('.dataTables_paginate .current').show();  
    }

    ocultarNumerosPaginacion();
    tablaBusqueda.on('draw', ocultarNumerosPaginacion);

    $('#tabla-busqueda').on('click', '.seleccionar', function() {
      const btn = $(this);
      document.getElementById("nombre_producto").value = btn.data("nombre");
      document.getElementById("precio_unitario").value = btn.data("precio");
      document.getElementById("categoria").value = btn.data("categoria");
      resultadosDiv.innerHTML = "";
    });

  } catch (error) {
    console.error("Error buscando producto:", error);
    resultadosDiv.innerHTML = "<p>Error en la búsqueda.</p>";
  }
});

// --- Exportar PDF ---
document.getElementById("exportar-cotizacion").addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  let idCotizacion = localStorage.getItem("idCotizacion") || 1;
  localStorage.setItem("idCotizacion", parseInt(idCotizacion) + 1);

  doc.setFontSize(14);
  doc.text("Cerámicas UK", 14, 15);
  doc.setFontSize(10);
  doc.text("Dirección: Calle 31 Cra 23, Ciudad: Barranquilla", 14, 21);
  doc.text("Tel: (+57) 3252014785", 14, 26);
  doc.text("Correo: CeramicasUKBarranquilla@gmail.com", 14, 31);

  doc.setFontSize(16);
  doc.text("Cotizacion", 150, 15);
  doc.setFontSize(10);
  doc.text("Fecha: " + document.getElementById("cotizacion-fecha").textContent, 150, 22);
  doc.text("Cotización #" + String(idCotizacion).padStart(4, "0"), 150, 28);

  doc.setFontSize(12);
  doc.text("Datos del Cliente", 14, 45);
  doc.setFontSize(10);
  doc.text("Nombre: " + document.getElementById("cotizacion-cliente").textContent, 14, 51);
  doc.text("Correo: " + document.getElementById("cotizacion-correo").textContent, 14, 56);
  doc.text("Teléfono: (+57) " + (document.getElementById("telefono").value || "---"), 14, 61);
  doc.text("Dirección: " + (document.getElementById("direccion").value || "---"), 14, 66);

const vendedorNombre = localStorage.getItem("nombre") || "Vendedor";
const vendedorCorreo = localStorage.getItem("correo") || "correo@empresa.com";
const vendedorTelefono = localStorage.getItem("telefono") || "numero";

doc.setFontSize(12);
doc.text("Datos del Vendedor", 150, 45); 
doc.setFontSize(10);
doc.text("Nombre: " + vendedorNombre, 150, 51);
doc.text("Correo: " + vendedorCorreo, 150, 56);
doc.text("Teléfono: (+57) " + vendedorTelefono, 150, 61);

  const filas = [];
  let subtotal = 0;

  document.querySelectorAll("#cotizacion-body tr").forEach((tr) => {
    const celdas = Array.from(tr.querySelectorAll("td")).map((td) => td.textContent.trim());

    if (celdas.length === 4) {
      filas.push(celdas);
      let totalFila = parseFloat(celdas[3].replace("$", "").replace(",", ""));
      subtotal += isNaN(totalFila) ? 0 : totalFila;
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

  doc.autoTable({
    head: [["Producto", "Cant.", "Precio Unitario", "Total"]],
    body: filas,
    startY: 80,
    theme: "grid",
    headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: "center" },
    bodyStyles: { halign: "center" },
    styles: { fontSize: 10 },
  });

  let finalY = doc.lastAutoTable.finalY + 10;
  const iva = subtotal * 0.12;
  const total = subtotal + iva;

  const totales = [
    ["Subtotal", `$${subtotal.toFixed(2)}`],
    ["IVA (12%)", `$${iva.toFixed(2)}`],
    ["TOTAL", `$${total.toFixed(2)}`],
  ];

  doc.autoTable({
    head: [["Detalle", "Valor"]],
    body: totales,
    startY: finalY,
    theme: "grid",
    tableWidth: 80,
    margin: { left: doc.internal.pageSize.width - 90 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, halign: "center" },
    styles: { fontSize: 11 },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "right" }
    },
  });

  doc.setFontSize(9);
  doc.text("Gracias por confiar en Cerámicas UK", 14, 285);

  doc.save(`cotizacion_${String(idCotizacion).padStart(4, "0")}.pdf`);
});

  document.getElementById("cerrar-cotizacion").addEventListener("click", () => {
    document.getElementById("modal-cotizacion").style.display = "none";
});
});
