import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function WelcomeScreen() {
 const router = useRouter();

 return (
 <SafeAreaView className="flex-1 bg-zinc-50 ">
 <View className="flex-1 justify-center items-center px-6">
 <Image 
 source={require('@/assets/images/logo.png')} 
 className="w-24 h-24 rounded-2xl mb-8" 
 resizeMode="contain"
 />

 <Text className="text-3xl font-extrabold text-zinc-900 text-center mb-3">
 Welcome to Nestara
 </Text>
 
 <Text className="text-base text-zinc-500 text-center mb-12 px-4 leading-6">
 Discover your dream home, invest in premium properties, and explore the best real estate options.
 </Text>

 <View className="w-full">
 <TouchableOpacity
 onPress={() => router.push('/(auth)/signup')}
 className="w-full bg-blue-600 rounded-xl py-4 items-center shadow-sm mb-4"
 >
 <Text className="text-white font-semibold text-lg">Create Account</Text>
 </TouchableOpacity>

 <TouchableOpacity
 onPress={() => router.push('/(auth)/login')}
 className="w-full bg-zinc-200 rounded-xl py-4 items-center"
 >
 <Text className="text-zinc-900 font-semibold text-lg">Sign In</Text>
 </TouchableOpacity>
 </View>
 </View>
 </SafeAreaView>
 );
}
