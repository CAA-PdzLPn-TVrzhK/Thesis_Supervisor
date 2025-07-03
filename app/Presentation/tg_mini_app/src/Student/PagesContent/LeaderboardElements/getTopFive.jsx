
import axios from "axios"

export async function getTopFive() {
    const allStudentsData = await axios.get(`${window.TelegramWebApp.API_BASE}students`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    const allStudents = allStudentsData.data;
    const sortedAllStudents = allStudents.sort((a, b) => b.score - a.score);
    const topFiveStudents = sortedAllStudents.slice(0, 5);

    let res = [];
    for(let student of topFiveStudents) {
        const userDataOfStudent = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${student.user_id}`,
            {
                headers: window.TelegramWebApp.headers,
            }
        );
        const element = [student, userDataOfStudent.data[0]];
        res.push(element);
    }
    return res;
}