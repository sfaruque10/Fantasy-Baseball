// import 'react-native-url-polyfill/auto';
// import { createClient } from '@supabase/supabase-js';
// import AsyncStorage from '@react-native-async-storage/async-storage';

// const supabaseUrl = 'YOUR_SUPABASE_URL';
// // const supabaseAnonKey = supabaseAnonKe;

// export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
//   global: {
//     fetch: async (url, options = {}) => {
//       // Get the token your friend saved during login
//       const token = await AsyncStorage.getItem('token');

//       // Inject the token into the headers
//       const headers = new Headers(options.headers);
//       if (token) {
//         headers.set('Authorization', `Bearer ${token}`);
//       }

//       return fetch(url, { ...options, headers });
//     },
//   },
// });
