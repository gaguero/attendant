import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, Building, User, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '@attendandt/shared';

const Sidebar: React.FC = () => {
  const { hasRole, user, logoutWithRedirect, getDisplayName, getUserInitials } = useAuth();
  const navLinkClasses =
    'flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200';
  const activeLinkClasses = 'bg-gray-300';

  return (
    <div className="w-64 h-full bg-white shadow-md relative">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-800">Attendandt</h1>
      </div>
      <nav className="px-2 space-y-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <Home className="w-5 h-5 mr-3" />
          Dashboard
        </NavLink>
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
          }
        >
          <User className="w-5 h-5 mr-3" />
          Profile
        </NavLink>
        {hasRole([UserRole.ADMIN, UserRole.STAFF]) && (
          <NavLink
            to="/guests"
            className={({ isActive }) =>
              `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
            }
          >
            <Users className="w-5 h-5 mr-3" />
            Guests
          </NavLink>
        )}
        {hasRole([UserRole.ADMIN, UserRole.STAFF]) && (
          <NavLink
            to="/vendors"
            className={({ isActive }) =>
              `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
            }
          >
            <Briefcase className="w-5 h-5 mr-3" />
            Vendors
          </NavLink>
        )}
        {hasRole(UserRole.ADMIN) && (
          <NavLink
            to="/users"
            className={({ isActive }) =>
              `${navLinkClasses} ${isActive ? activeLinkClasses : ''}`
            }
          >
            <Building className="w-5 h-5 mr-3" />
            Users
          </NavLink>
        )}
      </nav>
      
      {/* User info and logout section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
        {user && (
          <div className="space-y-3">
            {/* User info */}
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {getUserInitials()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getDisplayName()}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.role}
                </p>
              </div>
            </div>
            
            {/* Logout button */}
            <button
              onClick={() => logoutWithRedirect()}
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 