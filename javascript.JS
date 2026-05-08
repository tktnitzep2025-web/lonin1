let usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];

const form = document.getElementById('loginForm');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const usernameError = document.getElementById('usernameError');
const passwordError = document.getElementById('passwordError');
const messageDiv = document.getElementById('message');
const rememberCheckbox = document.getElementById('remember');

let isLoginMode = true;

function toggleMode() {
    isLoginMode = !isLoginMode;
    const header = document.querySelector('.login-header h2');
    const subheader = document.querySelector('.login-header p');
    const submitBtn = document.querySelector('.login-btn');
    const links = document.querySelector('.links');
    
    if (isLoginMode) {
        header.textContent = 'Iniciar Sesion';
        subheader.textContent = 'Accede a tu cuenta';
        submitBtn.textContent = 'Ingresar';
        links.innerHTML = `
            <a href="#" id="toggleLink">¿No tienes cuenta? Registrate</a>
            <a href="#" id="forgotLink">¿Olvidaste tu contraseña?</a>
        `;
    } else {
        header.textContent = 'Registrarse';
        subheader.textContent = 'Crea una cuenta nueva';
        submitBtn.textContent = 'Registrarme';
        links.innerHTML = `
            <a href="#" id="toggleLink">¿Ya tienes cuenta? Inicia Sesion</a>
        `;
    }
    
    usernameInput.value = '';
    passwordInput.value = '';
    clearAllErrors();
    
    document.getElementById('toggleLink')?.addEventListener('click', (e) => {
        e.preventDefault();
        toggleMode();
    });
    
    if (!isLoginMode) {
        document.getElementById('forgotLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            handleForgotPassword();
        });
    }
}

function clearAllErrors() {
    usernameError.textContent = '';
    passwordError.textContent = '';
    usernameInput.classList.remove('error');
    passwordInput.classList.remove('error');
    messageDiv.style.display = 'none';
}

function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 3000);
}

function validateForm() {
    let isValid = true;
    
    if (!usernameInput.value.trim()) {
        usernameError.textContent = 'El usuario es requerido';
        usernameInput.classList.add('error');
        isValid = false;
    } else if (usernameInput.value.trim().length < 3) {
        usernameError.textContent = 'El usuario debe tener al menos 3 caracteres';
        usernameInput.classList.add('error');
        isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(usernameInput.value.trim())) {
        usernameError.textContent = 'Solo letras, numeros y guion bajo';
        usernameInput.classList.add('error');
        isValid = false;
    } else {
        usernameError.textContent = '';
        usernameInput.classList.remove('error');
    }
    
    if (!passwordInput.value) {
        passwordError.textContent = 'La contraseña es requerida';
        passwordInput.classList.add('error');
        isValid = false;
    } else if (passwordInput.value.length < 6) {
        passwordError.textContent = 'La contraseña debe tener al menos 6 caracteres';
        passwordInput.classList.add('error');
        isValid = false;
    } else {
        passwordError.textContent = '';
        passwordInput.classList.remove('error');
    }
    
    return isValid;
}

function registerUser(username, password) {
    const userExists = usersDB.some(user => user.username === username);
    
    if (userExists) {
        showMessage('El nombre de usuario ya esta en uso', 'error');
        return false;
    }
    
    const newUser = {
        id: Date.now(),
        username: username,
        password: password,
        createdAt: new Date().toISOString()
    };
    
    usersDB.push(newUser);
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
    
    showMessage('Registro exitoso. Ahora puedes iniciar sesion', 'success');
    
    setTimeout(() => {
        if (!isLoginMode) {
            toggleMode();
        }
    }, 1500);
    
    return true;
}

function loginUser(username, password) {
    const user = usersDB.find(user => user.username === username && user.password === password);
    
    if (user) {
        if (rememberCheckbox.checked) {
            localStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                id: user.id,
                loginTime: new Date().toISOString()
            }));
        } else {
            sessionStorage.setItem('currentUser', JSON.stringify({
                username: user.username,
                id: user.id,
                loginTime: new Date().toISOString()
            }));
        }
        
        showMessage('Bienvenido ' + username, 'success');
        
        setTimeout(() => {
            console.log('Redirigiendo al dashboard...');
        }, 1500);
        
        return true;
    } else {
        showMessage('Usuario o contraseña incorrectos', 'error');
        passwordInput.value = '';
        passwordInput.focus();
        return false;
    }
}

function handleForgotPassword() {
    const username = prompt('Ingresa tu nombre de usuario para recuperar la contraseña:');
    
    if (username) {
        const user = usersDB.find(user => user.username === username);
        
        if (user) {
            showMessage('Tu contraseña es: ' + user.password, 'success');
        } else {
            showMessage('Usuario no encontrado', 'error');
        }
    }
}

function handleSubmit(event) {
    event.preventDefault();
    
    if (!validateForm()) {
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    if (isLoginMode) {
        loginUser(username, password);
    } else {
        registerUser(username, password);
    }
}

function checkExistingSession() {
    const savedUser = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    
    if (savedUser) {
        const user = JSON.parse(savedUser);
        showMessage('Sesion activa como ' + user.username, 'success');
        usernameInput.value = user.username;
    }
}

function clearErrors() {
    if (this === usernameInput) {
        usernameError.textContent = '';
        usernameInput.classList.remove('error');
    } else if (this === passwordInput) {
        passwordError.textContent = '';
        passwordInput.classList.remove('error');
    }
}

form.addEventListener('submit', handleSubmit);
usernameInput.addEventListener('input', clearErrors);
passwordInput.addEventListener('input', clearErrors);

document.addEventListener('DOMContentLoaded', () => {
    checkExistingSession();
    toggleMode();
});