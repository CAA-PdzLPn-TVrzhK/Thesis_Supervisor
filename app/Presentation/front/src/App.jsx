import MainPage from "./main_page.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import {SidebarMenu} from "./components/sidebar.jsx"
import StudentList from './components/student_list';
import SupervisorList from './components/supervisor_list';
import NewStudentList from './components/new-students-list.jsx';
import NewSupervisorsList from './components/new-supervisors-list.jsx';
import MilestonesList from './components/milestones-list.jsx';
import Settings from './components/settings.jsx';
import GroupsList from './components/groups-list.jsx';
import { ThemeProvider } from './components/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <SidebarMenu>
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/supervisors" element={<SupervisorList />} />
            <Route path="/new-students" element={<NewStudentList />} />
            <Route path="/new-supervisors" element={<NewSupervisorsList />} />
            <Route path="/groups" element={<GroupsList />} />
            <Route path="/milestones" element={<MilestonesList />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </SidebarMenu>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;