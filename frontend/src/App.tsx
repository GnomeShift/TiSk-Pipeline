import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import NotificationContainer from './components/NotificationContainer';
import Layout from './components/Layout';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import TicketDetail from './components/TicketDetail';
import Login from './components/Login';
import Register from './components/Register';
import Profile from './components/Profile';
import UserManagement from './components/UserManagement';
import PrivateRoute from './components/PrivateRoute';
import { UserRole } from './types/user';
import Statistics from './components/Statistics';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <NotificationProvider>
                    <NotificationContainer />
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route path="login" element={<Login />} />
                            <Route path="register" element={<Register />} />

                            <Route index element={
                                <PrivateRoute>
                                    <TicketList />
                                </PrivateRoute>
                            } />
                            <Route path="create" element={
                                <PrivateRoute>
                                    <TicketForm />
                                </PrivateRoute>
                            } />
                            <Route path="edit/:id" element={
                                <PrivateRoute>
                                    <TicketForm />
                                </PrivateRoute>
                            } />
                            <Route path="ticket/:id" element={
                                <PrivateRoute>
                                    <TicketDetail />
                                </PrivateRoute>
                            } />
                            <Route path="profile" element={
                                <PrivateRoute>
                                    <Profile />
                                </PrivateRoute>
                            } />
                            <Route path="statistics" element={
                                <PrivateRoute requiredRole={UserRole.ADMIN}>
                                    <Statistics />
                                </PrivateRoute>
                            } />
                            <Route path="users" element={
                                <PrivateRoute requiredRole={UserRole.ADMIN}>
                                    <UserManagement />
                                </PrivateRoute>
                            } />
                        </Route>

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </NotificationProvider>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;