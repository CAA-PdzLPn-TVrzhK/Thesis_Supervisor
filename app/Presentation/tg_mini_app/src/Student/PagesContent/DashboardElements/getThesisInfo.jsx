
import axios from "axios";

export async function getThesisInfo() {
    try {
        const studentData = await axios.get(`${window.TelegramWebApp.API_BASE}students?user_id=eq.${window.TelegramWebApp.userId}`,
        {
                headers: window.TelegramWebApp.headers,
            }
        );
        const thesisId = studentData.data[0].thesis_id;
        const thesisData = await axios.get(`${window.TelegramWebApp.API_BASE}theses?id=eq.${thesisId}`,
        {
                headers: window.TelegramWebApp.headers,
            }
        );
        return thesisData.data[0];
    } catch (e) {
        console.log(e);
        return "you haven't thesis";
    }
}