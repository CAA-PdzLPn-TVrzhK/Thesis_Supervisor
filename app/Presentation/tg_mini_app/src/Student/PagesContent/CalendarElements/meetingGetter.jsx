
import axios from "axios";
// import React, {useState, useEffect} from "react";
//
// function useMeetingGetter() {
//     const [listOfMeeting, setListOfMeeting] = useState([]);
//     const [error, setError] = useState(false);
//
//     useEffect(() => {
//         (async () => {
//             try {
//                 const thesisRes = await axios.get(`${window.TelegramWebApp.API_BASE}meetings/students/${window.TelegramWebApp.userId}`);
//                 setListOfMeeting(thesisRes.data);
//             } catch (err) {
//                 console.error(err);
//                 setError(true);
//             }
//         })();
//     }, []);
//
//     return {
//         listOfMeeting, error
//     }
// }
//
// export default useMeetingGetter;

export async function getMeetings() {
    let error = false;
    let listOfMeetings = null;
    let group_id = null;
    let student_data = null;

    try {
        student_data = await axios.get(`${window.TelegramWebApp.API_BASE}students?id=eq.${window.TelegramWebApp.userId}`,
            {
                headers: {
                    apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc",
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc`,
                    "Content-Type": "application/json"
                }
            });
        group_id = student_data[0].peer_group_id;
        listOfMeetings = await axios.get(`${window.TelegramWebApp.API_BASE}meetings?peer_group_id=eq.${group_id}`,
            {
                headers: {
                    apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc",
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc`,
                    "Content-Type": "application/json"
                }
            });
    } catch (err) {
        console.log(err);
        error = true;
    }
    return listOfMeetings;
}