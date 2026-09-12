import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Building } from 'lucide-react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signInWithEmail() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Login Failed', error.message);
    } else {
      router.replace('/(tabs)');
    }
    setLoading(false);
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 justify-center">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center p-4">
            <View className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden">
              
              <View className="p-6 pb-2 items-center space-y-2">
                <View className="h-12 w-12 bg-amber-500 rounded-xl items-center justify-center shadow-sm mb-2">
                  {/* @ts-ignore */}
                  <Building size={28} color="white" />
                </View>
                <Text className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">Welcome back</Text>
                <Text className="text-zinc-500 dark:text-zinc-400">Sign in to your Nestara account</Text>
              </View>

              <View className="p-6 space-y-4">
                
                <View className="space-y-1">
                  <Text className="text-sm font-medium text-zinc-900 dark:text-white">Email</Text>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="you@example.com"
                    placeholderTextColor="#A1A1AA"
                    autoCapitalize="none"
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-white"
                  />
                </View>

                <View className="space-y-1">
                  <View className="flex-row justify-between items-center">
                    <Text className="text-sm font-medium text-zinc-900 dark:text-white">Password</Text>
                    <Link href="/(auth)/signup" asChild>
                      <Pressable>
                        <Text className="text-xs font-medium text-amber-600">Forgot password?</Text>
                      </Pressable>
                    </Link>
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#A1A1AA"
                    secureTextEntry
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-white"
                  />
                </View>

                <Pressable
                  onPress={signInWithEmail}
                  disabled={loading}
                  className={`w-full bg-zinc-900 dark:bg-white rounded-md py-3 items-center justify-center mt-2 ${loading ? 'opacity-70' : ''}`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white dark:text-zinc-900 font-medium">Sign In</Text>
                  )}
                </Pressable>

              </View>

              <View className="border-t border-zinc-100 dark:border-zinc-800 p-6 items-center flex-row justify-center">
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">Don't have an account? </Text>
                <Link href="/(auth)/signup" asChild>
                  <Pressable>
                    <Text className="text-sm font-semibold text-amber-600">Sign up</Text>
                  </Pressable>
                </Link>
              </View>

            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
