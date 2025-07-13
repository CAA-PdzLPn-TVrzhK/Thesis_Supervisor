
import axios from "axios"
import React from "react"
import {supabase} from "../../ClientSupabase.jsx";
import { IconX } from "@tabler/icons-react";
import "./setProfile.css"

class SetProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            firstname: "",
            lastname: "",
            file: null,
            error: "",
        }
        this.close = this.close.bind(this);
        this.handleFileChange = this.handleFileChange.bind(this);
        this.handleFirstnameChange = this.handleFirstnameChange.bind(this);
        this.handleLastnameChange = this.handleLastnameChange.bind(this);
        this.closeSuccessful = this.closeSuccessful.bind(this);
        this.upload = this.upload.bind(this);
    }

    handleFirstnameChange(event) {
        this.setState(() => {
            return {
                firstname: event.target.value,
            }
        })
    }
    handleLastnameChange(event) {
        this.setState(() => {
            return {
                lastname: event.target.value,
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

    close() {
        this.props.close();
    }

    async upload() {
        let finalError = "";

        if (this.state.firstname.trim() !== "" ) {
            finalError = "changes are saved";
            const data = {first_name: this.state.firstname};
            await axios.patch(`${window.TelegramWebApp.API_BASE}/users?id=eq.${window.TelegramWebApp.userId}`, data, {headers: window.TelegramWebApp.headers,});
        }

        if (this.state.lastname.trim() !== "" ) {
            finalError = "changes are saved";
            const data = {last_name: this.state.lastname};
            await axios.patch(`${window.TelegramWebApp.API_BASE}/users?id=eq.${window.TelegramWebApp.userId}`, data, {headers: window.TelegramWebApp.headers,});
        }

        if (this.state.file) {
            const fileName = `${window.TelegramWebApp.userId}/avatar.jpg`;
            const {data, error} = await supabase.storage.from('supervisor-data').upload(fileName, this.state.file, { upsert: true });

            if (error) {
                finalError = "error in uploading file";
            } else {
                finalError = "changes are saved";
            }
        }

        if (finalError === "") {
            finalError = "you should fill at least one field";
        }
        this.setState({error: finalError});
    }

    closeSuccessful() {
        this.setState(() => {
            return {
                error: "",
            }
        })
    }

    render() {
        return (
            <div className="set-profile-container">
                <div className="set-profile-close-block">
                    <IconX size={20} className="settings-common-close-icon" onClick={this.close}/>
                </div>
                <div className="set-profile-name-block">
                    <span className="set-profile-name-block-text"> Write new firstname if you want: </span>
                    <span className="set-profile-name-block-input-block">
                        <label>
                            <input type="text" placeholder="new firstname" onChange={this.handleFirstnameChange} className="set-profile-name-block-input"></input>
                        </label>
                    </span>
                </div>
                <div className="set-profile-name-block">
                    <span className="set-profile-name-block-text"> Write new lastname if you want: </span>
                    <span className="set-profile-name-block-input-block">
                        <label>
                            <input type="text" placeholder="new lastname" onChange={this.handleLastnameChange} className="set-profile-name-block-input"></input>
                        </label>
                    </span>
                </div>
                <div className="set-profile-avatar-block">
                    <span className="set-profile-avatar-block-text"> Upload new avatar if you want: </span>
                    <span className="set-profile-avatar-block-input-block">
                        <label>
                            <input type="file" placeholder="new avatar" onChange={this.handleFileChange} className="set-profile-avatar-block-input"></input>
                        </label>
                    </span>
                </div>
                <div className="set-profile-save-block">
                    <button onClick={this.upload} className="set-profile-save-button"> save </button>
                </div>
                {this.state.error === "" ? "" : (
                    this.state.error === "changes are saved" ? (
                        <div className="set-profile-successful-block">
                            {this.state.error}
                            <IconX size={20} onClick={this.closeSuccessful} className="set-profile-successful-close-icon"/>
                        </div>
                    ) : (
                        <div className="set-profile-unsuccessful-block">
                            {this.state.error}
                            <IconX size={20} className="set-profile-unsuccessful-close-icon" onClick={this.closeSuccessful}/>
                        </div>
                    )
                )}
            </div>
        )
    }
}

export default SetProfile