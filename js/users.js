(function () {
    const storage = window.hospitalStorage;

    function createUser(data) {
        const users = storage.getUsers();
        const newUser = {
            id: Date.now(),
            name: data.name,
            email: data.email,
            password: data.password || '123456',
            role: data.role || 'patient'
        };
        users.push(newUser);
        storage.saveUsers(users);
        return newUser;
    }

    function updateUser(id, data) {
        const users = storage.getUsers();
        const index = users.findIndex((user) => user.id === Number(id));
        if (index === -1) return null;
        users[index] = { ...users[index], ...data, id: Number(id) };
        storage.saveUsers(users);
        return users[index];
    }

    function deleteUser(id) {
        const users = storage.getUsers().filter((user) => user.id !== Number(id));
        storage.saveUsers(users);
        return users;
    }

    function getUsersByRole(role) {
        return storage.getUsers().filter((user) => user.role === role);
    }

    window.hospitalUsers = { createUser, updateUser, deleteUser, getUsersByRole };
})();
