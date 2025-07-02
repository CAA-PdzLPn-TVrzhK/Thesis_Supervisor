import axios from "axios";

export async function getSupervisorData(supervisorId) {
    const supervisorDate = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?id=eq.${supervisorId}`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    return supervisorDate.data;
}