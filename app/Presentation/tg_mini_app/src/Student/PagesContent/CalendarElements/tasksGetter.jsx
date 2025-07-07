
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
    let msRes = [];
    let thesisId = [];
    try {
        const thesisRes = await axios.get(`${window.TelegramWebApp.API_BASE}students?user_id=eq.${window.TelegramWebApp.userId}`,
            {
                headers: window.TelegramWebApp.headers,
            });
        thesisId = thesisRes.data[0].thesis_id;
        console.log("thesisId that you got:", thesisId);
        msRes = await axios.get(`${window.TelegramWebApp.API_BASE}milestones?thesis_id=eq.${thesisId}`,
            {
                headers: window.TelegramWebApp.headers,
            });
        console.log('результат вызова списка заданий:', msRes.data);
        return msRes.data;
    } catch (err) {
        console.log(err);
        return [];
    }

}