import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform, Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

import restaurantData from '../../restaurant.json';

const kakaoHTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />  
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>카카오맵</title>
  <script type="text/javascript" src="YOUR_KAKAO_APP_KEY"></script>
  <style>
    html, body, #map {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }
    .info-window {
      font-size: 14px;
      padding: 8px;
      max-width: 250px;
      line-height: 1.4;
    }
    .place-name {
      font-weight: bold;
      margin-bottom: 4px;
      color: #333;
    }
    .place-address {
      margin-bottom: 8px;
      color: #666;
      font-size: 12px;
    }
    .kakao-link {
      display: inline-block;
      padding: 4px 8px;
      background-color: #fee500;
      color: #333;
      text-decoration: none;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
      cursor: pointer;
    }
    .kakao-link:hover {
      background-color: #fdd800;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    let map;
    let markers = [];

    console.log('카카오맵 스크립트 로드 완료');

    // 정보창 클릭 핸들러
    function handleKakaoMapClick(marker) {
      console.log('handleKakaoMapClick 호출:', marker);
      
      if (marker && marker.place_id) {
        const url = 'https://place.map.kakao.com/' + marker.place_id;
        console.log('생성된 URL:', url);
        
        const message = {
          type: 'OPEN_KAKAO_MAP',
          url: url,
          placeName: marker.name
        };
        
        console.log('전송할 메시지:', message);
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      } else {
        console.log('placeId가 없음:', marker);
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'ERROR',
          message: '카카오맵 링크 정보가 없습니다.'
        }));
      }
    }

    function initMap(markerData) {
      console.log('initMap 호출, 데이터:', markerData);
      
      if (!markerData || markerData.length === 0) {
        console.log('마커 데이터가 없음, 기본 지도 생성');
        const defaultPosition = new kakao.maps.LatLng(37.5666805, 126.9784147);
        const mapOption = {
          center: defaultPosition,
          level: 4
        };
        map = new kakao.maps.Map(document.getElementById("map"), mapOption);
        return;
      }

      const mapContainer = document.getElementById("map");
      const mapOption = {
        center: new kakao.maps.LatLng(markerData[0].lat, markerData[0].lng),
        level: 4
      };
      map = new kakao.maps.Map(mapContainer, mapOption);
      console.log('지도 생성 완료');

      // 기존 마커들 제거
      markers.forEach(m => m.setMap(null));
      markers = [];

      markerData.forEach((marker, index) => {
        console.log('마커 생성 중:', index, marker);
        
        const position = new kakao.maps.LatLng(marker.lat, marker.lng);
        const markerObj = new kakao.maps.Marker({
          position: position,
          map: map
        });

        // 정보창 내용 생성
        let content = '<div class="info-window">';
        content += '<div class="place-name">' + (marker.name || '장소명 없음') + '</div>';
        
        if (marker.address) {
          content += '<div class="place-address">' + marker.address + '</div>';
        }
        
        if (marker.place_id) {
          console.log('placeId 있음:', marker.place_id);
          // JSON 문자열을 안전하게 처리
          const markerJson = JSON.stringify(marker).replace(/"/g, '&quot;');
          content += '<a class="kakao-link" onclick="handleKakaoMapClick(' + markerJson + ')">카카오맵에서 보기</a>';
        } else {
          console.log('placeId 없음:', marker.name);
        }
        
        content += '</div>';
        
        console.log('생성된 content:', content);

        const infowindow = new kakao.maps.InfoWindow({
          content: content
        });

        // 마커 클릭 이벤트
        kakao.maps.event.addListener(markerObj, "click", function () {
          console.log('마커 클릭됨:', marker.name);
          
          // 다른 정보창들 닫기
          markers.forEach((m, i) => {
            if (m.infoWindow) {
              m.infoWindow.close();
            }
          });
          
          // 현재 정보창 열기
          infowindow.open(map, markerObj);
        });

        // 마커에 정보창 참조 저장
        markerObj.infoWindow = infowindow;
        markers.push(markerObj);
      });
      
      console.log('총 마커 개수:', markers.length);
    }

    // 메시지 리스너들
    document.addEventListener("message", function(event) {
      console.log('document message 받음:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          initMap(data);
        }
      } catch (e) {
        console.error("Error parsing data:", e);
      }
    });

    window.addEventListener("message", function(event) {
      console.log('window message 받음:', event.data);
      try {
        const data = JSON.parse(event.data);
        if (Array.isArray(data)) {
          initMap(data);
        }
      } catch (e) {
        console.error("Error parsing data:", e);
      }
    });

    // 전역 함수로 등록
    window.handleKakaoMapClick = handleKakaoMapClick;
    
    console.log('스크립트 초기화 완료');
  </script>
