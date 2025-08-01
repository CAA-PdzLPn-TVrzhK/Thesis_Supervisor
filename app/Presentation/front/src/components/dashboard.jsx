import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";
import axios from "axios";
import { useTheme } from './ThemeContext';
import { Link } from 'react-router-dom';

const API_URL = 'https://dprwupbzatrqmqpdwcgq.supabase.co/rest/v1/';
const API_HEADERS = {
  apikey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRwcnd1cGJ6YXRycW1xcGR3Y2dxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTExODQ3NzcsImV4cCI6MjA2Njc2MDc3N30.yl_E-xLFHTtkm_kx6bOkPenMG7IZx588-jamWhpg3Lc"
};

const COLORS = ["#000000", "#6366F1", "#9CA3AF"];

const TEXTS = {
  en: {
    mainPage: 'Main Page',
    students: 'Students',
    supervisors: 'Supervisors',
    pendingRequests: 'Pending Requests',
    groups: 'Groups',
    studentAdditions: 'Student Additions Over Time',
    requestsStatus: 'Requests Status',
    studentsAdded: 'Students Added',
    milestones: 'Upcoming Milestones',
    recentActivity: 'Recent Activity',
    approved: 'Approved',
    pending: 'In Queue',
    rejected: 'Rejected',
    groupCreated: 'Group',
    studentAdded: 'Student',
    supervisorAdded: 'Supervisor',
    milestoneUpdated: 'Milestone',
  },
  ru: {
    mainPage: 'Главная страница',
    students: 'Студенты',
    supervisors: 'Научные руководители',
    pendingRequests: 'Ожидающие заявки',
    groups: 'Группы',
    studentAdditions: 'Добавление студентов по времени',
    requestsStatus: 'Статус заявок',
    studentsAdded: 'Добавлено студентов',
    milestones: 'Ближайшие вехи',
    recentActivity: 'Последние действия',
    approved: 'Одобрено',
    pending: 'В очереди',
    rejected: 'Отклонено',
    groupCreated: 'Группа',
    studentAdded: 'Студент',
    supervisorAdded: 'Руководитель',
    milestoneUpdated: 'Веха',
  }
};

const getLang = () => localStorage.getItem('lang') || 'en';

const STATUS_LABELS = {
  Approved: 'Approved',
  Pending: 'In Queue',
  Rejected: 'Rejected',
};

const PERIODS = [
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Half-year', value: 'halfyear' },
  { label: 'Year', value: 'year' },
  { label: 'All time', value: 'all' },
];

function formatDate(date, period) {
  const d = new Date(date);
  if (period === 'week' || period === 'month') {
    return d.toLocaleDateString();
  } else if (period === 'halfyear' || period === 'year') {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }
}

function getPeriodStart(period) {
  const now = new Date();
  if (period === 'week') {
    const start = new Date(now);
    start.setDate(now.getDate() - 6);
    start.setHours(0,0,0,0);
    return start;
  }
  if (period === 'month') {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 1);
    start.setHours(0,0,0,0);
    return start;
  }
  if (period === 'halfyear') {
    const start = new Date(now);
    start.setMonth(now.getMonth() - 6);
    start.setHours(0,0,0,0);
    return start;
  }
  if (period === 'year') {
    const start = new Date(now);
    start.setFullYear(now.getFullYear() - 1);
    start.setHours(0,0,0,0);
    return start;
  }
  // For 'all', return very early date
  return new Date(0);
}

// Custom tick for XAxis: only show first and last
const CustomXAxisTick = ({ x, y, payload, index, visibleTicksCount, ...rest }) => {
  // Only show first and last
  if (index === 0 || index === visibleTicksCount - 1) {
    return (
      <text x={x} y={y + 16} textAnchor="middle" fontSize={12} fill="#333">
        {payload.value}
      </text>
    );
  }
  return null;
};

const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
  if (!value || percent === 0) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={14} fontWeight={500}>
      {STATUS_LABELS[name] || name}
    </text>
  );
};

