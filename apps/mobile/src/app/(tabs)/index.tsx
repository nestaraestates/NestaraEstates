import React, { useState, useEffect, useCallback } from 'react';
 
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { View, Text, KeyboardAvoidingView, Platform, ScrollView, TextInput, Pressable, ActivityIndicator, Image, Modal, RefreshControl, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, WifiOff, MapPin, SlidersHorizontal, Home as HomeIcon, Building2, LayoutGrid, Trees, Briefcase, Store, X, Bell, Calculator } from 'lucide-react-native';
import PropertyCard from '@/components/PropertyCard';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
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
  const insets = useSafeAreaInsets();
  const compareIds = useCompareStore((state) => state.compareIds);

  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState('Set your location');
  const [activeCategory, setActiveCategory] = useState('All');
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<{ initials: string, location: string, avatar: string | null }>({ initials: 'U', location: 'Bengaluru, KA', avatar: null });
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter State
  const [showFilters, setShowFilters] = useState(false);
  const [tempFilters, setTempFilters] = useState({ location: '', minPrice: '', maxPrice: '', bhk: '', bathrooms: '', verifiedOnly: false, radius: 0, radiusSource: 'saved' as 'gps' | 'saved' | null });
  const [appliedFilters, setAppliedFilters] = useState({ location: '', minPrice: '', maxPrice: '', bhk: '', bathrooms: '', verifiedOnly: false, radius: 0, radiusSource: 'saved' as 'gps' | 'saved' | null });

  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);

  useFocusEffect(useCallback(() => {
    let channel: any;
    async function loadProfileAndData() {
      // 1. Read location from AsyncStorage (instant sync from Map)
      try {
        const savedLoc = await AsyncStorage.getItem('user_location');
        if (savedLoc) setUserLocation(savedLoc);
      } catch(e) {}
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
        const checkNotifications = async () => {
          const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', session.user.id)
            .eq('is_read', false);
          setHasUnreadNotifications(count !== null && count > 0);
        };
        
        checkNotifications();

        // Subscribe to real-time notification changes
        channel = supabase
          .channel('public:notifications:index')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${session.user.id}` }, () => {
            checkNotifications();
          })
          .subscribe();
      }
    }
    
    loadProfileAndData();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []));

  
  const loadProperties = async (isRefresh = false, pageNum = 0) => {
    setHasError(false);
    if (isRefresh) {
      setRefreshing(true);
    } else if (pageNum > 0) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    const { data: { session } } = await supabase.auth.getSession();

    let query;
    if (appliedFilters.radius > 0) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions in your settings to search by radius.');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      
      let lat = 0;
      let lng = 0;
      
      if (appliedFilters.radiusSource === 'gps') {
        let location = await Location.getCurrentPositionAsync({});
        lat = location.coords.latitude;
        lng = location.coords.longitude;
      } else {
        const savedLat = await AsyncStorage.getItem('user_location_lat');
        const savedLng = await AsyncStorage.getItem('user_location_lng');
        if (savedLat && savedLng) {
          lat = parseFloat(savedLat);
          lng = parseFloat(savedLng);
        } else {
          let location = await Location.getCurrentPositionAsync({});
          lat = location.coords.latitude;
          lng = location.coords.longitude;
        }
      }
      
      query = supabase.rpc('get_properties_within_radius', {
        user_lat: lat,
        user_lng: lng,
        radius_km: appliedFilters.radius
      }).select('*, property_media(url, media_type)');
    } else {
      query = supabase.from('properties').select('*, property_media(url, media_type)').eq('status', 'AVAILABLE');
    }
    query = query.order('created_at', { ascending: false }).range(pageNum * 10, (pageNum + 1) * 10 - 1);

    if (session?.user?.id) {
      query = query.neq('owner_id', session.user.id);
    }

    if (activeCategory === 'Houses') {
      query = query.in('type', ['INDEPENDENT_HOUSE', 'VILLA']);
    } else if (activeCategory === 'Apartments') {
      query = query.eq('type', 'APARTMENT');
    } else if (activeCategory === 'Land') {
      query = query.eq('type', 'PLOT');
    } else if (activeCategory === 'Commercial' || activeCategory === 'Shops') {
      query = query.eq('type', 'COMMERCIAL');
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

  useFocusEffect(useCallback(() => {
    const timer = setTimeout(() => {
      setPage(0);
      loadProperties(false, 0);
    }, 150);
    return () => clearTimeout(timer);
  }, [activeCategory, appliedFilters, searchQuery]));

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
    const emptyFilters = { location: '', minPrice: '', maxPrice: '', bhk: '', bathrooms: '', verifiedOnly: false, radius: 0, radiusSource: 'saved' as 'gps' | 'saved' | null };
    setTempFilters(emptyFilters);
    setAppliedFilters(emptyFilters);
    setShowFilters(false);
  };
  
  return (
    <SafeAreaView className="flex-1 bg-surface-100">
      <FlatList
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        data={properties}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={() => (
          <>
            {/* Header */}
            <View className="px-4 py-4 bg-surface-100">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <Image source={require('@/assets/images/logo-sm.png')} className="w-10 h-10 mr-3 rounded-xl" resizeMode="contain" />
                  <Pressable onPress={() => router.push('/location-picker' as any)}>
                    <Text className="text-xs font-medium text-zinc-500">Current Location</Text>
                    <View className="flex-row items-center">
                      <MapPin size={14} className="text-brand-500" />
                      <Text className="text-sm font-bold text-surface-900 ml-1 truncate max-w-[200px]" numberOfLines={1}>{userLocation !== 'Set your location' ? userLocation : userProfile.location || 'Set your location'}</Text>
                    </View>
                  </Pressable>
                </View>
                <View className="flex-row items-center">
                  <Pressable onPress={() => router.push('/tools' as any)} className="w-10 h-10 items-center justify-center">
                    <Calculator size={22} color="#71717a" />
                  </Pressable>
                  <Pressable onPress={() => router.push('/notifications' as any)} className="w-10 h-10 items-center justify-center relative ml-1">
                    <Bell size={22} color="#71717a" />
                    {hasUnreadNotifications && (
                      <View className="absolute top-2 right-2 w-2.5 h-2.5 bg-brand-500 rounded-full border border-white" />
                    )}
                  </Pressable>
                  <View className="w-10 h-10 bg-zinc-100 rounded-full items-center justify-center overflow-hidden ml-3 border border-zinc-200">
                    {userProfile.avatar ? (
                      <Image source={{ uri: userProfile.avatar }} className="w-full h-full" resizeMode="cover" />
                    ) : (
                      <Text className="text-surface-900 font-bold">{userProfile.initials}</Text>
                    )}
                  </View>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="flex-1 flex-row items-center bg-white px-4 h-[48px] rounded-2xl border border-zinc-200 shadow-sm">
                  <Search size={18} color="#71717a" />
                  <TextInput
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholder="Search properties, locations..."
                    className="flex-1 ml-3 text-[15px] text-surface-900 py-0"
                    placeholderTextColor="#71717a"
                  />
                </View>
                <Pressable 
                  onPress={() => setShowFilters(true)}
                  className="ml-3 bg-brand-500 w-[48px] h-[48px] rounded-2xl items-center justify-center shadow-sm"
                >
                  <SlidersHorizontal size={18} color="white" />
                </Pressable>
              </View>
            </View>

            {/* Categories */}
            <View className="mt-2 mb-2">
              <ScrollView keyboardShouldPersistTaps="handled" horizontal showsHorizontalScrollIndicator={false} className="px-4">
                {CATEGORIES.map((category) => {
                  const isActive = activeCategory === category.id;
                  return (
                    <Pressable 
                      key={category.id} 
                      className="items-center mr-6"
                      onPress={() => setActiveCategory(category.id)}
                    >
                      <View className={`w-12 h-12 rounded-xl items-center justify-center mb-2 ${isActive ? 'bg-brand-500/10' : 'bg-zinc-50 border border-zinc-100'}`}>
                        <category.Icon size={20} className={isActive ? "text-brand-500" : "text-zinc-500"} />
                      </View>
                      <Text className={`text-sm font-medium ${isActive ? 'text-surface-900' : 'text-zinc-500'}`}>
                        {category.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View className="px-4 mt-4 mb-4 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-surface-900">Featured Properties</Text>
              <Pressable onPress={() => router.push('/explore' as any)}>
                <Text className="text-brand-500 font-medium text-sm">See All</Text>
              </Pressable>
            </View>
          </>
        )}
        renderItem={({ item, index }) => (
          <View className="px-4 mb-4">
            <PropertyCard 
              property={item} 
              isSavedInitial={savedPropertyIds.includes(item.id)} 
              index={index}
            />
          </View>
        )}
        ListEmptyComponent={() => (
          loading ? (
            <ActivityIndicator size="large" className="mt-10" />
          ) : (
            <View className="items-center justify-center py-20 mt-10 bg-surface-100 rounded-2xl border border-zinc-100 shadow-sm mx-4">
              <View className="w-16 h-16 bg-zinc-50 rounded-full items-center justify-center mb-4">
                <Search size={24} color="#a1a1aa" />
              </View>
              <Text className="text-xl font-bold text-surface-900 mb-2">No Properties Found</Text>
              <Text className="text-zinc-500 text-center px-8 font-medium text-sm">We couldn't find any properties matching your current location or filters.</Text>
            </View>
          )
        )}
        ListFooterComponent={() => (
          <View className="pb-20">
            {loadingMore && (
              <View className="py-4 items-center">
                <ActivityIndicator size="small" />
              </View>
            )}
          </View>
        )}
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'padding'} keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20} className="flex-1 justify-end bg-black/50" style={{ paddingTop: Math.max(insets.top, 24) }}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ flexGrow: 1, justifyContent: 'flex-end' }}>
            <View className="bg-surface-100 rounded-t-2xl p-6" style={{ paddingBottom: Math.max(insets.bottom, 24) }}>
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xl font-bold text-surface-900">Advanced Filters</Text>
                <Pressable onPress={() => setShowFilters(false)}>
                  <X size={24} color="#71717A" />
                </Pressable>
              </View>

              {/* Radius Filter */}
              <View className="mb-6">
                <Text className="text-sm font-semibold text-surface-900 mb-2">Search Radius</Text>
                <View className="flex-row flex-wrap mb-3">
                  {[0, 5, 10, 25, 50].map((km) => {
                    const isSelected = tempFilters.radius === km;
                    return (
                      <Pressable
                        key={km}
                        onPress={() => setTempFilters({...tempFilters, radius: km, radiusSource: km === 0 ? null : (tempFilters.radiusSource || 'saved')})}
                        className={`px-4 py-2 rounded-xl border mr-2 mb-2 ${isSelected ? 'bg-brand-500 border-brand-500' : 'bg-white border-zinc-200'}`}
                      >
                        <Text className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-surface-900'}`}>{km === 0 ? 'Anywhere' : `${km} km`}</Text>
                      </Pressable>
                    );
                  })}
                </View>

                {tempFilters.radius > 0 && (
                  <View className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <Text className="text-xs font-semibold text-zinc-500 mb-2 uppercase tracking-wider">Measure radius from:</Text>
                    <View className="flex-col space-y-2">
                      <View className="flex-row space-x-2">
                        <Pressable 
                          onPress={() => setTempFilters({...tempFilters, radiusSource: 'saved'})}
                          className={`flex-1 py-2 px-3 rounded-lg border ${tempFilters.radiusSource === 'saved' ? 'bg-brand-50 border-brand-200' : 'bg-white border-zinc-200'}`}
                        >
                          <Text className={`text-center text-sm font-medium ${tempFilters.radiusSource === 'saved' ? 'text-brand-700' : 'text-zinc-600'}`}>Saved Map</Text>
                        </Pressable>
                        <Pressable 
                          onPress={() => setTempFilters({...tempFilters, radiusSource: 'gps'})}
                          className={`flex-1 py-2 px-3 rounded-lg border ${tempFilters.radiusSource === 'gps' ? 'bg-brand-50 border-brand-200' : 'bg-white border-zinc-200'}`}
                        >
                          <Text className={`text-center text-sm font-medium ${tempFilters.radiusSource === 'gps' ? 'text-brand-700' : 'text-zinc-600'}`}>Current GPS</Text>
                        </Pressable>
                      </View>
                      <Pressable 
                        onPress={() => {
                          setShowFilters(false);
                          router.push('/location-picker' as any);
                        }}
                        className="py-2 px-3 rounded-lg border border-brand-200 bg-brand-50/50"
                      >
                        <Text className="text-center text-sm font-semibold text-brand-600">🗺️ Choose New Location</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-surface-900 mb-2">Price Range (e.g. 50L)</Text>
                <View className="flex-row items-center space-x-4">
                  <View className="flex-1">
                    <TextInput
                      value={tempFilters.minPrice}
                      onChangeText={(t) => setTempFilters({...tempFilters, minPrice: t})}
                      placeholder="Min Price"
                      keyboardType="default"
                      className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-surface-900"
                    />
                  </View>
                  <Text className="text-zinc-500">-</Text>
                  <View className="flex-1">
                    <TextInput
                      value={tempFilters.maxPrice}
                      onChangeText={(t) => setTempFilters({...tempFilters, maxPrice: t})}
                      placeholder="Max Price"
                      keyboardType="default"
                      className="bg-zinc-50 border border-zinc-200 p-3 rounded-xl text-surface-900"
                    />
                  </View>
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-sm font-semibold text-surface-900 mb-2">Bedrooms (BHK)</Text>
                <View className="flex-row flex-wrap">
                  {['', '1', '2', '3', '4'].map((num) => {
                    const label = num === '' ? 'Any' : num === '4' ? '4+' : num;
                    const isSelected = tempFilters.bhk === num;
                    return (
                      <Pressable
                        key={num}
                        onPress={() => setTempFilters({...tempFilters, bhk: num})}
                        className={`px-4 py-2 rounded-xl border mr-2 mb-2 ${isSelected ? 'bg-brand-500 border-brand-500' : 'bg-white border-zinc-200'}`}
                      >
                        <Text className={`font-medium text-sm ${isSelected ? 'text-white' : 'text-surface-900'}`}>{label}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-8">
                <Text className="text-sm font-semibold text-surface-900">Verified Properties Only</Text>
                <Pressable
                  onPress={() => setTempFilters({...tempFilters, verifiedOnly: !tempFilters.verifiedOnly})}
                  className={`w-12 h-6 rounded-full ${tempFilters.verifiedOnly ? 'bg-brand-500' : 'bg-zinc-200'} justify-center px-1`}
                >
                  <View className={`w-4 h-4 bg-white rounded-full transition-transform ${tempFilters.verifiedOnly ? 'translate-x-6' : 'translate-x-0'}`} />
                </Pressable>
              </View>

              <View className="flex-row space-x-4 mb-4">
                <Pressable onPress={clearFilters} className="flex-1 py-3 items-center justify-center rounded-xl bg-zinc-100">
                  <Text className="font-bold text-surface-900">Clear All</Text>
                </Pressable>
                <Pressable onPress={applyFilters} className="flex-1 py-3 items-center justify-center rounded-xl bg-brand-500 shadow-sm">
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
          className="absolute bottom-6 self-center bg-brand-500 flex-row items-center justify-center px-6 py-3 rounded-full shadow-sm"
        >
          <Scale size={20} color="white" />
          <Text className="text-white font-bold ml-2">Compare ({compareIds.length}/3)</Text>
        </Pressable>
      )}
    </SafeAreaView>
  );
}
