import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Missing Supabase environment variables. Please check your .env file.');
}

let clientInstance = null;
if (supabaseUrl && supabaseKey) {
  if (typeof window !== 'undefined') {
    if (!window.__supabaseClient) {
      window.__supabaseClient = createClient(supabaseUrl, supabaseKey);
    }
    clientInstance = window.__supabaseClient;
  } else {
    clientInstance = createClient(supabaseUrl, supabaseKey);
  }
}

export const supabase = clientInstance;

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-11 2.9-11 6v2h22v-2c0-3.1-4.9-6-11-6z"/></svg>`;

// Helper function to sanitize user inputs to protect against XSS injections
const sanitizeInput = (val) => {
  if (typeof val !== 'string') return '';
  // Strip tags and prevent scripts/malicious HTML
  return val.replace(/<[^>]*>?/gm, '').trim();
};

// Sign up a new user in app_users table
export async function signUpUser(email, password, profilePic, firstName, lastName, address, pinCode, state) {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  
  const cleanEmail = sanitizeInput(email).toLowerCase();
  const cleanFirstName = sanitizeInput(firstName);
  const cleanLastName = sanitizeInput(lastName);
  const cleanAddress = sanitizeInput(address);
  const cleanPinCode = sanitizeInput(pinCode);
  const cleanState = sanitizeInput(state);

  // Parameterized query via supabase client blocks SQL injections
  const { data: existingUser, error: checkError } = await supabase
    .from('app_users')
    .select('id')
    .eq('email', cleanEmail)
    .maybeSingle();
    
  if (checkError) throw checkError;
  if (existingUser) {
    throw new Error('This email is already registered.');
  }

  // Insert the new user safely
  const { data, error } = await supabase
    .from('app_users')
    .insert([
      {
        email: cleanEmail,
        password: password, // plaintext for developer testing environment context
        profile_pic: profilePic || DEFAULT_AVATAR,
        first_name: cleanFirstName,
        last_name: cleanLastName,
        address: cleanAddress,
        pin_code: cleanPinCode,
        state: cleanState
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // Log the signup event to system_logs
  try {
    await supabase.from('system_logs').insert([
      {
        category: 'NEW USER',
        message: `New User Sign-up: ${cleanFirstName} ${cleanLastName} (${cleanEmail}) registered account from ${cleanState || 'Online'}.`
      }
    ]);
  } catch (err) {
    console.warn('Failed to insert signup log:', err);
  }

  return data;
}

// Sign in an existing user
export async function signInUser(email, password) {
  if (!supabase) throw new Error('Supabase client is not initialized.');

  const cleanEmail = sanitizeInput(email).toLowerCase();

  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('email', cleanEmail)
    .eq('password', password)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('Invalid email or password.');
  }

  // Update last_login timestamp in database for session tracking
  try {
    const loginTime = new Date().toISOString();
    await supabase
      .from('app_users')
      .update({ last_login: loginTime })
      .eq('id', data.id);

    // Log the login event to system_logs
    await supabase.from('system_logs').insert([
      {
        category: 'USER LOGIN',
        message: `User Login: ${data.first_name} ${data.last_name} (${data.email}) logged into their account.`
      }
    ]);
  } catch (err) {
    console.warn('Failed to update last_login or insert login log in Supabase:', err);
  }

  return data;
}

// Update user profile details in app_users table
export async function updateUser(userId, updates) {
  if (!supabase) throw new Error('Supabase client is not initialized.');

  const cleanUpdates = {};
  if (updates.first_name !== undefined) cleanUpdates.first_name = sanitizeInput(updates.first_name);
  if (updates.last_name !== undefined) cleanUpdates.last_name = sanitizeInput(updates.last_name);
  if (updates.address !== undefined) cleanUpdates.address = sanitizeInput(updates.address);
  if (updates.pin_code !== undefined) cleanUpdates.pin_code = sanitizeInput(updates.pin_code);
  if (updates.state !== undefined) cleanUpdates.state = sanitizeInput(updates.state);
  if (updates.profile_pic !== undefined) cleanUpdates.profile_pic = updates.profile_pic;

  const { data, error } = await supabase
    .from('app_users')
    .update(cleanUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Sign in an admin with local fallback
export async function signInAdmin(username, password) {
  const normUser = sanitizeInput(username);
  
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .eq('username', normUser)
        .eq('password', password)
        .maybeSingle();
        
      if (!error && data) {
        return data;
      }
    } catch (err) {
      console.warn('Supabase admin lookup failed, falling back to local validation.', err);
    }
  }
  
  // Local fallback validation
  if (normUser === 'Surendra@admin' && password === 'Admin@123') {
    return {
      id: 'admin-local-id',
      username: 'Surendra@admin',
      first_name: 'Surendra',
      last_name: 'Bezawada',
      profile_pic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };
  }
  
  throw new Error('Invalid admin credentials.');
}

// Update admin credentials in the database (or mock locally)
export async function updateAdmin(adminId, updates) {
  const cleanUpdates = {};
  if (updates.first_name !== undefined) cleanUpdates.first_name = sanitizeInput(updates.first_name);
  if (updates.last_name !== undefined) cleanUpdates.last_name = sanitizeInput(updates.last_name);
  if (updates.username !== undefined) cleanUpdates.username = sanitizeInput(updates.username);
  if (updates.password !== undefined) cleanUpdates.password = updates.password; // maintain password character set
  if (updates.profile_pic !== undefined) cleanUpdates.profile_pic = updates.profile_pic;

  if (supabase && adminId !== 'admin-local-id') {
    const { data, error } = await supabase
      .from('admins')
      .update(cleanUpdates)
      .eq('id', adminId)
      .select();

    if (error) throw error;

    // Check if 0 rows were updated (usually due to a missing UPDATE policy in Supabase RLS settings)
    if (!data || data.length === 0) {
      throw new Error(
        'Database update failed: 0 rows affected. Please run this command in your Supabase SQL Editor to enable admin updates:\n' +
        'CREATE POLICY "Allow public update access" ON admins FOR UPDATE USING (true);'
      );
    }

    return data[0];
  }

  // Mock local fallback response
  return {
    id: 'admin-local-id',
    username: cleanUpdates.username !== undefined ? cleanUpdates.username : 'Surendra@admin',
    password: cleanUpdates.password !== undefined ? cleanUpdates.password : 'Admin@123',
    first_name: cleanUpdates.first_name !== undefined ? cleanUpdates.first_name : 'Surendra',
    last_name: cleanUpdates.last_name !== undefined ? cleanUpdates.last_name : 'Bezawada',
    profile_pic: cleanUpdates.profile_pic !== undefined ? cleanUpdates.profile_pic : 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };
}

// Fetch all registered users from database
export async function fetchAppUsers() {
  let rawUsers = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        rawUsers = data;
      } else if (error) {
        console.warn('Supabase app_users query failed, using local mock users:', error);
      }
    } catch (err) {
      console.warn('Failed to query app_users from Supabase:', err);
    }
  }

  // Only fallback to mock users if database connection failed / was offline (rawUsers is null)
  if (rawUsers === null) {
    rawUsers = [
      {
        id: 'usr-92819',
        first_name: 'Surendra',
        last_name: 'Bezawada',
        email: 'Surendra@admin',
        address: 'Plot 45, Jubilee Hills',
        pin_code: '500033',
        state: 'Telangana',
        created_at: new Date(Date.now() - 86400000 * 2).toISOString()
      },
      {
        id: 'usr-10924',
        first_name: 'Anitha',
        last_name: 'Reddy',
        email: 'anitha.reddy@gmail.com',
        address: 'Phase 2, Gachibowli',
        pin_code: '500032',
        state: 'Telangana',
        created_at: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: 'usr-87291',
        first_name: 'Rohan',
        last_name: 'Sharma',
        email: 'rohan.sharma@yahoo.com',
        address: 'Sector 5, HSR Layout',
        pin_code: '560102',
        state: 'Karnataka',
        created_at: new Date(Date.now() - 86400000 * 12).toISOString()
      }
    ];
  }

  // DEDUPLICATE users by email (case-insensitive) to prevent duplicates in the dashboard
  const uniqueUsers = [];
  const seenEmails = new Set();
  
  for (const user of rawUsers) {
    if (user.email && user.first_name && user.last_name) {
      const emailKey = user.email.toLowerCase().trim();
      if (!seenEmails.has(emailKey)) {
        seenEmails.add(emailKey);
        uniqueUsers.push(user);
      }
    }
  }

  return uniqueUsers;
}

