import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { env } from '../services/env';
import { cn, getUserInitials } from '../services/utils';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { ThemeToggle } from './ui/theme-toggle';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { BarChart3, LogOut, Menu, Plus, Settings, NotebookText, User, X } from 'lucide-react';

const NAV_CONFIG = [
    { path: '/statistics', label: 'Статистика', icon: BarChart3, roles: ['ADMIN'], loc: ['nav', 'mobile'] },
    { path: '/', label: 'Тикеты', short: 'Главная', icon: NotebookText, loc: ['nav', 'bottom', 'mobile'] },
    { path: '/create', label: 'Создать тикет', short: 'Создать', icon: Plus, primary: true, loc: ['nav', 'bottom', 'mobile'] },
    { path: '/profile', label: 'Профиль', icon: User, loc: ['menu', 'bottom', 'mobile'] },
    { path: '/users', label: 'Управление пользователями', icon: Settings, roles: ['ADMIN'], loc: ['menu', 'mobile'] },
];

const UserInfo: React.FC<{ user: any, variant?: 'compact' | 'full' }> = ({ user, variant = 'full' }) => (
    <div className={cn(
        'flex items-center gap-3 overflow-hidden',
        variant === 'full' && 'p-3 bg-muted rounded-lg'
    )}>
        <Avatar size={variant === 'full' ? 'lg' : 'default'}>
            <AvatarFallback>{getUserInitials(user?.firstName, user?.lastName)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col space-y-1 overflow-hidden">
            <p className={cn(
                'leading-none truncate',
                variant === 'full' ? 'font-medium' : 'text-sm font-medium'
            )}>
                {user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">
                {user?.email}
            </p>
        </div>
    </div>
);

const Layout: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);
    const handleLogout = () => { logout(); navigate('/login'); setMobileOpen(false); };
    const getItems = (loc: string) =>
        NAV_CONFIG.filter(i => i.loc.includes(loc) && (!i.roles || i.roles.includes(user?.role || '')));
    const isActive = (path: string) => location.pathname === path;

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <Link to="/" className="text-xl font-bold text-foreground hover:text-primary transition-colors">
                        {env.appTitle}
                    </Link>

                    {/* Desktop navigation */}
                    <nav className="hidden md:flex items-center gap-2">
                        {isAuthenticated ? (
                            <>
                                {getItems('nav').map(item => (
                                    <Link
                                        key={item.path}
                                        to={item.path} className={cn(
                                        'inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors',
                                        item.primary ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                                            : isActive(item.path)
                                                ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground'
                                    )}>
                                        <item.icon className="h-4 w-4" /> <span>{item.label}</span>
                                    </Link>
                                ))}
                                <ThemeToggle />
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                                            <Avatar>
                                                <AvatarFallback>
                                                    {getUserInitials(user?.firstName, user?.lastName)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-64" align="end">
                                        <DropdownMenuLabel className="font-normal">
                                            <UserInfo user={user} variant="compact" />
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        {getItems('menu').map(item => (
                                            <DropdownMenuItem
                                                key={item.path}
                                                onClick={() => navigate(item.path)}
                                                className="cursor-pointer"
                                            >
                                                <item.icon className="mr-2 h-4 w-4" />
                                                {item.label}
                                            </DropdownMenuItem>
                                        ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="cursor-pointer text-destructive focus:text-destructive"
                                        >
                                            <LogOut className="mr-2 h-4 w-4" />
                                            Выйти
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        ) : (
                            <>
                                <ThemeToggle />
                                <Link to="/login" className="px-4 py-2 text-sm font-medium hover:bg-accent rounded-md">
                                    Вход
                                </Link>
                                <Link to="/register" className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                                    Регистрация
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Mobile button */}
                    <div className="flex items-center gap-2 md:hidden">
                        <ThemeToggle />
                        <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
                            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                        </Button>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="md:hidden border-t bg-background">
                        <nav className="container py-4 space-y-2">
                            {isAuthenticated ? (
                                <>
                                    <UserInfo user={user} />
                                    {getItems('mobile').map(item => (
                                        <Link
                                            key={item.path}
                                            to={item.path}
                                            onClick={() => setMobileOpen(false)}
                                            className={cn(
                                                'flex items-center gap-3 p-3 rounded-lg',
                                                isActive(item.path) ? 'bg-primary/10 text-primary' : 'hover:bg-muted'
                                            )}>
                                            <item.icon className="h-5 w-5" />
                                            {item.label}
                                        </Link>
                                    ))}
                                    <button onClick={handleLogout} className="flex items-center gap-3 p-3 rounded-lg w-full text-destructive hover:bg-destructive/10">
                                        <LogOut className="h-5 w-5" />
                                        Выйти
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link
                                        to="/login"
                                        onClick={() => setMobileOpen(false)}
                                        className="inline-flex items-center justify-center gap-2 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                                    >
                                        Вход
                                    </Link>
                                    <Link
                                        to="/register"
                                        onClick={() => setMobileOpen(false)}
                                        className="inline-flex items-center justify-center h-10 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                                    >
                                        Регистрация
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </header>

            <main className="container py-4 md:py-6">
                <Outlet />
            </main>

            {/* Mobile bottom navigation */}
            {isAuthenticated && (
                <nav className="fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur md:hidden safe-area-inset-bottom">
                    <div className="flex items-center justify-around h-16">
                        {getItems('bottom').map(item => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    'flex flex-col items-center gap-1 p-2 rounded-lg',
                                    isActive(item.path) ? 'text-primary' : 'text-muted-foreground'
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span className="text-xs">{item.short || item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>
            )}
            {isAuthenticated && <div className="h-16 md:hidden" />}
        </div>
    );
};

export default Layout;