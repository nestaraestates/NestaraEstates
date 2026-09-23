import React from 'react';
import { View, Text, ScrollView, Pressable, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { ChevronLeft, Mail, Phone, MapPin, MessageCircle } from 'lucide-react-native';

export default function HelpScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <View className="flex-row items-center p-4 border-b border-zinc-200 bg-white">
        <Pressable onPress={() => { if(router.canGoBack()) router.back(); else router.push('/settings' as any); }} hitSlop={{top: 20, bottom: 20, left: 20, right: 20}} className="mr-3 p-1">
          <ChevronLeft size={24} color="#18181b" />
        </Pressable>
        <Text className="text-xl font-bold text-zinc-900">Help & Support</Text>
      </View>
      <ScrollView className="flex-1 px-4 py-6">
        <Text className="text-2xl font-black text-zinc-900 mb-2">We're here to help</Text>
        <Text className="text-base text-zinc-500 mb-8">Get in touch with our team for any queries regarding properties or your account.</Text>
        
        <View className="space-y-3 mb-8">
          
          {/* Primary Number Card */}
          <View className="flex-row items-center bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm justify-between">
            <View>
              <Text className="text-base font-bold text-zinc-900">Support Line 1</Text>
              <Text className="text-sm text-zinc-500 font-medium">+91 99011 17057</Text>
            </View>
            <View className="flex-row space-x-3">
              <Pressable 
                onPress={() => Linking.openURL('tel:+919901117057')}
                className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center active:bg-amber-200"
              >
                <Phone size={20} color="#d97706" />
              </Pressable>
              <Pressable 
                onPress={() => Linking.openURL('whatsapp://send?phone=919901117057')}
                className="w-12 h-12 bg-green-100 rounded-full items-center justify-center active:bg-green-200"
              >
                <MessageCircle size={20} color="#16a34a" />
              </Pressable>
            </View>
          </View>

          {/* Secondary Number Card */}
          <View className="flex-row items-center bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm justify-between">
            <View>
              <Text className="text-base font-bold text-zinc-900">Support Line 2</Text>
              <Text className="text-sm text-zinc-500 font-medium">+91 79967 74541</Text>
            </View>
            <View className="flex-row space-x-3">
              <Pressable 
                onPress={() => Linking.openURL('tel:+917996774541')}
                className="w-12 h-12 bg-amber-100 rounded-full items-center justify-center active:bg-amber-200"
              >
                <Phone size={20} color="#d97706" />
              </Pressable>
              <Pressable 
                onPress={() => Linking.openURL('whatsapp://send?phone=917996774541')}
                className="w-12 h-12 bg-green-100 rounded-full items-center justify-center active:bg-green-200"
              >
                <MessageCircle size={20} color="#16a34a" />
              </Pressable>
            </View>
          </View>

          <Pressable 
            onPress={() => Linking.openURL('mailto:nestaraestates@gmail.com')}
            className="flex-row items-center bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm"
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Mail size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-zinc-900">General Support Email</Text>
              <Text className="text-sm text-zinc-500">nestaraestates@gmail.com</Text>
            </View>
          </Pressable>

          <Pressable 
            onPress={() => Linking.openURL('mailto:vineethbpawar@gmail.com')}
            className="flex-row items-center bg-white border border-zinc-200 p-4 rounded-2xl shadow-sm"
          >
            <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-4">
              <Mail size={24} color="#2563eb" />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-zinc-900">Admin Email</Text>
              <Text className="text-sm text-zinc-500">vineethbpawar@gmail.com</Text>
            </View>
          </Pressable>
        </View>

        <Text className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-4 ml-1">Connect With Us</Text>
        <View className="flex-row justify-between space-x-4 mb-10">
          <Pressable 
            onPress={() => Linking.openURL('https://www.instagram.com/nestara.estates?stkn=MW5uaXY5d3FibXhpNA==')}
            className="flex-1 items-center justify-center bg-white border border-zinc-200 py-5 rounded-2xl shadow-sm"
          >
            <FontAwesome5 name="instagram" size={28} color="#e11d48" />
            <Text className="text-xs font-bold text-zinc-700 mt-2">Instagram</Text>
          </Pressable>

          <Pressable 
            onPress={() => Linking.openURL('https://www.linkedin.com/in/nestaraestates')}
            className="flex-1 items-center justify-center bg-white border border-zinc-200 py-5 rounded-2xl shadow-sm "
          >
            <FontAwesome5 name="linkedin" size={28} color="#0077b5" />
            <Text className="text-xs font-bold text-zinc-700 mt-2">LinkedIn</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