</body>
</html>`;

export default function ResultMapScreen() {
  const webViewRef = useRef(null);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [markerData, setMarkerData] = useState(null);

  // ⬇️ 노치/상태바 고려를 위한 상단 여백 계산 (패키지 없이)
  const TOP_INSET = Platform.select({ ios: 44, android: StatusBar.currentHeight ?? 0, default: 0 }) as number;
  const HEADER_BASE = 46;  // 상단 바 자체 높이(패딩 포함) 대략값
  const HEADER_TOTAL = TOP_INSET + HEADER_BASE;

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('권한 필요', '위치 권한이 필요합니다');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        
        const currentLocation = {
          lat: location.coords.latitude,
          lng: location.coords.longitude,
          name: '현재 위치',
          address: ''
          // 현재 위치는 placeId 없음 (카카오맵 링크 표시되지 않음)
        };

        setMarkerData([currentLocation, ...restaurantData]);
      } catch (error) {
        console.error('위치 정보 가져오기 실패:', error);
        Alert.alert('오류', '위치 정보를 가져올 수 없습니다');
        // 위치 정보 없이 레스토랑 데이터만 표시
        setMarkerData(restaurantData);
      }
    })();
  }, []);

  // ⬇️ 버튼: 현재 위치 다시 설정하기 (expo-location 재요청 후 전체 배열 재전송)
  const refreshLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('권한 필요', '위치 권한을 허용해 주세요.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const fresh = {
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
        name: '현재 위치',
        address: ''
      };

      const freshData = [fresh, ...restaurantData];
      setMarkerData(freshData);

      // WebView에 전체 마커 데이터 다시 전달 (HTML 변경 없이 동작)
      if (webViewRef.current) {
        setTimeout(() => {
          webViewRef.current.postMessage(JSON.stringify(freshData));
        }, 50);
      }
    } catch (e) {
      console.error('위치 재설정 실패:', e);
      Alert.alert('오류', '현재 위치를 가져오지 못했습니다.');
    }
  };

  const handleLoadEnd = () => {
    console.log('WebView 로드 완료');
    setIsLoading(false);
    if (webViewRef.current && markerData) {
      console.log('마커 데이터 전송 중:', markerData.length, '개');
      // 약간의 지연 후 데이터 전송 (WebView 완전 로드 보장)
      setTimeout(() => {
        webViewRef.current.postMessage(JSON.stringify(markerData));
      }, 100);
    }
  };

  const handleError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.error('WebView 에러:', nativeEvent);
    setIsError(true);
    setIsLoading(false);
  };

  const handleMessage = (event) => {
    console.log('React Native에서 메시지 받음:', event.nativeEvent.data);
    
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('파싱된 데이터:', data);
      
      switch (data.type) {
        case 'OPEN_KAKAO_MAP':
          console.log('카카오맵 열기 요청:', data.url);
          // place_id 기반 URL만 허용
          if (data.url && data.url.startsWith('https://place.map.kakao.com/')) {
            Linking.canOpenURL(data.url)
              .then(supported => {
                console.log('URL 지원 여부:', supported);
                if (supported) {
                  return Linking.openURL(data.url);
                } else {
                  throw new Error('URL을 열 수 없습니다');
                }
              })
              .then(() => {
                console.log('카카오맵 열기 성공');
              })
              .catch(err => {
                console.error('카카오맵 열기 실패:', err);
                Alert.alert('오류', `${data.placeName || '장소'}의 카카오맵을 열 수 없습니다.`);
              });
          } else {
            console.error('유효하지 않은 URL:', data.url);
            Alert.alert('오류', '유효하지 않은 카카오맵 링크입니다.');
          }
          break;
          
        case 'ERROR':
          console.error('WebView 에러:', data.message);
          Alert.alert('오류', data.message || '알 수 없는 오류가 발생했습니다.');
          break;
          
        default:
          console.log('알 수 없는 메시지 타입:', data.type);
      }
    } catch (error) {
      console.error('메시지 처리 오류:', error);
      console.error('원본 메시지:', event.nativeEvent.data);
    }
  };

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>지도를 불러오는데 실패했습니다.</Text>
        <Text style={styles.errorSubText}>네트워크 연결을 확인해주세요.</Text>
      </View>
    );
  }

  const EXTRA_TOP = 20;
  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: TOP_INSET + EXTRA_TOP }]}>
        <Text style={styles.headerTitle}></Text>
        <Pressable onPress={refreshLocation} style={styles.headerBtn}>
          <Text style={styles.headerBtnText}>현재 위치 다시 설정하기</Text>
        </Pressable>
      </View>

      {isLoading && (
        <View style={[styles.loadingContainer, { top: HEADER_TOTAL }]}>
          <Text style={styles.loadingText}>지도를 불러오는 중...</Text>
        </View>
      )}

      {/* WebView는 헤더 총높이만큼 패딩 */}
      <View style={{ flex: 1, paddingTop: HEADER_TOTAL }}>
        <WebView
          ref={webViewRef}
          source={{ html: kakaoHTML }}
          onError={handleError}
          onLoadEnd={handleLoadEnd}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={false}
          originWhitelist={['*']}
          allowsInlineMediaPlayback={true}
          mediaPlaybackRequiresUserAction={false}
          style={styles.webview}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
  },
  // ⬇️ 상단 바 스타일 추가
  header: {
    position: 'absolute',
    top: 0, left: 0, right: 0, zIndex: 20,
    backgroundColor: 'white',
    paddingHorizontal: 16, paddingVertical: 20,
    borderBottomWidth: 1, borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: { fontSize: 16, fontWeight: '600' },
  headerBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: '#ddd' },
  headerBtnText: { fontSize: 13 },

  loadingContainer: {
    position: 'absolute',
    left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
