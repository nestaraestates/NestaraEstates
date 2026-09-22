import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

import { GoogleIcon } from '@/components/google-icon';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  scopes: ['profile', 'email'],
});



export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'Please accept the terms and conditions to create an account.');
      return;
    }
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Signup Failed', error.message);
    } else {
      if (data.session) {
        // Check if profile is complete
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, phone_number')
          .eq('id', data.session.user.id)
          .single();

        if (!profile?.full_name || !profile?.phone_number) {
          router.replace('/(auth)/onboarding');
        } else {
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert('Success', 'Please check your inbox for email verification!');
      }
    }
    setLoading(false);
  }

  // Placeholder for future Google Auth implementation
  async function signUpWithGoogle() {
    if (!acceptedTerms) {
      Alert.alert('Terms Required', 'Please accept the terms and conditions to create an account.');
      return;
    }
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: userInfo.data.idToken,
        });
        if (error) throw error;
        
        if (data.session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, phone_number')
            .eq('id', data.session.user.id)
            .single();

          if (!profile?.full_name || !profile?.phone_number) {
            router.replace('/(auth)/onboarding');
          } else {
            router.replace('/(tabs)');
          }
        }
      } else {
        throw new Error('no ID token present!');
      }
    } catch (error: any) {
      if (error.code === 'SIGN_IN_CANCELLED') {
        // user cancelled
      } else {
        Alert.alert('Google Sign-In Error', error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
        <View className="p-4 w-full max-w-md mx-auto">
          <View className="w-full bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
            
            <View className="p-6 pb-2 items-center space-y-2">
              <Image 
                source={require('@/assets/images/logo.png')} 
                className="w-16 h-16 rounded-2xl mb-2" 
                resizeMode="contain"
              />
              <Text className="text-2xl font-bold tracking-tight text-zinc-900">Create an account</Text>
              <Text className="text-zinc-500">Join Nestara today</Text>
            </View>

            <View className="p-6 space-y-4">
              
              <View className="space-y-1">
                <Text className="text-sm font-medium text-zinc-900">Email</Text>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="you@example.com"
                  placeholderTextColor="#A1A1AA"
                  autoCapitalize="none"
                  className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-zinc-900"
                />
              </View>

              <View className="space-y-1">
                <Text className="text-sm font-medium text-zinc-900">Password</Text>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#A1A1AA"
                  secureTextEntry
                  className="w-full bg-white border border-zinc-200 rounded-md px-3 py-2 text-zinc-900"
                />
              </View>

              <View className="flex-row mt-2 mb-1 pr-4">
                <Pressable 
                  onPress={() => setAcceptedTerms(!acceptedTerms)}
                  className={`w-5 h-5 rounded border items-center justify-center mr-2 mt-0.5 ${acceptedTerms ? 'bg-amber-500 border-amber-500' : 'border-zinc-300 bg-white'}`}
                >
                  {acceptedTerms && <Text className="text-white text-xs font-bold">✓</Text>}
                </Pressable>
                <Text className="text-xs text-zinc-600 flex-1 leading-tight">
                  I agree to the <Link href="/settings/terms" asChild><Text className="text-blue-600 font-medium">Terms and Conditions</Text></Link>
                </Text>
              </View>

              <Pressable
                onPress={signUpWithEmail}
                disabled={loading}
                className={`w-full bg-amber-500 rounded-md py-3 items-center justify-center mt-2 ${loading ? 'opacity-70' : ''}`}
              >
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold">Sign Up</Text>
                )}
              </Pressable>

              <View className="flex-row items-center my-2">
                <View className="flex-1 h-px bg-zinc-200" />
                <Text className="mx-4 text-zinc-400 text-sm font-medium">OR</Text>
                <View className="flex-1 h-px bg-zinc-200" />
              </View>

              <Pressable
                onPress={signUpWithGoogle}
                className="w-full bg-white border border-zinc-300 rounded-md py-3 items-center justify-center flex-row"
              >
                <GoogleIcon width={20} height={20} />
                <Text className="text-zinc-700 font-bold ml-2">Continue with Google</Text>
              </Pressable>

            </View>

            <View className="border-t border-zinc-100 p-6 items-center flex-row justify-center">
              <Text className="text-sm text-zinc-500">Already have an account? </Text>
              <Link href="/(auth)/login" asChild>
                <Pressable>
                  <Text className="text-sm font-semibold text-blue-600">Sign in</Text>
                </Pressable>
              </Link>
            </View>

          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
