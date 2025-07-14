import axios from 'axios';
import React from "react";
import "./Dashboard.css"

class Dashboard extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [],
            error: false,
            loading: true,
        }
    }

    async componentDidMount() {
        const supervisor = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?user_id=eq.${window.TelegramWebApp.userId}`, {headers: window.TelegramWebApp.headers});
        const submissions = await axios.get(`${window.TelegramWebApp.API_BASE}submissions`, {
            params: {
                supervisor_id: `eq.${supervisor.data[0].id}`,
                status: `eq.pending`,
                order: 'submitted_at.desc'
            },
            headers: window.TelegramWebApp.headers
        });

        const rawSubmissions = submissions.data;

        const enrichedSubmissions = await Promise.all(
            rawSubmissions.map(async (submission) => {
                const student = await axios.get(`${window.TelegramWebApp.API_BASE}students?id=eq.${submission.student_id}`, { headers: window.TelegramWebApp.headers });
                const user = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${student.data[0].user_id}`, { headers: window.TelegramWebApp.headers });
                const milestone = await axios.get(`${window.TelegramWebApp.API_BASE}milestones?id=eq.${submission.milestone_id}`, { headers: window.TelegramWebApp.headers });

                return {
                    submission,
                    student: student.data[0],
                    user: user.data[0],
                    milestone: milestone.data[0],
                };
            })
        );

        this.setState({ data: enrichedSubmissions, loading: false });
    }

    getMonthName(month_number) {
        const month_names = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
        return month_names[month_number];
    }
    getDate(dateForTime) {
        const date = new Date(dateForTime);
        const day = date.getDate().toString();
        const month = this.getMonthName(date.getMonth());
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month}, ${hours}:${minutes}`;
    }

    render() {
        if(this.state.loading) {
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }
        return (
            <div className="submissions-container">
                <div className="submissions-container-title"> unverified submissions </div>
                <div className="submissions-list-of-draft">
                    {this.state.data.map((submission, submissionIndex) => {
                        return (
                            <div key={submissionIndex} className="submissions-list-of-draft-block">
                                <div className="submissions-list-of-draft-block-element">
                                    <div className="submissions-list-of-draft-block-element-label"> Student: </div>
                                    <div className="submissions-list-of-draft-block-element-value"> {submission.user.first_name} {submission.user.last_name} </div>
                                </div>
                                <div className="submissions-list-of-draft-block-element">
                                    <div className="submissions-list-of-draft-block-element-label"> Milestone deadline: </div>
                                    <div className="submissions-list-of-draft-block-element-value"> {this.getDate(submission.milestone.deadline)} </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

export default Dashboard