const BASE_URL = 'http://localhost:5000/api';

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-11 2.9-11 6v2h22v-2c0-3.1-4.9-6-11-6z"/></svg>`;

// Export supabase as null to disable direct browser SDK calls
export const supabase = null;

// User Signup
export async function signUpUser(email, password, profilePic, firstName, lastName, address, pinCode, state) {
  const res = await fetch(`${BASE_URL}/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, profile_pic: profilePic || DEFAULT_AVATAR, first_name: firstName, last_name: lastName, address, pin_code: pinCode, state })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signup failed');
  return data;
}

// User Signin
export async function signInUser(email, password) {
  const res = await fetch(`${BASE_URL}/users/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Signin failed');
  return data;
}

// Update User details
export async function updateUser(userId, updates) {
  let email = null;
  try {
    const session = localStorage.getItem('travelBy_user');
    if (session) {
      email = JSON.parse(session).email;
    }
  } catch (e) {}

  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...updates, sessionEmail: email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update user failed');
  return data;
}

// Admin Signin
export async function signInAdmin(username, password) {
  const res = await fetch(`${BASE_URL}/admin/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Admin login failed');
  return data;
}

// Update Admin details
export async function updateAdmin(adminId, updates) {
  const res = await fetch(`${BASE_URL}/admin/${adminId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update admin failed');
  return data;
}

// Fetch all registered users
export async function fetchAppUsers() {
  try {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch users');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch app users from MongoDB:', err);
    return [];
  }
}

// Fetch system logs
export async function fetchSystemLogs() {
  try {
    const res = await fetch(`${BASE_URL}/logs`);
    if (!res.ok) throw new Error('Failed to fetch logs');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch logs from MongoDB:', err);
    return [];
  }
}

// Add system log
export async function addSystemLog(category, message) {
  try {
    const res = await fetch(`${BASE_URL}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, message })
    });
    if (!res.ok) throw new Error('Failed to add log');
    return await res.json();
  } catch (err) {
    console.error('Failed to add system log to MongoDB:', err);
    return { id: `log-mock-${Date.now()}`, category, message, created_at: new Date().toISOString() };
  }
}

// Driver Signup
export async function signUpDriver(email, password, firstName, lastName, phone, vehicleType, vehicleNumber, licenseNumber, profilePic) {
  const res = await fetch(`${BASE_URL}/drivers/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, phone, vehicle_type: vehicleType, vehicle_number: vehicleNumber, license_number: licenseNumber, profile_pic: profilePic || DEFAULT_AVATAR })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Driver signup failed');
  return data;
}

// Driver Signin
export async function signInDriver(email, password) {
  const res = await fetch(`${BASE_URL}/drivers/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Driver login failed');
  return data;
}

// Update Driver details
export async function updateDriver(driverId, updates) {
  let email = null;
  try {
    const session = localStorage.getItem('travelBy_driver');
    if (session) {
      email = JSON.parse(session).email;
    }
  } catch (e) {}

  const res = await fetch(`${BASE_URL}/drivers/${driverId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...updates, sessionEmail: email })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update driver failed');
  return data;
}

// Fetch all drivers
export async function fetchDrivers() {
  try {
    const res = await fetch(`${BASE_URL}/drivers`);
    if (!res.ok) throw new Error('Failed to fetch drivers');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch drivers from MongoDB:', err);
    return [];
  }
}

// Save Driver documents
export async function saveDriverDocuments(docData) {
  const res = await fetch(`${BASE_URL}/documents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(docData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Save documents failed');
  return data;
}

// Fetch driver documents by email
export async function fetchDriverDocuments(email) {
  try {
    const res = await fetch(`${BASE_URL}/documents/${email}`);
    if (!res.ok) throw new Error('Failed to fetch documents');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch driver documents from MongoDB:', err);
    return null;
  }
}

// Fetch all driver documents
export async function fetchAllDriverDocuments() {
  try {
    const res = await fetch(`${BASE_URL}/documents`);
    if (!res.ok) throw new Error('Failed to fetch all documents');
    return await res.json();
  } catch (err) {
    console.error('Failed to fetch all driver documents from MongoDB:', err);
    return [];
  }
}

// Update driver document verification status
export async function updateDocumentVerification(docId, verificationStatus, driverId) {
  const res = await fetch(`${BASE_URL}/documents/verify/${docId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ verificationStatus, driverId })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Update document verification failed');
  return data;
}

// Fetch driver details by email
export async function fetchDriverByEmail(email) {
  try {
    const res = await fetch(`${BASE_URL}/drivers`);
    if (!res.ok) throw new Error('Failed to fetch drivers');
    const drivers = await res.json();
    return drivers.find(d => d.email.toLowerCase() === email.toLowerCase().trim()) || null;
  } catch (err) {
    console.error('Failed to query driver by email from MongoDB:', err);
    return null;
  }
}
