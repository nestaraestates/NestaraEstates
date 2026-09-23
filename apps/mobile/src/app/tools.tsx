import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { FinancialTools, AreaConverter, RentVsBuyCalculator } from '@/components/FinancialTools';

export default function ToolsScreen() {
 const router = useRouter();
 const [activeTab, setActiveTab] = useState<'EMI' | 'ROI' | 'AREA' | 'RENT_BUY'>('EMI');
 const [propertyPrice, setPropertyPrice] = useState('5000000');
 const [rentPrice, setRentPrice] = useState('25000');

 return (
 <SafeAreaView className="flex-1 bg-slate-50">
 <View className="flex-row items-center p-4 border-b border-slate-200 bg-white">
 <Pressable onPress={() => router.push('/' as any)} className="p-2 mr-2">
 {/* @ts-ignore */}
 <ArrowLeft size={24} color="#52525b" />
 </Pressable>
 <Text className="text-xl font-bold text-slate-900">Calculators & Tools</Text>
 </View>

 <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
 <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6">
 <View className="bg-white rounded-xl border border-slate-200 flex-row p-1 min-w-full">
 <Pressable 
 onPress={() => setActiveTab('EMI')}
 className={`px-4 py-2.5 items-center rounded-lg ${activeTab === 'EMI' ? 'bg-indigo-100' : ''}`}
 >
 <Text className={`font-semibold ${activeTab === 'EMI' ? 'text-indigo-800' : 'text-slate-600'}`}>
 EMI
 </Text>
 </Pressable>
 <Pressable 
 onPress={() => setActiveTab('ROI')}
 className={`px-4 py-2.5 items-center rounded-lg ${activeTab === 'ROI' ? 'bg-emerald-100' : ''}`}
 >
 <Text className={`font-semibold ${activeTab === 'ROI' ? 'text-emerald-800' : 'text-slate-600'}`}>
 ROI
 </Text>
 </Pressable>
 <Pressable 
 onPress={() => setActiveTab('AREA')}
 className={`px-4 py-2.5 items-center rounded-lg ${activeTab === 'AREA' ? 'bg-orange-100' : ''}`}
 >
 <Text className={`font-semibold ${activeTab === 'AREA' ? 'text-orange-800' : 'text-slate-600'}`}>
 Area Converter
 </Text>
 </Pressable>
 <Pressable 
 onPress={() => setActiveTab('RENT_BUY')}
 className={`px-4 py-2.5 items-center rounded-lg ${activeTab === 'RENT_BUY' ? 'bg-blue-100' : ''}`}
 >
 <Text className={`font-semibold ${activeTab === 'RENT_BUY' ? 'text-blue-800' : 'text-slate-600'}`}>
 Rent vs Buy
 </Text>
 </Pressable>
 </View>
 </ScrollView>

 {activeTab === 'EMI' && (
 <View>
 <Text className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Property Price (₹)</Text>
 <TextInput
 className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold text-slate-900 mb-4"
 keyboardType="numeric"
 value={propertyPrice}
 onChangeText={setPropertyPrice}
 placeholder="Enter property price"
 />
 <FinancialTools propertyPrice={parseFloat(propertyPrice) || 0} purpose="SELL" />
 </View>
 )}
 
 {activeTab === 'ROI' && (
 <View>
 <Text className="text-sm font-bold text-slate-500 mb-2 uppercase tracking-wider">Monthly Rent (₹)</Text>
 <TextInput
 className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-lg font-semibold text-slate-900 mb-4"
 keyboardType="numeric"
 value={rentPrice}
 onChangeText={setRentPrice}
 placeholder="Enter monthly rent"
 />
 <FinancialTools propertyPrice={parseFloat(rentPrice) || 0} purpose="RENT" />
 </View>
 )}

 {activeTab === 'AREA' && (
 <View>
 <AreaConverter />
 </View>
 )}

 {activeTab === 'RENT_BUY' && (
 <View>
 <RentVsBuyCalculator />
 </View>
 )}
 <View className="h-10" />
 </ScrollView>
 </SafeAreaView>
 );
}
