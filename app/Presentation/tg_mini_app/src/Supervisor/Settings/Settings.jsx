
import React from "react"
import { IconEdit, IconX } from "@tabler/icons-react";
import "./Settings.css"
import ReactDOM from "react-dom";
import SetProfile from "./SetProfile.jsx";

class Settings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            changeProfileInfo: false,
        }
        this.close = this.close.bind(this);
        this.changeSetProfile = this.changeSetProfile.bind(this);
    }

    close() {
        this.props.close();
    }

    changeSetProfile() {
        this.setState((p) => {
            return {
                changeProfileInfo: !p.changeProfileInfo,
            }
        });
    }

    render() {
        return ReactDOM.createPortal(
        this.state.changeProfileInfo ? (
            <div className="settings-overlay">
                <div className="settings-modal">
                    <SetProfile close={this.changeSetProfile} />
                </div>
            </div>
            ) : (
            <div className="settings-overlay">
                <div className="settings-modal">
                    <div className="settings-header">
                        <h2 className="settings-title">Settings</h2>
                        <IconX size={20} className="settings-close-icon" onClick={this.close}/>
                    </div>
                    
                    <div className="settings-content">
                        <div className="settings-section">
                            <h3 className="settings-section-title">Profile</h3>
                            <div className="settings-item">
                                <span className="settings-item-label">Change Profile Info</span>
                                <IconEdit size={18} className="settings-item-icon" onClick={this.changeSetProfile} />
                            </div>
                        </div>
                        
                        <div className="settings-section">
                            <h3 className="settings-section-title">Contact Support</h3>
                            <div className="settings-item">
                                <div className="settings-item-email">innopolis.university@gmail.com</div>
                            </div>
                            <div>
                                <div className="settings-item-phone">8-800-555-35-35</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>), document.getElementById("modal-root")
        )
    }
}

export default Settings