// Fetch system logs from Supabase
export async function fetchSystemLogs() {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) {
        return data;
      } else if (error) {
        console.warn('Supabase system_logs select failed, using empty mock logs:', error);
      }
    } catch (err) {
      console.warn('Failed to query system logs:', err);
    }
  }
  return [];
}

// Add a new system event log entry (persistent database logs)
export async function addSystemLog(category, message) {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('system_logs')
        .insert([{ category, message }])
        .select()
        .single();
      if (error) {
        console.warn('Supabase system_logs insert failed, using mock log.', error);
      } else {
        return data;
      }
    } catch (err) {
      console.warn('Failed to insert log entry:', err);
    }
  }
  return {
    id: `log-mock-${Date.now()}`,
    category,
    message,
    created_at: new Date().toISOString()
  };
}

// Sign up a new driver in drivers table
export async function signUpDriver(email, password, firstName, lastName, phone, vehicleType, vehicleNumber, licenseNumber, profilePic) {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  
  const cleanEmail = sanitizeInput(email).toLowerCase();
  const cleanFirstName = sanitizeInput(firstName);
  const cleanLastName = sanitizeInput(lastName);
  const cleanPhone = sanitizeInput(phone);
  const cleanVehicleType = sanitizeInput(vehicleType);
  const cleanVehicleNumber = sanitizeInput(vehicleNumber);
  const cleanLicenseNumber = sanitizeInput(licenseNumber);

  // Check if driver already exists
  const { data: existingDriver, error: checkError } = await supabase
    .from('drivers')
    .select('id')
    .eq('email', cleanEmail)
    .maybeSingle();
    
  if (checkError) throw checkError;
  if (existingDriver) {
    throw new Error('This email is already registered as a driver.');
  }

  // Insert the new driver safely
  const { data, error } = await supabase
    .from('drivers')
    .insert([
      {
        email: cleanEmail,
        password: password, // plaintext for dev testing environment
        first_name: cleanFirstName,
        last_name: cleanLastName,
        phone: cleanPhone,
        vehicle_type: cleanVehicleType,
        vehicle_number: cleanVehicleNumber,
        license_number: cleanLicenseNumber,
        profile_pic: profilePic || DEFAULT_AVATAR,
        status: 'pending'
      }
    ])
    .select()
    .single();

  if (error) throw error;

  // Log the signup event to system_logs
  try {
    await supabase.from('system_logs').insert([
      {
        category: 'NEW DRIVER',
        message: `New Driver Registered: ${cleanFirstName} ${cleanLastName} (${cleanEmail}) for ${cleanVehicleType} (${cleanVehicleNumber}).`
      }
    ]);
  } catch (err) {
    console.warn('Failed to insert driver signup log:', err);
  }

  return data;
}

