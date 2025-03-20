// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

export default function TabsLayout() {

  return (
    <Tabs screenOptions={{
        tabBarStyle: { backgroundColor: '#000000' },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Trakt Lists',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="playlist-star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="video-vintage" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="video"
        options={{
          title: 'Video',
          tabBarIcon: ({ color, size }: { color: string; size: number }) => (
            <Icon name="video" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}