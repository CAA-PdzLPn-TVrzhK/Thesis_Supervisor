
import React from "react"
import {IconX} from "@tabler/icons-react";
import {supabase} from "../../../../../ClientSupabase.jsx";
import "./lastSubmission.css"

class LastSubmission extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            file: null,
        }
        this.closeLastSubmission = this.closeLastSubmission.bind(this);
    }

    async componentDidMount() {
        const { error } = await supabase.storage.from('student-data').download(`${window.TelegramWebApp.userId}/${this.props.milestoneId}/submission.pdf`);
        if (error) {
            console.error('Error fetching PDF URL:', error)
            this.setState({file: null});
        } else {
            const {data} = await supabase.storage.from(`student-data`).getPublicUrl(`${window.TelegramWebApp.userId}/${this.props.milestoneId}/submission.pdf`);
            this.setState({file: `${data.publicUrl}?v=${Date.now()}`});
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

    closeLastSubmission() {
        this.props.close();
    }

    render() {
        const data = this.props.data;
        return (
            <div className="last-submission-modal-container">
                <div className="last-submission-container">
                    {data === null ? (
                        <div className="last-submission-error-block">
                            <div className="last-submission-error-block-text">
                                You haven't uploaded any work yet.
                            </div>
                            <IconX size={20} onClick={this.closeLastSubmission} className="last-submission-close-button"/>
                        </div>
                    ) : (
                        <div className="last-submission-info-block">
                            <div className="last-submission-info-block-header">
                                <div className="last-submission-info-block-title">Last Submission</div>
                                <IconX size={20} onClick={this.closeLastSubmission} className="last-submission-close-button"/>
                            </div>
                            <div className="last-submission-info-block-element">
                                <div className="last-submission-info-block-element-label">Date:</div>
                                <div className="last-submission-info-block-element-value">{this.getDate(data.updated_at)}</div>
                            </div>
                            <div className="last-submission-info-block-element">
                                <div className="last-submission-info-block-element-label">Comment:</div>
                                <div className="last-submission-info-block-element-value">{data.comments}</div>
                            </div>
                            <div className="last-submission-info-block-element">
                                <div className="last-submission-info-block-element-label">File:</div>
                                <div className="last-submission-info-block-element-value">
                                    {this.state.file === null ?
                                        <div> We cannot get your work. </div> :
                                        <a href={this.state.file} target="_blank" rel="noreferrer"> last submission </a>
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

export default LastSubmission