// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ChangePassword from './pages/Auth/ChangePassword';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';
import Profile from './pages/Auth/Profile';
import MainLayout from './layouts/MainLayout';
import DashboardHome from './pages/DashboardHome';
import EmployeeList from './pages/Employees/EmployeeList';
import EmployeeAdd from './pages/Employees/EmployeeAdd';
import EmployeeEdit from './pages/Employees/EmployeeEdit';
import DepartmentList from './pages/Departments/DepartmentList';
import DepartmentAdd from './pages/Departments/DepartmentAdd';
import DepartmentEdit from './pages/Departments/DepartmentEdit';
import DepartmentDelete from './pages/Departments/DepartmentDelete';
import AttendanceList from './pages/Attendance/AttendanceList';
import AttendanceAdd from './pages/Attendance/AttendanceAdd';
import AttendanceEdit from './pages/Attendance/AttendanceEdit';
import AttendanceAnalytics from './pages/Attendance/AttendanceAnalytics';
import SalaryList from './pages/Payroll/SalaryList';
import SalaryHistory from './pages/Payroll/SalaryHistory';
import ReportsHR from './pages/Reports/ReportsHR';
import ReportsPayroll from './pages/Reports/ReportsPayroll';
import ReportsAttendance from './pages/Reports/ReportsAttendance';
import ReportsDividends from './pages/Reports/ReportsDividends';
import PositionList from './pages/Positions/PositionList';
import PositionAdd from './pages/Positions/PositionAdd';
import PositionEdit from './pages/Positions/PositionEdit';
import PositionDelete from './pages/Positions/PositionDelete';
import DividendList from './pages/Dividends/DividendList';
import DividendPerEmployee from './pages/Dividends/DividendPerEmployee';
import Alerts from './pages/Alerts/Alerts';
import WorkAnniversary from './pages/Alerts/WorkAnniversary';
import UserList from './pages/Admin/UserList';
import UserAdd from './pages/Admin/UserAdd';
import UserEdit from './pages/Admin/UserEdit';
import RoleList from './pages/Admin/RoleList';
import PermissionList from './pages/Admin/PermissionList';
import AuditLogs from './pages/Audit/AuditLogs';
import PrivateRoute from './components/PrivateRoute';
import './styles/auth.css';
import './styles/admin.css';
import './styles/dashboard.css';
import './styles/employee.css';
import './styles/department.css';

function App() {
    return (
        <Router>
            <Routes>
                {/* Auth routes - không có layout */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password/:token" element={<ResetPassword />} />

                {/* Protected routes - có MainLayout chung */}
                <Route element={<PrivateRoute />}>
                    <Route element={<MainLayout />}>
                        <Route path="/dashboard" element={<DashboardHome />} />

                        {/* Department routes */}
                        <Route path="/departments" element={<DepartmentList />} />
                        <Route path="/departments/add" element={<DepartmentAdd />} />
                        <Route path="/departments/edit/:id" element={<DepartmentEdit />} />
                        <Route path="/departments/delete/:id" element={<DepartmentDelete />} />
                        
                        {/* Position routes */}
                        <Route path="/positions" element={<PositionList />} />
                        <Route path="/positions/add" element={<PositionAdd />} />
                        <Route path="/positions/edit/:id" element={<PositionEdit />} />
                        <Route path="/positions/delete/:id" element={<PositionDelete />} />

                        {/* Employee routes */}
                        <Route path="/employees" element={<EmployeeList />} />
                        <Route path="/employees/add" element={<EmployeeAdd />} />
                        <Route path="/employees/edit/:id" element={<EmployeeEdit />} />

                        {/* Attendance routes */}
                        <Route path="/attendance" element={<AttendanceList />} />
                        <Route path="/attendance/add" element={<AttendanceAdd />} />
                        <Route path="/attendance/edit/:id" element={<AttendanceEdit />} />
                        <Route path="/attendance/analytics" element={<AttendanceAnalytics />} />

                        {/* Payroll routes */}
                        <Route path="/payroll" element={<SalaryList />} />
                        <Route path="/payroll/history/:id" element={<SalaryHistory />} />
                                                
                        {/* Report routes */}
                        <Route path="/reports/hr" element={<ReportsHR />} />
                        <Route path="/reports/payroll" element={<ReportsPayroll />} />
                        <Route path="/reports/attendance" element={<ReportsAttendance />} />
                        <Route path="/reports/dividends" element={<ReportsDividends />} />

                        <Route path="/alerts" element={<Alerts />} />
                        <Route path="/alerts/anniversary" element={<WorkAnniversary />} />

                        {/* Admin routes */}
                        <Route path="/admin/users" element={<UserList />} />
                        <Route path="/admin/users/add" element={<UserAdd />} />
                        <Route path="/admin/users/edit/:id" element={<UserEdit />} />
                        <Route path="/admin/roles" element={<RoleList />} />
                        <Route path="/admin/permissions" element={<PermissionList />} />
                        <Route path="/admin/audit-logs" element={<AuditLogs />} />
                        
                        <Route path="/dividends" element={<DividendList />} />
                        <Route path="/dividends/per-employee" element={<DividendPerEmployee />} />

                        {/* Other routes */}
                        <Route path="/change-password" element={<ChangePassword />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/" element={<Navigate to="/dashboard" />} />
                    </Route>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;