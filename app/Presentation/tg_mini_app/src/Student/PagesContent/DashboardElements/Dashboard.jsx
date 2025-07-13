
import React from "react";
import {getThesisInfo} from "./getThesisInfo.jsx";
import {getMilestones} from "./getMilestones.jsx";
import TaskManager from "./TasksElements/openTask.jsx";
import "./Dashboard.css"
import ThesisInfo from "./ThesisInfo/ThesisInfo.jsx";
import ReactDOM from "react-dom";

class Dashboard extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            thesis_data: null,
            milestones_data: [],
            active_task: null,
            getterThesisInfo: false,
        }
        this.openTask = this.openTask.bind(this);
        this.closeThesisInfo = this.closeThesisInfo.bind(this);
    }

    async componentDidMount() {
        const thesisData = await getThesisInfo();
        const milestonesData = await getMilestones(thesisData.id);

        this.setState(() => {
            return {
                thesis_data: thesisData,
                milestones_data: milestonesData,
            }
        })
    }

    openTask(task_data) {
        this.setState(() => {
            return {
                active_task: task_data,
            }
        })
    }

    getMonthName(month_number) {
        const month_names = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
        return month_names[month_number];
    }

    getTimeForInfoBlock(dateForTime) {
        const date = new Date(dateForTime);
        const day = date.getDate().toString();
        const month = this.getMonthName(date.getMonth());
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month}, ${hours}:${minutes}`;
    }

    getThesisInfo() {
        this.setState({getterThesisInfo: true});
    }
    closeThesisInfo() {
        this.setState({getterThesisInfo: false});
    }

    render() {
        if(!this.state.thesis_data || this.state.milestones_data.length === 0) {
            if(this.state.thesis_data === "you haven't thesis") {
                return (
                    <div className = "dashboard-content-container">
                        <div className = "dashboard-content-header-text"> Dashboard </div>
                        <div className = "dashboard-content-thesis-title"> You haven't thesis </div>
                    </div>
                )
            }
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }

        if (this.state.active_task !== null) {
            return (
                <TaskManager data={this.state.active_task} closeTask={this.openTask}/>
            )
        }

        return (
            <div className = "dashboard-content-container">
                {this.state.getterThesisInfo && ReactDOM.createPortal(
                    <ThesisInfo back={this.closeThesisInfo} thesis={this.state.thesis_data}/>,
                    document.getElementById("modal-root")
                )}
                <div className = "dashboard-content-header-text-block">
                    <div className = "dashboard-content-header-text" onClick={() => this.getThesisInfo()}> Thesis Info </div>
                </div>
                <div>
                    <div className = "dashboard-content-roadmap-block">
                        <div className = "dashboard-content-roadmap-title"> Roadmap </div>
                        <ul className = "dashboard-content-roadmap-container">
                            {this.state.milestones_data.map((milestone, milestoneId) => {
                                return (
                                    <li key={milestoneId} onClick={() => this.openTask(milestone)} className = "dashboard-content-roadmap-item">
                                        <div className = "dashboard-content-milestones-title">
                                            {milestone.title}
                                        </div>
                                        <div className = "dashboard-content-milestones-deadline">
                                            <span> Deadline: </span>
                                            <span> {this.getTimeForInfoBlock(milestone.deadline)} </span>
                                        </div>
                                        <div>
                                            <span> Status: </span>
                                            <span className = "dashboard-content-milestones-status"> {milestone.status} </span>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            </div>
        )
    }
}

export default Dashboard