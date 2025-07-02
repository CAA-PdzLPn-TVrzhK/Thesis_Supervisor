
import React from "react";
import Profile from "./PagesContent/ProfileElements/Profile.jsx";
import Leaderboard from "./PagesContent/Leaderboard.jsx";
import Calendar from "./PagesContent/CalendarElements/CalendarDemo.jsx";
import Dashboard from "./PagesContent/Dashboard.jsx";
import "./BasePageComponent.css"

class Selector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: null,
        }
    }

    render() {
        switch(this.props.currentPage) {
            case "profile":
                return <Profile />;
            case "leaderboard":
                return <Leaderboard />;
            case "calendar":
                return <Calendar />;
            case "dashboard":
                return <Dashboard />;
            default:
                return <div>Страница не найдена</div>;
        }
    }
}

export default Selector;