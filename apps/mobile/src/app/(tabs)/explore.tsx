import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Image, Platform, TextInput, Pressable, ActivityIndicator, FlatList, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useCompareStore } from '@/store/compare';
import { Scale } from 'lucide-react-native';
import { parseIndianCurrencyString } from '@/utils/format';

export default function ExploreScreen() {
  const compareIds = useCompareStore((state) => state.compareIds);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'BUY' | 'RENT' | 'COMMERCIAL'>('BUY');
  const [searchQuery, setSearchQuery] = useState('');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({ minPrice: '', maxPrice: '', bhk: '' });
  const [appliedFilters, setAppliedFilters] = useState({ minPrice: '', maxPrice: '', bhk: '' });

  useEffect(() => {
    async function loadSaved() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: savedData } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', session.user.id);
        
        if (savedData) {
          setSavedPropertyIds(savedData.map(s => s.property_id));
        }
      }
    }
    loadSaved();
  }, []);

  const loadProperties = async (isRefresh = false, pageNum = 0) => {
    if (isRefresh) setRefreshing(true);
    else if (pageNum > 0) setLoadingMore(true);
    else setLoading(true);
    
    let query = supabase
      .from('properties')
      .select('*, property_media(url, media_type)')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false })
      .range(pageNum * 10, (pageNum + 1) * 10 - 1);

    if (activeTab === 'COMMERCIAL') {
      query = query.eq('type', 'COMMERCIAL');
    } else {
      query = query.eq('purpose', activeTab);
    }

    if (appliedFilters.minPrice) query = query.gte('price', parseInt(appliedFilters.minPrice));
    if (appliedFilters.maxPrice) query = query.lte('price', parseInt(appliedFilters.maxPrice));
    if (appliedFilters.bhk) query = query.eq('bhk', parseInt(appliedFilters.bhk));

    if (searchQuery.trim() !== '') {
      const term = `%${searchQuery.trim()}%`;
      query = query.or(`title.ilike.${term},location.ilike.${term},city.ilike.${term}`);
    }

    const { data: props, error } = await query;

    if (props) {
      if (isRefresh || pageNum === 0) setProperties(props);
      else setProperties(prev => [...prev, ...props]);
      setHasMore(props.length === 10);
    }
    
    setLoading(false);
    setRefreshing(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadProperties(false, 0);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, appliedFilters, searchQuery]);

  const onRefresh = () => {
    setPage(0);
    loadProperties(true, 0);
  };

  const loadMore = () => {
    if (!hasMore || loadingMore) return;
    const nextPage = page + 1;
    setPage(nextPage);
    loadProperties(false, nextPage);
  };

  const applyFilters = () => {
    setAppliedFilters({
      ...tempFilters,
      minPrice: parseIndianCurrencyString(tempFilters.minPrice),
      maxPrice: parseIndianCurrencyString(tempFilters.maxPrice)
    });
    setShowFilters(false);
  };

  const clearFilters = () => {
    const emptyFilters = { minPrice: '', maxPrice: '', bhk: '' };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setShowFilters(false);
  };

  const renderHeader = () => (
    <View className="px-4 pt-6 pb-4 bg-white border-b border-zinc-200">
      <View className="flex-row items-center mb-4">
        <Image source={require('@/assets/images/logo-sm.png')} className="w-8 h-8 mr-3 rounded-lg" resizeMode="contain" />
        <Text className="text-2xl font-bold text-zinc-900">Explore</Text>
      </View>
      
      {/* Search & Filter */}
      <View className="flex-row items-center mb-6">
        <View className="flex-1 flex-row items-center bg-zinc-100 px-4 py-3 rounded-xl">
          <Search size={20} color="#71717a" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search properties, locations..."
            className="flex-1 ml-2 text-base text-zinc-900"
            placeholderTextColor="#71717a"
          />
        </View>
        <Pressable 
          onPress={() => setShowFilters(true)}
          className="ml-3 bg-amber-500 w-12 h-12 rounded-xl items-center justify-center"
        >
          <SlidersHorizontal size={20} color="white" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-zinc-100 p-1 rounded-xl mb-4">
        {['BUY', 'RENT', 'COMMERCIAL'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`flex-1 py-2.5 items-center justify-center rounded-lg ${isActive ? 'bg-white shadow-sm' : ''}`}
            >
              <Text className={`font-bold ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`}>
                {tab === 'COMMERCIAL' ? 'Commercial' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      {renderHeader()}
      <FlatList keyboardShouldPersistTaps="handled"
        data={properties}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View className="px-4 mt-4">
            <PropertyCard property={item} isSavedInitial={savedPropertyIds.includes(item.id)} />
          </View>
        )}
        
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#f59e0b" className="mt-10" />
          ) : (
            <Text className="text-zinc-500 text-center mt-10">No properties found.</Text>
          )
        }
        ListFooterComponent={
          loadingMore ? (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#f59e0b" />
            </View>
          ) : <View className="h-20" />
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-zinc-900">Advanced Filters</Text>
              <Pressable onPress={() => setShowFilters(false)} className="p-2 bg-zinc-100 rounded-full">
                <X size={20} color="#3f3f46" />
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-zinc-900 mb-2">Price Range (e.g. 50L)</Text>
              <View className="flex-row items-center space-x-4">
                <View className="flex-1">
                  <TextInput
                    value={tempFilters.minPrice}
                    onChangeText={(t) => setTempFilters({...tempFilters, minPrice: t})}
                    placeholder="Min Price"
                    keyboardType="default"
                    className="bg-zinc-100 p-3 rounded-xl text-zinc-900"
                  />
                </View>
                <Text className="text-zinc-500 font-bold">-</Text>
                <View className="flex-1">
                  <TextInput
                    value={tempFilters.maxPrice}
                    onChangeText={(t) => setTempFilters({...tempFilters, maxPrice: t})}
                    placeholder="Max Price"
                    keyboardType="default"
                    className="bg-zinc-100 p-3 rounded-xl text-zinc-900"
                  />
                </View>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-sm font-semibold text-zinc-900 mb-2">Bedrooms (BHK)</Text>
              <View className="flex-row flex-wrap">
                {['1', '2', '3', '4', '5+'].map((num) => {
                  const val = num === '5+' ? '5' : num;
                  const isSelected = tempFilters.bhk === val;
                  return (
                    <Pressable
                      key={num}
                      onPress={() => setTempFilters({...tempFilters, bhk: isSelected ? '' : val})}
                      className={`px-4 py-2 rounded-full border mr-2 mb-2 ${isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-zinc-200'}`}
                    >
                      <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-zinc-600'}`}>{num} BHK</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View className="flex-row space-x-4">
              <Pressable 
                onPress={clearFilters}
                className="flex-1 py-4 items-center justify-center rounded-xl bg-zinc-100"
              >
                <Text className="text-zinc-700 font-bold">Clear All</Text>
              </Pressable>
              <Pressable 
                onPress={applyFilters}
                className="flex-1 py-4 items-center justify-center rounded-xl bg-zinc-900"
              >
                <Text className="text-white font-bold">Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    
      {compareIds.length > 0 && (
        <Pressable 
          onPress={() => router.push('/compare' as any)}
          className="absolute bottom-6 self-center bg-amber-500 flex-row items-center justify-center px-6 py-3 rounded-full shadow-lg shadow-amber-500/30 border-2 border-white"
        >
          <Scale size={20} color="white" />
          <Text className="text-white font-bold ml-2">Compare ({compareIds.length}/3)</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}
