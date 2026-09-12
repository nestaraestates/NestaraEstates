import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function signUpWithEmail() {
    setLoading(true);
    const { error, data } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Signup Failed', error.message);
    } else {
      if (data.session) {
        router.replace('/(tabs)');
      } else {
        Alert.alert('Success', 'Please check your inbox for email verification!');
      }
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
            <View className="w-full max-w-md mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl overflow-hidden p-8">
              
              <View className="items-center mb-8 space-y-2">
                <Text className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">Join Nestara</Text>
                <Text className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                  Create an account to save properties and contact owners.
                </Text>
              </View>

              <View className="space-y-4">
                
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
                  <Text className="text-sm font-medium text-zinc-900 dark:text-white">Password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#A1A1AA"
                    secureTextEntry
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-2 text-zinc-900 dark:text-white"
                  />
                  <Text className="text-xs text-zinc-500 mt-1">Must be at least 6 characters</Text>
                </View>

                <Pressable
                  onPress={signUpWithEmail}
                  disabled={loading}
                  className={`w-full bg-zinc-900 dark:bg-white rounded-md py-3 items-center justify-center mt-4 ${loading ? 'opacity-70' : ''}`}
                >
                  {loading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <Text className="text-white dark:text-zinc-900 font-medium">Create Account</Text>
                  )}
                </Pressable>

                <Text className="text-center text-xs text-zinc-500 mt-4">
                  By signing up, you agree to our Terms and Conditions.
                </Text>

              </View>

              <View className="mt-8 items-center flex-row justify-center">
                <Text className="text-sm text-zinc-500 dark:text-zinc-400">Already have an account? </Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text className="text-sm font-semibold text-amber-600">Sign in</Text>
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
