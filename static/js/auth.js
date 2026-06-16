class AuthManager {
    constructor() {
        this.currentUser = null;
        this.qrCanvas = null;
        this.init();
    }

    init() {
        this.checkSession();
        this.bindEvents();
    }

    checkSession() {
        fetch('/api/auth/me')
            .then(r => r.json())
            .then(data => {
                if (data.logged_in) {
                    this.currentUser = data.user;
                    this.showLoggedInState(data.user);
                } else {
                    this.showLoggedOutState();
                }
            })
            .catch(() => this.showLoggedOutState());
    }

    bindEvents() {
        document.getElementById('authLoginBtn')?.addEventListener('click', () => this.login());
        document.getElementById('authRegisterBtn')?.addEventListener('click', () => this.register());
        document.getElementById('authLogoutBtn')?.addEventListener('click', () => this.logout());
        document.getElementById('showRegisterLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('loginForm').classList.add('d-none');
            document.getElementById('registerForm').classList.remove('d-none');
        });
        document.getElementById('showLoginLink')?.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('registerForm').classList.add('d-none');
            document.getElementById('loginForm').classList.remove('d-none');
        });
        document.getElementById('generateQRBtn')?.addEventListener('click', () => this.generateQR());
    }

    async login() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;
        if (!username || !password) return this.showAuthMsg('Please fill in all fields.', 'danger');

        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
            this.currentUser = data.user;
            this.showLoggedInState(data.user);
            this.closeModal();
        } else {
            this.showAuthMsg(data.message || 'Login failed.', 'danger');
        }
    }

    async register() {
        const username = document.getElementById('regUsername').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const password = document.getElementById('regPassword').value;
        if (!username || !email || !password) return this.showAuthMsg('Please fill in all fields.', 'danger', true);

        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        const data = await res.json();
        if (data.success) {
            this.currentUser = data.user;
            this.showLoggedInState(data.user);
            this.closeModal();
        } else {
            this.showAuthMsg(data.message || 'Registration failed.', 'danger', true);
        }
    }

    async logout() {
        await fetch('/api/auth/logout', { method: 'POST' });
        this.currentUser = null;
        this.showLoggedOutState();
    }

    async generateQR() {
        if (!this.currentUser) return;
        const res = await fetch('/api/auth/qr-token');
        const data = await res.json();
        if (!data.token) return;

        const qrUrl = window.location.origin + '/qr-login/' + data.token;
        const container = document.getElementById('qrCodeContainer');
        container.innerHTML = '';

        if (typeof QRCode !== 'undefined') {
            new QRCode(container, {
                text: qrUrl,
                width: 180,
                height: 180,
                colorDark: '#ffffff',
                colorLight: '#1a1a2e',
                correctLevel: QRCode.CorrectLevel.M
            });
        }

        document.getElementById('qrLoginUrl').textContent = qrUrl;
        document.getElementById('qrSection').classList.remove('d-none');
        document.getElementById('qrExpiry').textContent = 'Expires in 10 minutes';
    }

    showLoggedInState(user) {
        document.getElementById('authLoggedOut')?.classList.add('d-none');
        document.getElementById('authLoggedIn')?.classList.remove('d-none');
        document.getElementById('authUsername')?.querySelectorAll('.auth-username-text').forEach(el => {
            el.textContent = user.username;
        });
        const nameEl = document.getElementById('loggedInUsername');
        if (nameEl) nameEl.textContent = user.username;

        const headerUser = document.getElementById('headerUserBadge');
        if (headerUser) {
            headerUser.textContent = '👤 ' + user.username;
            headerUser.classList.remove('d-none');
        }
    }

    showLoggedOutState() {
        document.getElementById('authLoggedOut')?.classList.remove('d-none');
        document.getElementById('authLoggedIn')?.classList.add('d-none');
        const headerUser = document.getElementById('headerUserBadge');
        if (headerUser) headerUser.classList.add('d-none');
    }

    showAuthMsg(msg, type, isRegister = false) {
        const id = isRegister ? 'regAuthMsg' : 'loginAuthMsg';
        const el = document.getElementById(id);
        if (el) {
            el.textContent = msg;
            el.className = `alert alert-${type} mt-2 py-1`;
            el.classList.remove('d-none');
        }
    }

    closeModal() {
        const modal = bootstrap.Modal.getInstance(document.getElementById('authModal'));
        if (modal) modal.hide();
        document.getElementById('loginAuthMsg')?.classList.add('d-none');
        document.getElementById('regAuthMsg')?.classList.add('d-none');
    }

    syncSessionToBackend(sessionData) {
        if (!this.currentUser) return;
        fetch('/api/sessions/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        }).catch(() => {});
    }
}

window.authManager = new AuthManager();
