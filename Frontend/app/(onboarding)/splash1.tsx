import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function Splash1Screen() {
  const router = useRouter();

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [length, setLength] = useState('');

  const handleSkip = () => {
    router.replace('/(onboarding)/splash2');
  };

  const handleNext = () => {
  router.replace({
    pathname: '/(onboarding)/splash2',
    params: {
      width,
      height,
      length,
    },
  });
};


  useEffect(() => {
    const timer = setTimeout(() => {
      handleNext(); 
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.step}>Step1</Text>
      <Text style={styles.title}>용기 사이즈를 입력하세요.</Text>

      <View style={styles.inputGroup}>
        <TextInput
          style={styles.input}
          placeholder="가로 (Width)"
          placeholderTextColor="#060000ff"
          value={width}
          onChangeText={setWidth}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="세로 (Height)"
          placeholderTextColor="#000000ff"
          value={height}
          onChangeText={setHeight}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder="높이 (Length)"
          value={length}
          placeholderTextColor="#000000ff"
          onChangeText={setLength}
          keyboardType="numeric"
        />
      </View>

      <TouchableOpacity onPress={handleSkip}>
        <Text style={styles.skip}>SKIP</Text>
      </TouchableOpacity>

      <View style={styles.stepIndicator}>
        <View style={styles.activeDot} />
        <View style={styles.inactiveDot} />
        <View style={styles.inactiveDot} />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 30,
    paddingTop: 100,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  step: {
    fontSize: 16,
    color: '#4B4B4B',
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4B4B4B',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    gap: 16,
    marginBottom: 48,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#C2C2C2',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  skip: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4CAF50',
  },
  stepIndicator: {
    flexDirection: 'row',
    gap: 6,
    position: 'absolute',
    bottom: 60,
  },
  activeDot: {
    width: 30,
    height: 6,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
  },
  inactiveDot: {
    width: 10,
    height: 6,
    borderRadius: 20,
    backgroundColor: '#C8E6C9',
  },
});
