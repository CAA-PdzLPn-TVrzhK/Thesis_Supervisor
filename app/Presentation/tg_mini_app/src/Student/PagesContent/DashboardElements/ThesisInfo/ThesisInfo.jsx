
import React from "react"
import {IconX} from "@tabler/icons-react";
import "./thesisInfo.css"

class ThesisInfo extends React.Component {
    constructor(props) {
        super(props);
        this.back = this.back.bind(this);
    }

    back() {
        this.props.back();
    }

    render() {
        const thesis = this.props.thesis;
        return (
            <div className="thesis-info-container">
                <div className = "dashboard-content-thesis-block">
                    <div className = "dashboard-content-thesis-block-title"> Thesis </div>
                    <IconX size={20} onClick={this.back} className="thesis-info-close-button"/>
                    <div className = "dashboard-content-thesis-title-block">
                        <div className = "dashboard-content-thesis-title"> Thesis Title </div>
                        <div className = "dashboard-content-thesis-title-info"> {thesis.title} </div>
                    </div>
                    <div className = "dashboard-content-thesis-description-block">
                        <div className = "dashboard-content-thesis-description"> Thesis description </div>
                        <div className = "dashboard-content-thesis-description-info"> {thesis.description} </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ThesisInfo