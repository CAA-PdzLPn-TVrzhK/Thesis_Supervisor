import axios from "axios";

export async function getGroupData(groupId) {
    const groupData = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?id=eq.${groupId}`,
        {
            headers: window.TelegramWebApp.headers,
        }
    );
    return groupData.data;
}