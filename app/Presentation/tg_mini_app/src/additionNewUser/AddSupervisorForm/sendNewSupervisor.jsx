
import axios from "axios";

export async function sendNewSupervisor(data) {

    try {
        console.log("массив групп:", data.groups);
        const submissionData = {
            user_id: window.TelegramWebApp.userId,
            departament: data.department,
            firstname: data.firstname,
            lastname: data.lastname,
            groups: data.groups,
        };

        await axios.post(`${window.TelegramWebApp.API_BASE}new_supervisors`, submissionData, {
            headers: window.TelegramWebApp.headers
        });

        const updateData = {
            role: "confirm",
        };

        await axios.patch(`${window.TelegramWebApp.API_BASE}users?id=eq.${window.TelegramWebApp.userId}`, updateData, {
            headers: window.TelegramWebApp.headers,
        });
        console.log("Supervisor user updated successfully");

    } catch (e) {
        console.error("Error updating student:", e);
    }
}