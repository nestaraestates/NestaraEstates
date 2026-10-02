import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { GoogleIcon } from '@/components/google-icon';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Eye, EyeOff } from 'lucide-react-native';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    if (!acceptedTerms) return Alert.alert('Terms Required', 'Please accept the terms to sign up.');
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({ email, password });
    if (error) {
      Alert.alert('Signup Failed', error.message);
    } else if (data.session) {
      router.replace('/(auth)/onboarding');
    }
    setLoading(false);
  }

  
  async function signInWithGoogle() {
    if (!acceptedTerms) return Alert.alert('Terms Required', 'Please accept the terms to sign up.');
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      if (userInfo.data?.idToken) {
        const { data, error } = await supabase.auth.signInWithIdToken({ provider: 'google', token: userInfo.data.idToken });
        if (error) throw error;
        if (data.session) {
          const { data: profile } = await supabase.from('profiles').select('full_name, phone_number').eq('id', data.session.user.id).single();
          if (!profile?.full_name || !profile?.phone_number) router.replace('/(auth)/onboarding');
          else router.replace('/(tabs)');
        }
      }
    } catch (error: any) {
      if (error.code !== 'SIGN_IN_CANCELLED') Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar style="light" />
      <View className="absolute w-full h-full">
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070&auto=format&fit=crop' }} 
          className="w-full h-full opacity-60" 
          resizeMode="cover" 
        />
        <View className="absolute w-full h-full bg-black/60" />
      </View>

      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} className="flex-1">
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
            
            <View className="px-6 mb-8">
              <Text className="text-3xl font-black text-white mb-2">Create Account</Text>
              <Text className="text-base text-zinc-300 font-medium">Start your premium real estate journey today.</Text>
            </View>

            <Animated.View entering={FadeInUp.delay(200).springify()} className="bg-white/10 px-6 pt-8 pb-6 mx-4 rounded-[32px] border border-white/20 backdrop-blur-xl">
              <View className="space-y-4">
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Email Address"
                  placeholderTextColor="#a1a1aa"
                  autoCapitalize="none"
                  className="w-full bg-black/30 border border-white/10 rounded-2xl px-5 py-4 text-white text-base"
                />
                <View className="relative w-full justify-center">
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Create Password"
                    placeholderTextColor="#a1a1aa"
                    secureTextEntry={!showPassword}
                    className="w-full bg-black/30 border border-white/10 rounded-2xl pl-5 pr-14 py-4 text-white text-base"
                  />
                  <Pressable 
                    onPress={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 h-full justify-center"
                  >
                    {showPassword ? <EyeOff size={20} color="#a1a1aa" /> : <Eye size={20} color="#a1a1aa" />}
                  </Pressable>
                </View>

                <View className="flex-row items-center mt-2 mb-2 pr-4">
                  <Pressable 
                    onPress={() => setAcceptedTerms(!acceptedTerms)}
                    className={`w-5 h-5 rounded-md border items-center justify-center mr-3 ${acceptedTerms ? 'bg-amber-500 border-amber-500' : 'border-white/50 bg-black/20'}`}
                  >
                    {acceptedTerms && <Text className="text-white text-xs font-bold">✓</Text>}
                  </Pressable>
                  <Text className="text-xs text-zinc-300 flex-1 leading-tight">
                    I agree to the <Link href="/settings/terms" asChild><Text className="text-amber-500 font-bold">Terms</Text></Link> and <Link href="/settings/privacy" asChild><Text className="text-amber-500 font-bold">Privacy Policy</Text></Link>
                  </Text>
                </View>

                <Pressable
                  onPress={signUpWithEmail}
                  disabled={loading}
                  className={`w-full bg-amber-500 rounded-2xl py-4 items-center justify-center mt-2 shadow-lg shadow-amber-500/30 ${loading ? 'opacity-70' : ''}`}
                >
                  {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-black text-lg">Sign Up</Text>}
                </Pressable>

                <View className="flex-row items-center my-4">
                  <View className="flex-1 h-px bg-white/20" />
                  <Text className="mx-4 text-white/50 text-xs font-bold uppercase tracking-widest">or</Text>
                  <View className="flex-1 h-px bg-white/20" />
                </View>

                <Pressable
                  onPress={signInWithGoogle}
                  className="w-full bg-white rounded-2xl py-4 items-center justify-center flex-row shadow-sm"
                >
                  <GoogleIcon width={22} height={22} />
                  <Text className="text-zinc-900 font-bold text-base ml-3">Continue with Google</Text>
                </Pressable>

              </View>

              <View className="mt-8 items-center flex-row justify-center">
                <Text className="text-zinc-400">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text className="font-bold text-amber-500">Sign in</Text>
                  </Pressable>
                </Link>
              </View>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}