
import React from "react"
import axios from "axios"

export async function setRoleIdAsStudent() {
    let student_data = null;
    let student_id = null;
    student_data = await axios.get(`${window.TelegramWebApp.API_BASE}students?user_id=eq.${window.TelegramWebApp.userId}`,
        {headers: window.TelegramWebApp.headers,}
    );
    student_id = student_data.data[0].id;

    console.log('setRoleId:')
    console.log('Student ID: ', student_id, ' User ID: ', window.TelegramWebApp.userId);
    window.TelegramWebApp.roleId = student_id;
}