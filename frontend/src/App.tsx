import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { TooltipProvider } from './components/ui/tooltip';
import { ConfirmProvider } from './components/ui/confirm-dialog';
import { Toaster } from './components/ui/sonner';
import Layout from './components/Layout';
import TicketList from './components/TicketList';
import TicketForm from './components/TicketForm';
import TicketDetail from './components/TicketDetail';
import Profile from './components/Profile';
import UserManagement from './components/UserManagement';
import PrivateRoute from './components/PrivateRoute';
import { UserRole } from './types/user';
import Statistics from './components/Statistics';
import AuthForm from "./components/AuthForm.tsx";

function App() {
    return (
        <BrowserRouter>
            <ThemeProvider defaultTheme="system">
                <AuthProvider>
                    <TooltipProvider>
                        <ConfirmProvider>
                            <Toaster />

                            <Routes>
                                <Route path="/" element={<Layout />}>
                                    <Route path="login" element={<AuthForm mode="login" />} />
                                    <Route path="register" element={<AuthForm mode="register" />} />

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
                        </ConfirmProvider>
                    </TooltipProvider>
                </AuthProvider>
            </ThemeProvider>
        </BrowserRouter>
    );
}

export default App;