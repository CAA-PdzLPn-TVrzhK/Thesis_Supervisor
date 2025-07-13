// import Authorization from "./authorization.jsx";
import MainPage from "./main_page.jsx";
import {useState} from "react";
import {SidebarMenu} from "./components/sidebar.jsx"
import StudentList from './components/student_list';
import SupervisorList from './components/supervisor_list';
import NewStudentList from './components/new-students-list.jsx';
import NewSupervisorsList from './components/new-supervisors-list.jsx';
import MilestonesList from './components/milestones-list.jsx';

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
    const [page, setPage] = useState("main-page")

    const renderContent = {
        'main-page': <MainPage onSelect={setPage} />,
        students: <StudentList onBackToMenu={() => setPage('main-page')} />,
        supervisors: <SupervisorList onBackToMenu={() => setPage('main-page')} />,
        'new-students': <NewStudentList onBackToMenu={() => setPage('main-page')} />,
        'new-supervisors': <NewSupervisorsList onBackToMenu={() => setPage('main-page')} />,
        'milestones': <MilestonesList onBackToMenu={() => setPage('main-page')} />,
    }[page];

  return (
    <SidebarMenu onSelect={setPage}>
      {renderContent}
    </SidebarMenu>
  );
}

export default App;