import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Clock, FileText, User, CalendarDays, Activity } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  doctor: {
    first_name: string;
    last_name: string;
    specialization: string;
  };
}

const PatientDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUpcomingAppointments();
  }, [profile]);

  const fetchUpcomingAppointments = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          doctor:profiles!appointments_doctor_id_fkey (
            first_name,
            last_name,
            specialization
          )
        `)
        .eq('patient_id', profile.id)
        .eq('status', 'scheduled')
        .gte('appointment_date', new Date().toISOString().split('T')[0])
        .order('appointment_date', { ascending: true })
        .limit(3);

      if (error) throw error;
      setUpcomingAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: 'Upcoming Appointments',
      value: upcomingAppointments.length,
      icon: Calendar,
      color: 'bg-blue-500',
    },
    {
      title: 'This Month',
      value: '4',
      icon: CalendarDays,
      color: 'bg-green-500',
    },
    {
      title: 'Medical Records',
      value: '12',
      icon: FileText,
      color: 'bg-purple-500',
    },
    {
      title: 'Health Score',
      value: '85%',
      icon: Activity,
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {profile?.first_name}!
        </h1>
        <p className="opacity-90">
          Stay on top of your health with our comprehensive care system.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-500" />
            Upcoming Appointments
          </h2>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse flex space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:border-blue-200 transition-colors"
                >
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <User className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      Dr. {appointment.doctor.first_name} {appointment.doctor.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{appointment.doctor.specialization}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {format(new Date(appointment.appointment_date), 'MMMM d, yyyy')} at{' '}
                      {appointment.appointment_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Scheduled
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No upcoming appointments</h3>
              <p className="text-sm text-gray-500">Schedule your next appointment to stay on track.</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <Calendar className="h-8 w-8 text-gray-400 group-hover:text-blue-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Book Appointment</p>
                <p className="text-sm text-gray-500">Schedule with a doctor</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group">
              <FileText className="h-8 w-8 text-gray-400 group-hover:text-green-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">View Records</p>
                <p className="text-sm text-gray-500">Access medical history</p>
              </div>
            </button>
            
            <button className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <User className="h-8 w-8 text-gray-400 group-hover:text-purple-500" />
              <div className="text-left">
                <p className="font-medium text-gray-900">Update Profile</p>
                <p className="text-sm text-gray-500">Manage your information</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;