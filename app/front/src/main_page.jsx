import StudentList from "./components/student_list"
import SupervisorList from "./components/supervisor_list"
import GroupList from "./components/group_list"
import './components/index.css';
import {useState} from "react";


function MainPage() {
    // current — это ключ текущей “страницы”
    const [current, setCurrent] = useState('menu');

    // Функция, которая возвращает нужный компонент
    const renderContent = () => {
        switch (current) {
            case 'page1':
                return <StudentList/>;
            case 'page2':
                return <SupervisorList/>;
            case 'page3':
                return <GroupList/>;
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
                        <button onClick={() => setCurrent('page3')} className={"mainButton"}>
                            Go to the List of Groups
                        </button>
                    </div>
                );
        }
    };

    return (
    <div>
      {renderContent()}
      {/* Кнопка возврата в меню */}
      {current !== 'menu' && (
        <button onClick={() => setCurrent('menu')} className="backButton">
          ← Back to menu
        </button>
      )}
    </div>
  );
}

export default MainPage;