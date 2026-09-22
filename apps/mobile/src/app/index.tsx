import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

export default function Index() {
 const [session, setSession] = useState<Session | null | undefined>(undefined);

 useEffect(() => {
 supabase.auth.getSession().then(({ data: { session } }) => {
 setSession(session);
 });

 supabase.auth.onAuthStateChange((_event, session) => {
 setSession(session);
 });
 }, []);

 if (session === undefined) {
 return (
 <View className="flex-1 justify-center items-center bg-zinc-50 ">
 <ActivityIndicator size="large" color="#f59e0b" />
 </View>
 );
 }

  if (session) {
    // We cannot easily do an async check synchronously in render, so we render a loader while we check
    return <ProfileCheck session={session} />;
  } else {
    return <Redirect href="/(auth)/welcome" />;
  }
}

import AsyncStorage from '@react-native-async-storage/async-storage';

function ProfileCheck({ session }: { session: Session }) {
  const [isComplete, setIsComplete] = useState<boolean | null>(null);

  useEffect(() => {
    async function checkProfile() {
      // First check if profile is complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, phone_number')
        .eq('id', session.user.id)
        .single();
      
      if (profile?.full_name && profile?.phone_number) {
        setIsComplete(true);
        return;
      } 
      
      // If not complete, check if they skipped onboarding in the last 7 days
      try {
        const skipTimestampStr = await AsyncStorage.getItem('onboarding_skip_timestamp');
        if (skipTimestampStr) {
          const skipTimestamp = parseInt(skipTimestampStr, 10);
          const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - skipTimestamp < oneWeekInMs) {
            // Still within the 1-week skip period, treat as "complete" for routing purposes
            setIsComplete(true);
            return;
          }
        }
      } catch (e) {
        console.error("Error reading async storage", e);
      }
      
      setIsComplete(false);
    }
    checkProfile();
  }, [session]);

  if (isComplete === null) {
    return (
      <View className="flex-1 justify-center items-center bg-zinc-50">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (isComplete) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/onboarding" />;
  }
}
