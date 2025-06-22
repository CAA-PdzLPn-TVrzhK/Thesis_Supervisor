<<<<<<<<< Temporary merge branch 1:app/Presentation/tg_mini_app/src/App.jsx
import Profile from "./Student/Profile.jsx"
=========
import axios from 'axios';
import StudentProfile from "./Student/Profile"
import SupervisorProfile from "./Supervisor/Profile"
import React from "react";
>>>>>>>>> Temporary merge branch 2:app/tg_mini_app/src/App.jsx

const API_BASE = "https://52.87.161.100:8000/"

class App extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            data: [],
            error: false,
            loading: true,
        }
    }

    componentDidMount() {
        axios.get(`${window.TelegramWebApp.API_BASE}users/telegram/${window.TelegramWebApp.userId}`)
            .then(res => {
                this.setState({ data: res.data });
            })
            .catch(() => {
                this.setState({ error: true });
            })
            .finally(() => {
                this.setState({ loading: false });
            });
    }

    render() {
        if (this.state.data.role === "student") {
            return (
                <div>
                    <StudentProfile data={this.state.data}/>
                </div>
            )
        } else {
            return (
                <div>
                    <SupervisorProfile data={this.state.data}/>
                </div>
            )
        }
    }
}

export default App;