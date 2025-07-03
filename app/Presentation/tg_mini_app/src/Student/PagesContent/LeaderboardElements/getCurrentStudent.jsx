
import axios from "axios"

export async function getCurrentStudent() {
    const studentData = await axios.get(`${window.TelegramWebApp.API_BASE}students?user_id=eq.${window.TelegramWebApp.userId}`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    const student = studentData.data[0];
    const userData = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${student.user_id}`,
        {
            headers: window.TelegramWebApp.headers,
        }
        );
    const res = [student, userData.data[0]];
    return res;
}