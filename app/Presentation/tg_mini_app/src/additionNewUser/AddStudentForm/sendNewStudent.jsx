
import axios from "axios";

export async function sendNewStudent(data) {

    try {
        const submissionData = {
            user_id: window.TelegramWebApp.userId,
            supervisor: data.supervisor,
            group: data.group,
            program: data.program,
            departament: data.department,
            year: data.year,
            firstname: data.firstname,
            lastname: data.lastname,
            thesis_title: data.thesisTitle,
            thesis_description: data.thesisDescription,
        };

        await axios.post(`${window.TelegramWebApp.API_BASE}new_students`, submissionData, {
            headers: window.TelegramWebApp.headers
        });

        const updateData = {
            role: "confirm",
        };

        const response = await axios.patch(`${window.TelegramWebApp.API_BASE}users?id=eq.${window.TelegramWebApp.userId}`, updateData, {
            headers: window.TelegramWebApp.headers,
        });
        console.log("Student updated successfully:", response.data);
    } catch (e) {
        console.error("Error updating student:", e);
    }
}