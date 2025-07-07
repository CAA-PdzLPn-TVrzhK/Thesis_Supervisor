
import axios from "axios";

export async function getMilestones(thesisId) {
    try {
        const milestonesData = await axios.get(`${window.TelegramWebApp.API_BASE}milestones?thesis_id=eq.${thesisId}`,
            {
                    headers: window.TelegramWebApp.headers,
                });
        return milestonesData.data;
    } catch (e) {
        console.log(e);
        return [];
    }
}