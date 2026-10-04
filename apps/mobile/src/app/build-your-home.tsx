import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets, SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { HardHat, Ruler, Calendar, IndianRupee, MapPin, FileText, CheckCircle, Home } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';

const SERVICE_CATEGORIES = [
  'Full Home Construction',
  'Interior Design',
  'Renovation',
  'Plumbing',
  'Electrical',
  'Painting',
  'Carpentry',
  'Other'
];

const FLOOR_OPTIONS = [
  { id: '1', label: '1 (Ground Only)' },
  { id: '2', label: '2 (G + 1)' },
  { id: '3', label: '3 (G + 2)' },
  { id: '4+', label: '4+ Floors' }
];

const BUDGET_OPTIONS = [
  { id: '50000', label: 'Under ₹50k' },
  { id: '100000', label: '₹50k - ₹1 Lakh' },
  { id: '500000', label: '₹1 Lakh - ₹5 Lakhs' },
  { id: '1500000', label: '₹5 Lakhs - ₹15 Lakhs' },
  { id: '2500000', label: '₹15 Lakhs - ₹35 Lakhs' },
  { id: '5000000', label: '₹35 Lakhs - ₹50 Lakhs' },
  { id: '10000000', label: '₹50 Lakhs - ₹1 Crore' },
  { id: '50000000', label: '₹1 Crore - ₹5 Crores' }
];

const START_DATE_OPTIONS = [
  'Immediately',
  'Within 1 Month',
  '1-3 Months',
  'Just exploring (No timeline)'
];

