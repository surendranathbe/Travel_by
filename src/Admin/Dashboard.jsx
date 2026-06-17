import { useState, useEffect } from 'react';
import { 
  Layers, 
  Users, 
  Car, 
  History as HistoryIcon, 
  Calendar, 
  Briefcase, 
  DollarSign, 
  LogOut, 
  ShieldAlert, 
  Activity,
  Camera,
  X,
  Eye,
  EyeOff,
  User,
  Lock
} from 'lucide-react';
import travelByLogo from '../assets/travel_by.png';
import { updateAdmin, fetchAppUsers, fetchSystemLogs, supabase } from '../utils/supabase';

export default function Dashboard({ admin, onLogout, onAdminUpdate }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [logs, setLogs] = useState([]);

  // Editable profile state variables
  const [editFirstName, setEditFirstName] = useState(admin.first_name || 'Surendra');
  const [editLastName, setEditLastName] = useState(admin.last_name || 'Bezawada');
  const [editUsername, setEditUsername] = useState(admin.username || 'Surendra@admin');
  const [editPassword, setEditPassword] = useState(admin.password || 'Admin@123');
  const [editProfilePic, setEditProfilePic] = useState(admin.profile_pic || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load database users and logs on component mount
  useEffect(() => {
    async function loadData() {
      setIsLoadingUsers(true);
      try {
        const usersData = await fetchAppUsers();
        setUsersList(usersData || []);

        const logsData = await fetchSystemLogs();
        if (logsData && logsData.length > 0) {
          const formattedLogs = logsData.map(l => {
            const logTime = new Date(l.created_at).toLocaleTimeString();
            const logDateStr = new Date(l.created_at).toLocaleDateString();
            return {
              id: l.id,
              time: `${logDateStr} ${logTime}`,
              category: l.category,
              message: l.message,
              type: l.category === 'USER LOGIN' ? 'login' : 'register'
            };
          });
          setLogs(formattedLogs);
        } else {
          // Fallback to construct from users if system_logs table has no entries
          if (usersData && usersData.length > 0) {
            const initialLogs = [];
            usersData.forEach(user => {
              if (user.created_at) {
                const regTime = new Date(user.created_at).toLocaleTimeString();
                const regDateStr = new Date(user.created_at).toLocaleDateString();
                initialLogs.push({
                  id: `log-init-reg-${user.id}`,
                  time: `${regDateStr} ${regTime}`,
                  category: 'NEW USER',
                  message: `New User Sign-up: ${user.first_name} ${user.last_name} (${user.email}) successfully registered account from ${user.state || 'Online'}.`,
                  type: 'register',
                  timestamp: new Date(user.created_at).getTime()
                });
              }
              if (user.last_login) {
                const logTime = new Date(user.last_login).toLocaleTimeString();
                const logDateStr = new Date(user.last_login).toLocaleDateString();
                initialLogs.push({
                  id: `log-init-login-${user.id}`,
                  time: `${logDateStr} ${logTime}`,
                  category: 'USER LOGIN',
                  message: `User Login: ${user.first_name} ${user.last_name} (${user.email}) logged into their account.`,
                  type: 'login',
                  timestamp: new Date(user.last_login).getTime()
                });
              }
            });
            initialLogs.sort((a, b) => b.timestamp - a.timestamp);
            setLogs(initialLogs);
          }
        }
      } catch (err) {
        console.error('Failed to load registered app_users or system_logs:', err);
      } finally {
        setIsLoadingUsers(false);
      }
    }
    loadData();
  }, []);

  // 1) Realtime Supabase Database Listener + Short Polling fallback
  useEffect(() => {
    // A) Short Polling: checks every 4 seconds for database changes
    const pollInterval = setInterval(async () => {
      try {
        const logsData = await fetchSystemLogs();
        if (logsData && logsData.length > 0) {
          setLogs((prevLogs) => {
            const newLogs = [];
            logsData.forEach(l => {
              const logTime = new Date(l.created_at).toLocaleTimeString();
              const logDateStr = new Date(l.created_at).toLocaleDateString();
              const formattedLog = {
                id: l.id,
                time: `${logDateStr} ${logTime}`,
                category: l.category,
                message: l.message,
                type: l.category === 'USER LOGIN' ? 'login' : 'register'
              };
              if (!prevLogs.some(pl => pl.id === formattedLog.id)) {
                newLogs.push(formattedLog);
              }
            });
            if (newLogs.length > 0) {
              return [...newLogs, ...prevLogs];
            }
            return prevLogs;
          });
        }
        
        // Also poll users in background to keep list fresh
        const freshUsers = await fetchAppUsers();
        if (freshUsers) {
          setUsersList(freshUsers);
        }
      } catch (err) {
        console.warn('Second-to-second polling check for logs failed:', err);
      }
    }, 4000);

    // B) Supabase Realtime Postgres Changes Subscription for system_logs table
    let realtimeChannel = null;
    if (supabase) {
      try {
        realtimeChannel = supabase
          .channel('db-changes-logs')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'system_logs' },
            (payload) => {
              const newLogEntry = payload.new;
              const logTime = new Date(newLogEntry.created_at).toLocaleTimeString();
              const logDateStr = new Date(newLogEntry.created_at).toLocaleDateString();
              const formattedLog = {
                id: newLogEntry.id,
                time: `${logDateStr} ${logTime}`,
                category: newLogEntry.category,
                message: newLogEntry.message,
                type: newLogEntry.category === 'USER LOGIN' ? 'login' : 'register'
              };
              
              setLogs((prevLogs) => {
                if (prevLogs.some(l => l.id === formattedLog.id)) {
                  return prevLogs;
                }
                return [formattedLog, ...prevLogs];
              });

              // Also reload the user list in background to ensure tab data is updated
              fetchAppUsers().then(data => {
                if (data) setUsersList(data);
              });
            }
          )
          .subscribe();
      } catch (err) {
        console.warn('Failed to initialize Supabase Realtime channel for system_logs:', err);
      }
    }

    return () => {
      clearInterval(pollInterval);
      if (supabase && realtimeChannel) {
        supabase.removeChannel(realtimeChannel);
      }
    };
  }, []);


  // Statistics counters
  const stats = [
    { label: 'Total Revenue', value: '₹0.00', icon: DollarSign, color: '#10b981' },
    { label: 'Active Users', value: String(usersList.length), icon: Users, color: '#3b82f6', action: () => setActiveTab('users') },
    { label: 'Active Drivers', value: '0', icon: Car, color: '#f59e0b', action: () => setActiveTab('drivers') },
    { label: 'Active Bookings', value: '0', icon: Calendar, color: '#a855f7', action: () => setActiveTab('trips') }
  ];

  // Sidebar Tabs Config
  const tabs = [
    { key: 'overview', label: 'Overview', icon: Layers },
    { key: 'users', label: 'No of Users', icon: Users },
    { key: 'drivers', label: 'No of Drivers', icon: Car },
    { key: 'history', label: 'Vehicles History', icon: HistoryIcon },
    { key: 'trips', label: 'Trips Booking with Vehicles', icon: Calendar },
    { key: 'partners', label: 'No of Partners', icon: Briefcase }
  ];

  // Helper to sync state when modal opens
  const openProfileModal = () => {
    setEditFirstName(admin.first_name || 'Surendra');
    setEditLastName(admin.last_name || 'Bezawada');
    setEditUsername(admin.username || 'Surendra@admin');
    setEditPassword(admin.password || 'Admin@123');
    setEditProfilePic(admin.profile_pic || '');
    setIsProfileModalOpen(true);
  };

  // Helper to handle avatar uploads and compress them to base64
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Please choose an avatar image smaller than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setEditProfilePic(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Profile save action
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!editFirstName.trim() || !editLastName.trim() || !editUsername.trim() || !editPassword.trim()) {
      alert("All fields are required to update administrator details.");
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateAdmin(admin.id, {
        first_name: editFirstName.trim(),
        last_name: editLastName.trim(),
        username: editUsername.trim(),
        password: editPassword.trim(),
        profile_pic: editProfilePic
      });

      if (onAdminUpdate) {
        onAdminUpdate(updated);
      }
      setIsProfileModalOpen(false);
      alert("🎉 Administrator profile updated successfully in the database!");
    } catch (err) {
      console.error(err);
      alert("❌ Failed to update administrator profile: " + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  // Tab Details Helper
  const getTabDetails = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Admin Overview', desc: 'Real-time overview of smart transportation metrics and system activities.' };
      case 'users':
        return { title: 'Registered Users Database', desc: 'Listing and authentication configuration for registered riders.' };
      case 'drivers':
        return { title: 'Registered Drivers Database', desc: 'Roster and status details of active and on-call fleet operators.' };
      case 'history':
        return { title: 'Vehicles Usage History', desc: 'System log tracking rides, category stats, and vehicle mileage counts.' };
      case 'trips':
        return { title: 'Trips Booking with Vehicles', desc: 'Scheduled, completed, and in-progress passenger bookings.' };
      case 'partners':
        return { title: 'Affiliated Transport Partners', desc: 'Active transport agents, operators, and corporate travel contractors.' };
      default:
        return { title: 'Administrator Control Panel', desc: 'Manage system settings and database entries.' };
    }
  };

  const currentTabInfo = getTabDetails();

  const renderTabContent = () => {
    if (activeTab === 'overview') {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* KPI Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
            {stats.map((s, idx) => (
              <div 
                key={idx} 
                onClick={s.action ? s.action : undefined}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                  cursor: s.action ? 'pointer' : 'default',
                  transform: 'translateY(0)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (s.action) {
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.06)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (s.action) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.02)';
                  }
                }}
              >
                <div>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {s.label}
                  </span>
                  <h4 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: '4px 0 0' }}>
                    {s.value}
                  </h4>
                </div>
                <div style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: `${s.color}12`,
                  color: s.color,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <s.icon size={22} />
                </div>
              </div>
            ))}
          </div>

          {/* System logs table container */}
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '20px',
            padding: '2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.02)'
          }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1.5rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={18} style={{ color: '#f97316' }} />
              Recent System Logs
            </h4>
            
            {/* Logs Timeline Display */}
            {logs.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '3.5rem 2rem',
                textAlign: 'center',
                border: '1px dashed #cbd5e1',
                borderRadius: '16px',
                backgroundColor: '#f8fafc'
              }}>
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  backgroundColor: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94a3b8',
                  marginBottom: '0.75rem'
                }}>
                  <Activity size={20} />
                </div>
                <h5 style={{ fontSize: '0.9rem', color: '#475569', margin: '0 0 4px 0', fontWeight: '700' }}>
                  Awaiting Application Updates...
                </h5>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem', maxWidth: '320px', margin: 0, lineHeight: 1.4 }}>
                  Real-time database listener is active. Dynamic logs will appear here when a new user registers on the platform.
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                maxHeight: '320px',
                overflowY: 'auto',
                paddingRight: '6px'
              }}>
                {logs.map((log) => (
                  <div key={log.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    backgroundColor: log.category === 'USER LOGIN' ? '#f0f9ff' : log.category === 'NEW USER' ? '#fff7ed' : '#f8fafc',
                    border: log.category === 'USER LOGIN' ? '1px solid #bae6fd' : log.category === 'NEW USER' ? '1px solid #ffedd5' : '1px solid #e2e8f0',
                    borderLeft: log.category === 'USER LOGIN' ? '5px solid #3b82f6' : log.category === 'NEW USER' ? '5px solid #f97316' : '1px solid #e2e8f0',
                    boxShadow: log.category === 'USER LOGIN' ? '0 4px 12px rgba(59, 130, 246, 0.06)' : log.category === 'NEW USER' ? '0 4px 12px rgba(249, 115, 22, 0.06)' : '0 2px 6px rgba(0,0,0,0.01)',
                    animation: 'fadeIn 0.3s ease-out'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: log.category === 'USER LOGIN' ? '#e0f2fe' : log.category === 'NEW USER' ? '#ffedd5' : '#e2e8f0',
                      color: log.category === 'USER LOGIN' ? '#3b82f6' : log.category === 'NEW USER' ? '#f97316' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <Activity size={18} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: '950',
                          color: (log.category === 'NEW USER' || log.category === 'USER LOGIN') ? '#ffffff' : '#64748b',
                          backgroundColor: log.category === 'USER LOGIN' ? '#3b82f6' : log.category === 'NEW USER' ? '#f97316' : '#e2e8f0',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em'
                        }}>
                          {log.category}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#94a3b8', fontStyle: 'monospace' }}>
                          {log.time}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', lineHeight: '1.4', fontWeight: (log.category === 'NEW USER' || log.category === 'USER LOGIN') ? '600' : '500' }}>
                        {log.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'users' && usersList.length > 0) {
      return (
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '20px',
          padding: '2rem',
          boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
          minHeight: '450px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              Registered Riders
            </h4>
            <span style={{ fontSize: '0.8rem', backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316', fontWeight: '700', padding: '4px 10px', borderRadius: '8px' }}>
              {usersList.length} Accounts Found
            </span>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#475569' }}>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User Details</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location Address</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account Status</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Login</th>
                  <th style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered Date</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#0f172a', transition: 'background-color 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', border: '1px solid #cbd5e1', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                        <img 
                          src={user.profile_pic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                          alt={user.first_name} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80';
                          }}
                        />
                      </div>
                      <div>
                        <span style={{ fontWeight: '700', display: 'block' }}>{user.first_name} {user.last_name}</span>
                        <span style={{ fontSize: '0.7rem', color: '#94a3b8', display: 'block', textTransform: 'uppercase', letterSpacing: '0.02em' }}>ID: {user.id.substring(0, 8)}...</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px', color: '#475569', fontSize: '0.85rem', fontWeight: '500' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '16px', color: '#475569', fontSize: '0.85rem' }}>
                      {user.address ? `${user.address}, ${user.state} (${user.pin_code})` : '—'}
                    </td>
                    <td style={{ padding: '16px' }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        padding: '4px 8px',
                        borderRadius: '9999px',
                        backgroundColor: '#d1fae5',
                        color: '#065f46'
                      }}>
                        Active Account
                      </span>
                    </td>
                    <td style={{ padding: '16px', color: '#475569', fontSize: '0.85rem' }}>
                      {user.last_login ? (
                        <span style={{ fontWeight: '600', color: '#3b82f6' }}>
                          {new Date(user.last_login).toLocaleString(undefined, {
                            dateStyle: 'short',
                            timeStyle: 'short'
                          })}
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>Never logged in</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', color: '#64748b', fontSize: '0.85rem' }}>
                      {new Date(user.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    // Generic list view for database records
    let headers = [];
    let emptyTitle = "";
    let emptySub = "";

    switch (activeTab) {
      case 'users':
        headers = ['User ID', 'Full Name', 'Email Address', 'Account Status', 'Date Registered'];
        emptyTitle = "Rider Accounts Database Empty";
        emptySub = "No passenger account entries exist in the database yet. New accounts appear here when users sign up.";
        break;
      case 'drivers':
        headers = ['Driver ID', 'Operator Name', 'License Number', 'Assigned Vehicle', 'Duty Status'];
        emptyTitle = "No Active Drivers Registered";
        emptySub = "No driver roster profiles are configured in the system. Go to fleet config to onboard transport operators.";
        break;
      case 'history':
        headers = ['Vehicle Model', 'Reg Plate No', 'Category Type', 'Total Trips Completed', 'Current Mileage', 'Health Status'];
        emptyTitle = "No Vehicles History Logged";
        emptySub = "No logs or vehicle usage data has been populated. History records will append here dynamically.";
        break;
      case 'trips':
        headers = ['Booking ID', 'Customer Info', 'Assigned Fleet Model', 'Route Itinerary', 'Trip Cost', 'Ride Status'];
        emptyTitle = "No Booked Trips Record Found";
        emptySub = "Riders have not placed any trip booking schedules. Active vehicle rides will log here real-time.";
        break;
      case 'partners':
        headers = ['Partner Company', 'Contact Person', 'Service Details', 'Operational Region', 'Contract Status'];
        emptyTitle = "No Affiliated Business Partners";
        emptySub = "No logistic agent contractors or commercial partners are listed. Onboard agency accounts to track them.";
        break;
    }

    return (
      <div style={{
        backgroundColor: '#ffffff',
        border: '1px solid #e2e8f0',
        borderRadius: '20px',
        padding: '2rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.02)',
        minHeight: '450px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Mock Table Shell Headers */}
        <div style={{ overflowX: 'auto', width: '100%', marginBottom: '2rem' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                {headers.map((h, i) => (
                  <th key={i} style={{ padding: '12px 16px', fontSize: '0.8rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Empty state inside table */}
            </tbody>
          </table>
        </div>

        {/* Empty State Illustration */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 0',
          textAlign: 'center',
          border: '1px dashed #cbd5e1',
          borderRadius: '14px',
          backgroundColor: '#f8fafc',
          flexGrow: 1
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(249, 115, 22, 0.08)',
            color: '#f97316',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            border: '1px dashed rgba(249, 115, 22, 0.2)'
          }}>
            <ShieldAlert size={28} />
          </div>
          <h4 style={{ fontSize: '1.15rem', color: '#0f172a', margin: '0 0 6px 0', fontWeight: '800' }}>
            {emptyTitle}
          </h4>
          <p style={{ color: '#64748b', fontSize: '0.85rem', maxWidth: '440px', margin: 0, lineHeight: 1.6 }}>
            {emptySub}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-crm-container" style={{
      display: 'flex',
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Sidebar Navigation */}
      <aside style={{
        width: '270px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        flexShrink: 0
      }}>
        {/* Sidebar Header Logo */}
        <div style={{
          padding: '0 1.5rem 1.5rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '1rem'
        }}>
          <img 
            src={travelByLogo} 
            alt="Travel_by Logo" 
            style={{ 
              height: '85px', 
              width: 'auto', 
              display: 'block', 
              marginBottom: '8px' 
            }} 
          />
          <span style={{ 
            fontSize: '0.65rem', 
            color: '#f97316', 
            textTransform: 'uppercase', 
            fontWeight: '800', 
            letterSpacing: '0.05em', 
            background: 'rgba(249, 115, 22, 0.08)', 
            padding: '3px 10px', 
            borderRadius: '6px' 
          }}>
            Administrator Portal
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '1rem', flexGrow: 1 }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === t.key ? 'rgba(249, 115, 22, 0.08)' : 'none',
                color: activeTab === t.key ? '#f97316' : '#475569',
                fontWeight: activeTab === t.key ? '700' : '600',
                fontSize: '0.9rem',
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
            >
              <t.icon size={18} style={{ color: activeTab === t.key ? '#f97316' : '#94a3b8' }} />
              {t.label}
            </button>
          ))}
        </nav>

        {/* Sidebar Footer Logout */}
        <div style={{ padding: '0 1rem' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'none',
              color: '#ef4444',
              fontWeight: '700',
              fontSize: '0.9rem',
              textAlign: 'left',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={18} />
            Exit Dashboard
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Header */}
        <header style={{
          height: '75px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2.5rem',
          flexShrink: 0
        }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {currentTabInfo.title}
            </h3>
            <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginTop: '2px' }}>
              {currentTabInfo.desc}
            </span>
          </div>

          {/* Admin Profile Details (Top Right, Clickable to Edit) */}
          <div 
            onClick={openProfileModal}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '12px', 
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: '12px',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            title="Edit Admin Settings"
          >
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.85rem', fontWeight: '700', color: '#0f172a' }}>
                {admin.first_name} {admin.last_name}
              </span>
            </div>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              border: '2px solid #f97316',
              overflow: 'hidden',
              backgroundColor: '#f1f5f9'
            }}>
              <img 
                src={admin.profile_pic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                alt="Admin Avatar" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
            </div>
          </div>
        </header>

        {/* Content Panel */}
        <div style={{ padding: '2.5rem', flexGrow: 1, overflowY: 'auto' }}>
          {renderTabContent()}
        </div>
      </main>

      {/* Edit Profile Modal */}
      {isProfileModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.4)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem'
        }} onClick={() => setIsProfileModalOpen(false)}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            border: '1px solid #e2e8f0',
            width: '100%',
            maxWidth: '500px',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.1)',
            overflow: 'hidden'
          }} onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div style={{
              padding: '1.5rem 2rem',
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#f8fafc'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: '#0f172a' }}>
                  Edit Administrator Account
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                  Update admin access credentials and profile details
                </span>
              </div>
              <button 
                onClick={() => setIsProfileModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e2e8f0'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleProfileSave} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              {/* Profile Image Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.5rem' }}>
                <div style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', border: '3px solid #f97316', backgroundColor: '#f1f5f9', flexShrink: 0 }}>
                  <img 
                    src={editProfilePic || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} 
                    alt="Edit Profile Avatar" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <label style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: '#ffffff',
                    height: '26px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    fontSize: '0.65rem',
                    transition: 'background-color 0.2s'
                  }}>
                    <Camera size={12} style={{ marginRight: '3px' }} />
                    Edit
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#334155' }}>
                    Profile Picture URL
                  </span>
                  <input 
                    type="text" 
                    value={editProfilePic}
                    onChange={(e) => setEditProfilePic(e.target.value)}
                    placeholder="Or paste an image URL..."
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      outline: 'none',
                      color: '#0f172a',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Name Row */}
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>First Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editFirstName}
                    onChange={(e) => setEditFirstName(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Last Name</label>
                  <input 
                    type="text" 
                    required 
                    value={editLastName}
                    onChange={(e) => setEditLastName(e.target.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Username Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    <User size={16} />
                  </span>
                  <input 
                    type="text" 
                    required 
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px 10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex', alignItems: 'center' }}>
                    <Lock size={16} />
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    required 
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 38px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#94a3b8',
                      cursor: 'pointer',
                      padding: 0
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.25rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsProfileModalOpen(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#ffffff',
                    color: '#475569',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    backgroundColor: '#f97316',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'opacity 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
