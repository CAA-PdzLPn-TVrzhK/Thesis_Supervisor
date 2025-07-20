
import React from "react"
import axios from "axios";
import NavigationBar from "./Student/NavigationBar.jsx";
import {IconInfoCircleFilled, IconArrowBigDownLinesFilled} from "@tabler/icons-react"
import ReactDom from "react-dom";
import "./Group.css"

class Group extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            students: [],
            navigationBar: false,
            currentStudent: null,
        }
        this.openStudentInfo = this.openStudentInfo.bind(this);
    }

    async componentDidMount() {
        const students = await axios.get(`${window.TelegramWebApp.API_BASE}students?peer_group_id=eq.${this.props.group.id}`, {headers: window.TelegramWebApp.headers});
        const info = [];

        for(let student of students.data) {
            const user = await axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${student.user_id}`, {headers: window.TelegramWebApp.headers});
            info.push({user: user.data[0], student: student});
        }

        this.setState({students: info});
    }

    openStudentInfo(currentStudent) {
        this.setState((p) => {
            return {
                navigationBar: !p.navigationBar,
                currentStudent: currentStudent,
            }
        })
    }

    render() {
        return (
            <div className={`peer-group-container`}>
                {this.state.navigationBar && ReactDom.createPortal(
                    <NavigationBar data={this.state.currentStudent} close={this.openStudentInfo}/>,
                    document.getElementById("modal-root")
                )}
               <div className={`peer-group-container-title-block`}>
                   <div className={`peer-group-container-title`}> {this.props.group.name} </div>
                   <IconArrowBigDownLinesFilled size={20} onClick={() => this.setState({open: !this.state.open})} className={`peer-group-container-title-icon ${this.state.open===true ? "open" : ""}`}/>
               </div>
               {this.state.open && (
                    <div className={`peer-group-container-students-block`}>
                        {this.state.students.map((studentData) => {
                            return (
                                <div key={studentData.user.id}  className={`peer-group-container-students-block-element`}>
                                    <div className={`peer-group-container-students-block-element-name`}> {studentData.user.first_name} {studentData.user.last_name} </div>
                                    <IconInfoCircleFilled size={20} onClick={() => this.openStudentInfo(studentData)} className={`peer-group-container-students-block-element-info-icon`}/>
                                </div>
                            )
                        })}
                   </div>
               )}
           </div>
        )
    }
}

export default Group