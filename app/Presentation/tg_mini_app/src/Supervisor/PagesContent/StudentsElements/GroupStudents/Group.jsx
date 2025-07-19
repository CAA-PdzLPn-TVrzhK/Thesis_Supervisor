
import React, { useState, useEffect } from "react"
import axios from "axios";



export default function GetGroup({group}) {
    const [open, setOpen] = useState(false);
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const getStudents = async () => {
            const students = await axios.get(`${window.TelegramWebApp.API_BASE}students?peer_group_id=eq.${group.id}`, {headers: window.TelegramWebApp.headers});
            const info = [];

            for(let student of students.data) {
                const user = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${student.user_id}`, {headers: window.TelegramWebApp.headers});
                info.push({user: user.data[0], student: student});
            }
            setStudents(info);
        };
        getStudents();
    }, [group]);

    return(
           <div>
               <div onClick={() => setOpen(!open)}>
                   {group.name}
               </div>
               {open && (
                    <div>
                        {students.map((studentData) => {
                            return (
                                <div key={studentData.user.id}>
                                    <div>
                                        <div> {studentData.user.first_name} {studentData.user.last_name} </div>
                                    </div>
                                </div>
                            )
                        })}
                   </div>
               )}
           </div>
    )
}