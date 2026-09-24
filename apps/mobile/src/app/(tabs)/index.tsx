import React, { useState, useEffect } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, Pressable, ActivityIndicator, Image, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search, MapPin, SlidersHorizontal, Home as HomeIcon, Building2, LayoutGrid, Trees, Briefcase, Store, X, Bell, Calculator } from 'lucide-react-native';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { useCompareStore } from '@/store/compare';
import { Scale } from 'lucide-react-native';
import { parseIndianCurrencyString } from '@/utils/format';

const CATEGORIES = [
  { id: 'All', label: 'All', Icon: LayoutGrid },
  { id: 'Houses', label: 'Houses', Icon: HomeIcon },
  { id: 'Apartments', label: 'Apartments', Icon: Building2 },
  { id: 'Land', label: 'Land', Icon: Trees },
  { id: 'Commercial', label: 'Commercial', Icon: Briefcase },
  { id: 'Shops', label: 'Shops', Icon: Store },
];

export default function HomeScreen() {
  const compareIds = useCompareStore((state) => state.compareIds);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ initials: string, location: string, avatar: string | null }>({ initials: 'U', location: 'Bengaluru, KA', avatar: null });
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({ minPrice: '', maxPrice: '', bhk: '' });
  const [appliedFilters, setAppliedFilters] = useState({ minPrice: '', maxPrice: '', bhk: '' });

  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadProfileAndData() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, address')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          const initials = profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'U';
          setUserProfile({
            initials,
            location: profile.address || 'Set your location',
            avatar: profile.avatar_url
          });
        }

        // Fetch Saved Properties
        const { data: savedData } = await supabase
          .from('saved_properties')
          .select('property_id')
          .eq('user_id', session.user.id);
        
        if (savedData) {
          setSavedPropertyIds(savedData.map(s => s.property_id));
        }

        // Fetch Unread Notifications Count
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', session.user.id)
          .eq('is_read', false);
        
        setHasUnreadNotifications(count !== null && count > 0);
      }
    }
    loadProfileAndData();
  }, []);

  
  const loadProperties = async (isRefresh = false, pageNum = 0) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (pageNum > 0) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    let query = supabase
      .from('properties')
      .select('*, property_media(url, media_type)')
      .eq('status', 'AVAILABLE')
      .order('created_at', { ascending: false })
      .range(pageNum * 10, (pageNum + 1) * 10 - 1);

    if (activeCategory === 'Houses') {
      query = query.in('type', ['INDEPENDENT_HOUSE', 'VILLA']);
    } else if (activeCategory === 'Apartments') {
      query = query.eq('type', 'APARTMENT');
    } else if (activeCategory === 'Land') {
      query = query.eq('type', 'PLOT');
    } else if (activeCategory === 'Commercial' || activeCategory === 'Shops') {
      query = query.eq('type', 'COMMERCIAL');
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
      if (isRefresh || pageNum === 0) {
        setProperties(props);
      } else {
        setProperties(prev => [...prev, ...props]);
      }
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
  }, [activeCategory, appliedFilters, searchQuery]);

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
  
  return (
    <SafeAreaView className="flex-1 bg-zinc-50">
      <ScrollView keyboardShouldPersistTaps="handled" className="flex-1" showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f59e0b" />}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
          if (isCloseToBottom) loadMore();
        }}
        scrollEventThrottle={400}>
        {/* Header */}
        <View className="px-4 pt-6 pb-4 bg-white border-b border-zinc-200">
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <Image source={require('@/assets/images/logo-sm.png')} className="w-10 h-10 mr-3 rounded-xl" resizeMode="contain" />
              <Pressable onPress={() => router.push('/profile/details')}>
                <Text className="text-xs font-medium text-zinc-500">Current Location</Text>
                <View className="flex-row items-center">
                  <MapPin size={14} color="#f59e0b" />
                  <Text className="text-sm font-bold text-zinc-900 ml-1">{userProfile.location}</Text>
                </View>
              </Pressable>
            </View>
            <View className="flex-row items-center space-x-4">
              <Pressable onPress={() => router.push('/tools' as any)} className="relative mr-1">
                <Calculator size={24} color="#71717a" />
              </Pressable>
              <Pressable onPress={() => router.push('/notifications' as any)} className="relative">
                <Bell size={24} color="#71717a" />
                {hasUnreadNotifications && (
                  <View className="absolute top-0 right-0 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
                )}
              </Pressable>
              <View className="w-10 h-10 bg-zinc-100 rounded-full items-center justify-center overflow-hidden ml-4">
                {userProfile.avatar ? (
                  <Image source={{ uri: userProfile.avatar }} className="w-full h-full" resizeMode="cover" />
                ) : (
                  <Text className="text-zinc-700 font-bold">{userProfile.initials}</Text>
                )}
              </View>
            </View>
          </View>
          
          <View className="flex-row items-center">
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
        </View>

        {/* Categories */}
        <View className="mt-6 mb-4">
          <ScrollView keyboardShouldPersistTaps="handled" horizontal showsHorizontalScrollIndicator={false} className="px-4">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <Pressable 
                  key={category.id} 
                  className="items-center mr-6"
                  onPress={() => setActiveCategory(category.id)}
                >
                  <View className={`w-14 h-14 rounded-full items-center justify-center mb-2 ${isActive ? 'bg-amber-100' : 'bg-zinc-100'}`}>
                    <category.Icon size={24} color={isActive ? "#f59e0b" : "#71717a"} />
                  </View>
                  <Text className={`text-sm font-semibold ${isActive ? 'text-zinc-900' : 'text-zinc-600'}`}>
                    {category.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Featured Properties */}
        <View className="px-4 mt-4 pb-20">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-lg font-bold text-zinc-900">Featured Properties</Text>
            <Pressable onPress={() => router.push('/explore' as any)}>
              <Text className="text-amber-600 font-medium text-sm">See All</Text>
            </Pressable>
          </View>
          
          {loading && properties.length === 0 ? (
            <ActivityIndicator size="large" color="#f59e0b" className="mt-10" />
          ) : properties.length > 0 ? (
            properties.map(prop => (
              <PropertyCard 
                key={prop.id} 
                property={prop} 
                isSavedInitial={savedPropertyIds.includes(prop.id)} 
              />
            ))
          ) : (
            <Text className="text-zinc-500 text-center mt-10">No properties found.</Text>
          )}
        </View>
      </ScrollView>

      
          {loadingMore && (
            <View className="py-4 items-center">
              <ActivityIndicator size="small" color="#f59e0b" />
            </View>
          )}

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-bold text-zinc-900">Advanced Filters</Text>
              <Pressable onPress={() => setShowFilters(false)} className="p-2 bg-zinc-100 rounded-full">
                <X size={20} color="#3f3f46" />
              </Pressable>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-zinc-900 mb-2">Price Range ($)</Text>
              <View className="flex-row items-center space-x-4">
                <View className="flex-1">
                  <TextInput
                    value={tempFilters.minPrice}
                    onChangeText={(t) => setTempFilters({...tempFilters, minPrice: t})}
                    placeholder="Min Price (e.g. 50L)"
                    keyboardType="default"
                    className="bg-zinc-100 p-3 rounded-xl text-zinc-900"
                  />
                </View>
                <Text className="text-zinc-500 font-bold">-</Text>
                <View className="flex-1">
                  <TextInput
                    value={tempFilters.maxPrice}
                    onChangeText={(t) => setTempFilters({...tempFilters, maxPrice: t})}
                    placeholder="Max Price (e.g. 2Cr)"
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
