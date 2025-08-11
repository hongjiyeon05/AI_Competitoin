import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// 기기 크기 가져오기
const { width: screenWidth } = Dimensions.get('window');

// 배열/문자열 구분 처리
const first = (v?: string | string[]) => Array.isArray(v) ? v[0] : (v ?? '');

// reason 값을 정규화: 소문자, 언더바·공백 → 하이픈
const norm = (v: string) =>
  v.trim().toLowerCase().replace(/[\s_]+/g, '-');

export default function ErrorScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    reason?: string | string[];
    width?: string | string[];
    height?: string | string[];
    length?: string | string[];
    categories?: string | string[];
  }>();

  const reason = norm(first(params.reason));
  const width = first(params.width);
  const height = first(params.height);
  const length = first(params.length);
  const categories = first(params.categories);

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
    const commonParams = { width, height, length, categories };
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
    width: screenWidth * 0.5, // 화면 폭의 50%
    height: screenWidth * 0.5,
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

