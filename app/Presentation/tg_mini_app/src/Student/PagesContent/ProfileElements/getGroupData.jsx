import axios from "axios";

export async function getGroupData(groupId) {
    try {
        const groupData = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?id=eq.${groupId}`,
        {
            headers: window.TelegramWebApp.headers,
            }
        );
        return groupData.data;
    } catch (e) {
        console.log('error in getting group data', e);
        return [];
    }
}