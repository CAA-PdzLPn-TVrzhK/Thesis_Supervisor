
import React from "react";
import Profile from "./PagesContent/ProfileElements/Profile.jsx";
import Leaderboard from "./PagesContent/LeaderboardElements/Leaderboard.jsx";
import Calendar from "./PagesContent/CalendarElements/CalendarDemo.jsx";
import Dashboard from "./PagesContent/DashboardElements/Dashboard.jsx";
import "./BasePageComponent.css"

class Selector extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPage: null,
        }
        this.goToPage = this.goToPage.bind(this);
    }

    goToPage(page) {
        this.props.setCurrentPage(page);
    }

    render() {
        switch(this.props.currentPage) {
            case "profile":
                return <Profile setCurrentPage={this.goToPage}/>;
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