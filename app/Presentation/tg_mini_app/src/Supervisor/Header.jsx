
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
            <div className="header">
                <div className="nav-bar">
                    <span onClick={() => this.goToPage("profile")} className="navigation-item"> Profile </span>
                    <span onClick={() => this.goToPage("calendar")} className="navigation-item"> Calendar </span>
                    <span onClick={() => this.goToPage("dashboard")} className="navigation-item"> Dashboard </span>
                </div>
            </div>
        )
    }
}

export default Header;