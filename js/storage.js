(function () {
    const STORAGE_KEYS = {
        users: 'hospital_users',
        appointments: 'hospital_appointments',
        availability: 'hospital_availability',
        currentUser: 'hospital_current_user'
    };

    function readStorage(key, fallback) {
        const raw = localStorage.getItem(key);
        if (!raw) return fallback;
        try {
            return JSON.parse(raw);
        } catch (error) {
            localStorage.removeItem(key);
            return fallback;
        }
    }

    function writeStorage(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
        return value;
    }

    function seedData() {
        const users = readStorage(STORAGE_KEYS.users, []);
        if (users.length === 0) {
            const defaultUsers = [
                { id: 1, name: 'Admin General', email: 'admin@hospital.com', password: '123456', role: 'admin' },
                { id: 2, name: 'Dra. Ana Torres', email: 'ana@hospital.com', password: '123456', role: 'doctor' },
                { id: 3, name: 'Luis Pérez', email: 'luis@hospital.com', password: '123456', role: 'patient' }
            ];
            writeStorage(STORAGE_KEYS.users, defaultUsers);
        }

        const availability = readStorage(STORAGE_KEYS.availability, []);
        if (availability.length === 0) {
            const defaultAvailability = [
                { id: 1, doctorId: 2, doctorName: 'Dra. Ana Torres', date: '2026-08-06', time: '09:00', specialty: 'Cardiología', status: 'active' },
                { id: 2, doctorId: 2, doctorName: 'Dra. Ana Torres', date: '2026-08-06', time: '11:00', specialty: 'Cardiología', status: 'active' }
            ];
            writeStorage(STORAGE_KEYS.availability, defaultAvailability);
        }

        const appointments = readStorage(STORAGE_KEYS.appointments, []);
        if (appointments.length === 0) {
            const defaultAppointments = [
                { id: 1, patientId: 3, patientName: 'Luis Pérez', doctorId: 2, doctorName: 'Dra. Ana Torres', date: '2026-08-06', time: '09:00', status: 'pendiente', specialty: 'Cardiología' }
            ];
            writeStorage(STORAGE_KEYS.appointments, defaultAppointments);
        }
    }

    seedData();

    window.hospitalStorage = {
        STORAGE_KEYS,
        getUsers: () => readStorage(STORAGE_KEYS.users, []),
        saveUsers: (users) => writeStorage(STORAGE_KEYS.users, users),
        getAppointments: () => readStorage(STORAGE_KEYS.appointments, []),
        saveAppointments: (appointments) => writeStorage(STORAGE_KEYS.appointments, appointments),
        getAvailability: () => readStorage(STORAGE_KEYS.availability, []),
        saveAvailability: (items) => writeStorage(STORAGE_KEYS.availability, items),
        getCurrentUser: () => readStorage(STORAGE_KEYS.currentUser, null),
        setCurrentUser: (user) => writeStorage(STORAGE_KEYS.currentUser, user),
        clearCurrentUser: () => {
            localStorage.removeItem(STORAGE_KEYS.currentUser);
            return null;
        },
        logout: () => {
            localStorage.removeItem(STORAGE_KEYS.currentUser);
            return true;
        }
    };
})();
