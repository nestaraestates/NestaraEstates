import React, { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import { View, Text, KeyboardAvoidingView, Image, Platform, TextInput, Pressable, ActivityIndicator, FlatList, Modal, RefreshControl, Alert, ScrollView } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, WifiOff, SlidersHorizontal, X } from 'lucide-react-native';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useCompareStore } from '@/store/compare';
import { Scale } from 'lucide-react-native';
import { parseIndianCurrencyString } from '@/utils/format';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
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
  const [hasError, setHasError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({ location: '', minPrice: '', maxPrice: '', bhk: '', bathrooms: '', verifiedOnly: false, radius: 0 });
  const [appliedFilters, setAppliedFilters] = useState({ location: '', minPrice: '', maxPrice: '', bhk: '', bathrooms: '', verifiedOnly: false, radius: 0 });

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
    setHasError(false);
    if (isRefresh) setRefreshing(true);
    else if (pageNum > 0) setLoadingMore(true);
    else setLoading(true);
    
    const { data: { session } } = await supabase.auth.getSession();

    let query;
    if (appliedFilters.radius > 0) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in your settings to search by radius.');
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      query = supabase.rpc('get_properties_within_radius', {
        user_lat: location.coords.latitude,
        user_lng: location.coords.longitude,
        radius_km: appliedFilters.radius
      }).select('*, property_media(url, media_type)');
    } else {
      query = supabase.from('properties').select('*, property_media(url, media_type)').eq('status', 'AVAILABLE');
    }
    query = query.order('created_at', { ascending: false }).range(pageNum * 10, (pageNum + 1) * 10 - 1);

    if (session?.user?.id) {
      query = query.neq('owner_id', session.user.id);
    }

    if (activeTab === 'COMMERCIAL') {
      query = query.eq('type', 'COMMERCIAL');
    } else {
      query = query.eq('purpose', activeTab);
    }

    if (appliedFilters.minPrice) query = query.gte('price', parseInt(parseIndianCurrencyString(appliedFilters.minPrice)));
    if (appliedFilters.maxPrice) query = query.lte('price', parseInt(parseIndianCurrencyString(appliedFilters.maxPrice)));
    if (appliedFilters.bhk) query = query.eq('bhk', parseInt(appliedFilters.bhk));
    if (appliedFilters.bathrooms) query = query.eq('bathrooms', parseInt(appliedFilters.bathrooms));
    if (appliedFilters.verifiedOnly) query = query.eq('is_verified', true);
    if (appliedFilters.location) {
      const loc = `%${appliedFilters.location.trim()}%`;
      query = query.or(`location.ilike.${loc},city.ilike.${loc}`);
    }

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
    const emptyFilters = { location: '', minPrice: '', maxPrice: '', bhk: '', bathrooms: '', verifiedOnly: false, radius: 0 };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setShowFilters(false);
  };

  const renderHeader = () => (
    <View className="px-4 pt-3 pb-3 bg-white border-b border-zinc-200">
      <View className="flex-row items-center mb-2">
        <Image source={require('@/assets/images/logo-sm.png')} className="w-8 h-8 mr-3 rounded-lg" resizeMode="contain" />
        <Text className="text-2xl font-bold text-zinc-900">Explore</Text>
      </View>
      
      {/* Search & Filter */}
      <View className="flex-row items-center mb-2">
        <View className="flex-1 flex-row items-center bg-zinc-100 px-3.5 py-2.5 rounded-xl">
          <Search size={18} color="#71717a" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search properties, locations..."
            className="flex-1 ml-2 text-[15px] text-zinc-900"
            placeholderTextColor="#71717a"
          />
        </View>
        <Pressable 
          onPress={() => setShowFilters(true)}
          className="ml-3 bg-amber-500 w-11 h-11 rounded-xl items-center justify-center"
        >
          <SlidersHorizontal size={18} color="white" />
        </Pressable>
      </View>

      {/* Tabs */}
      <View className="flex-row bg-zinc-100 p-1 rounded-xl mb-2">
        {['BUY', 'RENT', 'COMMERCIAL'].map((tab) => {
          const isActive = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab as any)}
              className={`flex-1 py-2 items-center justify-center rounded-lg ${isActive ? 'bg-white shadow-sm' : ''}`}
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
        renderItem={({ item, index }) => (
          <View className="px-4 mt-4">
            <PropertyCard property={item} isSavedInitial={savedPropertyIds.includes(item.id)} index={index} />
          </View>
        )}
        
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#f59e0b" className="mt-10" />
          ) : (
            <View className="items-center justify-center py-20 mt-10 bg-white rounded-[24px] border border-zinc-100 shadow-sm mx-4">
              <View className="w-20 h-20 bg-zinc-50 rounded-full items-center justify-center mb-4">
                <Search size={32} color="#a1a1aa" />
              </View>
              <Text className="text-xl font-black text-zinc-900 mb-2">No Properties Found</Text>
              <Text className="text-zinc-500 text-center px-8 font-medium">Try adjusting your filters or searching in a different area.</Text>
            </View>
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
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} className="flex-1 justify-end bg-black/50">
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <View className="bg-white rounded-t-3xl p-6" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-zinc-900">Advanced Filters</Text>
                <Pressable onPress={() => setShowFilters(false)}>
                  <X size={24} color="#71717A" />
                </Pressable>
              </View>

              {/* Radius Filter */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-zinc-900 mb-2">Search Radius (from your location)</Text>
                <View className="flex-row flex-wrap">
                  {[0, 5, 10, 25, 50].map((km) => {
                    const isSelected = tempFilters.radius === km;
                    return (
                      <Pressable
                        key={km}
                        onPress={() => setTempFilters({...tempFilters, radius: km})}
                        className={`px-4 py-2 rounded-full border mr-2 mb-2 ${isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-zinc-200'}`}
                      >
                        <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-zinc-600'}`}>{km === 0 ? 'Anywhere' : `${km} km`}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="mb-6">
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
                  <Text className="text-zinc-500">-</Text>
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

              <View className="mb-6">
                <Text className="text-sm font-semibold text-zinc-900 mb-2">Bedrooms (BHK)</Text>
                <View className="flex-row flex-wrap">
                  {['', '1', '2', '3', '4'].map((num) => {
                    const label = num === '' ? 'Any' : num === '4' ? '4+' : num;
                    const isSelected = tempFilters.bhk === num;
                    return (
                      <Pressable
                        key={num}
                        onPress={() => setTempFilters({...tempFilters, bhk: num})}
                        className={`px-4 py-2 rounded-full border mr-2 mb-2 ${isSelected ? 'bg-amber-500 border-amber-500' : 'bg-white border-zinc-200'}`}
                      >
                        <Text className={`font-semibold ${isSelected ? 'text-white' : 'text-zinc-600'}`}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-sm font-semibold text-zinc-900">Verified Properties Only</Text>
                <Pressable
                  onPress={() => setTempFilters({...tempFilters, verifiedOnly: !tempFilters.verifiedOnly})}
                  className={`w-12 h-6 rounded-full ${tempFilters.verifiedOnly ? 'bg-emerald-500' : 'bg-zinc-200'} justify-center px-1`}
                >
                  <View className={`w-4 h-4 bg-white rounded-full transition-transform ${tempFilters.verifiedOnly ? 'translate-x-6' : 'translate-x-0'}`} />
                </Pressable>
              </View>

              <View className="flex-row space-x-4 mb-4">
                <Pressable onPress={clearFilters} className="flex-1 py-4 items-center justify-center rounded-xl bg-zinc-100">
                  <Text className="font-bold text-zinc-600">Clear All</Text>
                </Pressable>
                <Pressable onPress={applyFilters} className="flex-1 py-4 items-center justify-center rounded-xl bg-amber-500 shadow-md shadow-amber-500/30">
                  <Text className="font-bold text-white">Show Results</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
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
