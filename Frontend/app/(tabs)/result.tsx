import MenuCard from '@/components/MenuCard';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type MenuItem = {
  name: string;
  category: string;
  price: number;
  restaurantName: string;
  imageUrl: string;
  placeId: string;
  lat: number;
  lng: number;
};

const toNum = (v: unknown) =>
  Number(String(v ?? '').replace(/[^0-9.]/g, '')) || 0;

const toCatArray = (v: unknown) => {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === 'string') {
    try {
      const arr = JSON.parse(v);
      if (Array.isArray(arr)) return arr.map(String);
    } catch {}
    return v ? [v] : []; 
  }
  return [];
};

export default function ResultScreen() {
  const router = useRouter(); 
  const [menuList, setMenuList] = useState<MenuItem[]>([]);
  const [userLocation, setUserLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [sortOption, setSortOption] = useState<'ai' | 'distance' | 'low' | 'high'>('ai');
  const [loading, setLoading] = useState(true);


  const params = useLocalSearchParams<{
    width?: string;
    height?: string;
    length?: string;
    categories?: string; 
    category?: string;  
  }>();

  const containerWidth  = toNum(params.width);
  const containerHeight = toNum(params.height);
  const containerLength = toNum(params.length);

  const rawCats = params.categories ?? params.category ?? '';
  const categories = toCatArray(rawCats);

  const categoryMap: Record<string, string> = {
    korean: '한식',
    chinese: '중식',
    japanese: '일식',
    western: '양식',
    etc: '기타',
    한식: '한식',
    중식: '중식',
    일식: '일식',
    양식: '양식',
    기타: '기타',
  };

  const categoriesForApi = categories
    .map((c) => {
      const key = String(c);
      return categoryMap[key.toLowerCase()] ?? categoryMap[key] ?? '';
    })
    .filter(Boolean);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.warn('위치 권한 거부됨');
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation(location.coords);
    })();
  }, []);

  useEffect(() => {
    setLoading(true);

    console.log('파라미터 원본:', params);
    console.log('파싱된 값:', {
      containerWidth, containerHeight, containerLength, categories, categoriesForApi
    });


    if (containerWidth <= 0 || containerHeight <= 0 || containerLength <= 0 || categoriesForApi.length === 0) {
      console.log('전송 스킵: 값 미완성', {
        containerWidth, containerHeight, containerLength, categoriesForApi
      });
      setLoading(false);
      router.replace('/noresult'); 
      return;
    }

    const payload = {
      container: {
        width: containerWidth,
        height: containerHeight,
        length: containerLength,
      },
      categories: categoriesForApi,
      sort: "default",
      page: 1,
      limit: 10,
      use_ai: true
    };

    console.log('전송할 데이터:', payload);

    fetch('https://menu-recommend.onrender.com/recommend/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            throw new Error(`API 오류: ${text}`);
          });
        }
        return res.json();
      })
      .then((data: any) => {
        console.log('받은 응답:', data);

        const list = Array.isArray(data?.recommendations)
          ? data.recommendations
          : Array.isArray(data?.results)
          ? data.results
          : [];

        const total = typeof data?.total === 'number' ? data.total : list.length;

        if (!list || list.length === 0 || total === 0) {
          setLoading(false);
          router.replace('/noresult'); 
          return;
        }

        const converted: MenuItem[] = list.map((item: any) => ({
          name: item.name ?? item.food_name ?? '메뉴명 없음',
          category: item.category || '기타',
          price: Number(item.price ?? 0),
          restaurantName: item.restaurantName ?? item.restaurant_name ?? '식당명 없음',
          imageUrl: String(item.image_url ?? item.img_url ?? item.imageUrl ?? ''), 
          placeId: String(item.place_id ?? item.placeId ?? ''),
          lat: Number(item.lat ?? 0),
          lng: Number(item.lng ?? 0),
        }));

        setMenuList(converted);
        setLoading(false);
      })
      .catch((err) => {
        console.error('API 호출 에러:', err.message);
        setLoading(false);
        router.replace('/noresult');
      });
  }, [
    containerWidth,
    containerHeight,
    containerLength,
    JSON.stringify(categoriesForApi),
  ]);

  const getSortedList = () => {
    if (!menuList || menuList.length === 0) return [];

    switch (sortOption) {
      case 'distance':
        if (!userLocation) return menuList;
        return [...menuList].sort((a, b) => {
          const distA = Math.hypot(a.lat - userLocation.latitude, a.lng - userLocation.longitude);
          const distB = Math.hypot(b.lat - userLocation.latitude, b.lng - userLocation.longitude);
          return distA - distB;
        });
      case 'low':
        return [...menuList].sort((a, b) => a.price - b.price);
      case 'high':
        return [...menuList].sort((a, b) => b.price - a.price);
      case 'ai':
      default:
        return menuList;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6C69AD" />
        <Text style={{ marginTop: 10 }}>추천 메뉴 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>이런 음식 어때요?</Text>

      {/* 정렬 옵션 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortRow}>
        <Pressable
          style={[styles.sortButton, sortOption === 'ai' && styles.activeButton]}
          onPress={() => setSortOption('ai')}
        >
          <Text style={styles.sortText}>AI 추천순</Text>
        </Pressable>
        <Pressable
          style={[styles.sortButton, sortOption === 'distance' && styles.activeButton]}
          onPress={() => setSortOption('distance')}
        >
          <Text style={styles.sortText}>거리순</Text>
        </Pressable>
        <Pressable
          style={[styles.sortButton, sortOption === 'low' && styles.activeButton]}
          onPress={() => setSortOption('low')}
        >
          <Text style={styles.sortText}>낮은 가격순</Text>
        </Pressable>
        <Pressable
          style={[styles.sortButton, sortOption === 'high' && styles.activeButton]}
          onPress={() => setSortOption('high')}
        >
          <Text style={styles.sortText}>높은 가격순</Text>
        </Pressable>
      </ScrollView>

      {/* 추천 결과 */}
      <ScrollView contentContainerStyle={styles.cardList}>
        {getSortedList().map((item, idx) => (
          <MenuCard key={idx} {...item} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F5FF',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#424242',
    marginBottom: 16,
  },
  sortRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  sortButton: {
    paddingVertical: 8,
    paddingHorizontal: 2,
    minWidth: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    marginRight: 10,
    height: 30,
    alignItems: 'center',
  },
  activeButton: {
    backgroundColor: '#81C784',
  },
  sortText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  cardList: {
    paddingBottom: 650,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});



