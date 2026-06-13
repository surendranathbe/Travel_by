import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️ Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

const DEFAULT_AVATAR = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23cbd5e1"><circle cx="12" cy="8" r="4"/><path d="M12 14c-6.1 0-11 2.9-11 6v2h22v-2c0-3.1-4.9-6-11-6z"/></svg>`;

// Sign up a new user in app_users table
export async function signUpUser(email, password, profilePic, firstName, lastName, address, pinCode, state) {
  if (!supabase) throw new Error('Supabase client is not initialized.');
  
  // Check if email already exists
  const { data: existingUser, error: checkError } = await supabase
    .from('app_users')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .maybeSingle();
    
  if (checkError) throw checkError;
  if (existingUser) {
    throw new Error('This email is already registered.');
  }

  // Insert the new user
  const { data, error } = await supabase
    .from('app_users')
    .insert([
      {
        email: email.toLowerCase().trim(),
        password: password,
        profile_pic: profilePic || DEFAULT_AVATAR,
        first_name: firstName,
        last_name: lastName,
        address: address,
        pin_code: pinCode,
        state: state
      }
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Sign in an existing user
export async function signInUser(email, password) {
  if (!supabase) throw new Error('Supabase client is not initialized.');

  const { data, error } = await supabase
    .from('app_users')
    .select('*')
    .eq('email', email.toLowerCase().trim())
    .eq('password', password)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('Invalid email or password.');
  }

  return data;
}
