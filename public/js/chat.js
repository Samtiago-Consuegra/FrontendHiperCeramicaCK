document.addEventListener("DOMContentLoaded", () => {
  const chatBox = document.getElementById("chat-box");
  const userInput = document.getElementById("user-input");
  const sendBtn = document.getElementById("send-btn");

  userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  sendBtn.addEventListener("click", sendMessage);
  function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    appendMessage("usuario", message);
    userInput.value = "";

    fetch("http://localhost:5005/webhooks/rest/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sender: "usuario_web", message }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.length > 0) {
          data.forEach((msg) => {
            if (msg.text) appendMessage("bot", msg.text);
          });
        } else {
          appendMessage("bot", "No entendí, ¿puedes repetirlo?");
        }
      })
      .catch((err) => {
        console.error("Error al conectar con Rasa:", err);
        appendMessage("bot", "Error al conectar con el servidor.");
      });
  }

  function appendMessage(sender, text) {
    const msgDiv = document.createElement("div");
    msgDiv.classList.add("mensaje", sender === "bot" ? "mensaje-bot" : "mensaje-usuario");
    msgDiv.textContent = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  const userToggle = document.getElementById("user-toggle");
  const dropdownMenu = document.getElementById("dropdown-menu");

  if (userToggle && dropdownMenu) {
    userToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.style.display = dropdownMenu.style.display === "block" ? "none" : "block";
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
});
