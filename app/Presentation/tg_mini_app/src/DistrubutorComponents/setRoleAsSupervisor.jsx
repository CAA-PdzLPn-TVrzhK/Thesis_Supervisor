
import axios from "axios";

export async function setRoleIdAsSupervisor() {
    let supervisor_data = null;
    let supervisor_id = null;
    supervisor_data = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?user_id=eq.${window.TelegramWebApp.userId}`,
        {headers: window.TelegramWebApp.headers,}
    );
    supervisor_id = supervisor_data.data[0].id;

    console.log('Supervisor ID: ', supervisor_id, ' User ID: ', window.TelegramWebApp.userId);
    window.TelegramWebApp.roleId = supervisor_id;
}