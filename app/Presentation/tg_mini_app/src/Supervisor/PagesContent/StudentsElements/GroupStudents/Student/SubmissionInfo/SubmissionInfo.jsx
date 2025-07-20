
import React from "react"
import axios from "axios";
import MilestoneInfo from "./MilestoneInfo/MilestoneInfo.jsx";
import "./SubmissionInfo.css"

class SubmissionInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            milestones: null,
            openMilestone: false,
            currentMilestone: null,
        }
        this.setOpenMilestone = this.setOpenMilestone.bind(this);
    }

    async componentDidMount() {
        const thesis = await axios.get(`${window.TelegramWebApp.API_BASE}theses?student_id=eq.${this.props.data.student.id}`, {headers: window.TelegramWebApp.headers});
        const milestones = await axios.get(`${window.TelegramWebApp.API_BASE}milestones?thesis_id=eq.${thesis.data[0].id}&order=deadline.asc`, {headers: window.TelegramWebApp.headers});
        this.setState({milestones: milestones.data});
    }

    setOpenMilestone(currentMilestone) {
        this.setState((p) => {
            return {
                openMilestone: !p.openMilestone,
                currentMilestone: currentMilestone,
            }
        })
    }

    render() {
        if(this.state.milestones === null) {
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }
        return (
            <div className={`navigation-bar-submission-info-container`}>
                {!this.state.openMilestone && this.state.milestones.map((milestone, index) => {
                    return (
                        <div key={milestone.id} onClick={() => this.setOpenMilestone(milestone)} className={`navigation-bar-submission-info-container-element`}>
                            {index+1}. {milestone.title}
                        </div>
                    )
                })}
                {this.state.openMilestone &&
                    <MilestoneInfo milestone={this.state.currentMilestone} close={this.setOpenMilestone} data={this.props.data}/>
                }
            </div>
        )
    }
}

export default SubmissionInfo