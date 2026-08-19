(function () {
    const auth = window.hospitalAuth;

    function normalizePath(path) {
        return path.replace(/\\/g, '/');
    }

    function getBasePath() {
        const path = normalizePath(window.location.pathname);
        return path.includes('/pages/') ? '../../' : '';
    }

    function redirectToLogin() {
        window.location.href = `${getBasePath()}index.html`;
    }

    function redirectToDashboard() {
        window.location.href = `${getBasePath()}dashboard.html`;
    }

    function requireAuth() {
        const user = auth.getCurrentUser();
        if (!user) {
            redirectToLogin();
            return null;
        }
        return user;
    }

    function requireRole(allowedRoles) {
        const user = requireAuth();
        if (!user) return null;
        if (!allowedRoles.includes(user.role)) {
            redirectToDashboard();
            return null;
        }
        return user;
    }

    window.hospitalGuards = { requireAuth, requireRole };
})();
