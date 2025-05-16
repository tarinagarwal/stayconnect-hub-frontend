
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserRole, useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Home, Search, User, LogOut, MessageCircle, Heart } from 'lucide-react';

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  const getDashboardRoute = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'owner':
        return '/owner';
      case 'finder':
      default:
        return '/dashboard';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        {/* Logo */}
        <Link
          to="/"
          className="flex items-center space-x-2 text-xl md:text-2xl font-bold text-primary"
        >
          <Home className="h-6 w-6" />
          <span>StayConnect</span>
        </Link>

        {/* Search Bar - Hide on mobile, show on larger screens */}
        <form
          onSubmit={handleSearch}
          className="hidden md:flex items-center max-w-md flex-1 mx-4"
        >
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search locations, PGs..."
              className="input-search pl-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" size="sm" className="ml-2 rounded-full">
            Search
          </Button>
        </form>

        {/* Right section */}
        <div className="flex items-center space-x-2 md:space-x-4">
          {isAuthenticated ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/messages')}
                className="hidden md:flex"
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/favorites')}
                className="hidden md:flex"
              >
                <Heart className="h-5 w-5" />
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative rounded-full" size="icon">
                    <Avatar className="h-8 w-8">
                      {currentUser?.avatar && <AvatarImage src={currentUser.avatar} />}
                      <AvatarFallback>
                        {currentUser?.name ? getInitials(currentUser.name) : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start p-2">
                    <div className="flex flex-col space-y-0.5">
                      <p className="text-sm font-medium">{currentUser?.name}</p>
                      <p className="text-xs text-muted-foreground">{currentUser?.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {currentUser?.role && (
                    <DropdownMenuItem onClick={() => navigate(getDashboardRoute(currentUser.role))}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => navigate('/messages')}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    <span>Messages</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/favorites')}>
                    <Heart className="mr-2 h-4 w-4" />
                    <span>Saved Properties</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => navigate('/login')}>
                Log In
              </Button>
              <Button onClick={() => navigate('/signup')}>Sign Up</Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar - Show on mobile only */}
      <form
        onSubmit={handleSearch}
        className="md:hidden px-4 pb-3 flex items-center"
      >
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search locations, PGs..."
            className="input-search pl-10 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" size="sm" className="ml-2 rounded-full">
          <Search className="h-4 w-4" />
        </Button>
      </form>
    </header>
  );
};

export default Header;
