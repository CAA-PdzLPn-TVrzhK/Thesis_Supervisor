import axios from "axios";

export async function getRoleData(userId) {
    const roleDate = await axios.get(`${window.TelegramWebApp.API_BASE}students?user_id=eq.${userId}`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    return roleDate.data;
}