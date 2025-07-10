
import React from "react"
import "./BasePageComponent.css"
import {IconSchool} from "@tabler/icons-react";
import Settings from "./Settings/Settings.jsx";
import {IconSettings} from "@tabler/icons-react";

class Header extends React.Component {
    constructor() {
        super();
        this.state = {
            settings: false,
        }
        this.changeSettings = this.changeSettings.bind(this);
    }

    changeSettings() {
        this.setState((p) => {
            return {
                settings: !p.settings,
            }
        })
    }

    render() {
        return (
            <>
            <div className="header header-top">
                <div className="header-logo-block">
                    <IconSchool size={36} className="header-logo"/>
                    <span className="header-title">Innopolis Thesis Supervisor</span>
                </div>
                <div className="header-settings-block">
                    <IconSettings size={24} className="header-settings-icon" onClick={() => this.changeSettings()}/>
                </div>
            </div>
            {this.state.settings ? <Settings close = {this.changeSettings} /> : ""}
            </>
        )
    }
}

export default Header;