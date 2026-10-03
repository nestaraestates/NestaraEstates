import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, Image, Pressable, Dimensions, Linking } from 'react-native';
import { supabase } from '@/lib/supabase';

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width - 32; // px-4 padding on both sides (16 * 2)

type Ad = {
  id: string;
  image_url: string;
  redirect_url: string;
  slot_number: number;
};

export default function AdCarousel() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  
  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const { data } = await supabase
      .from('mobile_ads')
      .select('*')
      .eq('is_active', true)
      .order('slot_number', { ascending: true });
      
    if (data && data.length > 0) {
      setAds(data);
    }
  };

  useEffect(() => {
    if (ads.length <= 1) return;

    const timer = setInterval(() => {
      let nextIndex = currentIndex + 1;
      if (nextIndex >= ads.length) {
        nextIndex = 0;
      }
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setCurrentIndex(nextIndex);
    }, 4000);

    return () => clearInterval(timer);
  }, [currentIndex, ads]);

  const handlePress = (url?: string) => {
    if (url) {
      Linking.openURL(url).catch(err => console.error("Couldn't load page", err));
    }
  };

  if (ads.length === 0) return null;

  return (
    <View className="mt-4 mb-2">
      <FlatList
        ref={flatListRef}
        data={ads}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(event) => {
          const newIndex = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <Pressable 
            onPress={() => handlePress(item.redirect_url)}
            className="px-4"
            style={{ width }}
          >
            <Image
              source={{ uri: item.image_url }}
              className="w-full h-40 rounded-2xl bg-zinc-100"
              resizeMode="cover"
            />
          </Pressable>
        )}
      />
      {ads.length > 1 && (
        <View className="flex-row justify-center mt-3 space-x-1.5">
          {ads.map((_, index) => (
            <View
              key={index}
              className={`h-1.5 rounded-full ${
                index === currentIndex ? 'w-4 bg-brand-500' : 'w-1.5 bg-zinc-300'
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}
