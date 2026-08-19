(function () {
    const storage = window.hospitalStorage;

    function createAvailability(data) {
        const items = storage.getAvailability();
        const item = {
            id: Date.now(),
            doctorId: Number(data.doctorId),
            doctorName: data.doctorName,
            date: data.date,
            time: data.time,
            specialty: data.specialty,
            status: 'active'
        };
        items.push(item);
        storage.saveAvailability(items);
        return item;
    }

    function updateAvailability(id, data) {
        const items = storage.getAvailability();
        const index = items.findIndex((item) => item.id === Number(id));
        if (index === -1) return null;
        items[index] = { ...items[index], ...data, id: Number(id) };
        storage.saveAvailability(items);
        return items[index];
    }

    function deleteAvailability(id) {
        const items = storage.getAvailability().filter((item) => item.id !== Number(id));
        storage.saveAvailability(items);
        return items;
    }

    function getAvailabilityByDoctor(doctorId) {
        return storage.getAvailability().filter((item) => item.doctorId === Number(doctorId));
    }

    window.hospitalAvailability = { createAvailability, updateAvailability, deleteAvailability, getAvailabilityByDoctor };
})();
