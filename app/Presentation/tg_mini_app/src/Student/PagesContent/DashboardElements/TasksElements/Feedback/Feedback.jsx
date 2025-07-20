
import React from "react"
import {IconX} from "@tabler/icons-react";
import {supabase} from "../../../../../ClientSupabase.jsx";
import axios from "axios"
import "../LastSubmission/lastSubmission.css"

class Feedback extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
            feedback: null,
            submission: null,
        }
        this.closeFeedback = this.closeFeedback.bind(this);
    }

    async componentDidMount() {
        const submission = await axios.get(`${window.TelegramWebApp.API_BASE}submissions?milestone_id=eq.${this.props.milestone.id}`, {headers: window.TelegramWebApp.headers});
        if(submission.data.length === 0) {
            return;
        } else {
            console.log("я в рот ебал submission:", submission.data[0]);
        }
        const feedback = await axios.get(`${window.TelegramWebApp.API_BASE}feedback?submission_id=eq.${submission.data[0].id}`, {headers: window.TelegramWebApp.headers});
        if(feedback.data.length === 0) {
            return;
        } else {
            console.log("я в рот ебал feedback:", feedback.data[0]);
        }
        const supervisor = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?id=eq.${feedback.data[0].supervisor_id}`, {headers: window.TelegramWebApp.headers});
        const { error } = await supabase.storage.from('supervisor-data').download(`${supervisor.data[0].user_id}/${feedback.data[0].student_id}/${this.props.milestone.id}/feedback.pdf`);
        if (error) {
            console.error('Error fetching PDF URL:', error)
            this.setState({file: null});
        } else {
            const {data} = await supabase.storage.from(`supervisor-data`).getPublicUrl(`${supervisor.data[0].user_id}/${feedback.data[0].student_id}/${this.props.milestone.id}/feedback.pdf`);
            this.setState({file: `${data.publicUrl}?v=${Date.now()}`});
        }
        this.setState({feedback: feedback.data[0], submission: submission.data[0]});
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
    closeFeedback() {
        this.props.close();
    }

    render() {
        const milestone = this.props.milestone;
        return (
            <div className="last-submission-modal-container">
                <div className="last-submission-container">
                    {this.state.file === null ? (
                        <div className="last-submission-error-block">
                            <div className="last-submission-error-block-text">
                                You haven't feedback yet.
                            </div>
                            <IconX size={20} onClick={this.closeFeedback} className="last-submission-close-button"/>
                        </div>
                    ) : (
                        <div className="last-submission-info-block">
                            <div className="last-submission-info-block-header">
                                <div className="last-submission-info-block-title">Feedback</div>
                                <IconX size={20} onClick={this.closeFeedback} className="last-submission-close-button"/>
                            </div>
                            <div className="last-submission-info-block-element">
                                <div className="last-submission-info-block-element-label">Rating:</div>
                                <div className={`last-submission-info-block-element-value`}> {this.state.feedback.rating}/{milestone.weight} </div>
                            </div>
                            <div className="last-submission-info-block-element">
                                <div className="last-submission-info-block-element-label">Date:</div>
                                <div className="last-submission-info-block-element-value">{this.getDate(this.state.feedback.created_at)}</div>
                            </div>
                            <div className="last-submission-info-block-element">
                                <div className="last-submission-info-block-element-label">Comment:</div>
                                <div className="last-submission-info-block-element-value">{this.state.feedback.comments}</div>
                            </div>
                            <div className="last-submission-info-block-element">
                                <div className="last-submission-info-block-element-label">File:</div>
                                <div className="last-submission-info-block-element-value">
                                    {this.state.file === null ?
                                        <div> We cannot get feedback. </div> :
                                        <a href={this.state.file} target="_blank" rel="noreferrer"> Feedback </a>
                                    }
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default Feedback