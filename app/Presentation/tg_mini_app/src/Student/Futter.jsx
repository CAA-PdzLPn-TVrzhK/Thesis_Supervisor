
import React from "react"
import "./BasePageComponent.css"

class Futter extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className="futter">
                <div className="futter-content">
                    <span>number: </span>
                    <span>8-800-555-35-35</span>
                </div>
                <div>
                    <span>email: </span>
                    <span>innopolis.university@gmail.com</span>
                </div>
            </div>
        )
    }
}

export default Futter