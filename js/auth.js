(function () {
    const storage = window.hospitalStorage;

    function getUserByEmail(email) {
        return storage.getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
    }

    function login(email, password) {
        const user = getUserByEmail(email);
        if (!user || user.password !== password) {
            return null;
        }

        const authenticatedUser = { ...user };
        storage.setCurrentUser(authenticatedUser);
        return authenticatedUser;
    }

    function registerUser(data) {
        const users = storage.getUsers();
        const exists = users.some((user) => user.email.toLowerCase() === data.email.toLowerCase());
        if (exists) {
            return { success: false, message: 'Ya existe un usuario con ese correo.' };
        }

        const newUser = {
            id: Date.now(),
            name: data.name,
            email: data.email,
            password: data.password,
            role: 'patient'
        };

        users.push(newUser);
        storage.saveUsers(users);
        storage.setCurrentUser(newUser);
        return { success: true, user: newUser };
    }

    window.hospitalAuth = {
        login,
        registerUser,
        getUserByEmail,
        getCurrentUser: () => storage.getCurrentUser(),
        logout: () => storage.logout()
    };
})();
