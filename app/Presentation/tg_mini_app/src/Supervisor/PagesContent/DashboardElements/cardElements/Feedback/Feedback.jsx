
import React from "react"
import {IconX} from "@tabler/icons-react";
import axios from "axios";
import "./Feedback.css"
import {supabase} from "../../../../../ClientSupabase.jsx";

class Feedback extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: "",
            commentsError: "",
            file: null,
            fileError: "",
            grade: "",
            gradeError: "",
            uploadingFeedback: null,
        }
        this.close = this.close.bind(this);
        this.handleCommentsChange = this.handleCommentsChange.bind(this);
        this.handleGradeChange = this.handleGradeChange.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);

        this.send = this.send.bind(this);
        this.closeSuccessfulMessage = this.closeSuccessfulMessage.bind(this);
    }

    handleCommentsChange(event) {
        this.setState(() => {
            return {
                comments: event.target.value,
            }
        })
    }
    handleFileChange(event) {
        this.setState(() => {
            return {
                file: event.target.files[0],
            }
        })
    }
    handleGradeChange(event) {
        this.setState(() => {
            return {
                grade: event.target.value,
            }
        })
    }

    close() {
        this.props.close(null);
    }

    closeSuccessfulMessage() {
        this.setState({uploadingFeedback: null});
    }

    validate() {
        let fileError = "";
        let commentsError = "";
        let gradeError = "";
        const isOnlyDigits = (str) => /^[0-9]+$/.test(str);
        if(this.state.file === null) {
            fileError = "file cannot be empty";
        } else if(this.state.file.type !== "application/pdf") {
            fileError = "please upload pdf file";
        }
        if(this.state.comments.trim() === "") {
            commentsError = "comments cannot be empty";
        }
        if(this.state.grade.trim() === "") {
            gradeError = "grade cannot be empty";
        } else if(!isOnlyDigits(this.state.grade)) {
            gradeError = "grade must be a positive integer";
        } else if(parseInt(this.state.grade) > this.props.data.milestone.weight) {
            gradeError = "grade cannot be greater then weight of milestone";
        }
        this.setState(() => {
            return {
                fileError: fileError,
                commentsError: commentsError,
                gradeError: gradeError,
            }
        })
        return [fileError, commentsError, gradeError]
    }

    async send() {
        const validation = this.validate();
        if(validation[0].trim() === "" && validation[1].trim() === "" && validation[2].trim() === "") {
            const feedback = await axios.get(`${window.TelegramWebApp.API_BASE}feedback?submission_id=eq.${this.props.data.submission.id}`, {headers: window.TelegramWebApp.headers});
            if(feedback.data.length > 0) {
                try {
                    const updateData = {
                        comments: this.state.comments,
                        created_at: new Date().toISOString(),
                        rating: Number(this.state.grade)
                    }
                    console.log('update data:', updateData);

                    await axios.patch(`${window.TelegramWebApp.API_BASE}feedback?submission_id=eq.${this.props.data.submission.id}`, updateData, {
                        headers: window.TelegramWebApp.headers,
                        Prefer: "resolution=merge-duplicates",
                    });
                } catch (e) {
                    console.log("error:", e);
                    return;
                }
            } else {
                try {
                    const supervisorData = await axios.get(`${window.TelegramWebApp.API_BASE}supervisors?user_id=eq.${window.TelegramWebApp.userId}`, {headers: window.TelegramWebApp.headers});
                    const newData = {
                        comments: this.state.comments,
                        created_at: new Date().toISOString(),
                        rating: Number(this.state.grade),
                        supervisor_id: supervisorData.data[0].id,
                        student_id: this.props.data.student.id,
                        submission_id: this.props.data.submission.id
                    }
                    console.log('new data:', newData);

                    await axios.post(`${window.TelegramWebApp.API_BASE}feedback`, newData, {headers: window.TelegramWebApp.headers});
                } catch (e) {
                    console.log("error:", e);
                    return;
                }
            }

            const path = `${window.TelegramWebApp.userId}/${this.props.data.student.id}/${this.props.data.milestone.id}/feedback.pdf`;
            const {data, error} = await supabase.storage.from('supervisor-data').upload(path, this.state.file, { upsert: true });
            if (error) {
                console.error('Ошибка загрузки файла:', error);
                this.setState({uploadingFeedback: false});
            } else {
                console.log('Файл успешно загружен:', data);
                this.setState({uploadingFeedback: true});
            }
        }
    }

    render() {
        const data = this.props.data;
        return (
            <div className={`modal-draft-info-container`}>
                <IconX size={20} onClick={this.close} className={`draft-info-container-close-button`}/>
                <div className={`draft-info-container-main-block`}>
                    <div className={`draft-info-container-main-block-title`}>
                        Feedback Form
                    </div>
                    <form>
                        <div>
                            <span> Grade draft (out of {data.milestone.weight}). </span>
                            <span>
                                <label>
                                    <input type="text" placeholder="grade" onChange={this.handleGradeChange} ></input>
                                </label>
                            </span>
                            <span>
                                {this.state.gradeError.length === 0 ? "" : `${this.state.gradeError}`}
                            </span>
                        </div>
                        <div>
                            <span> Write comment for feedback. </span>
                            <span>
                                <label>
                                    <input type="text" placeholder="comment" onChange={this.handleCommentsChange} ></input>
                                </label>
                            </span>
                            <span>
                                {this.state.commentsError.length === 0 ? "" : `${this.state.commentsError}`}
                            </span>
                        </div>
                        <div>
                            <span> Choose file for feedback. </span>
                            <span>
                                <label>
                                    <input type="file" placeholder="choose file" onChange={this.handleFileChange}></input>
                                </label>
                            </span>
                            <span>
                                {this.state.fileError.length === 0 ? "" : `${this.state.fileError}`}
                            </span>
                        </div>
                        <button type="button" onClick={this.send}> send </button>
                        {this.state.uploadingFeedback === true ? <div>
                            <div> You sent the feedback. </div>
                            <IconX size={20} onClick={this.closeSuccessfulMessage}/>
                        </div> : (this.state.uploadingFeedback === false ? <div>
                            <div> You have failed uploading feedback. </div>
                            <IconX size={20} onClick={this.closeSuccessfulMessage}/>
                        </div> : <div></div>)}
                    </form>
                </div>
            </div>
        )
    }
}

export default Feedback