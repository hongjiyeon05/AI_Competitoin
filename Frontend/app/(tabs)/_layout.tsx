import { Tabs } from 'expo-router';
import { Image } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#eee',
          height: 70,
        },
        tabBarIcon: ({ focused }) => {
          let iconSource;

          switch (route.name) {
            case 'home':
              iconSource = focused
                ? require('../../assets/images/home_push.png')
                : require('../../assets/images/home.png');
              break;

            case 'result':
              iconSource = focused
                ? require('../../assets/images/logo.png')
                : require('../../assets/images/logo.png');
              break;

            case 'resultmap':
              iconSource = focused
                ? require('../../assets/images/location_push.png')
                : require('../../assets/images/location.png');
              break;

            default:
              iconSource = require('../../assets/images/home.png');
          }

          return (
            <Image
              source={iconSource}
              style={{ width: 28, height: 28 }}
              resizeMode="contain"
            />
          );
        },
      })}
    >
      <Tabs.Screen name="home" options={{ title: '' }} />
      <Tabs.Screen name="result" options={{ title: '' }} />
      <Tabs.Screen name="resultmap" options={{ title: '' }} />
    </Tabs>
  );
}
