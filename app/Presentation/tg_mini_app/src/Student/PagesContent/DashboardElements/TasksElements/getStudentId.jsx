import axios from "axios";

export async function getStudentId() {
    const studentDate = await axios.get(`${window.TelegramWebApp.API_BASE}students?user_id=eq.${window.TelegramWebApp.userId}`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    return studentDate.data[0].id;
}