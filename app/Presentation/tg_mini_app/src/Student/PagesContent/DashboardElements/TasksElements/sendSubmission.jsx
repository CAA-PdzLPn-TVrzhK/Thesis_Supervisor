
import axios from "axios";

export async function sendSubmission(submissionData) {
    await axios.post(`${window.TelegramWebApp.API_BASE}submissions`, submissionData, {
        headers: window.TelegramWebApp.headers
    })
}