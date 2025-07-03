import axios from "axios";

export async function getDataOfUser() {
    try {
        const res = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${window.TelegramWebApp.userId}`,
            {
                headers: window.TelegramWebApp.headers,
            }
        );
        return res.data;
    } catch (err) {
        console.log('error in the method getDataOfUser.jsx', err);
        return null;
    }
}