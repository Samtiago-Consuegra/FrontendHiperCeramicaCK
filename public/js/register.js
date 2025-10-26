document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const formData = {
            nombre_apellido: document.getElementById("nombre_apellido").value,
            cedula: document.getElementById("cedula").value,
            correo: document.getElementById("correo").value,
            contraseña: document.getElementById("contraseña").value,
            telefono: document.getElementById("telefono").value,
            direccion: document.getElementById("direccion").value,
            rol_id: document.getElementById("rol_id").value
        };

        const response = await fetch("/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (response.ok) {
            alert("Registro exitoso");
            window.location.href = "/views/login.html"; 
        } else {
            alert("Error: " + data.message);
        }
    });
});
