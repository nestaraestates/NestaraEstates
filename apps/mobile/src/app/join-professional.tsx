import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Hammer, Truck, Paintbrush, ChevronLeft, CheckCircle2 } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

const CATEGORIES = [
  { id: 'DESIGNER', title: 'Interior Designer', icon: Paintbrush, desc: '3D renders, floor plans, and space styling.', color: '#9333ea', bg: 'bg-purple-100', border: 'border-purple-500' },
  { id: 'WORKER', title: 'Construction Worker', icon: Hammer, desc: 'Masons, Carpenters, Plumbers, and Electricians.', color: '#d97706', bg: 'bg-amber-100', border: 'border-amber-500' },
  { id: 'TRANSPORTER', title: 'Transporter', icon: Truck, desc: 'House shifting and material transport.', color: '#2563eb', bg: 'bg-blue-100', border: 'border-blue-500' }
];

const SUB_CATEGORIES: any = {
  WORKER: ['Mason', 'Carpenter', 'Plumber', 'Electrician', 'Painter', 'General Labour'],
  DESIGNER: ['Residential', 'Commercial', 'Renovation'],
  TRANSPORTER: ['House Shifting', 'Material Transport', 'Furniture']
};

const PRICING_MODELS = [
  { id: 'NEGOTIABLE', label: 'Negotiable' },
  { id: 'PER_HOUR', label: 'Per Hour' },
  { id: 'PER_SQFT', label: 'Per Sq. Ft.' },
  { id: 'PER_KM', label: 'Per KM' },
  { id: 'FIXED', label: 'Fixed Price' }
];

