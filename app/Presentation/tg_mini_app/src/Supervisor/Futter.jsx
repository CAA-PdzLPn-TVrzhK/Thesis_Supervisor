
import React from "react"
import { IconUser, IconCalendar, IconLayoutDashboard, IconAlignCenter } from "@tabler/icons-react";
import "./BasePageComponent.css"

class Futter extends React.Component {
    handleNav = (page) => {
        if (this.props.setCurrentPage) {
            this.props.setCurrentPage(page);
        }
    }
    render() {
        return (
            <div className="futter futter-nav">
                <div className="futter-nav-bar">
                    <span className="futter-nav-item" onClick={() => this.handleNav("profile")}> <IconUser size={28}/> </span>
                    <span className="futter-nav-item" onClick={() => this.handleNav("calendar")}> <IconCalendar size={28}/> </span>
                    <span className="futter-nav-item" onClick={() => this.handleNav("dashboard")}> <IconLayoutDashboard size={28}/> </span>
                    <span className="futter-nav-item" onClick={() => this.handleNav("students")}> <IconAlignCenter size={28}/> </span>
                </div>
            </div>
        )
    }
}

export default Futter