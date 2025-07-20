
import React from "react"
import axios from "axios";
import "./MilestoneInfo.css"
import {supabase} from "../../../../../../../ClientSupabase.jsx";
import {IconArrowBigUp} from "@tabler/icons-react"

class MilestoneInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            submissionComment: "",
            submissionDate: null,
            submissionFile: null,
            feedbackComment: "",
            feedbackDate: null,
            feedbackRating: "",
            feedbackFile: null,
            open: false,
        }
        this.close = this.close.bind(this);
    }

    async componentDidMount() {
        setTimeout(() => {
            this.setState({ open: true });
        }, 400);

        const submission = await axios.get(`${window.TelegramWebApp.API_BASE}submissions?milestone_id=eq.${this.props.milestone.id}`, {headers: window.TelegramWebApp.headers});
        if(submission.data.length > 0) {
            console.log(this.props.data.user.id, this.props.milestone.id)
            const {data} = await supabase.storage.from(`student-data`).getPublicUrl(`${this.props.data.user.id}/${this.props.milestone.id}/submission.pdf`);

            this.setState({
                submissionComment: submission.data[0].comments,
                submissionDate: this.getDate(submission.data[0].submitted_at),
                submissionFile: `${data.publicUrl}?v=${Date.now()}`,
            });

            const feedback = await axios.get(`${window.TelegramWebApp.API_BASE}feedback?submission_id=eq.${submission.data[0].id}`, {headers: window.TelegramWebApp.headers});
            if(feedback.data.length > 0) {
                const {data} = await supabase.storage.from(`supervisor-data`).getPublicUrl(`${window.TelegramWebApp.userId}/${this.props.data.student.id}/${this.props.milestone.id}/feedback.pdf`);

                this.setState({
                    feedbackComment: feedback.data[0].comments,
                    feedbackDate: this.getDate(feedback.data[0].created_at),
                    feedbackRating: feedback.data[0].rating,
                    feedbackFile: `${data.publicUrl}?v=${Date.now()}`,
                });
            }
        }
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
    close() {
        this.props.close(null);
    }

    render() {
        const milestone = this.props.milestone;
        return (
            <div className={`navigation-bar-submission-info-milestone-container ${this.state.open ? "open" : ""}`}>
                <div className={`navigation-bar-submission-info-milestone-container-element`}>
                    <div className={`navigation-bar-submission-info-milestone-container-element-label`}> Title: </div>
                    <div className={`navigation-bar-submission-info-milestone-container-element-value`}> {milestone.title} </div>
                </div>
                <div className={`navigation-bar-submission-info-milestone-container-element`}>
                    <div className={`navigation-bar-submission-info-milestone-container-element-label`}> Description: </div>
                    <div className={`navigation-bar-submission-info-milestone-container-element-value`}> {milestone.description} </div>
                </div>
                <div className={`navigation-bar-submission-info-milestone-container-element`}>
                    <div className={`navigation-bar-submission-info-milestone-container-element-label`}> Status: </div>
                    <div className={`navigation-bar-submission-info-milestone-container-element-value`}> {milestone.status} </div>
                </div>
                <div className={`navigation-bar-submission-info-milestone-container-element`}>
                    <div className={`navigation-bar-submission-info-milestone-container-element-label`}> Deadline: </div>
                    <div className={`navigation-bar-submission-info-milestone-container-element-value`}> {this.getDate(milestone.deadline)} </div>
                </div>
                <div className={`navigation-bar-submission-info-milestone-container-section`}>
                    <div className={`navigation-bar-submission-info-milestone-container-section-title`}> Submission: </div>
                    {this.state.submissionFile === null ?
                        <div className={`navigation-bar-submission-info-milestone-container-section-none`}> None </div>
                        :
                        <div className={`navigation-bar-submission-info-milestone-container-section-container`}>
                            <div className={`navigation-bar-submission-info-milestone-container-section-container-element`}>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-label`}> Comment: </div>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-value`}> {this.state.submissionComment} </div>
                            </div>
                            <div className={`navigation-bar-submission-info-milestone-container-section-container-element`}>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-label`}> Date: </div>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-value`}> {this.state.submissionDate} </div>
                            </div>
                            <div className={`navigation-bar-submission-info-milestone-container-section-container-element`}>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-label`}> File: </div>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-value-link`}> <a href={this.state.submissionFile} target="_blank" rel="noreferrer"> Submission </a> </div>
                            </div>
                        </div>
                    }
                </div>
                <div className={`navigation-bar-submission-info-milestone-container-section`}>
                    <div className={`navigation-bar-submission-info-milestone-container-section-title`}> Feedback: </div>
                    {this.state.feedbackFile === null ?
                        <div className={`navigation-bar-submission-info-milestone-container-section-none`}> None </div>
                        :
                        <div className={`navigation-bar-submission-info-milestone-container-section-container`}>
                            <div className={`navigation-bar-submission-info-milestone-container-section-container-element`}>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-label`}> Comment: </div>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-value`}> {this.state.feedbackComment} </div>
                            </div>
                            <div className={`navigation-bar-submission-info-milestone-container-section-container-element`}>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-label`}> Date: </div>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-value`}> {this.state.feedbackDate} </div>
                            </div>
                            <div className={`navigation-bar-submission-info-milestone-container-section-container-element`}>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-label`}> Grade: </div>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-value`}> {this.state.feedbackRating}/{milestone.weight} </div>
                            </div>
                            <div className={`navigation-bar-submission-info-milestone-container-section-container-element`}>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-label`}> File: </div>
                                <div className={`navigation-bar-submission-info-milestone-container-section-container-element-value-link`}> <a href={this.state.feedbackFile} target="_blank" rel="noreferrer"> Feedback </a> </div>
                            </div>
                        </div>
                    }
                </div>
                <IconArrowBigUp size={20} onClick={() => {
                    this.setState({open: false});
                    setTimeout(() => {
                        this.close();
                    }, 400);
                }} className={`navigation-bar-submission-info-milestone-container-close-icon`}/>
            </div>
        )
    }
}

export default MilestoneInfo