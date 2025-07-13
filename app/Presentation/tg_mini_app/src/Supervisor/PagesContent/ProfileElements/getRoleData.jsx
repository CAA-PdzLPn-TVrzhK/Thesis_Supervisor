import axios from "axios";

export async function getRoleData(userId) {
    const roleDate = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?user_id=eq.${userId}`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    return roleDate.data;
}