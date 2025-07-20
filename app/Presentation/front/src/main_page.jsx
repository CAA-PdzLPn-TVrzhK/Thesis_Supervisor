import Dashboard from "./components/dashboard.jsx";
import { useNavigate } from "react-router-dom";
export default function MainPage() {
    const navigate = useNavigate();
    return <Dashboard onNavigate={navigate} />;
}

