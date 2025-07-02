import axios from "axios";

export async function getUserData() {
    const userData = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${window.TelegramWebApp.userId}`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    return userData;
}