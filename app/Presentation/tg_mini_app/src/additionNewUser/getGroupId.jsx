
import axios from "axios";

export async function getGroupId(groupName) {
    try {
        const groupData = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?name=eq.${groupName}`,
        {
            headers: window.TelegramWebApp.headers,
            }
        );
        return groupData.data[0].id;
    } catch (e) {
        console.log('error in getting group data', e);
        return null;
    }
}