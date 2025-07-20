
import React from "react"
import {IconX} from "@tabler/icons-react";
import axios from "axios";
import "./ThesisInfo.css"


class ThesisInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            thesis: null,
        }
        this.close = this.close.bind(this);
    }

    async componentDidMount() {
        const thesis = await axios.get(`${window.TelegramWebApp.API_BASE}theses?student_id=eq.${this.props.data.student.id}`, { headers: window.TelegramWebApp.headers });
        console.log(thesis.data[0], this.props.data.student);
        this.setState({thesis: thesis.data[0]});
    }

    close() {
        this.props.close(null);
    }

    render() {
        if(this.state.thesis === null) {
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }
        return (
            <div className={`modal-thesis-info-container`}>
                <IconX size={20} onClick={this.close} className={`thesis-info-container-close-button`}/>
                <div className={`thesis-info-container-main-block`}>
                    <div className={`thesis-info-container-main-block-title`}>
                        Thesis Info
                    </div>
                    <div className={`thesis-info-container-main-block-body`}>
                        <div className={`thesis-info-container-main-block-body-element`}>
                            <div className={`thesis-info-container-main-block-body-element-label`}> title: </div>
                            <div className={`thesis-info-container-main-block-body-element-value`}> {this.state.thesis.title} </div>
                        </div>
                        <div className={`thesis-info-container-main-block-body-element`}>
                            <div className={`thesis-info-container-main-block-body-element-label`}> description: </div>
                            <div className={`thesis-info-container-main-block-body-element-value`}> {this.state.thesis.description} </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default ThesisInfo