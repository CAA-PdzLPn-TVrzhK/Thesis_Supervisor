
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
        this.handleInputChange = this.handleInputChange.bind(this);
        this.sendSolution = this.sendSolution.bind(this);
        this.resetSubmissionStatus = this.resetSubmissionStatus.bind(this);
    }

    async sendSolution() {
        console.log('you try to submit content')
        const content = this.state.content;
        if (content) {
            const submissionDate = {
                student_id: this.state.student_id,
                milestone_id: this.props.data.id,
                content: content,
            }
            console.log('your submission date:', submissionDate);
            try {
                await sendSubmission(submissionDate);
            } catch (err) {
                console.error(err.response.data);
            }
            this.setState(() => {
                return {
                    submission_status: true,
                    content: "",
                }
            })
        } else {
            this.setState(() => {
                return {
                    submission_status: false,
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

    handleInputChange(event) {
        this.setState(() => {
            return {
                content: event.target.value,
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
                {this.state.submission_status === null ?
                    <div></div> :
                    (this.state.submission_status === true ?
                        <div className = "successful-submit-block">
                            <div className = "results-submission-content"> Successful submit </div>
                            <button onClick={this.resetSubmissionStatus} className = "close-results-submission-button"> Close </button>
                        </div> :
                        <div className = "non-successful-submit-block">
                            <div>
                                <div className = "results-submission-content">Unsuccessful submit</div>
                                <div  className = "results-submission-content-optional">Please, write your draft</div>
                            </div>
                            <button onClick={this.resetSubmissionStatus} className = "close-results-submission-button"> Close </button>
                        </div>)}
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
                        <input type="text" placeholder="Write your draft" className = "dashboard-task-content-form-input" onChange={this.handleInputChange}></input>
                    </label>
                    <button type={"button"} className = "dashboard-task-content-form-submit-button" onClick={this.sendSolution}>
                        Submit
                    </button>
                </form>
                <button onClick={this.closeTask} className = "dashboard-task-content-go-back"> Back </button>

            </div>
        )
    }
}

export default TaskManager