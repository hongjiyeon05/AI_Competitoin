import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StyleSheet, View } from 'react-native';

export default function OpeningScreen() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/(onboarding)/splash1');
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleNext();
     }, 2000);

  return () => clearTimeout(timer);
}, []);

  return (
    <View style={styles.container}>
      <Image
        source={require('C:/Users/user/yonggi-project/assets/images/opening_logo.png')}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#AED581', // Eco Green
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});