export default function JoinProfessionalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [serviceRadius, setServiceRadius] = useState('50');
  const [pricingModel, setPricingModel] = useState('NEGOTIABLE');
  const [basePrice, setBasePrice] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleJoin() {
    if (!companyName || !selectedCat || !subCategory || !yearsExperience || !basePrice) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('You must be logged in to register as a professional.');
      
      const { error } = await supabase.from('professional_profiles').insert({
        id: user.id,
        company_name: companyName,
        category: selectedCat,
        sub_category: subCategory,
        years_experience: parseInt(yearsExperience) || 0,
        service_radius_km: parseInt(serviceRadius) || 50,
        pricing_model: pricingModel,
        base_price_amount: parseFloat(basePrice) || 0,
        created_at: new Date().toISOString(),
      });
      
      if (error) throw error;
      
      // Success, go to dashboard
      router.replace('/dashboard/professional');
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to join as professional');
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeCategory = CATEGORIES.find(c => c.id === selectedCat);

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ paddingTop: insets.top }}>
      <Stack.Screen options={{ title: 'Join Professionals', headerTitleStyle: { fontWeight: 'bold' } }} />
      
      {!selectedCat ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 20 }}>
          <View className="items-center mb-8 mt-4">
            <Text className="text-3xl font-black text-zinc-900 text-center mb-2">Grow your business</Text>
            <Text className="text-zinc-500 text-center px-4">
              Join our network of professionals connecting with property buyers and owners.
            </Text>
          </View>
          
          <Text className="text-xl font-bold text-zinc-900 text-center mb-6">What is your profession?</Text>
          
          <View className="gap-4 mb-10">
            {CATEGORIES.map((cat) => (
              <Pressable
                key={cat.id}
                onPress={() => {
                  setSelectedCat(cat.id);
                  setSubCategory('');
                }}
                className={`bg-white p-6 rounded-2xl shadow-sm border-2 border-transparent active:border-brand-500 flex-row items-center`}
              >
                <View className={`w-14 h-14 ${cat.bg} rounded-xl items-center justify-center mr-4`}>
                  <cat.icon size={28} color={cat.color} />
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-bold text-zinc-900 mb-1">{cat.title}</Text>
                  <Text className="text-sm text-zinc-500">{cat.desc}</Text>
                </View>
              </Pressable>
            ))}
          </View>
          
          <View className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
            <Text className="text-lg font-bold text-zinc-900 mb-4 text-center">Why join Nestara?</Text>
            <View className="flex-row items-start mb-4">
              <CheckCircle2 size={24} color="#10b981" className="mr-3 mt-0.5" />
              <View className="flex-1">
                <Text className="font-bold text-zinc-900">Premium Leads</Text>
                <Text className="text-sm text-zinc-500 mt-1">Direct access to qualified high-budget projects.</Text>
              </View>
            </View>
            <View className="flex-row items-start">
              <CheckCircle2 size={24} color="#10b981" className="mr-3 mt-0.5" />
              <View className="flex-1">
                <Text className="font-bold text-zinc-900">Verified Customers</Text>
                <Text className="text-sm text-zinc-500 mt-1">Connect with motivated buyers actively using our platform.</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      ) : (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
            
            <View className="flex-row items-center mb-6">
              <Pressable 
                onPress={() => setSelectedCat(null)}
                className="w-10 h-10 bg-zinc-200 rounded-full items-center justify-center mr-3"
              >
                <ChevronLeft size={24} color="#52525B" />
              </Pressable>
              <View className={`w-10 h-10 ${activeCategory?.bg} rounded-lg items-center justify-center mr-3`}>
                {activeCategory && <activeCategory.icon size={20} color={activeCategory.color} />}
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-zinc-900">Become a {activeCategory?.title}</Text>
                <Text className="text-xs text-zinc-500">Fill out your profile details</Text>
              </View>
            </View>

            <View className="bg-white p-5 rounded-2xl shadow-sm border border-zinc-200 space-y-4">
              
              <View className="mb-4">
                <Text className="text-sm font-bold text-zinc-900 mb-2">Company / Individual Name</Text>
                <TextInput
                  placeholder="e.g. Modern Spaces Design"
                  value={companyName}
                  onChangeText={setCompanyName}
                  className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-zinc-900"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-bold text-zinc-900 mb-2">Specialization</Text>
                <View className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={subCategory}
                    onValueChange={(itemValue) => setSubCategory(itemValue)}
                    style={{ height: 50, width: '100%' }}
                  >
                    <Picker.Item label="Select specialization..." value="" color="#a1a1aa" />
                    {SUB_CATEGORIES[selectedCat]?.map((sub: string) => (
                      <Picker.Item key={sub} label={sub} value={sub} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View className="flex-row gap-4 mb-4">
                <View className="flex-1">
                  <Text className="text-sm font-bold text-zinc-900 mb-2">Years of Exp.</Text>
                  <TextInput
                    placeholder="e.g. 5"
                    value={yearsExperience}
                    onChangeText={setYearsExperience}
                    keyboardType="numeric"
                    className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-zinc-900"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-bold text-zinc-900 mb-2">Radius (KM)</Text>
                  <TextInput
                    value={serviceRadius}
                    onChangeText={setServiceRadius}
                    keyboardType="numeric"
                    className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-zinc-900"
                  />
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-bold text-zinc-900 mb-2">Pricing Model</Text>
                <View className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
                  <Picker
                    selectedValue={pricingModel}
                    onValueChange={(itemValue) => setPricingModel(itemValue)}
                    style={{ height: 50, width: '100%' }}
                  >
                    {PRICING_MODELS.map((model) => (
                      <Picker.Item key={model.id} label={model.label} value={model.id} />
                    ))}
                  </Picker>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-bold text-zinc-900 mb-2">Starting / Base Price (₹)</Text>
                <TextInput
                  placeholder="e.g. 500"
                  value={basePrice}
                  onChangeText={setBasePrice}
                  keyboardType="numeric"
                  className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-zinc-900"
                />
              </View>

              <Pressable
                onPress={handleJoin}
                disabled={isSubmitting}
                className={`py-4 rounded-xl items-center justify-center ${isSubmitting ? 'bg-brand-400' : 'bg-brand-600'}`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Create Professional Profile</Text>
                )}
              </Pressable>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}
