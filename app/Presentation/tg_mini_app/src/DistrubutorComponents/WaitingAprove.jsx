
import React from "react"

class WaitingAprove extends React.Component {
    render() {
        return (
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: "50vh",
                fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
                color: "#333",
                textAlign: "center",
                padding: "20px"
            }}>
                <h2>Your application is awaiting confirmation</h2>
                <p>
                    Thank you for registering! We will check your details and confirm your access soon.
                </p>
            </div>
        )
    }
}

export default WaitingAprove