import axios from 'axios';
import React from "react";
import "./Dashboard.css"
import {IconArrowBarRight, IconArrowBarLeft} from "@tabler/icons-react";
import ReactDOM from "react-dom";
import StudentInfo from "./cardElements/StudentInfo/StudentInfo.jsx";
import MilestoneInfo from "./cardElements/MilestoneInfo/MilestoneInfo.jsx";
import ThesisInfo from "./cardElements/ThesisInfo/ThesisInfo.jsx";
import DraftInfo from "./cardElements/DraftInfo/DraftInfo.jsx";

class Dashboard extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            data: [],
            error: false,
            loading: true,
            flipped: [],
            studentInfo: null,
            milestoneInfo: null,
            draft: null,
            thesis: null,
        }

        this.changeStudentInfo = this.changeStudentInfo.bind(this);
        this.changeMilestoneInfo = this.changeMilestoneInfo.bind(this);
        this.changeThesis = this.changeThesis.bind(this);
        this.changeDraft = this.changeDraft.bind(this);
    }

    changeStudentInfo(data) {
        this.setState(() => {
            return {
                studentInfo: data,
            }
        })
    }
    changeMilestoneInfo(data) {
        this.setState(() => {
            return {
                milestoneInfo: data,
            }
        })
    }
    changeThesis(data) {
        this.setState(() => {
            return {
                thesis: data,
            }
        })
    }
    changeDraft(data) {
        this.setState(() => {
            return {
                draft: data,
            }
        })
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

    flipCard(index) {
        this.setState(p => {
            if (p.flipped.includes(index)) {
                return {
                    flipped: p.flipped.filter(i => i !== index),
                }
            } else {
                return {
                    flipped: [...p.flipped, index],
                }
            }
        })
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
                {this.state.studentInfo!==null && ReactDOM.createPortal(
                    <StudentInfo close={this.changeStudentInfo} data={this.state.studentInfo}/>,
                    document.getElementById("modal-root")
                )}
                {this.state.milestoneInfo!==null && ReactDOM.createPortal(
                    <MilestoneInfo close={this.changeMilestoneInfo} data={this.state.milestoneInfo}/>,
                    document.getElementById("modal-root")
                )}
                {this.state.thesis!==null && ReactDOM.createPortal(
                    <ThesisInfo close={this.changeThesis} data={this.state.thesis}/>,
                    document.getElementById("modal-root")
                )}
                {this.state.draft!==null && ReactDOM.createPortal(
                    <DraftInfo close={this.changeDraft} data={this.state.draft}/>,
                    document.getElementById("modal-root")
                )}
                <div className="submissions-container-title"> unverified submissions </div>
                <div className="submissions-list-of-draft">
                    {this.state.data.map((submission, submissionIndex) => {
                        return (
                            <div key={submissionIndex} className={`submissions-list-of-draft-block ${this.state.flipped.includes(submissionIndex) ? 'flipped' : ''}`}>
                                    <div className="submissions-list-of-draft-addition-element">
                                        <div className="submissions-list-of-draft-addition-element-info">
                                            <div className="submissions-list-of-draft-addition-element-info-left-block">
                                                <div className="submissions-list-of-draft-addition-element-info-left-block-element" onClick={() => this.changeStudentInfo(submission)}>
                                                    Student
                                                </div>
                                                <div className="submissions-list-of-draft-addition-element-info-left-block-element" onClick={() => this.changeMilestoneInfo(submission)}>
                                                    Milestone
                                                </div>
                                            </div>
                                            <div className="submissions-list-of-draft-addition-element-info-right-block">
                                                <div className="submissions-list-of-draft-addition-element-info-right-block-element" onClick={() => this.changeDraft(submission)}>
                                                    Draft
                                                </div>
                                                <div className="submissions-list-of-draft-addition-element-info-right-block-element" onClick={() => this.changeThesis(submission)}>
                                                    Thesis
                                                </div>
                                            </div>
                                        </div>
                                        <IconArrowBarLeft size={20} onClick={() => this.flipCard(submissionIndex)} className="submissions-list-of-draft-left-arrow"/>
                                    </div>
                                    <div className="submissions-list-of-draft-main-element">
                                        <div className="submissions-list-of-draft-main-element-info">
                                            <div className="submissions-list-of-draft-main-element-info-element">
                                                <div className="submissions-list-of-draft-main-element-info-element-label"> Student: </div>
                                                <div className="submissions-list-of-draft-main-element-info-element-value"> {submission.user.first_name} {submission.user.last_name} </div>
                                            </div>
                                            <div className="submissions-list-of-draft-main-element-info-element">
                                                <div className="submissions-list-of-draft-main-element-info-element-label"> Milestone deadline: </div>
                                                <div className="submissions-list-of-draft-main-element-info-element-value"> {this.getDate(submission.milestone.deadline)} </div>
                                            </div>
                                        </div>
                                        <IconArrowBarRight size={20} onClick={() => this.flipCard(submissionIndex)} className="submissions-list-of-draft-right-arrow"/>
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