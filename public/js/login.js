document.addEventListener("DOMContentLoaded", function () {
  console.log("Script login.js cargado ✅");

  // 🔧 Detectar si está en local o producción
  const backendUrl = window.location.hostname.includes("localhost")
    ? "http://127.0.0.1:5000"
    : "https://backendhiperceramicack.onrender.com"; // ⬅️ reemplaza por tu dominio de Render

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginForm = document.getElementById("login-form");

  console.log("Verificando elementos...");
  console.log("Email:", emailInput);
  console.log("Password:", passwordInput);
  console.log("Formulario:", loginForm);

  if (!emailInput || !passwordInput || !loginForm) {
    console.error("ERROR: No se encontraron los elementos del formulario");
    return;
  }

  loginForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    console.log("Botón de inicio de sesión presionado");

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    console.log("Datos ingresados:", { email, password });

    if (!email || !password) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    console.log("Enviando datos al servidor...");
    try {
      const response = await fetch(`${backendUrl}/login`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          correo: email,
          contraseña: password,
        }),
      });

      console.log("Estado de la respuesta:", response.status);
      const data = await response.json();
      console.log("Respuesta del servidor:", data);

      if (response.ok) {
        // ✅ Guardar información en localStorage
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("nombre", data.nombre);
        localStorage.setItem("correo", data.correo);
        localStorage.setItem("telefono", data.telefono);
        localStorage.setItem("rol", data.rol);
        localStorage.setItem("rol_id", data.rol_id);

        alert("Inicio de sesión exitoso 🎉");

        // ⏳ Redirigir a la vista principal
        setTimeout(() => {
          window.location.href = "/views/main.html";
        }, 800);
      } else {
        alert(data.error || "Credenciales incorrectas ❌");
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("No se pudo conectar con el servidor ⚠️");
    }
  });
});