export default function BuildYourHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [serviceCategory, setServiceCategory] = useState('');
  const [city, setCity] = useState('');
  const [plotSize, setPlotSize] = useState('');
  const [floors, setFloors] = useState('');
  const [budgetApprox, setBudgetApprox] = useState('');
  const [startDate, setStartDate] = useState('');
  const [details, setDetails] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!serviceCategory || !city || !plotSize || !floors || !budgetApprox || !startDate || !details) {
      setError('Please fill out all fields.');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("You must be logged in to submit a request.");
      }
      
      const { error: dbError } = await supabase.from('service_requests').insert({
        customer_id: user.id,
        service_category: serviceCategory,
        budget_approx: parseFloat(budgetApprox),
        details: details,
        location_data: { city, plot_size: plotSize, floors, start_date: startDate },
        status: 'OPEN'
      });
      
      if (dbError) throw dbError;
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit request.');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <View className="flex-1 bg-white items-center justify-center p-6">
        <Stack.Screen options={{ title: 'Request Sent', headerLeft: () => null }} />
        <CheckCircle size={64} color="#059669" className="mb-6" />
        <Text className="text-2xl font-bold text-zinc-900 mb-2">Request Submitted!</Text>
        <Text className="text-center text-zinc-500 mb-8">
          Your project has been broadcasted to verified professionals in {city}. You will start receiving quotes soon!
        </Text>
        <Pressable 
          onPress={() => router.replace('/')}
          className="bg-brand-600 px-8 py-4 rounded-xl shadow-sm"
        >
          <Text className="text-white font-bold text-base">Back to Home</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-zinc-50" style={{ paddingTop: insets.top }}> 
      <Stack.Screen options={{ title: 'Build Your Home' }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
          
          <View className="items-center mb-8 mt-4">
            <View className="w-16 h-16 rounded-full bg-brand-100 items-center justify-center mb-4">
              <Home size={32} color="#0284c7" />
            </View>
            <Text className="text-3xl font-black text-zinc-900 text-center mb-2">Build Your Dream Home</Text>
            <Text className="text-zinc-500 text-center px-4">
              Tell us about your plot and vision. We will instantly connect you with verified Architects, Contractors, and Construction Workers in your city.
            </Text>
          </View>

          <View className="bg-brand-600 px-6 py-5 rounded-t-2xl">
            <View className="flex-row items-center mb-1">
              <HardHat size={24} color="white" className="mr-2" />
              <Text className="text-lg font-bold text-white">Project Requirements</Text>
            </View>
            <Text className="text-brand-100 text-sm">Fill out the details below to generate quotes.</Text>
          </View>

          <View className="bg-white p-6 rounded-b-2xl shadow-sm border border-zinc-200 border-t-0 space-y-5">
            {error ? <Text className="text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 font-medium mb-2">{error}</Text> : null}

            <View>
              <View className="flex-row items-center mb-2">
                <HardHat size={16} color="#0284c7" className="mr-2" />
                <Text className="text-sm font-bold text-zinc-900">What do you need help with?</Text>
              </View>
              <View className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden mb-2">
                <Picker
                  selectedValue={serviceCategory}
                  onValueChange={(itemValue) => setServiceCategory(itemValue)}
                  style={{ height: 50, width: '100%' }}
                >
                  <Picker.Item label="Select a service type..." value="" color="#a1a1aa" />
                  {SERVICE_CATEGORIES.map(cat => (
                    <Picker.Item key={cat} label={cat} value={cat} />
                  ))}
                </Picker>
              </View>
            </View>

            <View className="flex-row gap-4">
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <MapPin size={16} color="#0284c7" className="mr-2" />
                  <Text className="text-sm font-bold text-zinc-900">City</Text>
                </View>
                <TextInput
                  value={city}
                  onChangeText={setCity}
                  placeholder="e.g. Bengaluru"
                  className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-zinc-900"
                />
              </View>
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <Ruler size={16} color="#0284c7" className="mr-2" />
                  <Text className="text-sm font-bold text-zinc-900">Plot Size (sq.ft)</Text>
                </View>
                <TextInput
                  value={plotSize}
                  onChangeText={setPlotSize}
                  keyboardType="numeric"
                  placeholder="e.g. 2400"
                  className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-xl text-zinc-900"
                />
              </View>
            </View>

            <View>
              <View className="flex-row items-center mb-2">
                <Home size={16} color="#0284c7" className="mr-2" />
                <Text className="text-sm font-bold text-zinc-900">Number of Floors</Text>
              </View>
              <View className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden mb-2">
                <Picker
                  selectedValue={floors}
                  onValueChange={(itemValue) => setFloors(itemValue)}
                  style={{ height: 50, width: '100%' }}
                >
                  <Picker.Item label="Select floors..." value="" color="#a1a1aa" />
                  {FLOOR_OPTIONS.map(f => (
                    <Picker.Item key={f.id} label={f.label} value={f.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View>
              <View className="flex-row items-center mb-2">
                <IndianRupee size={16} color="#0284c7" className="mr-2" />
                <Text className="text-sm font-bold text-zinc-900">Approximate Budget</Text>
              </View>
              <View className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden mb-2">
                <Picker
                  selectedValue={budgetApprox}
                  onValueChange={(itemValue) => setBudgetApprox(itemValue)}
                  style={{ height: 50, width: '100%' }}
                >
                  <Picker.Item label="Select an approximate budget..." value="" color="#a1a1aa" />
                  {BUDGET_OPTIONS.map(b => (
                    <Picker.Item key={b.id} label={b.label} value={b.id} />
                  ))}
                </Picker>
              </View>
            </View>

            <View>
              <View className="flex-row items-center mb-2">
                <Calendar size={16} color="#0284c7" className="mr-2" />
                <Text className="text-sm font-bold text-zinc-900">Expected Start Date</Text>
              </View>
              <View className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden mb-2">
                <Picker
                  selectedValue={startDate}
                  onValueChange={(itemValue) => setStartDate(itemValue)}
                  style={{ height: 50, width: '100%' }}
                >
                  <Picker.Item label="Select a timeline..." value="" color="#a1a1aa" />
                  {START_DATE_OPTIONS.map(date => (
                    <Picker.Item key={date} label={date} value={date} />
                  ))}
                </Picker>
              </View>
            </View>

            <View>
              <View className="flex-row items-center mb-2">
                <FileText size={16} color="#0284c7" className="mr-2" />
                <Text className="text-sm font-bold text-zinc-900">Specific Requirements & Details</Text>
              </View>
              <TextInput
                value={details}
                onChangeText={setDetails}
                multiline
                numberOfLines={4}
                placeholder="Describe your vision, preferred materials, or any special requirements like Vaastu compliance..."
                className="bg-zinc-50 border border-zinc-200 p-4 rounded-xl text-zinc-900"
                style={{ textAlignVertical: 'top', minHeight: 100 }}
              />
            </View>

            <View className="pt-4 mt-2 border-t border-zinc-100">
              <Pressable 
                disabled={isSubmitting}
                onPress={handleSubmit}
                className={`py-4 rounded-xl items-center justify-center shadow-sm ${isSubmitting ? 'bg-brand-400' : 'bg-brand-600'}`}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-bold text-lg">Generate Professional Quotes</Text>
                )}
              </Pressable>
              <Text className="text-center text-xs text-zinc-400 mt-4">
                By submitting, you agree to let verified professionals contact you with quotations.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
