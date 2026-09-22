import React, { useState, useEffect } from 'react';
import { View, Text, Animated, SafeAreaView } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff, AlertTriangle } from 'lucide-react-native';

export function NetworkBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [isSlow, setIsSlow] = useState(false);
  const translateY = new Animated.Value(-100);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      // Check if internet is slow (2g, edge, or low cellular generation)
      if (state.type === 'cellular') {
        const generation = state.details?.cellularGeneration;
        setIsSlow(generation === '2g' || generation === '3g');
      } else {
        setIsSlow(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isConnected === false || isSlow) {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected, isSlow]);

  if (isConnected !== false && !isSlow) return null;

  const bgColor = isConnected === false ? 'bg-red-500' : 'bg-amber-500';
  const message = isConnected === false ? 'No Internet Connection' : 'Slow Internet Connection';
  const Icon = isConnected === false ? WifiOff : AlertTriangle;

  return (
    <Animated.View 
      style={{ transform: [{ translateY }], zIndex: 100 }} 
      className="absolute top-0 left-0 right-0"
    >
      <SafeAreaView className={bgColor}>
        <View className="flex-row items-center justify-center py-3 px-4">
          <Icon size={16} color="white" />
          <Text className="text-white font-bold ml-2 text-sm">{message}</Text>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}
