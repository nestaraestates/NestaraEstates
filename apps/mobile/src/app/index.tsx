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
      <View className="flex-1 justify-center items-center bg-zinc-50 dark:bg-zinc-950">
        <ActivityIndicator size="large" color="#f59e0b" />
      </View>
    );
  }

  if (session) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/(auth)/welcome" />;
  }
}
