document.addEventListener('DOMContentLoaded', () => {
    const currentUser = window.hospitalAuth?.getCurrentUser();

    function normalizePath(path) {
        return path.replace(/\\/g, '/');
    }

    function isCurrentPage(pagePath) {
        return normalizePath(window.location.pathname).endsWith(pagePath);
    }

    const currentPath = normalizePath(window.location.pathname);

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();

            if (!email || !password) {
                showMessage('message', 'Completa ambos campos.', 'danger');
                return;
            }

            const user = window.hospitalAuth.login(email, password);
            if (!user) {
                showMessage('message', 'Credenciales incorrectas.', 'danger');
                return;
            }

            window.location.href = 'dashboard.html';
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();

            if (!name || !email || !password || !confirmPassword) {
                showMessage('message', 'Todos los campos son obligatorios.', 'danger');
                return;
            }

            if (password.length < 6) {
                showMessage('message', 'La contraseña debe tener al menos 6 caracteres.', 'danger');
                return;
            }

            if (password !== confirmPassword) {
                showMessage('message', 'Las contraseñas no coinciden.', 'danger');
                return;
            }

            const result = window.hospitalAuth.registerUser({ name, email, password });
            if (!result.success) {
                showMessage('message', result.message, 'danger');
                return;
            }

            showMessage('message', 'Registro exitoso. Redirigiendo...', 'success');
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 800);
        });
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            window.hospitalAuth.logout();
            window.location.href = 'index.html';
        });
    }

    if (isCurrentPage('dashboard.html')) {
        const user = window.hospitalGuards.requireAuth();
        if (!user) return;

        document.getElementById('userName').textContent = user.name;
        document.querySelectorAll('.admin-option').forEach((el) => {
            el.style.display = user.role === 'admin' ? 'block' : 'none';
        });
        document.querySelectorAll('.doctor-option').forEach((el) => {
            el.style.display = user.role === 'doctor' ? 'block' : 'none';
        });
        document.querySelectorAll('.patient-option').forEach((el) => {
            el.style.display = user.role === 'patient' ? 'block' : 'none';
        });

        const users = window.hospitalStorage.getUsers();
        document.getElementById('totalUsers').textContent = users.length;
        document.getElementById('totalDoctors').textContent = users.filter((u) => u.role === 'doctor').length;
        document.getElementById('totalPatients').textContent = users.filter((u) => u.role === 'patient').length;
        document.getElementById('totalAppointments').textContent = window.hospitalAppointments.getAllAppointments().length;

        const appointments = window.hospitalAppointments.getAllAppointments().slice(-5).reverse();
        const tableBody = document.getElementById('appointmentsTable');
        tableBody.innerHTML = '';
        if (!appointments.length) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay citas registradas.</td></tr>';
            return;
        }

        appointments.forEach((appointment) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${appointment.patientName}</td>
                <td>${appointment.doctorName}</td>
                <td>${appointment.date}</td>
                <td>${appointment.time}</td>
                <td><span class="badge bg-info text-dark">${formatStatus(appointment.status)}</span></td>`;
            tableBody.appendChild(row);
        });
    }

    if (isCurrentPage('pages/admin/usuarios.html')) {
        const user = window.hospitalGuards.requireRole(['admin']);
        if (!user) return;
        const form = document.getElementById('userForm');
        const tableBody = document.getElementById('usersTable');
        const title = document.getElementById('formTitle');
        const hiddenId = document.getElementById('userId');

        function renderUsers() {
            const users = window.hospitalStorage.getUsers();
            tableBody.innerHTML = '';
            users.forEach((item) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${item.name}</td>
                    <td>${item.email}</td>
                    <td>${getRoleLabel(item.role)}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${item.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${item.id}">Eliminar</button>
                    </td>`;
                tableBody.appendChild(row);
            });
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const payload = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                password: document.getElementById('password').value.trim(),
                role: document.getElementById('role').value
            };

            if (!payload.name || !payload.email || !payload.role) {
                showMessage('message', 'Completa los campos obligatorios.', 'danger');
                return;
            }

            if (hiddenId.value) {
                window.hospitalUsers.updateUser(hiddenId.value, payload);
                showMessage('message', 'Usuario actualizado.', 'success');
            } else {
                window.hospitalUsers.createUser(payload);
                showMessage('message', 'Usuario creado.', 'success');
            }

            form.reset();
            hiddenId.value = '';
            title.textContent = 'Crear Usuario';
            renderUsers();
        });

        tableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const id = button.getAttribute('data-id');
            if (button.getAttribute('data-action') === 'delete') {
                window.hospitalUsers.deleteUser(id);
                renderUsers();
                showMessage('message', 'Usuario eliminado.', 'warning');
                return;
            }

            const editUser = window.hospitalStorage.getUsers().find((item) => item.id === Number(id));
            document.getElementById('name').value = editUser.name;
            document.getElementById('email').value = editUser.email;
            document.getElementById('password').value = editUser.password;
            document.getElementById('role').value = editUser.role;
            hiddenId.value = editUser.id;
            title.textContent = 'Editar Usuario';
        });

        renderUsers();
    }

    if (isCurrentPage('pages/admin/roles.html')) {
        const user = window.hospitalGuards.requireRole(['admin']);
        if (!user) return;
        const container = document.getElementById('roleList');

        function renderRoles() {
            const users = window.hospitalStorage.getUsers();
            container.innerHTML = '';
            users.forEach((item) => {
                const row = document.createElement('div');
                row.className = 'row align-items-center border-bottom py-2';
                row.innerHTML = `
                    <div class="col-md-6"><strong>${item.name}</strong><br><small>${item.email}</small></div>
                    <div class="col-md-4">
                        <select class="form-select role-select" data-id="${item.id}">
                            <option value="admin" ${item.role === 'admin' ? 'selected' : ''}>Administrador</option>
                            <option value="doctor" ${item.role === 'doctor' ? 'selected' : ''}>Doctor</option>
                            <option value="patient" ${item.role === 'patient' ? 'selected' : ''}>Paciente</option>
                        </select>
                    </div>
                    <div class="col-md-2 text-end"><button class="btn btn-sm btn-primary save-role" data-id="${item.id}">Guardar</button></div>`;
                container.appendChild(row);
            });
        }

        container.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const id = button.getAttribute('data-id');
            const select = container.querySelector(`.role-select[data-id="${id}"]`);
            window.hospitalUsers.updateUser(id, { role: select.value });
            showMessage('message', 'Rol actualizado.', 'success');
        });

        renderRoles();
    }

    if (isCurrentPage('pages/admin/citas.html')) {
        const user = window.hospitalGuards.requireRole(['admin']);
        if (!user) return;
        const form = document.getElementById('appointmentForm');
        const tableBody = document.getElementById('appointmentTable');
        const patientSelect = document.getElementById('patientId');
        const doctorSelect = document.getElementById('doctorId');

        function renderAppointments() {
            const appointments = window.hospitalAppointments.getAllAppointments();
            tableBody.innerHTML = '';
            appointments.forEach((appointment) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${appointment.patientName}</td>
                    <td>${appointment.doctorName}</td>
                    <td>${appointment.date}</td>
                    <td>${appointment.time}</td>
                    <td>
                        <select class="form-select status-select" data-id="${appointment.id}">
                            <option value="pendiente" ${appointment.status === 'pendiente' ? 'selected' : ''}>Pendiente</option>
                            <option value="confirmada" ${appointment.status === 'confirmada' ? 'selected' : ''}>Confirmada</option>
                            <option value="atendida" ${appointment.status === 'atendida' ? 'selected' : ''}>Atendida</option>
                            <option value="cancelada" ${appointment.status === 'cancelada' ? 'selected' : ''}>Cancelada</option>
                        </select>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${appointment.id}">Eliminar</button>
                    </td>`;
                tableBody.appendChild(row);
            });
        }

        function populatePatients() {
            const patients = window.hospitalStorage.getUsers().filter((item) => item.role === 'patient');
            patientSelect.innerHTML = '<option value="">Seleccione paciente</option>';
            patients.forEach((patient) => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = patient.name;
                patientSelect.appendChild(option);
            });
        }

        populatePatients();
        populateDoctorSelect(doctorSelect);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const patient = window.hospitalStorage.getUsers().find((item) => item.id === Number(patientSelect.value));
            const doctor = window.hospitalStorage.getUsers().find((item) => item.id === Number(doctorSelect.value));
            window.hospitalAppointments.createAppointment({
                patientId: patient.id,
                patientName: patient.name,
                doctorId: doctor.id,
                doctorName: doctor.name,
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                specialty: document.getElementById('specialty').value,
                status: 'pendiente'
            });
            showMessage('message', 'Cita creada.', 'success');
            form.reset();
            renderAppointments();
        });

        tableBody.addEventListener('change', (event) => {
            const select = event.target.closest('select.status-select');
            if (!select) return;
            window.hospitalAppointments.updateAppointment(select.getAttribute('data-id'), { status: select.value });
            showMessage('message', 'Estado actualizado.', 'success');
        });

        tableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button[data-action="delete"]');
            if (!button) return;
            window.hospitalAppointments.deleteAppointment(button.getAttribute('data-id'));
            renderAppointments();
            showMessage('message', 'Cita eliminada.', 'warning');
        });

        renderAppointments();
    }

    if (isCurrentPage('pages/doctor/disponibilidad.html')) {
        const user = window.hospitalGuards.requireRole(['doctor']);
        if (!user) return;
        const form = document.getElementById('availabilityForm');
        const tableBody = document.getElementById('availabilityTable');
        const hiddenId = document.getElementById('availabilityId');

        function renderAvailability() {
            const slots = window.hospitalAvailability.getAvailabilityByDoctor(user.id);
            tableBody.innerHTML = '';
            slots.forEach((slot) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${slot.date}</td>
                    <td>${slot.time}</td>
                    <td>${slot.specialty}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary me-2" data-action="edit" data-id="${slot.id}">Editar</button>
                        <button class="btn btn-sm btn-outline-danger" data-action="delete" data-id="${slot.id}">Eliminar</button>
                    </td>`;
                tableBody.appendChild(row);
            });
        }

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const payload = {
                doctorId: user.id,
                doctorName: user.name,
                date: document.getElementById('availabilityDate').value,
                time: document.getElementById('availabilityTime').value,
                specialty: document.getElementById('specialty').value
            };
            if (hiddenId.value) {
                window.hospitalAvailability.updateAvailability(hiddenId.value, payload);
                showMessage('message', 'Disponibilidad actualizada.', 'success');
            } else {
                window.hospitalAvailability.createAvailability(payload);
                showMessage('message', 'Disponibilidad registrada.', 'success');
            }
            form.reset();
            hiddenId.value = '';
            renderAvailability();
        });

        tableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const id = button.getAttribute('data-id');
            if (button.getAttribute('data-action') === 'delete') {
                window.hospitalAvailability.deleteAvailability(id);
                renderAvailability();
                showMessage('message', 'Disponibilidad eliminada.', 'warning');
                return;
            }
            const slot = window.hospitalStorage.getAvailability().find((item) => item.id === Number(id));
            document.getElementById('availabilityDate').value = slot.date;
            document.getElementById('availabilityTime').value = slot.time;
            document.getElementById('specialty').value = slot.specialty;
            hiddenId.value = slot.id;
        });

        renderAvailability();
    }

    if (isCurrentPage('pages/doctor/citas.html')) {
        const user = window.hospitalGuards.requireRole(['doctor']);
        if (!user) return;
        const tableBody = document.getElementById('doctorAppointments');

        function renderAppointments() {
            const appointments = window.hospitalAppointments.getAppointmentsByDoctor(user.id);
            tableBody.innerHTML = '';
            appointments.forEach((appointment) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${appointment.patientName}</td>
                    <td>${appointment.date}</td>
                    <td>${appointment.time}</td>
                    <td>${formatStatus(appointment.status)}</td>
                    <td>
                        <button class="btn btn-sm btn-success me-2" data-action="attend" data-id="${appointment.id}">Atender</button>
                        <button class="btn btn-sm btn-outline-primary" data-action="confirm" data-id="${appointment.id}">Confirmar</button>
                    </td>`;
                tableBody.appendChild(row);
            });
        }

        tableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            const id = Number(button.getAttribute('data-id'));
            const action = button.getAttribute('data-action');
            const status = action === 'attend' ? 'atendida' : 'confirmada';
            window.hospitalAppointments.updateAppointment(id, { status });
            renderAppointments();
            showMessage('message', action === 'attend' ? 'Cita marcada como atendida.' : 'Cita confirmada.', 'success');
        });

        renderAppointments();
    }

    if (isCurrentPage('pages/paciente/solicitar-cita.html')) {
        const user = window.hospitalGuards.requireRole(['patient']);
        if (!user) return;
        const form = document.getElementById('appointmentForm');
        const doctorSelect = document.getElementById('doctorId');
        const slotsContainer = document.getElementById('slotsContainer');

        populateDoctorSelect(doctorSelect);

        function renderSlots() {
            const doctorId = doctorSelect.value;
            if (!doctorId) {
                slotsContainer.innerHTML = '<p class="text-muted">Seleccione un doctor para ver disponibilidad.</p>';
                return;
            }
            const slots = window.hospitalAvailability.getAvailabilityByDoctor(doctorId);
            slotsContainer.innerHTML = '';
            slots.forEach((slot) => {
                const card = document.createElement('div');
                card.className = 'border rounded p-3 mb-2';
                card.innerHTML = `<strong>${slot.date}</strong> - ${slot.time} <span class="badge bg-light text-dark">${slot.specialty}</span>`;
                slotsContainer.appendChild(card);
            });
        }

        doctorSelect.addEventListener('change', renderSlots);

        form.addEventListener('submit', (event) => {
            event.preventDefault();
            const doctorId = doctorSelect.value;
            const doctor = window.hospitalStorage.getUsers().find((item) => item.id === Number(doctorId));
            if (!doctor) {
                showMessage('message', 'Seleccione un doctor válido.', 'danger');
                return;
            }
            window.hospitalAppointments.createAppointment({
                patientId: user.id,
                patientName: user.name,
                doctorId: doctor.id,
                doctorName: doctor.name,
                date: document.getElementById('appointmentDate').value,
                time: document.getElementById('appointmentTime').value,
                specialty: document.getElementById('specialty').value,
                status: 'pendiente'
            });
            showMessage('message', 'Solicitud enviada correctamente.', 'success');
            form.reset();
            renderSlots();
        });

        renderSlots();
    }

    if (isCurrentPage('pages/paciente/mis-citas.html')) {
        const user = window.hospitalGuards.requireRole(['patient']);
        if (!user) return;
        const tableBody = document.getElementById('patientAppointments');

        function renderAppointments() {
            const appointments = window.hospitalAppointments.getAppointmentsByPatient(user.id);
            tableBody.innerHTML = '';
            appointments.forEach((appointment) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${appointment.doctorName}</td>
                    <td>${appointment.date}</td>
                    <td>${appointment.time}</td>
                    <td>${formatStatus(appointment.status)}</td>
                    <td><button class="btn btn-sm btn-outline-danger" data-id="${appointment.id}">Cancelar</button></td>`;
                tableBody.appendChild(row);
            });
        }

        tableBody.addEventListener('click', (event) => {
            const button = event.target.closest('button');
            if (!button) return;
            window.hospitalAppointments.updateAppointment(button.getAttribute('data-id'), { status: 'cancelada' });
            renderAppointments();
            showMessage('message', 'Cita cancelada.', 'warning');
        });

        renderAppointments();
    }
});
