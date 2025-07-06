
import axios from "axios";
import {getSupervisorId} from "./getSupervisorId.jsx";
import {getGroupId} from "./getGroupId.jsx";

export async function sendNewStudent(data) {


    const supervisorId = await getSupervisorId(data["supervisor"]);
    const groupId = await getGroupId(data["group"]);

    const submissionData = {
        user_id: window.TelegramWebApp.userId,
        supervisor_id: supervisorId,
        peer_group_id: groupId,
    };

    await axios.post(`${window.TelegramWebApp.API_BASE}students`, submissionData, {
        headers: window.TelegramWebApp.headers
    });

    const updateData = {
        first_name: data.firstname,
        last_name: data.lastname,
        role: "student",
    };

    try {
        const response = await axios.patch(`${window.TelegramWebApp.API_BASE}users?id=eq.${window.TelegramWebApp.userId}`, updateData, {
            headers: window.TelegramWebApp.headers,
        });
        console.log("Student updated successfully:", response.data);
    } catch (e) {
        console.error("Error updating student:", e);
    }
}