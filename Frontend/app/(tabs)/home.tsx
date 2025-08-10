import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import ChineseImage from '../../assets/images/chinese.png';
import EtcImage from '../../assets/images/etc.png';
import JapaneseImage from '../../assets/images/japanese.png';
import KoreanImage from '../../assets/images/korean.png';
import WesternImage from '../../assets/images/western.png';

const categories = [
  { id: 'korean', label: '한식', icon: KoreanImage },
  { id: 'chinese', label: '중식', icon: ChineseImage },
  { id: 'japanese', label: '일식', icon: JapaneseImage },
  { id: 'western', label: '양식', icon: WesternImage },
  { id: 'etc', label: '기타', icon: EtcImage },
];

export default function IndexScreen() {
  const router = useRouter();

  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [height, setHeight] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSubmit = () => {
  const w = Number(width);
  const l = Number(length);
  const h = Number(height);

  const isValid =
    !isNaN(w) && !isNaN(l) && !isNaN(h) &&
    w > 0 && l > 0 && h > 0 &&
    selectedCategory;

  if (!isValid) {
    router.push('/(onboarding)/error');
  } else {
    router.push({
      pathname: '/(tabs)/result',
      params: {
        width: w.toString(),
        length: l.toString(),
        height: h.toString(),
        category: selectedCategory,
      },
    });
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>용기 사이즈와 카테고리를{'\n'}선택해주세요</Text>

      <TextInput
        style={styles.input}
        placeholder="가로(cm)"
        keyboardType="numeric"
        placeholderTextColor="#020000ff"
        value={width}
        onChangeText={setWidth}
      />
      <TextInput
        style={styles.input}
        placeholder="세로(cm)"
        placeholderTextColor="#000000ff"
        keyboardType="numeric"
        value={length}
        onChangeText={setLength}
      />
      <TextInput
        style={styles.input}
        placeholder="높이(cm)"
        keyboardType="numeric"
        placeholderTextColor="#000000ff"
        value={height}
        onChangeText={setHeight}
      />

      <Text style={styles.subtitle}>카테고리</Text>
      <View style={styles.categoryRow}>
        {categories.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setSelectedCategory(item.id)}
            style={[
              styles.categoryItem,
              selectedCategory === item.id && styles.categorySelected,
            ]}
          >
            <Image source={item.icon} style={styles.icon} />
            <Text
              style={[
                styles.categoryLabel,
                selectedCategory === item.id && styles.categoryLabelSelected,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>음식 추천 받기</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    backgroundColor: '#F6F5FF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 28,
    textAlign: 'center',
    color: '#333',
    lineHeight: 30,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 14,
    backgroundColor: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 12,
    color: '#333',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  categoryItem: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D9D9D9',
    backgroundColor: '#FFFFFF',
    width: 60,
  },
  categorySelected: {
    borderColor: '#4CAF50',
    backgroundColor: '#EDEBFB',
  },
  icon: {
    width: 40,
    height: 40,
    marginBottom: 6,
    borderRadius: 20,
  },
  categoryLabel: {
    fontSize: 12,
    color: '#555',
  },
  categoryLabelSelected: {
    fontWeight: '700',
    color: '#4CAF50',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
