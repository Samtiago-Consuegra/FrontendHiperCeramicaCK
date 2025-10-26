document.addEventListener("DOMContentLoaded", () => {
  // 🌐 Detectar entorno (local o producción)
  const backendUrl = window.location.hostname.includes("localhost")
    ? "http://127.0.0.1:5000"
    : "https://tu-backend.onrender.com"; // ⚠️ Reemplaza por tu dominio real de Render

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

  // ⏰ Validar sesión
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

  // 🔐 Restricciones según rol
  const adminSection = document.getElementById("admin-section");
  if (rol_id === 2) {
    console.log("Empleado detectado → Bloqueando secciones");
    ["linkcitas", "link-empleados", "link-reportes"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.classList.add("disabled");
    });
  } else if (rol_id === 3) {
    console.log("Bodeguero detectado → Solo inventario");
    ["link-dashboard", "link-empleados", "linkcitas", "link-reportes", "link-chatbot"].forEach(
      (id) => {
        const el = document.getElementById(id);
        if (el) el.classList.add("disabled");
      }
    );
    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage !== "inventario.html") {
      window.location.href = "inventario.html";
    }
  } else if (rol_id === 1) {
    console.log("Administrador → Acceso completo");
  }

  // 🚪 Cerrar sesión
  const cerrarSesion = document.getElementById("cerrar-sesion");
  cerrarSesion?.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "login.html";
  });

  // 📦 Lógica de productos de venta
  let productosVenta = [];
  document.getElementById("form-venta").addEventListener("submit", (e) => {
    e.preventDefault();
    const nombre = document.getElementById("nombre_producto").value;
    const cantidad = parseInt(document.getElementById("cantidad").value);
    const precio = parseFloat(document.getElementById("precio_unitario").value);
    const categoria = document.getElementById("categoria").value || "General";

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
      resumenBody.innerHTML += `
        <tr>
          <td>${p.nombre}<br><small>${p.categoria}</small></td>
          <td>${p.cantidad}</td>
          <td>$${p.precio.toFixed(2)}</td>
          <td>$${p.subtotal.toFixed(2)}</td>
          <td><button onclick="eliminarProducto(${index})">Eliminar</button></td>
        </tr>`;
    });

    const iva = subtotal * 0.12;
    const total = subtotal + iva;

    document.getElementById("subtotal").textContent = subtotal.toFixed(2);
    document.getElementById("iva").textContent = iva.toFixed(2);
    document.getElementById("total-general").textContent = total.toFixed(2);
  }

  window.eliminarProducto = (index) => {
    productosVenta.splice(index, 1);
    actualizarResumen();
  };

  document.getElementById("cancelar-venta").addEventListener("click", () => {
    if (confirm("¿Seguro que deseas cancelar la venta?")) {
      productosVenta = [];
      actualizarResumen();
    }
  });

  // 💾 Registrar venta
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
      const respCliente = await fetch(`${backendUrl}/api/clientes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify(cliente),
      });
      const clienteData = await respCliente.json();
      const cliente_id = clienteData.cliente_id;

      const respVenta = await fetch(`${backendUrl}/api/ventas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("access_token"),
        },
        body: JSON.stringify({ cliente_id, productos: productosVenta }),
      });

      const ventaData = await respVenta.json();
      const venta_id = ventaData.venta_id;

      alert(`✅ Venta registrada correctamente (ID: ${venta_id})`);

      generarFacturaPDF(cliente, productosVenta, venta_id);
      productosVenta = [];
      actualizarResumen();
      document.getElementById("form-venta").reset();

    } catch (err) {
      console.error("Error al procesar venta:", err);
      alert("⚠️ No se pudo registrar la venta.");
    }
  });

  // 🧾 Generar factura PDF
  function generarFacturaPDF(cliente, productos, idVenta) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    // … (resto de la generación del PDF igual que tu versión actual)
  }
});
