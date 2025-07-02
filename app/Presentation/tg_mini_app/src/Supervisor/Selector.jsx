
import React from "react";
import Profile from "./PagesContent/Profile.jsx";
import Calendar from "./PagesContent/Calendar.jsx";
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