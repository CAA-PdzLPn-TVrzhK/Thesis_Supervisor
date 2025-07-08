
import axios from "axios";
import {setGroupSupervisor} from "./setGroupSupervisor.jsx";

export async function sendNewSupervisor(data) {

    try {
        const submissionData = {
            user_id: window.TelegramWebApp.userId,
            department: data.department,
        };

        await axios.post(`${window.TelegramWebApp.API_BASE}supervisors`, submissionData, {
            headers: window.TelegramWebApp.headers
        });

        const updateData = {
            first_name: data.firstname,
            last_name: data.lastname,
            role: "supervisor",
        };

        await axios.patch(`${window.TelegramWebApp.API_BASE}users?id=eq.${window.TelegramWebApp.userId}`, updateData, {
            headers: window.TelegramWebApp.headers,
        });
        console.log("Supervisor user updated successfully");

        const supervisorData = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?user_id=eq.${window.TelegramWebApp.userId}`, {
            headers: window.TelegramWebApp.headers
        });

        await setGroupSupervisor(data.groups, supervisorData.data[0].id);

    } catch (e) {
        console.error("Error updating student:", e);
    }
}