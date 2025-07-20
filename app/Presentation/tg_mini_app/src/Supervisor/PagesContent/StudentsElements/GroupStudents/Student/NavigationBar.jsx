
import React from "react"
import "./NavigationBar.css"
import StudentInfo from "./StudentInfo/StudentInfo.jsx";
import SubmissionInfo from "./SubmissionInfo/SubmissionInfo.jsx";
import ThesisInfo from "./ThesisInfo/ThesisInfo.jsx";
import {IconSquareRoundedXFilled, IconUser, IconBook, IconAlignBoxBottomCenter} from "@tabler/icons-react"

class NavigationBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            studentInfo: true,
            thesisInfo: false,
            submissionInfo: false,
        }
        this.changePage = this.changePage.bind(this);
        this.close = this.close.bind(this);
    }

    close() {
        this.props.close(null);
    }

    changePage(newPage) {
        if(newPage === "studentInfo") {
            this.setState({studentInfo: true, thesisInfo: false, submissionInfo: false});
        }
        if(newPage === "thesisInfo") {
            this.setState({studentInfo: false, thesisInfo: true, submissionInfo: false});
        }
        if(newPage === "submissionInfo") {
            this.setState({studentInfo: false, thesisInfo: false, submissionInfo: true});
        }
    }

    render() {
        return(
            <div className={`navigation-bar-modal-page`}>
                <div className={`navigation-bar-header`}>
                    <div className={`navigation-bar-header-title`}> Student Card </div>
                    <IconSquareRoundedXFilled size={20} onClick={this.close} className={`navigation-bar-close-icon`}/>
                </div>
                <div className="navigation-bar-scroll-content">
                    {this.state.studentInfo && <StudentInfo data={this.props.data}/>}
                    {this.state.thesisInfo && <ThesisInfo data={this.props.data}/>}
                    {this.state.submissionInfo && <SubmissionInfo data={this.props.data}/>}
                </div>
                <div className={`navigation-bar-icons-block`}>
                    <IconUser size={20} onClick={() => this.changePage("studentInfo")} className={`navigation-bar-page-icon`}/>
                    <IconBook size={20} onClick={() => this.changePage("thesisInfo")} className={`navigation-bar-page-icon`}/>
                    <IconAlignBoxBottomCenter size={20} onClick={() => this.changePage("submissionInfo")} className={`navigation-bar-page-icon`}/>
                </div>
            </div>
        )
    }
}

export default NavigationBar