// Sign in an existing driver with local fallback
export async function signInDriver(email, password) {
  const cleanEmail = sanitizeInput(email).toLowerCase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('email', cleanEmail)
        .eq('password', password)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        // Log the login event to system_logs
        try {
          await supabase.from('system_logs').insert([
            {
              category: 'DRIVER LOGIN',
              message: `Driver Login: ${data.first_name} ${data.last_name} (${data.email}) logged into driver portal.`
            }
          ]);
        } catch (logErr) {
          console.warn('Failed to insert driver login log:', logErr);
        }
        return data;
      }
    } catch (err) {
      console.warn('Supabase driver lookup failed, checking local fallback.', err);
    }
  }

  // Local fallback validation
  if (cleanEmail === 'test@driver.com' && password === 'Driver@123') {
    return {
      id: 'driver-local-id',
      email: 'test@driver.com',
      password: 'Driver@123',
      first_name: 'John',
      last_name: 'Driver',
      phone: '9876543210',
      vehicle_type: 'car',
      vehicle_number: 'AP-09-XX-1234',
      license_number: 'DL-9876543210',
      status: 'approved',
      profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
    };
  }

  throw new Error('Invalid driver email or password.');
}

// Update driver details
export async function updateDriver(driverId, updates) {
  const cleanUpdates = {};
  if (updates.first_name !== undefined) cleanUpdates.first_name = sanitizeInput(updates.first_name);
  if (updates.last_name !== undefined) cleanUpdates.last_name = sanitizeInput(updates.last_name);
  if (updates.phone !== undefined) cleanUpdates.phone = sanitizeInput(updates.phone);
  if (updates.vehicle_type !== undefined) cleanUpdates.vehicle_type = sanitizeInput(updates.vehicle_type);
  if (updates.vehicle_number !== undefined) cleanUpdates.vehicle_number = sanitizeInput(updates.vehicle_number);
  if (updates.license_number !== undefined) cleanUpdates.license_number = sanitizeInput(updates.license_number);
  if (updates.profile_pic !== undefined) cleanUpdates.profile_pic = updates.profile_pic;
  if (updates.status !== undefined) cleanUpdates.status = sanitizeInput(updates.status);

  if (supabase && driverId !== 'driver-local-id') {
    const { data, error } = await supabase
      .from('drivers')
      .update(cleanUpdates)
      .eq('id', driverId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Mock local fallback response
  return {
    id: 'driver-local-id',
    email: 'test@driver.com',
    first_name: cleanUpdates.first_name !== undefined ? cleanUpdates.first_name : 'John',
    last_name: cleanUpdates.last_name !== undefined ? cleanUpdates.last_name : 'Driver',
    phone: cleanUpdates.phone !== undefined ? cleanUpdates.phone : '9876543210',
    vehicle_type: cleanUpdates.vehicle_type !== undefined ? cleanUpdates.vehicle_type : 'car',
    vehicle_number: cleanUpdates.vehicle_number !== undefined ? cleanUpdates.vehicle_number : 'AP-09-XX-1234',
    license_number: cleanUpdates.license_number !== undefined ? cleanUpdates.license_number : 'DL-9876543210',
    status: cleanUpdates.status !== undefined ? cleanUpdates.status : 'approved',
    profile_pic: cleanUpdates.profile_pic !== undefined ? cleanUpdates.profile_pic : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  };
}

// Fetch all registered drivers from database
export async function fetchDrivers() {
  let rawDrivers = null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        rawDrivers = data;
      } else if (error) {
        console.warn('Supabase drivers query failed, checking local mock fallback:', error);
      }
    } catch (err) {
      console.warn('Failed to query drivers from Supabase:', err);
    }
  }

  if (rawDrivers === null) {
    rawDrivers = [
      {
        id: 'drv-mock-1',
        first_name: 'John',
        last_name: 'Driver',
        email: 'test@driver.com',
        phone: '9876543210',
        vehicle_type: 'car',
        vehicle_number: 'AP-09-XX-1234',
        license_number: 'DL-9876543210',
        status: 'approved',
        profile_pic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        created_at: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'drv-mock-2',
        first_name: 'Surendra Nath',
        last_name: 'Bezawada',
        email: 'Surendra@gmail.com',
        phone: '8688119095',
        vehicle_type: 'bike',
        vehicle_number: 'AP-27-CB-1644',
        license_number: 'DL-123456789',
        status: 'pending',
        profile_pic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
        created_at: new Date().toISOString()
      }
    ];
  }

  return rawDrivers;
}


