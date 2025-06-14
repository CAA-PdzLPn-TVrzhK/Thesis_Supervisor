import StudentList from "student_list"

function MainPage() {
    // current — это ключ текущей “страницы”
    const [current, setCurrent] = useState('menu');

    // Функция, которая возвращает нужный компонент
    const renderContent = () => {
        switch (current) {
            case 'page1':
                return <StudentList/>;
            case 'page2':
                return <Page2/>;
            case 'page3':
                return <Page3/>;
            default:
                // Главное меню с тремя кнопками
                return (
                    <div>
                        <button onClick={() => setCurrent('List of students')}>
                            Перейти на страницу 1
                        </button>
                        <button onClick={() => setCurrent('List of supervisors')}>
                            Перейти на страницу 2
                        </button>
                        <button onClick={() => setCurrent('List of groups')}>
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