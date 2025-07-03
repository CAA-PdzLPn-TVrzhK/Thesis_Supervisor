
import React from "react";
import {getStudentId} from "./getStudentId.jsx";
import {sendSubmission} from "./sendSubmission.jsx";
import "./TaskElement.css"

class TaskManager extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            data: this.props.data,
            student_id: null,
            content: "",
            submission_status: null,
        }
        this.closeTask = this.closeTask.bind(this);
    }

    async sendSolution() {
        if (this.state.content !== "") {
            const submissionDate = {
                student_id: this.state.student_id,
                milestones_id: this.props.data.id,
                content: this.state.content,
            }
            await sendSubmission(submissionDate);
            this.setState(() => {
                return {
                    submission_status: true,
                }
            })
        } else {
            this.setState(() => {
                return {
                    submission_status: true,
                }
            })
        }
    }

    closeTask() {
        this.props.closeTask(null);
    }

    resetSubmissionStatus() {
        this.setState(() => {
            return {
                submission_status: null,
            }
        })
    }

    async componentDidMount() {
        const studentId = await getStudentId();
        this.setState({student_id: studentId});
    }

    render() {
        if(!this.state.student_id) {
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }

        return (
            <div className = "dashboard-task-container">
                <div className = "dashboard-task-content-info"> Milestone info </div>
                <div className = "dashboard-task-content-block">
                    <div className = "task-info-item">
                        <div className = "dashboard-task-content-mark"> Title:  </div>
                        <div className = "dashboard-task-content-value"> {this.state.data.title} </div>
                    </div>
                    <div className = "task-info-item">
                        <div className = "dashboard-task-content-mark"> Description:  </div>
                        <div className = "dashboard-task-content-value"> {this.state.data.description} </div>
                    </div>
                    <div className = "task-info-item">
                        <div className = "dashboard-task-content-mark"> Deadline:  </div>
                        <div className = "dashboard-task-content-value"> {this.state.data.deadline} </div>
                    </div>
                    <div className = "task-info-item">
                        <div className = "dashboard-task-content-mark"> Points:  </div>
                        <div className = "dashboard-task-content-value"> {this.state.data.weight} </div>
                    </div>

                    <div className = "dashboard-task-content-status"> {this.state.data.status} </div>
                </div>
                <form className = "dashboard-task-content-form">
                    <label>
                        <input type="text" placeholder="Write your draft" className = "dashboard-task-content-form-input"></input>
                    </label>
                    <button className = "dashboard-task-content-form-submit-button" onClick={this.sendSolution}>
                        Submit
                    </button>
                </form>
                <button onClick={this.closeTask} className = "dashboard-task-content-go-back"> Back </button>

                {this.state.submission_status === null ?
                    <div></div> :
                    (this.state.submission_status === true ?
                        <div>
                            <div> Successful submit </div>
                            <button onClick={this.resetSubmissionStatus}> close </button>
                        </div> :
                        <div>Write your draft</div>)}
            </div>
        )
    }
}

export default TaskManager