import axios from 'axios';
import StudentProfile from "./Student/Profile"
import SupervisorProfile from "./Supervisor/Profile"
import React from "react";

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
                    <StudentProfile id={window.TelegramWebApp.userId}/>
                </div>
            )
        } else {
            return (
                <div>
                    <SupervisorProfile id={window.TelegramWebApp.userId}/>
                </div>
            )
        }
    }
}

export default App;