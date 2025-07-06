
import axios from "axios";

export async function getSupervisorId(supervisorName) {
    try {
        const supervisors = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors`,
        {
            headers: window.TelegramWebApp.headers,
            }
        );
        for(let supervisor of supervisors.data) {
            const supervisorData = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${supervisor.user_id}`,
        {
            headers: window.TelegramWebApp.headers,
                }
            );
            console.log('current checked supervisor:', `${supervisorData.data[0].first_name} ${supervisorData.data[0].last_name}`, supervisorName);
            if (`${supervisorData.data[0].first_name} ${supervisorData.data[0].last_name}` === supervisorName ||
            `${supervisorData.data[0].last_name} ${supervisorData.data[0].first_name}` === supervisorName) {
                return supervisor.id;
            }
        }
        throw new Error("Supervisor not found");
    } catch (e) {
        console.log('error in getting group data', e);
        return null;
    }
}