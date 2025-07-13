
import React from "react"
import { IconEdit, IconX } from "@tabler/icons-react";
import './taskInfo.css'

class TaskInfo extends React.Component {
    constructor(props) {
        super(props);
        this.back = this.back.bind(this);
    }

    getMonthName(month_number) {
        const month_names = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
        return month_names[month_number];
    }
    getDeadline(dateForTime) {
        const date = new Date(dateForTime);
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
        const task = this.props.data;
        return (
            <div className="task-info-container">
                <div className="task-info-content">
                    <IconX size={20} onClick={this.back} className="task-info-close-button"/>
                    <div className="task-info-title"> {task.title} </div>
                    <div className="task-info-status"> {task.status} </div>
                    <div className="task-info-main-info">
                        <div className="task-info-description"> {task.description} </div>
                        <div className="task-info-time-info">
                            <div className="task-info-time-info-item">
                                <div className="task-info-time-info-item-title"> Deadline: </div>
                                <div className="task-info-time-info-item-value"> {this.getDeadline(task.deadline)} </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default TaskInfo