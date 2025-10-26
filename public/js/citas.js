document.addEventListener("DOMContentLoaded", () => {
  const userToggle = document.getElementById("user-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  if (userToggle && dropdownMenu) {
    userToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.style.display =
        dropdownMenu.style.display === "block" ? "none" : "block";
    });

    document.addEventListener("click", (e) => {
      if (!userToggle.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.style.display = "none";
      }
    });
  }

  setInterval(() => {
    if (!localStorage.getItem("access_token")) {
      window.location.href = "login.html";
    }
  }, 2000)

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
    el.textContent = getIniciales(nombre);
  });

  function getIniciales(nombreCompleto) {
    const partes = nombreCompleto.trim().split(" ");
    return partes.length >= 2
      ? (partes[0][0] + partes[1][0]).toUpperCase()
      : partes[0][0].toUpperCase();
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

  const verPerfilBtn = document.getElementById("ver-perfil");
  const modalPerfil = document.getElementById("modal-perfil");
  const cerrarPerfil = document.getElementById("cerrar-perfil");
  const cerrarSesionBtn = document.getElementById("cerrar-sesion-btn");

  const usuario = {
    nombre,
    correo,
    rol: localStorage.getItem("rol") || "Rol no definido",
    rol_id: parseInt(localStorage.getItem("rol_id")) || 0,
    iniciales: getIniciales(nombre),
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
      document.getElementById("perfil-ultimo").textContent =
        usuario.ultimoAcceso;
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

  if (cerrarPerfil) {
    cerrarPerfil.addEventListener("click", () => {
      modalPerfil.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modalPerfil) modalPerfil.style.display = "none";
  });

  if (cerrarSesionBtn) {
    cerrarSesionBtn.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "login.html";
    });
  }

  const tabla = $("#tablaCitas").DataTable({
    ajax: { url: "/api/citas", dataSrc: "" },
    columns: [
      { data: "nombre_cliente" },
      { data: "correo" },
      { data: "telefono" },
      { data: "fecha_cita" },
      { data: "hora_cita" },
      { data: "tipo_cita" },
      { data: "motivo" },
    ],
    pagingType: "simple_numbers",
    pageLength: 10,
    lengthMenu: [10, 20, 50],
    autoWidth: false,
  language: {
    url: "https://cdn.datatables.net/plug-ins/2.0.2/i18n/es-ES.json",
    paginate: {
      previous: "Anterior",
      next: "Siguiente",
      },
    },
  });

  const modal = document.getElementById("modal-cita");
  const btnNueva = document.getElementById("btn-nueva-cita");
  const cerrarModal = document.getElementById("cerrar-modal");
  const form = document.getElementById("form-cita");

  btnNueva.addEventListener("click", () => (modal.style.display = "flex"));
  cerrarModal.addEventListener("click", () => {
    modal.style.display = "none";
    form.reset();
  });
  window.addEventListener("click", (e) => {
    if (e.target === modal) modal.style.display = "none";
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form));

    try {
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (res.ok) {
        alert("Cita registrada correctamente");
        modal.style.display = "none";
        form.reset();
        tabla.ajax.reload();
      } else {
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error(error);
      alert("Error al guardar la cita");
    }
  });

  const modalHoy = document.getElementById("modal-citas-hoy");
  const modalManana = document.getElementById("modal-citas-manana");
  const btnHoy = document.getElementById("btn-citas-hoy");
  const btnManana = document.getElementById("btn-citas-manana");
  const cerrarHoy = document.getElementById("cerrar-modal-hoy");
  const cerrarManana = document.getElementById("cerrar-modal-manana");
  const listaHoy = document.getElementById("lista-citas-hoy");
  const listaManana = document.getElementById("lista-citas-manana");

  const formatearFechaLocal = (fechaStr) => {
    const fecha = new Date(fechaStr);
    const local = new Date(
      fecha.getUTCFullYear(),
      fecha.getUTCMonth(),
      fecha.getUTCDate()
    );
    return local.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  async function cargarCitas(url, contenedor) {
    contenedor.innerHTML = "<p>Cargando...</p>";
    try {
      const res = await fetch(url);
      const citas = await res.json();

      if (!citas.length) {
        contenedor.innerHTML = "<p>No hay citas para esta fecha.</p>";
        return;
      }

      contenedor.innerHTML = citas
        .map(
          (c) => `
        <div class="cita-item">
          <p><strong>${c.nombre_cliente}</strong> (${c.tipo_cita})</p>
          <p><i class="fa-regular fa-calendar"></i> ${formatearFechaLocal(
            c.fecha_cita
          )}</p>
          <p><i class="fa-regular fa-clock"></i> ${c.hora_cita}</p>
          <p><i class="fa-regular fa-envelope"></i> ${c.correo}</p>
          <button class="btn-confirmar"
            data-nombre="${c.nombre_cliente}"
            data-correo="${c.correo}"
            data-fecha="${c.fecha_cita}"
            data-hora="${c.hora_cita}"
            data-tipo="${c.tipo_cita}">
            <i class='fa-solid fa-paper-plane'></i> Confirmar por correo
          </button>
        </div>
      `
        )
        .join("");

      document.querySelectorAll(".btn-confirmar").forEach((btn) => {
        btn.addEventListener("click", async () => {
          const data = {
            nombre: btn.dataset.nombre,
            correo: btn.dataset.correo,
            fecha: btn.dataset.fecha,
            hora: btn.dataset.hora,
            tipo: btn.dataset.tipo,
          };

          try {
            const resp = await fetch("/api/citas/confirmar", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            });
            const resJson = await resp.json();
            alert(resJson.mensaje || resJson.error);
          } catch (err) {
            alert("Error al enviar el correo");
          }
        });
      });
    } catch {
      contenedor.innerHTML = "<p>Error al cargar las citas.</p>";
    }
  }

  btnHoy.addEventListener("click", () => {
    modalHoy.style.display = "flex";
    cargarCitas("/api/citas/hoy", listaHoy);
  });

  btnManana.addEventListener("click", () => {
    modalManana.style.display = "flex";
    cargarCitas("/api/citas/manana", listaManana);
  });

  cerrarHoy.addEventListener("click", () => (modalHoy.style.display = "none"));
  cerrarManana.addEventListener(
    "click",
    () => (modalManana.style.display = "none")
  );

  window.addEventListener("click", (e) => {
    if (e.target === modalHoy) modalHoy.style.display = "none";
    if (e.target === modalManana) modalManana.style.display = "none";
  });
});
