// @ts-nocheck
import { Tabs } from 'expo-router';
import { Building, User, Compass, PlusCircle, MessageSquare } from 'lucide-react-native';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#f59e0b', headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Building size={24} color={color} /> as any,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Compass size={24} color={color} /> as any,
        }}
      />
      <Tabs.Screen
        name="sell"
        options={{
          title: 'Sell',
          tabBarIcon: ({ color }) => <PlusCircle size={24} color={color} /> as any,
        }}
      />
      <Tabs.Screen
        name="inbox"
        options={{
          title: 'Inbox',
          tabBarIcon: ({ color }) => <MessageSquare size={24} color={color} /> as any,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={24} color={color} /> as any,
        }}
      />
    </Tabs>
  );
}
