
import axios from "axios";

export async function getGroupsList() {
    try {
        const groupsData = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups`,
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