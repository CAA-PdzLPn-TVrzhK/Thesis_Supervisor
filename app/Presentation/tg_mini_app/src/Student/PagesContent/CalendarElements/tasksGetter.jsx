
import axios from "axios";
// import React, {useState, useEffect} from "react";
//
// function useTasksGetter() {
//     const [listOfMilestones, setListOfMilestones] = useState([]);
//     const [error, setError] = useState(false);
//     const [thesisId, setThesisId] = useState([]);
//
//     useEffect(() => {
//         (async () => {
//             try {
//                 const thesisRes = await axios.get(`${window.TelegramWebApp.API_BASE}theses/students/${window.TelegramWebApp.userId}`);
//                 setThesisId(thesisRes.data._id);
//                 const msRes = await axios.get(`${window.TelegramWebApp.API_BASE}milestones/${thesisId}/milestones`);
//                 setListOfMilestones(msRes.data);
//             } catch (err) {
//                 console.error(err);
//                 setError(true);
//             }
//         })();
//     }, []);
//
//     return {
//     listOfMilestones, error
//     }
// }
//
// export default useTasksGetter;

export async function getTasks() {
    console.log('вызван getTasks');
    let error = false;
    let msRes = [];
    let thesisId = [];
    try {
        const thesisRes = await axios.get(`${window.TelegramWebApp.API_BASE}student?user_id=eq.${window.TelegramWebApp.userId}`,
            {
                headers: {
                    apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc",
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc`,
                    "Content-Type": "application/json"
                }
            });
        thesisId = thesisRes.data[0].thesis_id;
        msRes = await axios.get(`${window.TelegramWebApp.API_BASE}milestones?thesis_id=${thesisId}`,
            {
                headers: {
                    apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc",
                    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc`,
                    "Content-Type": "application/json"
                }
            });
        console.log('результат вызова списка заданий', msRes);
    } catch (err) {
        console.log(err);
        error = true;
    }
    console.log('вернулись данные:', msRes);
    return msRes.data[0];
}