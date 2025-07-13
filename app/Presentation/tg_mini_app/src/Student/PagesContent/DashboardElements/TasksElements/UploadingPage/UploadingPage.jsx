
import React from "react"
import {IconX} from "@tabler/icons-react";
import axios from "axios";
import "./uploadingPage.css"
import {supabase} from "../../../../../ClientSupabase.jsx";

class UploadingPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            comments: "",
            commentsError: "",
            file: null,
            fileError: "",
            uploadingDraft: false,
        }
        this.closeUploadingPage = this.closeUploadingPage.bind(this);
        this.handleCommentsChange = this.handleCommentsChange.bind(this);
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

    closeUploadingPage() {
        this.props.close();
    }

    closeSuccessfulMessage() {
        this.setState({uploadingDraft: false});
    }

    validate() {
        let fileError = "";
        let commentsError = "";
        if(this.state.file === null) {
            fileError = "file cannot be empty";
        } else if(this.state.file.type !== "application/pdf") {
            fileError = "please upload pdf file";
        }
        if(this.state.comments.trim() === "") {
            commentsError = "comments cannot be empty";
        }
        this.setState(() => {
            return {
                fileError: fileError,
                commentsError: commentsError,
            }
        })
        return [fileError, commentsError]
    }

    async send() {
        const validation = this.validate();
        if(validation[0].trim() === "" && validation[1].trim() === "") {
            const submission = await axios.get(`${window.TelegramWebApp.API_BASE}submissions?milestone_id=eq.${this.props.milestone.id}`, {headers: window.TelegramWebApp.headers});
            if(submission.data.length > 0) {
                try {
                    const updateData = {
                        comments: this.state.comments,
                        submitted_at: new Date().toISOString(),
                        status: "pending"
                    }

                    await axios.patch(`${window.TelegramWebApp.API_BASE}submissions?milestone_id=eq.${this.props.milestone.id}`, updateData, {
                        headers: window.TelegramWebApp.headers,
                        Prefer: "resolution=merge-duplicates",
                    });
                } catch (e) {
                    console.log("error:", e);
                    return;
                }
            } else {
                try {
                    const studentData = await axios.get(`${window.TelegramWebApp.API_BASE}students?user_id=eq.${window.TelegramWebApp.userId}`, {headers: window.TelegramWebApp.headers});
                    const newData = {
                        milestone_id: this.props.milestone.id,
                        student_id: studentData.data[0].id,
                        comments: this.state.comments,
                        submitted_at: new Date().toISOString(),
                        status: "pending"
                    }

                    await axios.post(`${window.TelegramWebApp.API_BASE}submissions`, newData, {headers: window.TelegramWebApp.headers});
                } catch (e) {
                    console.log("error:", e);
                    return;
                }
            }

            const path = `${window.TelegramWebApp.userId}/${this.props.milestone.id}/submission.pdf`;
            const {data, error} = await supabase.storage.from('student-data').upload(path, this.state.file, { upsert: true });
            if (error) {
                console.error('Ошибка загрузки файла:', error);
            } else {
                console.log('Файл успешно загружен:', data);
                this.setState({uploadingDraft: true});
            }
        }
    }

    render() {
        const data = this.props.milestone;
        return (
            <div className="upload-draft-modal-container">
                <div className="upload-draft-container">
                    {data.status === "done" || data.status === "not started" ? (
                        <div className="upload-draft-error-block">
                            <div className="upload-draft-error-block-text">
                                You can only upload work to the current milestone.
                            </div>
                            <IconX size={20} onClick={this.closeUploadingPage} className="upload-draft-close-button"/>
                        </div>
                    ) : (
                        <div className="upload-draft-form-block">
                            <div>
                                <div className = "upload-draft-info-block-title"> Uploading form </div>
                                <IconX size={20} onClick={this.closeUploadingPage} className="upload-draft-close-button"/>
                            </div>
                            <form className="upload-draft-form">
                                <div className="upload-draft-form-element">
                                    <span className="upload-draft-form-element-label"> Write comment for draft. </span>
                                    <span className="upload-draft-form-element-value">
                                        <label>
                                            <input type="text" placeholder="comment" onChange={this.handleCommentsChange} className="upload-draft-form-element-value-input"></input>
                                        </label>
                                    </span>
                                    <span className="upload-draft-form-element-error">
                                        {this.state.commentsError.length === 0 ? "" : `${this.state.commentsError}`}
                                    </span>
                                </div>
                                <div className="upload-draft-form-element">
                                    <span className="upload-draft-form-element-label"> Choose file for draft. </span>
                                    <span className="upload-draft-form-element-value">
                                        <label>
                                            <input type="file" placeholder="choose file" onChange={this.handleFileChange} className="upload-draft-form-element-value-input"></input>
                                        </label>
                                    </span>
                                    <span className="upload-draft-form-element-error">
                                        {this.state.fileError.length === 0 ? "" : `${this.state.fileError}`}
                                    </span>
                                </div>
                                <button type="button" onClick={this.send} className="upload-draft-form-button-send"> send </button>
                                {this.state.uploadingDraft === true ? <div className="upload-draft-successful-upload-message">
                                    <div className="upload-draft-successful-upload-message-text"> You sent the draft for review. </div>
                                    <IconX size={20} onClick={this.closeSuccessfulMessage} className="upload-draft-successful-upload-message-close-button"/>
                                </div> : <div></div>}
                            </form>
                        </div>
                    )}
                </div>
            </div>
        );
    }
}

export default UploadingPage