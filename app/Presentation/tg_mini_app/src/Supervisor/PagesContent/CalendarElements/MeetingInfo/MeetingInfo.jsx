
import React from "react"
import { IconEdit, IconX } from "@tabler/icons-react";
import './meetingInfo.css'

class MeetingInfo extends React.Component {
    constructor(props) {
        super(props);
        this.back = this.back.bind(this);
    }

    getMonthName(month_number) {
        const month_names = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
        return month_names[month_number];
    }
    startDate(dateForTime) {
        const date = new Date(dateForTime);
        const day = date.getDate().toString();
        const month = this.getMonthName(date.getMonth());
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month}, ${hours}:${minutes}`;
    }
    finishDate(dateForTime, duration) {
        const date = new Date(dateForTime);
        date.setMinutes(date.getMinutes() + parseInt(duration, 10));
        const day = date.getDate().toString();
        const month = this.getMonthName(date.getMonth());
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month}, ${hours}:${minutes}`;
    }
    back() {
        this.props.back();
    }

    render() {
        const meeting = this.props.data;
        const group = this.props.group;
        return (
            <div className="meeting-info-container">
                <div className="meeting-info-content">
                    <IconX size={20} onClick={this.back} className="meeting-info-close-button"/>
                    <div className="meeting-info-title"> {meeting.title} </div>
                    <div className="meeting-info-status"> {meeting.status} </div>
                    <div className="meeting-info-main-info">
                        <div className="meeting-info-description"> {meeting.description} </div>
                        <div className="meeting-info-time-info">
                            <div className="meeting-info-time-info-item">
                                <div className="meeting-info-time-info-item-title"> Group: </div>
                                <div className="meeting-info-time-info-item-value"> {group} </div>
                            </div>
                            <div className="meeting-info-time-info-item">
                                <div className="meeting-info-time-info-item-title"> Start time: </div>
                                <div className="meeting-info-time-info-item-value"> {this.startDate(meeting.date)} </div>
                            </div>
                            <div className="meeting-info-time-info-item">
                                <div className="meeting-info-time-info-item-title"> Finish time: </div>
                                <div className="meeting-info-time-info-item-value"> {this.finishDate(meeting.date, meeting.duration_minutes)} </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MeetingInfo