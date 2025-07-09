
import axios from "axios";

export async function getSupervisorList() {
    try {
        const supervisorsData = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors`,
        {
            headers: window.TelegramWebApp.headers,
            }
        );
        let supervisors = [];
        for(let supervisorElement of supervisorsData.data) {
            const supervisorData = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${supervisorElement.user_id}`,
        {
            headers: window.TelegramWebApp.headers,
                }
            );
            supervisors.push(`${supervisorData.data[0].first_name} ${supervisorData.data[0].last_name}`);
        }
        return supervisors;
    } catch (e) {
        console.log('error: supervisors list not found', e);
        return [];
    }
}