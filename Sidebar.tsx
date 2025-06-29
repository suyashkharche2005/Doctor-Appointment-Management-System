import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Clock, 
  BarChart3,
  User,
  CalendarDays,
  History
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const { profile } = useAuth();

  const patientMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments', label: 'Book Appointment', icon: Calendar },
    { id: 'my-appointments', label: 'My Appointments', icon: CalendarDays },
    { id: 'medical-records', label: 'Medical Records', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const doctorMenuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'appointments', label: 'Appointments', icon: Calendar },
    { id: 'patients', label: 'Patients', icon: Users },
    { id: 'schedule', label: 'Schedule', icon: Clock },
    { id: 'medical-records', label: 'Records', icon: FileText },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  const menuItems = profile?.user_type === 'doctor' ? doctorMenuItems : patientMenuItems;

  return (
    <aside className="bg-white w-64 min-h-screen border-r border-gray-200 shadow-sm">
      <div className="p-6">
        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;