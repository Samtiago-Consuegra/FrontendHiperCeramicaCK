document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("register-form");

  if (!registerForm) {
    console.error("No se encontró el formulario de registro.");
    return;
  }

  // 🔧 Detectar entorno: local o producción
  const backendUrl = window.location.hostname.includes("localhost")
    ? "http://127.0.0.1:5000"
    : "https://tu-backend.onrender.com"; // ⚠️ reemplázalo con tu URL real de Render

  registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = {
      nombre_apellido: document.getElementById("nombre_apellido").value.trim(),
      cedula: document.getElementById("cedula").value.trim(),
      correo: document.getElementById("correo").value.trim(),
      contraseña: document.getElementById("contraseña").value.trim(),
      telefono: document.getElementById("telefono").value.trim(),
      direccion: document.getElementById("direccion").value.trim(),
      rol_id: parseInt(document.getElementById("rol_id").value, 10),
    };

    // 🧩 Validar campos antes de enviar
    for (const [key, value] of Object.entries(formData)) {
      if (!value) {
        alert(`Por favor completa el campo: ${key.replace("_", " ")}`);
        return;
      }
    }

    try {
      const response = await fetch(`${backendUrl}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Registro exitoso");
        window.location.href = "/views/login.html";
      } else {
        alert(`❌ Error: ${data.message || "No se pudo registrar el usuario"}`);
      }
    } catch (error) {
      console.error("Error de conexión:", error);
      alert("⚠️ No se pudo conectar con el servidor. Intenta más tarde.");
    }
  });
});
