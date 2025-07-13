
import axios from "axios";

export async function getLastUploadingStatus(milestoneId) {
    try {
        const submissionDate = await axios.get(`${window.TelegramWebApp.API_BASE}submissions?milestone_id=eq.${milestoneId}`, {headers: window.TelegramWebApp.headers});
        return submissionDate.data.length > 0 ? submissionDate.data[0] : null;
    } catch (e) {
        console.log(e);
        return null;
    }
}