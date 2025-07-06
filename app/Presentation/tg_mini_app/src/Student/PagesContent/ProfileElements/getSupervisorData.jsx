import axios from "axios";

export async function getSupervisorData(supervisorId) {
    try {
        const supervisorDate = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?id=eq.${supervisorId}`,
        {
            headers: window.TelegramWebApp.headers,
            }
        );
        return supervisorDate.data;
    } catch (e) {
        console.log("error in get supervisor data", e);
        return [];
    }

}