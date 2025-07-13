
import axios from "axios";

export async function getGroupList() {
    try {
        const supervisorData = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?user_id=eq.${window.TelegramWebApp.userId}`, {headers: window.TelegramWebApp.headers});
        const groupsData = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?supervisor_id=eq.${supervisorData.data[0].id}`,
        {
            headers: window.TelegramWebApp.headers,
            }
        );
        let gpoups = [];
        for(let groupElement of groupsData.data) {
            gpoups.push(`${groupElement.name}`);
        }
        return gpoups;
    } catch (e) {
        console.log('error: supervisors list not found', e);
        return [];
    }
}