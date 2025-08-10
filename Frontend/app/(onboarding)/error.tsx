import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ErrorScreen() {
  const router = useRouter();

  // result.tsx에서 에러로 보낼 때 예시:
  // router.replace('/(onboarding)/error?reason=invalid-size&width=10&height=12&length=5&categories=["한식"]')
  // router.replace('/(onboarding)/error?reason=no-category&width=10&height=12&length=5')
  const { reason, width, height, length, categories } = useLocalSearchParams<{
    reason?: string;
    width?: string;
    height?: string;
    length?: string;
    categories?: string; // JSON 문자열 또는 단일 문자열일 수 있음
  }>();

  const getMessage = () => {
    switch (reason) {
      case 'invalid-size':
        return '용기 사이즈를 다시 입력해주세요.';
      case 'no-category':
        return '하나 이상의 카테고리를 선택해주세요.';
      default:
        return '입력값을 확인해주세요.';
    }
  };

  const handleOK = () => {
    // 이전 입력값을 가능한 한 보존해서 입력 화면에 넘겨줌(프리필용)
    const commonParams = {
      width: width ?? '',
      height: height ?? '',
      length: length ?? '',
      categories: categories ?? '',
    };

    if (reason === 'invalid-size') {
      router.replace({ pathname: '/home', params: commonParams });
      return;
    }
    if (reason === 'no-category') {
      router.replace({ pathname: '/home', params: commonParams });
      return;
    }
    router.replace({ pathname: '/home', params: commonParams });
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@/assets/images/error.png')}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>입력 오류</Text>
      <Text style={styles.description}>{getMessage()}</Text>
      <TouchableOpacity style={styles.button} onPress={handleOK}>
        <Text style={styles.buttonText}>OK</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: 350,
    height: 350,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333333',
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#1E7D35',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
