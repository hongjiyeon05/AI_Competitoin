import * as Linking from 'expo-linking';
import React from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Props = {
  name: string;
  category: string;
  price: number;
  restaurantName: string;
  imageUrl: string;
  placeId: string;
};

export default function MenuCard({
  name,
  category,
  price,
  restaurantName,
  imageUrl,
  placeId,
}: Props) {
  const handlePress = () => {
    if (!placeId) {
      Alert.alert('오류', 'place_id가 없습니다.');
      return;
    }

    const kakaoUrl = `https://place.map.kakao.com/${placeId}`;
    Linking.openURL(kakaoUrl);
  };

  return (
    <Pressable style={styles.card} onPress={handlePress}>
      <Image source={{ uri: imageUrl }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.price}>가격: {price.toLocaleString()}원</Text>
        <Text style={styles.restaurant}>식당: {restaurantName}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  price: {
    fontSize: 14,
    color: '#444',
  },
  restaurant: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
});
