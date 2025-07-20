
import React from "react"
import {IconX} from "@tabler/icons-react";
import "./MilestoneInfo.css"

class MilestoneInfo extends React.Component {
    constructor(props) {
        super(props);
        this.close = this.close.bind(this);
    }

    close() {
        this.props.close(null);
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
        const data = this.props.data;
        return (
            <div className={`modal-milestone-info-container`}>
                <IconX size={20} onClick={this.close} className={`milestone-info-container-close-button`}/>
                <div className={`milestone-info-container-main-block`}>
                    <div className={`milestone-info-container-main-block-title`}>
                        Milestone Info
                    </div>
                    <div className={`milestone-info-container-main-block-body`}>
                        <div className={`milestone-info-container-main-block-body-element`}>
                            <div className={`milestone-info-container-main-block-body-element-label`}> title: </div>
                            <div className={`milestone-info-container-main-block-body-element-value`}> {data.milestone.title} </div>
                        </div>
                        <div className={`milestone-info-container-main-block-body-element`}>
                            <div className={`milestone-info-container-main-block-body-element-label`}> description: </div>
                            <div className={`milestone-info-container-main-block-body-element-value`}> {data.milestone.description} </div>
                        </div>
                        <div className={`milestone-info-container-main-block-body-element`}>
                            <div className={`milestone-info-container-main-block-body-element-label`}> deadline: </div>
                            <div className={`milestone-info-container-main-block-body-element-value`}> {this.getDate(data.milestone.deadline)} </div>
                        </div>
                        <div className={`milestone-info-container-main-block-body-element`}>
                            <div className={`milestone-info-container-main-block-body-element-label`}> weight: </div>
                            <div className={`milestone-info-container-main-block-body-element-value`}> {data.milestone.weight} </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default MilestoneInfo