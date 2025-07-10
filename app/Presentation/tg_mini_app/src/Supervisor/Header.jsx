
import React from "react"
import { IconSchool } from "@tabler/icons-react";
import "./BasePageComponent.css"

class Header extends React.Component {
    render() {
        return (
            <div className="header header-top">
                <div className="header-logo-block">
                    <IconSchool size={36} className="header-logo"/>
                    <span className="header-title">Innopolis Thesis Supervisor</span>
                </div>
                <div className="header-help-block">
                    <span className="header-help-title">Служба поддержки:</span>
                    <span className="header-help-email">innopolis.university@gmail.com</span>
                    <span className="header-help-phone">8-800-555-35-35</span>
                </div>
            </div>
        )
    }
}

export default Header;