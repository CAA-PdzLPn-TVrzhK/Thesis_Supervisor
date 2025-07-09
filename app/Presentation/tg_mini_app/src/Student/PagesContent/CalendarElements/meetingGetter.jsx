
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
        student_data = await axios.get(`${window.TelegramWebApp.API_BASE}students?user_id=eq.${window.TelegramWebApp.userId}`,
            {
                headers: window.TelegramWebApp.headers,
            });
        group_id = student_data.data[0].peer_group_id;
        listOfMeetings = await axios.get(`${window.TelegramWebApp.API_BASE}meetings?peer_group_id=eq.${group_id}`,
            {
                headers: window.TelegramWebApp.headers,
            });
        console.log('результат вызова списка встреч:', listOfMeetings.data);
        return listOfMeetings.data;
    } catch (err) {
        console.log(err);
        return [];
    }
}