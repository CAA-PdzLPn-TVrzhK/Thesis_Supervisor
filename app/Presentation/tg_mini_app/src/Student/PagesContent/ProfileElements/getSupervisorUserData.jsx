import axios from "axios";

export async function getSupervisorUserData(supervisorUserId) {
    const supervisorUserDate = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${supervisorUserId}`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    return supervisorUserDate.data;
}