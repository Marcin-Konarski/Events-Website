import React, { useEffect, useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { X, Menu, LogOut, User } from 'lucide-react'
import { useAuthContext } from '@/AuthContext'
import { cn } from '@/lib/utils'

const NavBar = () => {
    const { isAuthenticated, user, logout, loading } = useAuthContext();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const navigate = useNavigate();
    const navBarHeight = 10;

    // Base navigation items
    const baseNavItems = [
        {name: "Home", to: "/", isNewPage: false, animationDuration: 1000},
        {name: "Events", to: "/#events", isNewPage: false, animationDuration: 1000},
        {name: "Create Event", to: "/create_event", isNewPage: true, animationDuration: 1000},
    ];

    // Get navigation items based on auth status
    const getNavItems = () => {
        const items = [...baseNavItems];
        
        if (!isAuthenticated) {
            items.push(
                {name: "Log in", to: "/login", isNewPage: true, animationDuration: 1000},
                {name: "Register", to: "/register", isNewPage: true, animationDuration: 1000}
            );
        }

        return items;
    };

    const navItems = getNavItems();

    // Handle logout
    const handleLogout = async () => {
        if (isLoggingOut) return; // Prevent double-clicking
        
        setIsLoggingOut(true);
        setIsMenuOpen(false); // Close mobile menu
        
        try {
            const result = await logout();
            
            if (result.success) {
                navigate('/'); // Redirect to home page
            } else {
                console.error('Logout failed:', result.error);
                // Even if logout fails, redirect to home
                navigate('/');
            }
        } catch (error) {
            console.error('Logout error:', error);
            navigate('/'); // Redirect anyway
        } finally {
            setIsLoggingOut(false);
        }
    };

    useEffect(() => {
        const navBarHeight = 10;
        const isDesktop = () => window.innerWidth >= 768; // 768 is the mid-width of the md screen in tailwind

        const handleScroll = () => {
            if (isDesktop()) {
            setIsScrolled(window.scrollY > navBarHeight);
            } else {
            setIsScrolled(false);
            }
        };

        // Set initial state
        handleScroll();

        if (isDesktop()) {
            window.addEventListener("scroll", handleScroll);
        }

        // Listen for resize to update isScrolled if switching between mobile/desktop
        const handleResize = () => {
            if (!isDesktop()) setIsScrolled(false);
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Show loading state
    if (loading) {
        return (
            <nav className="fixed top-0 left-0 w-full z-40 py-5">
                <div className="container flex items-center justify-between">
                    <a className="text-xl font-bold text-primary flex items-center" href="/">
                        <span className="relative z-10">
                            <span className="text-glow text-foreground"> Venuo </span> Events
                        </span>
                    </a>
                    <div className="hidden md:flex space-x-8 mr-10">
                        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                        <div className="h-6 w-20 bg-gray-200 animate-pulse rounded"></div>
                    </div>
                </div>
            </nav>
        );
    }

    return (<>
        <nav className={cn("fixed top-0 left-0 w-full z-40 transition-all duration-300",
            "py-2 bg-background/60 shadow-xs", // Mobile
            isScrolled // Desktop
                ? "md:py-3 md:bg-background/40 md:shadow-xs"
                : "md:py-5 md:bg-transparent md:shadow-none"
            )}
        style={{
            WebkitMaskImage: 'linear-gradient(to bottom, black 10%, black/90 20%, black/80 30%, black/70 40%, black/60 50%, black/50 60%, black/40 70%, black/30 80%, black/20 90%, black/10 100%)',
            maskImage: 'linear-gradient(to bottom, black 10%, black/90 20%, black/80 30%, black/70 40%, black/60 50%, black/50 60%, black/40 70%, black/30 80%, black/20 90%, black/10 100%)',
            backdropFilter: isScrolled ? 'blur(3px)' : 'none'
        }}>

            <div className="container mx-auto px-4 flex items-center justify-between">
                {/* Logo */}
                <a className="text-xl font-bold text-primary flex items-center" href="/">
                    <span className="relative z-10">
                        <span className="text-glow text-foreground"> Venuo </span> Events
                    </span>
                </a>

                {/* Desktop NavBar - Hidden on mobile */}
                <div className="hidden md:flex items-center space-x-8 font-bold">
                    {navItems.map((item) => {
                        return item.isNewPage
                            ? (<NavLink key={item.name} to={item.to} className="group text-foreground/80 transition-colors duration-300">
                                    <span className={cn("bg-left-bottom bg-gradient-to-t from-current to-current",
                                        `bg-[length:0%_1px] bg-no-repeat group-hover:bg-[length:100%_1px] transition-all duration-${item.animationDuration} ease-out`)}>
                                        {item.name}
                                    </span>
                                </NavLink>)
                            : (<a key={item.name} href={item.to} className="group text-foreground/80 transition-colors duration-300">
                                    <span className={cn("bg-left-bottom bg-gradient-to-t from-current to-current",
                                        `bg-[length:0%_1px] bg-no-repeat group-hover:bg-[length:100%_1px] transition-all duration-${item.animationDuration} ease-out`)}>
                                        {item.name}
                                    </span>
                                </a>);
                    })}

                    {/* Desktop authenticated user section */}
                    {isAuthenticated && (
                        <div className="flex items-center space-x-4 ml-4 pl-4 border-l border-foreground/20">
                            {user && (
                                <span className="text-sm text-foreground/60 flex items-center">
                                    <User size={16} className="mr-2" />
                                    {user.userName} {user.userSurname}
                                </span>
                            )}
                            <button onClick={handleLogout} disabled={isLoggingOut} className={cn(
                                "group text-foreground/80 hover:text-red-500 transition-colors duration-300 flex items-center space-x-1",
                                isLoggingOut && "opacity-50 cursor-not-allowed")}>
                                    <LogOut size={16} />
                                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Mobile Menu Button - Only visible on mobile */}
                <button onClick={() => setIsMenuOpen((i) => !i)} className="md:hidden p-2 text-foreground z-50 relative" aria-label={isMenuOpen ? "Close Menu" : "Open Menu"}>
                    {isMenuOpen ? <X size={24}/> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu Overlay - Only visible on mobile */}
            <div className={cn("fixed inset-0 bg-background/95 backdrop-blur-md z-40 flex flex-col items-center justify-center",
                "transition-all duration-300 md:hidden", isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none")}>
                <div className="flex flex-col space-y-8 text-xl text-center">
                    {navItems.map((item) => {
                        return item.isNewPage
                            ? (<NavLink key={item.name} to={item.to}  onClick={() => setIsMenuOpen(false)}
                                className="text-foreground/80 hover:text-primary transition-colors duration-300">
                                    {item.name}
                            </NavLink>)
                            : (<a key={item.name} href={item.to} onClick={() => setIsMenuOpen(false)}
                                className="text-foreground/80 hover:text-primary transition-colors duration-300">
                                    {item.name}
                            </a>);
                    })}

                    {/* Mobile authenticated user section */}
                    {isAuthenticated && (
                        <div className="border-t border-foreground/20 pt-6 mt-4">
                            {user && (
                                <div className="text-sm text-foreground/60 mb-4 flex items-center justify-center">
                                    <User size={16} className="mr-2" />
                                    {user.userName} {user.userSurname}
                                </div>
                            )}
                            <button onClick={handleLogout} disabled={isLoggingOut} className={cn("text-red-500 hover:text-red-600 transition-colors duration-300",
                                "flex items-center space-x-2 mx-auto", isLoggingOut && "opacity-50 cursor-not-allowed")}>
                                    <LogOut size={20} />
                                    <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    </>);
};

export default NavBar;
