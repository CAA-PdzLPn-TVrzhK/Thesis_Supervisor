
import React from "react";
import {getTopFive} from "./getTopFive.jsx";
import {getCurrentStudent} from "./getCurrentStudent.jsx";
import {getNumbetInTop} from "./getNumbetInTop.jsx";
import "./Leaderboard.css"

class Leaderboard extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            top_five_data: [],
            current_student_data: null,
            loading: true,
            error: false,
            number_in_top: null,
        }
    }

    async componentDidMount() {
        const topFive = await getTopFive();
        const currentStudent = await getCurrentStudent();
        const numberInTop = await getNumbetInTop(currentStudent[0].id);

        this.setState(() => {
            return {
                top_five_data: topFive,
                current_student_data: currentStudent,
                number_in_top: numberInTop,
            }
        });
        console.log('top five students:', this.state.top_five_data, 'current student:', this.state.current_student_data);
    }

    render() {
        if (!this.state.number_in_top || !this.state.current_student_data || this.state.top_five_data.length === 0) {
            return (
                <div className = "loader-container">
                    <img className = "loader-image" src="https://megakeys.info/icons/loader.gif" alt="Please, wait a bit" />
                </div>
            )
        }
        return (
            <div className = "leaderboard-container">
                <div className = "leaderboard-title"> Leaderboard </div>
                <div className = "leaderboard-current-student-block">
                    <div className = "leaderboard-current-student-block-header"> Your position in the top </div>
                    <div className = "leaderboard-current-student-info-block">
                        <span className = "leaderboard-current-student-info-name"> {this.state.current_student_data[1].first_name} {this.state.current_student_data[1].last_name} </span>
                        <span className = "leaderboard-current-student-info-position"> {this.state.number_in_top} </span>
                        <span className = "leaderboard-current-student-info-score"> {this.state.current_student_data[0].score} </span>
                    </div>
                </div>
                <div className = "leaderboard-table-container">
                    <table className = "leaderboard-table-block">
                        <thead className = "leaderboard-table-header-block">
                            <tr className = "leaderboard-table-header-row">
                                <td className = "leaderboard-table-header-element">Name</td>
                                <td className = "leaderboard-table-header-element">Place</td>
                                <td className = "leaderboard-table-header-element">Points</td>
                            </tr>
                        </thead>
                        <tbody className = "leaderboard-table-body-block">
                        {this.state.top_five_data.map((student, studentId) => {
                            return (
                                <tr key={studentId} className = "leaderboard-table-body-row">
                                    <td className = "leaderboard-table-body-element-name"> {student[1].first_name} {student[1].last_name} </td>
                                    <td className = "leaderboard-table-body-element-position"> {studentId + 1} </td>
                                    <td className = "leaderboard-table-body-element-score"> {student[0].score} </td>
                                </tr>
                            )
                        })}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
}

export default Leaderboard