import StudentList from "./components/student_list"
import SupervisorList from "./components/supervisor_list"
import './components/index.css';
import {useState} from "react";


export default function MainPage() {
    // current — это ключ текущей “страницы”
    const [current, setCurrent] = useState('menu');

    // Функция, которая возвращает нужный компонент
    const renderContent = () => {
        switch (current) {
            case 'page1':
                return <StudentList onBackToMenu={() => setCurrent('menu')}/>;
            case 'page2':
                return <SupervisorList onBackToMenu={() => setCurrent('menu')}/>;
            default:
                // Главное меню с тремя кнопками
                return (
                    <div className="menuContainer">
                        <button onClick={() => setCurrent('page1')} className={"mainButton"}>
                            Go to the List of Students
                        </button>
                        <button onClick={() => setCurrent('page2')} className={"mainButton"}>
                            Go to the List of Supervisors
                        </button>
                    </div>
                );
        }
    };

    return (
    <div>
      {renderContent()}
    </div>
  );
}

