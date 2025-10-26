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

  // 🚪 Cerrar sesión
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

  // 👤 Modal Perfil de Usuario
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

      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) =>
        c.classList.remove("active")
      );
      document
        .querySelector(".tab[data-tab='informacion']")
        .classList.add("active");
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
      document.querySelectorAll(".tab-content").forEach((c) =>
        c.classList.remove("active")
      );
      tab.classList.add("active");
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  const mesSelect = document.getElementById("mes");
  const anioSelect = document.getElementById("anio");
  const formFiltros = document.getElementById("form-filtros");

  if (mesSelect && anioSelect) {
    const actualizarMesYAnio = () => {
      const now = new Date();
      const mesActual = now.getMonth() + 1;
      const anioActual = now.getFullYear();

      if (mesSelect.querySelector(`option[value="${mesActual}"]`)) {
        mesSelect.value = mesActual.toString();
      }
      if (anioSelect.querySelector(`option[value="${anioActual}"]`)) {
        anioSelect.value = anioActual.toString();
      }
    };
    actualizarMesYAnio();
    setInterval(actualizarMesYAnio, 1000 * 60 * 60 * 24);
  }

  if (formFiltros) {
    formFiltros.addEventListener("submit", async (e) => {
      e.preventDefault();

      const mes = mesSelect.value;
      const anio = anioSelect.value;
      const calidad = document.getElementById("calidad").value;
      const tipo = document.getElementById("tipo").value;

      if (!mes || !anio || !calidad || !tipo) {
        alert("Por favor completa todos los filtros antes de generar el reporte.");
        return;
      }

      try {
        const formData = new FormData(formFiltros);
        const response = await fetch("http://127.0.0.1:5000/generar_reporte", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Error al generar el reporte.");
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download =
          tipo === "inventario"
            ? `Reporte_Inventario_${mes}_${anio}.pdf`
            : `Reporte_Ventas_${mes}_${anio}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error(err);
        alert("No se pudo generar el reporte.");
      }
    });
  }
});
