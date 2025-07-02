
import axios from "axios";

export async function getUserId() {
    const userData = await axios.get(`${window.TelegramWebApp.API_BASE}users?telegram_id=eq.${window.TelegramWebApp.userId}`, {
        headers: window.TelegramWebApp.headers,
    });
    console.log('user data:', userData.data[0].id);
    return userData.data[0].id;
}