
import axios from "axios";

export async function setGroupSupervisor(updatedGroups, supervisorId) {
    try {
        const groupsData = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups`,
        { headers: window.TelegramWebApp.headers, }
        );
        for(let groupElement of groupsData.data) {
            if (updatedGroups.includes(groupElement.name)) {
                const request = {
                    supervisor_id: supervisorId,
                }
                const response = await axios.patch(`${window.TelegramWebApp.API_BASE}peer_groups?id=eq.${groupElement.id}`, request, {
                    headers: window.TelegramWebApp.headers,
                });
                console.log('supervisor id updated: ', response);
            }
        }
    } catch (e) {
        console.log('error: supervisors list not found', e);
        return [];
    }
}