
import axios from "axios";

export async function getMeetings() {
    let listOfMeetings = [];
    let supervisor_data = null;

    try {
        supervisor_data = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?user_id=eq.${window.TelegramWebApp.userId}`,
            {
                headers: window.TelegramWebApp.headers,
            });

        const groupsData = await axios.get(`${window.TelegramWebApp.API_BASE}peer_groups?supervisor_id=eq.${supervisor_data.data[0].id}`,
            {
                headers: window.TelegramWebApp.headers,
            });
        for(let group of groupsData.data) {
            const listOfMeetingsPeerGroup = await axios.get(`${window.TelegramWebApp.API_BASE}meetings?peer_group_id=eq.${group.id}`,
                { headers: window.TelegramWebApp.headers });
            for(let meeting of listOfMeetingsPeerGroup.data) {
                let element = [meeting, group.name];
                listOfMeetings.push(element);
            }
        }

        console.log('результат вызова списка встреч:', listOfMeetings);
        return listOfMeetings;
    } catch (err) {
        console.log(err);
        return [];
    }
}