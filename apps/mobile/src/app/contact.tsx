import React from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Phone, MapPin, Send } from 'lucide-react-native';
import { Stack } from 'expo-router';

export default function ContactPage() {
 return (
 <SafeAreaView className="flex-1 bg-zinc-50" edges={['bottom']}>
 <Stack.Screen options={{ title: 'Contact Us', headerBackTitle: 'Back' }} />
 <ScrollView className="flex-1 px-4 py-6">
 <View className="mb-8 mt-2">
 <Text className="text-3xl font-black text-zinc-900 text-center">
 Get in Touch
 </Text>
 <Text className="text-base text-zinc-600 text-center mt-3">
 Have a question about a property, verification, or our services? Our team is here to help.
 </Text>
 </View>

 <View className="bg-amber-50 p-6 rounded-3xl border border-amber-200 mb-8">
 <Text className="text-lg font-bold text-amber-900 mb-5">Contact Information</Text>
 
 <View>
 <View className="flex-row items-center mb-5">
 <View className="bg-white p-3 rounded-full shadow-sm mr-4">
 <Phone color="#D97706" size={20} />
 </View>
 <View>
 <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Phone / WhatsApp</Text>
 <Text className="text-zinc-900 font-medium mt-1">-</Text>
 </View>
 </View>

 <View className="flex-row items-center mb-5">
 <View className="bg-white p-3 rounded-full shadow-sm mr-4">
 <Mail color="#D97706" size={20} />
 </View>
 <View>
 <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Email</Text>
 <Text className="text-zinc-900 font-medium mt-1">-</Text>
 </View>
 </View>

 <View className="flex-row items-center">
 <View className="bg-white p-3 rounded-full shadow-sm mr-4">
 <MapPin color="#D97706" size={20} />
 </View>
 <View className="flex-1">
 <Text className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Head Office</Text>
 <Text className="text-zinc-900 font-medium mt-1">-</Text>
 </View>
 </View>
 </View>
 </View>

 <View className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm mb-12">
 <Text className="text-xl font-bold mb-6 text-zinc-900">Send us a Message</Text>
 
 <View>
 <View className="mb-4">
 <Text className="text-sm font-bold text-zinc-700 mb-2">Full Name</Text>
 <TextInput 
 placeholder="John Doe" 
 placeholderTextColor="#A1A1AA"
 className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
 />
 </View>
 
 <View className="mb-4">
 <Text className="text-sm font-bold text-zinc-700 mb-2">Phone Number</Text>
 <TextInput 
 placeholder="+91 90000 00000" 
 placeholderTextColor="#A1A1AA"
 className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
 />
 </View>

 <View className="mb-4">
 <Text className="text-sm font-bold text-zinc-700 mb-2">Email Address</Text>
 <TextInput 
 placeholder="john@example.com" 
 placeholderTextColor="#A1A1AA"
 keyboardType="email-address"
 className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
 />
 </View>

 <View className="mb-4">
 <Text className="text-sm font-bold text-zinc-700 mb-2">Subject</Text>
 <TextInput 
 placeholder="How can we help you?" 
 placeholderTextColor="#A1A1AA"
 className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900"
 />
 </View>

 <View className="mb-6">
 <Text className="text-sm font-bold text-zinc-700 mb-2">Message</Text>
 <TextInput 
 placeholder="Type your message here..." 
 placeholderTextColor="#A1A1AA"
 multiline
 numberOfLines={4}
 className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-zinc-900 min-h-[120px]"
 style={{ textAlignVertical: 'top' }}
 />
 </View>

 <Pressable className="bg-amber-500 active:bg-amber-500 rounded-xl flex-row items-center justify-center py-4">
 <Send color="#FFFFFF" size={18} className="mr-2" />
 <Text className="text-white font-bold text-base ml-2">Send Message</Text>
 </Pressable>
 </View>
 </View>
 </ScrollView>
 </SafeAreaView>
 );
}
