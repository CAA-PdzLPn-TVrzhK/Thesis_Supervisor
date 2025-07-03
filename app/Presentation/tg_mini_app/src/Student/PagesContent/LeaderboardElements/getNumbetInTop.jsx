
import axios from "axios"

export async function getNumbetInTop(studentId) {
    const allStudentData = await axios.get(`${window.TelegramWebApp.API_BASE}students`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    const allStudents = allStudentData.data;
    const sortedAllStudents = allStudents.sort((a, b) => b.score - a.score);
    let number = 1;
    for(let student of sortedAllStudents) {
        if(student.id === studentId) {
            break;
        } else {
            number = number + 1;
        }
    }
    return number;
}