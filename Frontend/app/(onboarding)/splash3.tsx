import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import RecommendImage from '../../assets/images/recommend.png';

// 카테고리 타입 정의
type Category = 'korean' | 'chinese' | 'japanese' | 'western' | 'etc' | 'none';

// 카테고리 매핑 객체
const categoryMap: Record<Category, string> = {
  korean: '한식',
  chinese: '중식',
  japanese: '일식',
  western: '양식',
  etc: '기타',
  none: '카테고리 미선택',
};

export default function Splash3Screen() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);

  const { width, height, length, category } = useLocalSearchParams<{
    width: string;
    height: string;
    length: string;
    category: Category;
  }>();

  const parsedCategory: Category = categoryMap.hasOwnProperty(category || '') ? (category as Category) : 'none';

  const BUTTON_DELAY = 2000;

  useEffect(() => {
    const timer = setTimeout(() => setShowButton(true), BUTTON_DELAY);
    return () => clearTimeout(timer);
  }, []);

  const handleFinish = () => {
    router.replace('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      {/* 상단 안내 */}
      <View style={styles.header}>
        <Text style={styles.step}>Step 3</Text>
        <Text style={styles.title}>
          나에게 딱 맞는 메뉴를 즐겨보세요!
          {'\n'}
          <Text style={styles.subtitle}>
            Enjoy a menu that’s just right for you
          </Text>
        </Text>
      </View>

      {/* 추천 안내 */}
      <Text style={styles.question}>이런 음식 어때요?</Text>

      <View style={styles.categoryContainer}>
        <View style={styles.categoryBadge}>
          <Text
            style={[
              styles.categoryText,
              parsedCategory === 'none' && styles.categoryNone,
            ]}
          >
            {categoryMap[parsedCategory]}
          </Text>
        </View>
      </View>

      {/* 추천 카드 */}
      <View style={styles.card}>
        <Image source={RecommendImage} style={styles.cardImage} />
        <Text style={styles.cardTitle}>초밥</Text>
        <Text style={styles.cardDesc}>
          입안에서 사르르 녹는 정통 일본식 초밥
        </Text>
      </View>

      {/* 시작 버튼 */}
      {showButton && (
        <TouchableOpacity style={styles.startButton} onPress={handleFinish}>
          <Text style={styles.startButtonText}>Let’s Start!</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F5FF',
    paddingHorizontal: 24,
    paddingTop: 80,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  step: {
    fontSize: 16,
    color: '#888',
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 28,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
  },
  categoryContainer: {
    marginBottom: 20,
  },
  categoryBadge: {
    backgroundColor: '#EDEBFB',
    paddingVertical: 6,
    paddingHorizontal: 18,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6C69AD',
  },
  categoryNone: {
    color: '#bbb',
  },
  card: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    alignItems: 'center',
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 32,
  },
  cardImage: {
    width: 280,
    height: 180,
    borderRadius: 12,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  startButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 40,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
