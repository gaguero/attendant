import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Users, Briefcase, Building, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '@attendandt/shared';

const Sidebar: React.FC = () => {
  const { hasRole } = useAuth();
  const navLinkClasses =
    'flex items-center px-4 py-2 text-gray-700 rounded-lg hover:bg-gray-200';
  const activeLinkClasses = 'bg-gray-300';

  return (
    <div className="w-64 h-full bg-white shadow-md">
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
    </div>
  );
};

export default Sidebar; 