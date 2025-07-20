
import React from "react"
import axios from "axios";
import "./ThesisInfo.css"

class ThesisInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            thesis: null,
        }
    }

    async componentDidMount() {
        const thesis = await axios.get(`${window.TelegramWebApp.API_BASE}theses?student_id=eq.${this.props.data.student.id}`, {headers: window.TelegramWebApp.headers});
        this.setState({thesis: thesis.data[0]});
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
            <div className={`navigation-bar-thesis-info-container`}>
                <div className={`navigation-bar-thesis-info-container-element`}>
                    <div className={`navigation-bar-thesis-info-container-element-label`}> Thesis title: </div>
                    <div className={`navigation-bar-thesis-info-container-element-value`}> {this.state.thesis.title} </div>
                </div>
                <div className={`navigation-bar-thesis-info-container-element`}>
                    <div className={`navigation-bar-thesis-info-container-element-label`}> Thesis description: </div>
                    <div className={`navigation-bar-thesis-info-container-element-value`}> {this.state.thesis.description} </div>
                </div>
            </div>
        )
    }
}

export default ThesisInfo