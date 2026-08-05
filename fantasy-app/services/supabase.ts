import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import "react-native-url-polyfill/auto";

// const supabaseUrl = "https://toqeaiwgipwdwmlvnkwj.supabase.co";
// const supabaseAnonKey = "sb_publishable_ZGJbkgFc_xinZ3M8HoJm_A_tcCCwYH2";
const supabaseUrl = "https://mrraighvanafwtdpvppo.supabase.co";
const supabaseAnonKey = "sb_publishable_zmOtYZcI17MNBFZSA5crhw_IyKSE4mo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
