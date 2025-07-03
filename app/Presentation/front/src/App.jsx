// import Authorization from "./authorization.jsx";
import MainPage from "./main_page.jsx";
import {useState} from "react";
import {SidebarMenu} from "./components/sidebar.jsx"
import StudentList from './components/student_list';
import SupervisorList from './components/supervisor_list';

function App() {
    console.log('🟢 App rendered');
    // const [isAuthenticated, setIsAuthenticated] = useState(false);
    //
    // return (
    // <div>
    //   {isAuthenticated ? (
    //     <MainPage isAuthenticated={isAuthenticated} />
    //   ) : (
    //     <Authorization onAuthSuccess={() => setIsAuthenticated(true)} />
    //   )}
    // </div>
    // );
    const [page, setPage] = useState("menu")

    const renderContent = {
        menu: <MainPage onSelect={setPage} />,
        students: <StudentList onBackToMenu={() => setPage('menu')} />,
        supervisors: <SupervisorList onBackToMenu={() => setPage('menu')} />,
    }[page];

  return (
    <SidebarMenu onSelect={setPage}>
      {renderContent}
    </SidebarMenu>
  );
}

export default App;