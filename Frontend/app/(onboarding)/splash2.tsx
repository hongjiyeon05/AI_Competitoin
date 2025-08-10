import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const MaskedView =
  Platform.OS === 'web'
    ? View
    : require('@react-native-masked-view/masked-view').default;

import ChineseImage from '@/assets/images/chinese.png';
import EtcImage from '@/assets/images/etc.png';
import JapaneseImage from '@/assets/images/japanese.png';
import KoreanImage from '@/assets/images/korean.png';
import WesternImage from '@/assets/images/western.png';

const categories = [
  { id: 'korean', label: '한식', icon: KoreanImage },
  { id: 'chinese', label: '중식', icon: ChineseImage },
  { id: 'japanese', label: '일식', icon: JapaneseImage },
  { id: 'western', label: '양식', icon: WesternImage },
  { id: 'etc', label: '기타', icon: EtcImage },
];

export default function Splash2Screen() {
  const router = useRouter();
  const [selected, setSelected] = useState<string | null>(null);
  const [moved, setMoved] = useState(false);

  const { width, height, length } = useLocalSearchParams<{
    width: string;
    height: string;
    length: string;
  }>();

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!moved) {
        setMoved(true);
        router.push({
          pathname: '/(onboarding)/splash3',
          params: { width, height, length, category: 'none' },
        });
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [moved]);

  const handleCategorySelect = (id: string) => {
    if (moved) return;
    setSelected(id);
    setMoved(true);
    router.push({
      pathname: '/(onboarding)/splash3',
      params: { width, height, length, category: id },
    });
  };

  const handleSkip = () => {
    if (moved) return;
    setMoved(true);
    router.push({
      pathname: '/(onboarding)/splash3',
      params: { width, height, length, category: 'none' },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.step}>Step 2</Text>
        <Text style={styles.title}>
          원하는 음식 카테고리를 선택하세요.
          {'\n'}
          <Text style={styles.subtitle}>
            Please select the food category you want
          </Text>
        </Text>
      </View>

      <View style={styles.categoryRow}>
        {categories.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => handleCategorySelect(item.id)}
            style={[
              styles.categoryItem,
              selected === item.id && styles.categorySelected,
            ]}
          >
            <Image source={item.icon} style={styles.icon} />
            <Text
              style={[
                styles.label,
                selected === item.id && styles.labelSelected,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={handleSkip} style={styles.skipBox}>
        <MaskedView maskElement={<Text style={styles.skipText}>SKIP</Text>}>
          <LinearGradient
            colors={['#81C784', '#4CAF50']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          >
            <Text style={[styles.skipText, { opacity: 0 }]}>SKIP</Text>
          </LinearGradient>
        </MaskedView>
      </Pressable>

      <View style={styles.indicatorContainer}>
        <View style={styles.indicatorDot} />
        <View style={styles.indicatorActive} />
        <View style={styles.indicatorDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
  },
  step: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
    marginBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 26,
    color: '#4B4B4B',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    width: '100%',
  },
  categoryItem: {
    alignItems: 'center',
    padding: 8,
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#F8F8F8',
  },
  categorySelected: {
    backgroundColor: '#E4F6E6',
    borderColor: '#4CAF50',
  },
  icon: {
    width: 48,
    height: 48,
    marginBottom: 6,
    borderRadius: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  labelSelected: {
    color: '#4CAF50',
    fontWeight: '700',
  },
  skipBox: {
    position: 'absolute',
    top: 728,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  indicatorContainer: {
    position: 'absolute',
    top: 765,
    flexDirection: 'row',
    gap: 6,
  },
  indicatorDot: {
    width: 10,
    height: 6,
    borderRadius: 20,
    backgroundColor: '#C8E6C9',
  },
  indicatorActive: {
    width: 30.77,
    height: 6,
    borderRadius: 20,
    backgroundColor: '#4CAF50',
  },
});