const Dashboard = () => {
  const { theme } = useTheme();
  const lang = getLang();
  const t = TEXTS[lang];
  const [stats, setStats] = useState({
    students: 0,
    supervisors: 0,
    pendingRequests: 0,
    groups: 0,
  });
  const [studentPeriod, setStudentPeriod] = useState('month');
  const [studentTrend, setStudentTrend] = useState([]);
  const [requestStatus, setRequestStatus] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        // Получаем все нужные данные
        const [studentsRes, supervisorsRes, groupsRes, newStudentsRes, newSupervisorsRes, milestonesRes, usersRes, thesesRes] = await Promise.all([
          axios.get(API_URL + 'students', { headers: API_HEADERS }),
          axios.get(API_URL + 'supervisors', { headers: API_HEADERS }),
          axios.get(API_URL + 'peer_groups', { headers: API_HEADERS }),
          axios.get(API_URL + 'new_students', { headers: API_HEADERS }),
          axios.get(API_URL + 'new_supervisors', { headers: API_HEADERS }),
          axios.get(API_URL + 'milestones', { headers: API_HEADERS }),
          axios.get(API_URL + 'users', { headers: API_HEADERS }),
          axios.get(API_URL + 'theses', { headers: API_HEADERS }),
        ]);

        // Stats
        setStats({
          students: studentsRes.data.length,
          supervisors: supervisorsRes.data.length,
          pendingRequests: newStudentsRes.data.length + newSupervisorsRes.data.length,
          groups: groupsRes.data.length,
        });

        // --- Новый тренд студентов по времени ---
        const students = studentsRes.data.filter(s => s.created_at);
        const period = studentPeriod;
        const start = getPeriodStart(period);
        let buckets = {};
        if (period === 'week' || period === 'month') {
          const nowDay = new Date();
          for (let d = new Date(start); d <= nowDay; d.setDate(d.getDate() + 1)) {
            const key = d.toLocaleDateString();
            buckets[key] = 0;
          }
          students.forEach(s => {
            const d = new Date(s.created_at);
            if (d >= start && d <= nowDay) {
              const key = d.toLocaleDateString();
              if (buckets[key] !== undefined) buckets[key]++;
            }
          });
        } else if (period === 'halfyear' || period === 'year') {
          const nowMonth = new Date();
          for (let d = new Date(start); d <= nowMonth; d.setMonth(d.getMonth() + 1)) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            buckets[key] = 0;
          }
          students.forEach(s => {
            const d = new Date(s.created_at);
            if (d >= start && d <= nowMonth) {
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              if (buckets[key] !== undefined) buckets[key]++;
            }
          });
        } else {
          // All time: by month, начиная с первого студента
          if (students.length > 0) {
            const minDate = new Date(Math.min(...students.map(s => new Date(s.created_at))));
            const maxDate = new Date(Math.max(...students.map(s => new Date(s.created_at))));
            for (let d = new Date(minDate.getFullYear(), minDate.getMonth(), 1); d <= maxDate; d.setMonth(d.getMonth() + 1)) {
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              buckets[key] = 0;
            }
            students.forEach(s => {
              const d = new Date(s.created_at);
              const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              if (buckets[key] !== undefined) buckets[key]++;
            });
          } else {
            buckets = {}; // если студентов нет, график пустой
          }
        }
        const trend = Object.entries(buckets).map(([date, count]) => ({ date, count }));
        setStudentTrend(trend);

        // Requests status (approved, pending, rejected)
        // For demo: count filled/approved/incomplete in new_students and new_supervisors
        const getStatus = (item) => {
          const hasEmptyFields = !item.firstname || !item.lastname || !item.username || !item.department || !item.groups;
          const isAllFilled = !hasEmptyFields;
          const isApproved = item.approved === true;
          if (isAllFilled && isApproved) return 'Approved';
          if (isAllFilled) return 'Pending';
          return 'Rejected';
        };
        const allRequests = [...newStudentsRes.data, ...newSupervisorsRes.data];
        const statusCounts = { Approved: 0, Pending: 0, Rejected: 0 };
        allRequests.forEach(item => {
          statusCounts[getStatus(item)]++;
        });
        setRequestStatus([
          { name: 'Approved', value: statusCounts.Approved },
          { name: 'Pending', value: statusCounts.Pending },
          { name: 'Rejected', value: statusCounts.Rejected },
        ]);

        // Upcoming milestones (next 3 by deadline)
        const now = new Date();
        const upcoming = milestonesRes.data
          .filter(m => m.deadline && new Date(m.deadline) > now)
          .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
          .slice(0, 3)
          .map(m => ({ id: m.id, title: m.title, date: m.deadline, status: m.status }));
        setMilestones(upcoming);

        // --- Recent Activity с именами ---
        const users = usersRes.data;
        const theses = thesesRes.data;
        const supervisors = supervisorsRes.data;
        // Мапы id -> имя/тайтл
        const userIdToName = users.reduce((m, u) => {
          m[u.id] = `${u.first_name || ''} ${u.last_name || ''}`.trim();
          return m;
        }, {});
        const supervisorIdToUserId = supervisors.reduce((m, sup) => {
          m[sup.id] = sup.user_id;
          return m;
        }, {});
        const thesisIdToTitle = theses.reduce((m, t) => {
          m[t.id] = t.title;
          return m;
        }, {});
        // Последний студент
        let recent = [];
        if (studentsRes.data.length > 0) {
          const lastStudent = studentsRes.data[studentsRes.data.length - 1];
          const name = userIdToName[lastStudent.user_id] || lastStudent.user_id || lastStudent.id;
          recent.push(`Student ${name} added`);
        }
        // Последний супервизор
        if (supervisorsRes.data.length > 0) {
          const lastSupervisor = supervisorsRes.data[supervisorsRes.data.length - 1];
          const name = userIdToName[lastSupervisor.user_id] || lastSupervisor.user_id || lastSupervisor.id;
          recent.push(`Supervisor ${name} added`);
        }
        // Последний milestone
        if (milestonesRes.data.length > 0) {
          const lastMilestone = milestonesRes.data[milestonesRes.data.length - 1];
          const thesisTitle = thesisIdToTitle[lastMilestone.thesis_id] || '';
          recent.push(`Milestone "${lastMilestone.title}" (${thesisTitle}) updated`);
        }
        // Последняя группа
        if (groupsRes.data.length > 0) {
          const lastGroup = groupsRes.data[groupsRes.data.length - 1];
          recent.push(`Group "${lastGroup.name}" created`);
        }
        setRecentActivity(recent.slice(0, 4));
      } catch (err) {
        console.error('Dashboard API error:', err);
      }
    }
    fetchDashboardData();
    // eslint-disable-next-line
  }, [studentPeriod]);

  return (
    <div className="p-6 min-h-screen text-black dark:text-white bg-gray-50 dark:bg-neutral-900 transition-colors">
      <h1 className="text-2xl font-bold mb-6">{t.mainPage}</h1>
      {/* KPI CARDS */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: t.students, value: stats.students, page: '/students' },
          { label: t.supervisors, value: stats.supervisors, page: '/supervisors' },
          { label: t.pendingRequests, value: stats.pendingRequests },
          { label: t.groups, value: stats.groups, page: '/groups' },
        ].map((item, idx) => (
          item.page ? (
            <Link to={item.page} key={idx} style={{ textDecoration: 'none' }}>
              <motion.div
                className={`bg-white dark:bg-neutral-800 shadow-md rounded-xl p-4 flex flex-col items-center justify-center border border-neutral-200 dark:border-neutral-700 transition-colors cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                tabIndex={0}
                role="button"
                aria-label={`Go to ${item.label}`}
              >
                <p className="text-lg text-black dark:text-white">{item.label}</p>
                <h2 className="text-3xl font-bold text-black dark:text-white">{item.value}</h2>
              </motion.div>
            </Link>
          ) : (
            <motion.div
              key={idx}
              className="bg-white dark:bg-neutral-800 shadow-md rounded-xl p-4 flex flex-col items-center justify-center border border-neutral-200 dark:border-neutral-700 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <p className="text-lg text-black dark:text-white">{item.label}</p>
              <h2 className="text-3xl font-bold text-black dark:text-white">{item.value}</h2>
            </motion.div>
          )
        ))}
      </div>
      {/* CHARTS */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Student addition chart */}
        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-xl p-4 dashboard-chart-container border border-neutral-200 dark:border-neutral-700 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-black dark:text-white">{t.studentAdditions}</h3>
            <select
              className="dashboard-chart-select"
              value={studentPeriod}
              onChange={e => setStudentPeriod(e.target.value)}
            >
              {PERIODS.map(p => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={studentTrend} margin={{ left: 0, right: 0, top: 10, bottom: 0 }} style={{ background: 'transparent' }}>
              <XAxis
                dataKey="date"
                tick={false}
                axisLine={false}
                tickLine={false}
              />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: theme === 'dark' ? '#fff' : '#000', fontSize: 13 }} />
              <Tooltip
                contentStyle={{ background: theme === 'dark' ? '#23272f' : '#fff', borderRadius: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', border: `1px solid ${theme === 'dark' ? '#fff' : '#000'}`, color: theme === 'dark' ? '#fff' : '#000' }}
                labelStyle={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 600 }}
                itemStyle={{ color: theme === 'dark' ? '#fff' : '#000', fontWeight: 500 }}
                cursor={{ fill: theme === 'dark' ? '#fff' : '#000', fillOpacity: 0.06 }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ fontSize: 13, color: theme === 'dark' ? '#fff' : '#000', marginBottom: 8, fontWeight: 500 }}
              />
              <Line
                type="monotone"
                dataKey="count"
                stroke={theme === 'dark' ? '#fff' : '#000'}
                strokeWidth={3}
                dot={{ r: 5, fill: theme === 'dark' ? '#23272f' : '#fff', stroke: theme === 'dark' ? '#fff' : '#000', strokeWidth: 2, filter: 'drop-shadow(0 1px 4px #0001)' }}
                activeDot={{ r: 7, fill: theme === 'dark' ? '#fff' : '#000', stroke: theme === 'dark' ? '#23272f' : '#fff', strokeWidth: 2, filter: 'drop-shadow(0 2px 8px #0002)' }}
                name={t.studentsAdded}
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        {/* Pie Chart */}
        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-xl p-4 border border-neutral-200 dark:border-neutral-700 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">{t.requestsStatus}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={requestStatus}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label={renderCustomLabel}
                isAnimationActive={false}
              >
                {requestStatus.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={theme === 'dark' ? (index === 0 ? '#fff' : '#888') : COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [`${value}`, STATUS_LABELS[name] || name]} contentStyle={{ background: theme === 'dark' ? '#23272f' : '#fff', color: theme === 'dark' ? '#fff' : '#000', border: `1px solid ${theme === 'dark' ? '#fff' : '#000'}` }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* MILESTONES & RECENT ACTIVITY */}
      <div className="grid grid-cols-2 gap-6">
        {/* Milestones */}
        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-xl p-4 border border-neutral-200 dark:border-neutral-700 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">{t.milestones}</h3>
          <ul className="space-y-3">
            {milestones.map((m) => (
              <li key={m.id} className="flex justify-between border-b pb-2 border-neutral-200 dark:border-neutral-700">
                <span>{m.title}</span>
                <span className="text-gray-600 dark:text-gray-300">{m.date ? new Date(m.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-US') : ''}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Recent Activity */}
        <div className="bg-white dark:bg-neutral-800 shadow-md rounded-xl p-4 border border-neutral-200 dark:border-neutral-700 transition-colors">
          <h3 className="text-lg font-semibold mb-4 text-black dark:text-white">{t.recentActivity}</h3>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            {recentActivity.map((a, idx) => (
              <li key={idx}>• {a.replace('Student', t.studentAdded).replace('Supervisor', t.supervisorAdded).replace('Milestone', t.milestoneUpdated).replace('Group', t.groupCreated)}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 