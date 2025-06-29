import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Calendar, Users, Clock, FileText, Activity, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  patient: {
    first_name: string;
    last_name: string;
  };
}

const DoctorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodaysAppointments();
  }, [profile]);

  const fetchTodaysAppointments = async () => {
    if (!profile) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          patient:profiles!appointments_patient_id_fkey (
            first_name,
            last_name
          )
        `)
        .eq('doctor_id', profile.id)
        .eq('appointment_date', today)
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setTodaysAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      title: "Today's Appointments",
      value: todaysAppointments.length,
      icon: Calendar,
      color: 'bg-blue-500',
      change: '+12%',
    },
    {
      title: 'Total Patients',
      value: '284',
      icon: Users,
      color: 'bg-green-500',
      change: '+5%',
    },
    {
      title: 'This Week',
      value: '47',
      icon: Clock,
      color: 'bg-purple-500',
      change: '+18%',
    },
    {
      title: 'Completion Rate',
      value: '94%',
      icon: Activity,
      color: 'bg-orange-500',
      change: '+2%',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Good morning, Dr. {profile?.last_name}!
        </h1>
        <p className="opacity-90">
          You have {todaysAppointments.length} appointments scheduled for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center text-green-600 text-sm">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.title}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Today's Schedule */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Clock className="h-5 w-5 mr-2 text-green-500" />
            Today's Schedule
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
          ) : todaysAppointments.length > 0 ? (
            <div className="space-y-4">
              {todaysAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center space-x-4 p-4 border border-gray-100 rounded-lg hover:border-green-200 transition-colors"
                >
                  <div className="bg-green-100 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {appointment.patient.first_name} {appointment.patient.last_name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {appointment.appointment_time}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        appointment.status === 'scheduled'
                          ? 'bg-blue-100 text-blue-800'
                          : appointment.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {appointment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">No appointments today</h3>
              <p className="text-sm text-gray-500">Enjoy your free schedule!</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Recent Patients</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Sarah Johnson', time: '2 hours ago', status: 'Completed' },
                { name: 'Michael Chen', time: '1 day ago', status: 'Completed' },
                { name: 'Emma Wilson', time: '2 days ago', status: 'Completed' },
              ].map((patient, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className="bg-blue-100 w-10 h-10 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.time}</p>
                  </div>
                  <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {patient.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
          </div>
          <div className="p-6 space-y-3">
            <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors group">
              <Calendar className="h-6 w-6 text-gray-400 group-hover:text-green-500" />
              <span className="text-gray-700 group-hover:text-green-700">View Schedule</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors group">
              <FileText className="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
              <span className="text-gray-700 group-hover:text-blue-700">Patient Records</span>
            </button>
            
            <button className="w-full flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors group">
              <Activity className="h-6 w-6 text-gray-400 group-hover:text-purple-500" />
              <span className="text-gray-700 group-hover:text-purple-700">Update Availability</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;