import axios from "axios";

export async function getGroupData(supervisorId) {
    try {
        const groupData = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?supervisor_id=eq.${supervisorId}`,
        {
            headers: window.TelegramWebApp.headers,
            }
        );
        let groups = [];
        for(let group of groupData.data) {
            groups.push(group.name);
        }
        return groups;
    } catch (e) {
        console.log('error in getting group data', e);
        return [];
    }
}