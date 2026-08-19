function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    if (!element) return;
    element.className = `alert alert-${type} mt-3`;
    element.textContent = message;
}

function clearMessage(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.className = '';
    }
}

function getRoleLabel(role) {
    const roles = {
        admin: 'Administrador',
        doctor: 'Doctor',
        patient: 'Paciente'
    };
    return roles[role] || role;
}

function formatStatus(status) {
    const statusMap = {
        pendiente: 'Pendiente',
        confirmada: 'Confirmada',
        atendida: 'Atendida',
        cancelada: 'Cancelada'
    };
    return statusMap[status] || status;
}

function populateDoctorSelect(select, selectedValue = '') {
    const doctors = window.hospitalStorage.getUsers().filter((user) => user.role === 'doctor');
    if (!select) return;
    select.innerHTML = '<option value="">Seleccione un doctor</option>';
    doctors.forEach((doctor) => {
        const option = document.createElement('option');
        option.value = doctor.id;
        option.textContent = doctor.name;
        if (selectedValue && String(selectedValue) === String(doctor.id)) option.selected = true;
        select.appendChild(option);
    });
}
