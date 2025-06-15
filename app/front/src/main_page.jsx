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
                    <div>
                        <button onClick={() => setCurrent('List of students')} className={"mainButton"}>
                            Перейти на страницу 1
                        </button>
                        <button onClick={() => setCurrent('List of supervisors')} className={"mainButton"}>
                            Перейти на страницу 2
                        </button>
                        <button onClick={() => setCurrent('List of groups')} className={"mainButton"}>
                            Перейти на страницу 3
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
        <button onClick={() => setCurrent('menu')}>
          ← Назад в меню
        </button>
      )}
    </div>
  );
}

export default MainPage;