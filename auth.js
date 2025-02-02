class AuthManager {
    constructor() {
        this.init();
    }

    async init() {
        const token = this.getTokenFromURL();
        if (token) {
            localStorage.setItem('jwt', token);
            window.history.replaceState({}, '', window.location.pathname);
        }

        await this.checkAuth();
        this.applyRoleBasedUI();
    }

    getTokenFromURL() {
        const params = new URLSearchParams(window.location.search);
        return params.get('token');
    }

    async checkAuth() {
        const token = localStorage.getItem('jwt');
        
        if (!token) {
            this.redirectToAuth();
            return;
        }

        try {
            const response = await fetch('https://richmom.vercel.app/verify', {
                method: 'POST',
                headers: { 'Authorization': token }
            });
            
            const data = await response.json();
            
            if (!data.valid) {
                this.redirectToAuth();
            } else {
                this.currentUser = data.user;
            }
        } catch (error) {
            this.redirectToAuth();
        }
    }

    applyRoleBasedUI() {
        const role = this.currentUser?.role;
        
        // Пример: скрываем премиум-контент
        if (role !== 'vip' && role !== 'admin') {
            document.querySelectorAll('.premium-content').forEach(el => el.remove());
        }
        
        // Показываем админ-панель
        if (role === 'admin') {
            document.getElementById('admin-panel').style.display = 'block';
        }
    }

    redirectToAuth() {
        const currentSite = encodeURIComponent(window.location.href);
        window.location.href = `https://richmom.vercel.app/index.html?source=${currentSite}`;
    }
}

// Инициализация при загрузке
//document.addEventListener('DOMContentLoaded', () => new AuthManager());