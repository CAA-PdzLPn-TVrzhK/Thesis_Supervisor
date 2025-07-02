
import axios from 'axios';
import React from "react";

class Leaderboard extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            data: [],
            loading: true,
            error: false,
        }

        axios.get(`${window.TelegramWebApp.API_BASE}users?id=eq.${window.TelegramWebApp.userId}`).then(res => {
            this.setState({data: res.data});
        }).catch(() => {
            this.setState({error: true});
        }).finally(() => {
            this.setState({loading: false});
        })
    }

    render() {
        return (
            <div className={'profile-container'}>
                <main>
                    <div>
                        <table className="leaderboard-table">
                            <thead>
                            <tr>
                                <td>Place</td>
                                <td>Student</td>
                                <td>Score</td>
                            </tr>
                            </thead>
                            <tbody>
                            <tr>
                                <td>1</td>
                                <td>Student</td>
                                <td>Score</td>
                            </tr>
                            <tr>
                                <td>2</td>
                                <td>Student</td>
                                <td>Score</td>
                            </tr>
                            <tr>
                                <td>3</td>
                                <td>Student</td>
                                <td>Score</td>
                            </tr>
                            <tr>
                                <td>Place</td>
                                <td>{this.state.data.first_name} {this.state.data.last_name}</td>
                                <td> 6941 </td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </main>
            </div>
        )
    }
}

export default Leaderboard