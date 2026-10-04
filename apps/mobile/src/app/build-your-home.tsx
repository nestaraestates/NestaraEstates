import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Building, MapPin, IndianRupee, FileText, CheckCircle } from 'lucide-react-native';

export default function BuildYourHomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [serviceCategory, setServiceCategory] = useState('DESIGNER');
  const [city, setCity] = useState('');
  const [budget, setBudget] = useState('');
  const [details, setDetails] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!city || !budget || !details) {
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
        budget_approx: parseFloat(budget),
        details: details,
        location_data: { city },
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
    <View className="flex-1 bg-zinc-50">
      <Stack.Screen options={{ title: 'Build Your Home' }} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 40 }}>
        <Text className="text-2xl font-bold text-zinc-900 mb-2">Start Your Project</Text>
        <Text className="text-zinc-500 mb-8">Tell us what you need and we'll match you with the best professionals.</Text>

        {error ? <Text className="text-red-500 bg-red-50 p-3 rounded-lg border border-red-100 mb-6 font-medium">{error}</Text> : null}

        <Text className="text-sm font-bold text-zinc-900 mb-2 ml-1">I am looking for an...</Text>
        <View className="flex-row flex-wrap mb-6 gap-2">
          {['DESIGNER', 'WORKER', 'TRANSPORTER'].map(cat => (
            <Pressable 
              key={cat}
              onPress={() => setServiceCategory(cat)}
              className={`flex-1 py-3 px-2 rounded-xl border ${serviceCategory === cat ? 'bg-brand-50 border-brand-500' : 'bg-white border-zinc-200'}`}
            >
              <Text className={`text-center font-bold text-xs ${serviceCategory === cat ? 'text-brand-700' : 'text-zinc-600'}`}>
                {cat === 'DESIGNER' ? 'Interior Designer' : cat === 'WORKER' ? 'Contractor / Mason' : 'Transporter'}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-bold text-zinc-900 mb-2 ml-1">Project City</Text>
        <View className="bg-white border border-zinc-200 rounded-xl mb-6 flex-row items-center px-3">
          <MapPin size={20} color="#A1A1AA" />
          <TextInput
            value={city}
            onChangeText={setCity}
            placeholder="e.g. Bengaluru, Mumbai"
            className="flex-1 p-3 text-zinc-900"
          />
        </View>

        <Text className="text-sm font-bold text-zinc-900 mb-2 ml-1">Approximate Budget (₹)</Text>
        <View className="bg-white border border-zinc-200 rounded-xl mb-6 flex-row items-center px-3">
          <IndianRupee size={20} color="#A1A1AA" />
          <TextInput
            value={budget}
            onChangeText={setBudget}
            keyboardType="numeric"
            placeholder="e.g. 500000"
            className="flex-1 p-3 text-zinc-900"
          />
        </View>

        <Text className="text-sm font-bold text-zinc-900 mb-2 ml-1">Project Details</Text>
        <View className="bg-white border border-zinc-200 rounded-xl mb-8 flex-row px-3 pt-3">
          <FileText size={20} color="#A1A1AA" className="mr-2" />
          <TextInput
            value={details}
            onChangeText={setDetails}
            multiline
            numberOfLines={5}
            placeholder="Describe your requirements, timeline, and any specific preferences..."
            className="flex-1 text-zinc-900 pb-3"
            style={{ textAlignVertical: 'top', minHeight: 120 }}
          />
        </View>

        <Pressable 
          disabled={isSubmitting}
          onPress={handleSubmit}
          className={`py-4 rounded-xl items-center justify-center shadow-sm ${isSubmitting ? 'bg-brand-400' : 'bg-brand-600'}`}
        >
          {isSubmitting ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Broadcast Request</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}
