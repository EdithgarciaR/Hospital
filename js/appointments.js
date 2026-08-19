(function () {
    const storage = window.hospitalStorage;

    function createAppointment(data) {
        const appointments = storage.getAppointments();
        const appointment = {
            id: Date.now(),
            patientId: Number(data.patientId),
            patientName: data.patientName,
            doctorId: Number(data.doctorId),
            doctorName: data.doctorName,
            date: data.date,
            time: data.time,
            specialty: data.specialty,
            status: data.status || 'pendiente'
        };
        appointments.push(appointment);
        storage.saveAppointments(appointments);
        return appointment;
    }

    function updateAppointment(id, data) {
        const appointments = storage.getAppointments();
        const index = appointments.findIndex((appointment) => appointment.id === Number(id));
        if (index === -1) return null;
        appointments[index] = { ...appointments[index], ...data, id: Number(id) };
        storage.saveAppointments(appointments);
        return appointments[index];
    }

    function deleteAppointment(id) {
        const appointments = storage.getAppointments().filter((appointment) => appointment.id !== Number(id));
        storage.saveAppointments(appointments);
        return appointments;
    }

    function getAppointmentsByPatient(patientId) {
        return storage.getAppointments().filter((appointment) => appointment.patientId === Number(patientId));
    }

    function getAppointmentsByDoctor(doctorId) {
        return storage.getAppointments().filter((appointment) => appointment.doctorId === Number(doctorId));
    }

    function getAllAppointments() {
        return storage.getAppointments();
    }

    window.hospitalAppointments = { createAppointment, updateAppointment, deleteAppointment, getAppointmentsByPatient, getAppointmentsByDoctor, getAllAppointments };
})();
