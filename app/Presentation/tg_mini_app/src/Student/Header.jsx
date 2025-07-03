
import React from "react"
import "./BasePageComponent.css"

class Header extends React.Component {
    constructor(props) {
        super(props);

    }

    goToPage(page) {
        this.props.setCurrentPage(page);
    }

    render() {
        return (
            <header className="header">
                <div className="navigation-bar">
                    <span onClick={() => this.goToPage("profile")} className="navigation-item"> Profile </span>
                    <span onClick={() => this.goToPage("leaderboard")} className="navigation-item"> Leaderboard </span>
                    <span onClick={() => this.goToPage("calendar")} className="navigation-item"> Calendar </span>
                    <span onClick={() => this.goToPage("dashboard")} className="navigation-item"> Dashboard </span>
                </div>
            </header>
        )
    }
}

export default Header;