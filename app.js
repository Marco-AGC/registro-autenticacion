// REGISTRO DE USUARIOS
document.getElementById('registroForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    const confirmPassword = document.getElementById('confirmPassword').value.trim();
    const email = document.getElementById('email').value.trim();
    const role = document.getElementById('role').value;
    const securityWord = document.getElementById('securityWord')?.value.trim();

    if (!securityWord || securityWord.length < 3) {
        alert("La palabra de seguridad debe tener al menos 3 caracteres.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Las contraseñas no coinciden.");
        return;
    }
    if (password.length < 6) {
        alert("La contraseña debe tener al menos 6 caracteres.");
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];

    if (users.some(u => u.username === username)) {
        alert("El nombre de usuario ya existe.");
        return;
    }

    users.push({ username, password, email, role, securityWord });
    localStorage.setItem('users', JSON.stringify(users));

    // Enviar email con EmailJS
    const templateParams = {
        to_name: username,
        to_email: email,
        message: "Ha sido registrado con éxito."
    };

    emailjs.send('service_el41jre', 'template_yihks9u', templateParams)
        .then(() => {
            alert("Usuario registrado correctamente y correo enviado.");
            this.reset();
        }, (error) => {
            alert("Usuario registrado correctamente pero no se pudo enviar el correo.");
            console.error('Error EmailJS:', error);
            this.reset();
        });
});

// INICIO DE SESIÓN
document.getElementById('loginForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value.trim();

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        sessionStorage.setItem('activeUser', username);
        alert("Inicio de sesión exitoso.");
        window.location.href = 'pages/integrantes.html';
    } else {
        alert('❌ Usuario o contraseña incorrectos.');
    }
});

// RECUPERACIÓN DE CONTRASEÑA (redirige a verificar.html con usuario en URL)
document.getElementById('recoveryForm')?.addEventListener('submit', function(event) {
    event.preventDefault();

    const recoveryUsername = document.getElementById('recoveryUsername').value.trim();
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(user => user.username === recoveryUsername);

    if (!user) {
        alert("Usuario no encontrado.");
        return;
    }

    window.location.href = `verificar.html?user=${encodeURIComponent(recoveryUsername)}`;
});

// VERIFICACIÓN DE PALABRA DE SEGURIDAD Y CAMBIO DE CONTRASEÑA
(function initPasswordChange() {
    if (!window.location.pathname.endsWith("verificar.html")) return;

    const params = new URLSearchParams(window.location.search);
    const username = params.get("user");
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username);

    const securityForm = document.getElementById('securityForm');
    const passwordForm = document.getElementById('passwordForm');
    const message = document.getElementById('message');

    if (!user) {
        message.textContent = "❌ Usuario no encontrado.";
        return;
    }

    // Paso 1: Verificar palabra de seguridad
    securityForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        const inputWord = document.getElementById('securityAnswer').value.trim();
        if (inputWord.toLowerCase() === user.securityWord.toLowerCase()) {
            securityForm.style.display = 'none';
            passwordForm.style.display = 'block';
        } else {
            alert("❌ Palabra de seguridad incorrecta.");
        }
    });

    // Paso 2: Cambiar la contraseña
    passwordForm?.addEventListener('submit', function(e) {
        e.preventDefault();
        const newPassword = document.getElementById('newPassword').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();

        if (newPassword.length < 6) {
            alert("La contraseña debe tener al menos 6 caracteres.");
            return;
        }
        if (newPassword !== confirmPassword) {
            alert("Las contraseñas no coinciden.");
            return;
        }

        const index = users.findIndex(u => u.username === username);
        if (index !== -1) {
            users[index].password = newPassword;
            localStorage.setItem('users', JSON.stringify(users));
            alert("✅ Contraseña actualizada correctamente.");
            window.location.href = "index.html";
        } else {
            alert("❌ Usuario no encontrado.");
        }
    });
})();
