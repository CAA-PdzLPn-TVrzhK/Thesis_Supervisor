import axios from "axios";

export async function getRoleData() {
    const roleDate = await axios.get(`${window.TelegramWebApp.API_BASE}students?id=eq.${window.TelegramWebApp.roleId}`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    return roleDate.data;
}