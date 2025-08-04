import os
import pandas as pd
import numpy as np
import chardet
import warnings
from datetime import datetime
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer

warnings.filterwarnings("ignore")

# =============================================================================
# 상수 정의
# =============================================================================

# 용기 크기 분류 기준
CONTAINER_THRESHOLDS = {
    'SMALL_VOLUME': 300,
    'LARGE_VOLUME': 1000,
    'MIN_CATEGORY_SIZE': 10
}

# 기본값 설정
DEFAULT_VALUES = {
    'POPULARITY_SCORE': 5.0,
    'MENU_SIZE': 15.0,
    'HIGH_UTILIZATION': 70.0
}

# 음식 유연성 분류
FLEXIBLE_FOODS = [
    # 밥류 & 볶음류
    '비빔밥', '볶음밥', '알밥', '잡채밥', '제육볶음', '매콤낙지비빔밥',
    
    # 샐러드류
    '샐러드', '파스타샐러드', '리코타치즈샐러드', '스테이크샐러드', '타코샐러드',
    
    # 죽 & 국물류
    '죽', '곱도리탕', '닭곱새', '우도리탕', '닭도리탕',
    
    # 떡볶이류 (소스형)
    '떡볶이', '로제떡볶이', '마라떡볶이', '치즈떡볶이', '국물떡볶이', '짜장떡볶이',
    '라볶이', '고구마떡볶이', '차돌박이떡볶이',
    
    # 마라탕 & 중식 볶음류
    '마라탕', '마라샹궈', '꿔바로우',
    
    # 면류 (국물/소스)
    '스파게티', '파스타', '분짜', '쌀국수', '팟타이', '포', '마제소바',
    '짬뽕', '짜장면', '해물짬뽕',
    
    # 카레류
    '카레',
    
    # 튀김 & 기타
    '오뎅', '탕수육', '닭발', '소테'
]

RIGID_FOODS = [
    # 샌드위치 & 바게트류
    '에그마요', '치아바타', '햄치즈에그', '잠봉뵈르', '바게트',
    
    # 반미류
    '반미',
    
    # 스테이크 정식류
    '함박스테끼', '돈테끼', '치킨난반', '차슈동',
    
    # 조밥 (초밥)류
    '조밥', '초밥',
    
    # 김밥류
    '김밥',
    
    # 피자류
    '피자', '라자냐',
    
    # 냉면류
    '냉면', '물냉면', '비빔냉면', '불냉면',
    
    # 돈까스류
    '돈까스', '카츠',
    
    # 덮밥류 (고정 형태)
    '가츠동', '특규동', '오야꼬동', '덮밥',
    
    # 오므라이스류
    '오므라이스',
    
    # 밥버거류
    '밥버거',
    
    # 인도 커리류 (고정 형태)
    '탄두리', '치킨티카', '빈달루', '코르마', '마크니', '거라이',
    
    # 기타 고정 형태
    '팬치즈'
]

# =============================================================================
# CSV 로딩 함수
# =============================================================================

def load_csv_robust(filepath):
    """다양한 인코딩을 시도하여 CSV 파일을 안전하게 로드"""
    try:
        with open(filepath, 'rb') as f:
            raw_data = f.read()
            encoding = chardet.detect(raw_data)['encoding']
        return pd.read_csv(filepath, encoding=encoding, on_bad_lines='skip')
    except Exception as e:
        print(f"CSV 로드 실패 ({filepath}): {e}")
        encodings = ['utf-8', 'utf-8-sig', 'cp949', 'euc-kr', 'latin1']
        for enc in encodings:
            try:
                return pd.read_csv(filepath, encoding=enc, on_bad_lines='skip')
            except:
                continue
        raise Exception(f"모든 인코딩 시도 실패: {filepath}")

# =============================================================================
# 메인 AI 추천 시스템 클래스
# =============================================================================

class AIFoodRecommendationSystem:
    """
    AI 강화 음식 추천 시스템
    
    점수 구성:
    - 용기 적합성: 50% (물리적 제약, 가장 중요)
    - AI 클러스터링: 30% (같은 카테고리 내 메뉴 그룹 분석)  
    - 인기도: 20% (popularity_score 활용)
    
    입력: 용기 크기 + 카테고리
    출력: AI 추천 점수 순으로 정렬된 메뉴 10개
    """
    
    def __init__(self, csv_dir="."):
        """
        Args:
            csv_dir: CSV 파일들이 있는 디렉토리 경로
        """
        self.csv_dir = csv_dir
        
        # CSV 파일 로드
        self._load_data()
        
        # 데이터 전처리
        self._preprocess_data()
        
        # AI 모델 초기화
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=30,        # 작은 데이터에 맞게
            ngram_range=(1, 2),     # 1글자, 2글자 조합
            analyzer='char'         # 한글 특성상 글자 단위
        )
        self.scaler = StandardScaler()
        self.kmeans_models = {}     # 카테고리별 클러스터링 모델
        
        # AI 특성 구축
        self._build_ai_features()
        
        print("AI 음식 추천 시스템 준비 완료!")
        print(f"   총 메뉴: {len(self.menus_df)}개")
        print(f"   총 식당: {len(self.restaurants_df)}개")
        print(f"   AI 클러스터: 카테고리별로 생성됨")
    
    def _load_data(self):
        """CSV 파일들 로드"""
        menus_path = os.path.join(self.csv_dir, "final_menus_data.csv")
        restaurants_path = os.path.join(self.csv_dir, "restaurants.csv")
        
        self.menus_df = load_csv_robust(menus_path)
        self.restaurants_df = load_csv_robust(restaurants_path)
        
        print(f"데이터 로드 완료: 메뉴 {len(self.menus_df)}개, 식당 {len(self.restaurants_df)}개")
    
    def _preprocess_data(self):
        """데이터 전처리"""
        # 숫자형 컬럼 변환
        numeric_cols = ['price', 'width', 'length', 'height', 'popularity_score']
        for col in numeric_cols:
            if col in self.menus_df.columns:
                self.menus_df[col] = pd.to_numeric(self.menus_df[col], errors='coerce')
        
        # 결측값 처리
        self.menus_df['popularity_score'] = self.menus_df['popularity_score'].fillna(DEFAULT_VALUES['POPULARITY_SCORE'])
        self.menus_df['price'] = self.menus_df['price'].fillna(self.menus_df['price'].median())
        
        # 크기 정보는 모든 메뉴에 있다고 가정 (결측값 처리 불필요)
        
        # 부피 계산
        self.menus_df['volume'] = (self.menus_df['width'] * 
                                  self.menus_df['length'] * 
                                  self.menus_df['height'])
        
        # 음식 유연성 분류
        self.menus_df['food_flexibility'] = self.menus_df['menu_name'].apply(self._classify_food_flexibility)
        
        print("데이터 전처리 완료")
    
    def _classify_food_flexibility(self, menu_name):
        """메뉴명 기반으로 음식 유연성 분류"""
        if pd.isna(menu_name):
            return 'flexible'
        
        menu_lower = str(menu_name).lower()
        
        # 먼저 비유연한 음식 체크 (더 구체적이므로)
        for rigid_keyword in RIGID_FOODS:
            if rigid_keyword in menu_lower:
                return 'rigid'
        
        # 유연한 음식 체크
        for flexible_keyword in FLEXIBLE_FOODS:
            if flexible_keyword in menu_lower:
                return 'flexible'
        
        # 기본값은 유연한 음식으로 분류
        return 'flexible'
    
    def _build_ai_features(self):
        """카테고리별 AI 클러스터링 모델 구축"""
        print("AI 클러스터링 모델 구축 중...")
        
        categories = self.menus_df['category'].unique()
        self.cluster_info = {}
        
        for category in categories:
            category_menus = self.menus_df[self.menus_df['category'] == category].copy()
            
            if len(category_menus) < 2:  # 메뉴가 너무 적으면 클러스터링 안 함
                self.cluster_info[category] = {
                    'clusters': {0: {'indices': list(category_menus.index), 'avg_popularity': category_menus['popularity_score'].mean(), 'size': len(category_menus), 'examples': category_menus['menu_name'].tolist()}}, 
                    'model': None,
                    'n_clusters': 1
                }
                continue
            
            # 해당 카테고리의 메뉴명을 벡터화
            menu_texts = category_menus['menu_name'].fillna('').astype(str)
            text_vectors = self.tfidf_vectorizer.fit_transform(menu_texts)
            
            # 수치 특성 추가
            numeric_features = ['price', 'volume', 'popularity_score']
            available_features = [col for col in numeric_features if col in category_menus.columns]
            
            if available_features:
                numeric_data = self.scaler.fit_transform(category_menus[available_features].fillna(0))
                
                # 텍스트 + 수치 특성 결합
                if text_vectors.shape[1] > 0:
                    combined_features = np.hstack([text_vectors.toarray(), numeric_data])
                else:
                    combined_features = numeric_data
            else:
                combined_features = text_vectors.toarray()
            
            # 클러스터 수 결정 (메뉴 수에 따라 적응적으로)
            n_menus = len(category_menus)
            n_clusters = min(max(2, n_menus // 5), 4)  # 최소 2개, 최대 4개 클러스터
            
            # K-Means 클러스터링
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(combined_features)
            
            # 클러스터별 인기도 계산
            clusters = {}
            for cluster_id in range(n_clusters):
                cluster_indices = category_menus.index[cluster_labels == cluster_id].tolist()
                cluster_menus_data = category_menus.loc[cluster_indices]
                
                avg_popularity = cluster_menus_data['popularity_score'].mean()
                clusters[cluster_id] = {
                    'indices': cluster_indices,
                    'avg_popularity': avg_popularity,
                    'size': len(cluster_indices),
                    'examples': cluster_menus_data['menu_name'].head(2).tolist()
                }
            
            self.cluster_info[category] = {
                'clusters': clusters,
                'model': kmeans,
                'n_clusters': n_clusters
            }
            
            print(f"   {category}: {n_clusters}개 클러스터 생성 (메뉴 {n_menus}개)")
    
    def calculate_container_utilization(self, user_width, user_length, user_height, 
                                      menu_width, menu_length, menu_height, menu_name, food_flexibility):
        """용기 활용률 계산 - 음식 유연성에 따라 다른 로직 적용"""
        
        user_volume = user_width * user_length * user_height
        menu_volume = menu_width * menu_length * menu_height
        
        # 기본 부피 체크
        if menu_volume > user_volume:
            return 0
        
        if food_flexibility == 'flexible':
            # 유연한 음식: 부피만 체크
            basic_utilization = (menu_volume / user_volume) * 100
            
            # 유연한 음식 보너스 (10%)
            return min(100, basic_utilization * 1.1)
        
        else:  # rigid
            # 비유연한 음식: 가로, 세로, 높이 모두 엄격하게 체크
            if (menu_width > user_width or 
                menu_length > user_length or 
                menu_height > user_height):
                return 0  # 완전 탈락
            
            # 크기가 맞으면 기본 활용률 계산
            basic_utilization = (menu_volume / user_volume) * 100
            return basic_utilization
    
    def calculate_ai_cluster_score(self, menu_index, category):
        """AI 클러스터링 기반 점수 계산"""
        if category not in self.cluster_info:
            return 50  # 기본 점수
        
        category_info = self.cluster_info[category]
        clusters = category_info['clusters']
        
        # 해당 메뉴가 속한 클러스터 찾기
        menu_cluster_id = None
        for cluster_id, cluster_data in clusters.items():
            if menu_index in cluster_data['indices']:
                menu_cluster_id = cluster_id
                break
        
        if menu_cluster_id is None:
            return 50  # 기본 점수
        
        # 클러스터의 평균 인기도를 점수로 변환
        cluster_data = clusters[menu_cluster_id]
        avg_popularity = cluster_data['avg_popularity']
        
        # 클러스터 크기도 고려 (큰 클러스터 = 대표적인 음식)
        cluster_size = cluster_data['size']
        size_bonus = min(20, cluster_size * 5)  # 최대 20점 보너스
        
        # 인기도 점수 (0-10 -> 0-80 변환) + 크기 보너스
        cluster_score = min(100, (avg_popularity * 8) + size_bonus)
        
        return cluster_score
    
    def get_ai_recommendations(self, user_width, user_length, user_height, category, top_k=10):
        """
        AI 추천 메인 함수
        
        Args:
            user_width, user_length, user_height: 용기 크기
            category: 음식 카테고리 ('한식', '중식', '일식', '양식', '기타')
            top_k: 추천할 메뉴 개수 (기본 10개)
        
        Returns:
            dict: 추천 결과 및 분석 정보
        """
        # 입력 검증
        if user_width <= 0 or user_length <= 0 or user_height <= 0:
            return {"status": "error", "message": "용기 크기는 0보다 커야 합니다."}
        
        # 카테고리 필터링
        available_categories = self.menus_df['category'].unique()
        if category not in available_categories:
            return {
                "status": "error", 
                "message": f"사용 가능한 카테고리: {list(available_categories)}"
            }
        
        filtered_menus = self.menus_df[self.menus_df['category'] == category].copy()
        
        if len(filtered_menus) == 0:
            return {"status": "error", "message": f"{category} 카테고리에 메뉴가 없습니다."}
        
        recommendations = []
        
        for idx, menu in filtered_menus.iterrows():
            # 1. 용기 적합성 계산 (50%)
            container_utilization = self.calculate_container_utilization(
                user_width, user_length, user_height,
                menu['width'], menu['length'], menu['height'],
                menu['menu_name'], menu['food_flexibility']
            )
            
            if container_utilization <= 0:
                continue  # 용기에 안 맞으면 제외
            
            # 2. AI 클러스터링 점수 (30%)
            ai_cluster_score = self.calculate_ai_cluster_score(idx, category)
            
            # 3. 인기도 점수 (20%)
            popularity_score = min(100, menu['popularity_score'] * 10)  # 0-10 -> 0-100
            
            # 4. 최종 AI 추천 점수 계산
            final_ai_score = (
                container_utilization * 0.5 +    # 50%
                ai_cluster_score * 0.3 +          # 30%
                popularity_score * 0.2            # 20%
            )
            
            # 5. 식당 정보 매칭
            restaurant = self.restaurants_df[
                self.restaurants_df['restaurant_id'] == menu['restaurant_id']
            ]
            restaurant_name = restaurant['name'].iloc[0] if len(restaurant) > 0 else "정보없음"
            
            recommendations.append({
                "menu_id": menu['menu_id'],
                "menu_name": menu['menu_name'],
                "category": menu['category'],
                "price": int(menu['price']),
                "restaurant_name": restaurant_name,
                "container_utilization": round(container_utilization, 1),
                "ai_cluster_score": round(ai_cluster_score, 1),
                "popularity_score": round(popularity_score, 1),
                "final_ai_score": round(final_ai_score, 1),
                "food_flexibility": menu['food_flexibility'],
                "menu_size": {
                    "width": menu['width'],
                    "length": menu['length'],
                    "height": menu['height']
                }
            })
        
        # AI 점수 기준으로 정렬
        recommendations.sort(key=lambda x: x['final_ai_score'], reverse=True)
        
        # 결과 반환
        return {
            "status": "success",
            "message": f"AI가 분석한 {category} 추천 메뉴",
            "ai_method": "K-Means 클러스터링 + 음식 유연성 분류 + 가중치 조합",
            "scoring_system": {
                "container_fit": "50%",
                "ai_clustering": "30%", 
                "popularity": "20%"
            },
            "analysis_summary": {
                "total_candidates": len(recommendations),
                "avg_ai_score": round(np.mean([r['final_ai_score'] for r in recommendations[:top_k]]), 1) if recommendations else 0,
                "avg_container_utilization": round(np.mean([r['container_utilization'] for r in recommendations[:top_k]]), 1) if recommendations else 0,
                "flexible_count": len([r for r in recommendations[:top_k] if r['food_flexibility'] == 'flexible']),
                "rigid_count": len([r for r in recommendations[:top_k] if r['food_flexibility'] == 'rigid']),
                "price_range": {
                    "min": min([r['price'] for r in recommendations[:top_k]]) if recommendations else 0,
                    "max": max([r['price'] for r in recommendations[:top_k]]) if recommendations else 0
                }
            },
            "cluster_insights": self._get_cluster_insights(category),
            "recommendations": recommendations[:top_k]
        }
    
    def _get_cluster_insights(self, category):
        """클러스터 분석 결과 요약"""
        if category not in self.cluster_info:
            return {"message": "클러스터 정보 없음"}
        
        category_info = self.cluster_info[category]
        clusters = category_info['clusters']
        
        insights = {}
        for cluster_id, cluster_data in clusters.items():
            insights[f"클러스터_{cluster_id}"] = {
                "메뉴수": cluster_data['size'],
                "평균인기도": round(cluster_data['avg_popularity'], 1),
                "대표메뉴": cluster_data['examples']
            }
        
        return insights
    
    def get_system_info(self):
        """시스템 정보 반환 (디버깅/분석용)"""
        category_stats = {}
        for category in self.menus_df['category'].unique():
            category_menus = self.menus_df[self.menus_df['category'] == category]
            category_stats[category] = {
                "메뉴수": len(category_menus),
                "평균가격": int(category_menus['price'].mean()),
                "평균인기도": round(category_menus['popularity_score'].mean(), 1),
                "클러스터수": self.cluster_info.get(category, {}).get('n_clusters', 0),
                "유연한음식": len(category_menus[category_menus['food_flexibility'] == 'flexible']),
                "비유연한음식": len(category_menus[category_menus['food_flexibility'] == 'rigid'])
            }
        
        return {
            "총메뉴수": len(self.menus_df),
            "총식당수": len(self.restaurants_df), 
            "카테고리별통계": category_stats,
            "AI기법": "K-Means 클러스터링 + 음식 유연성 분류",
            "점수체계": "용기적합성(50%) + AI클러스터링(30%) + 인기도(20%)"
        }

# =============================================================================
# 사용 예시 및 테스트
# =============================================================================

if __name__ == "__main__":
    print("AI 음식 추천 시스템 테스트")
    
    try:
        # AI 시스템 초기화 (CSV 파일이 같은 디렉토리에 있다고 가정)
        ai_recommender = AIFoodRecommendationSystem()
        
        # 시스템 정보 확인
        system_info = ai_recommender.get_system_info()
        print("\n시스템 정보:")
        print(f"   총 메뉴: {system_info['총메뉴수']}개")
        print(f"   총 식당: {system_info['총식당수']}개")
        print(f"   AI 기법: {system_info['AI기법']}")
        print(f"   점수 체계: {system_info['점수체계']}")
        
        # 카테고리별 통계
        print("\n카테고리별 통계:")
        for category, stats in system_info['카테고리별통계'].items():
            print(f"   {category}: {stats['메뉴수']}개 (유연:{stats['유연한음식']}, 비유연:{stats['비유연한음식']})")
            print(f"             평균 {stats['평균가격']:,}원, 클러스터 {stats['클러스터수']}개")
        
        # 추천 테스트
        print("\n" + "="*60)
        print("AI 추천 테스트")
        
        # 테스트 케이스: 20×15×8cm 용기에 한식 추천
        result = ai_recommender.get_ai_recommendations(
            user_width=20,
            user_length=15, 
            user_height=8,
            category='한식',
            top_k=5
        )
        
        if result['status'] == 'success':
            print(f"\n{result['message']}")
            print(f"AI 방법: {result['ai_method']}")
            print(f"점수 체계: {result['scoring_system']}")
            
            print(f"\n분석 요약:")
            summary = result['analysis_summary']
            print(f"   후보 메뉴: {summary['total_candidates']}개")
            print(f"   평균 AI 점수: {summary['avg_ai_score']}")
            print(f"   평균 용기 활용률: {summary['avg_container_utilization']}%")
            print(f"   유연한 음식: {summary['flexible_count']}개, 비유연한 음식: {summary['rigid_count']}개")
            print(f"   가격 범위: {summary['price_range']['min']:,}원 ~ {summary['price_range']['max']:,}원")
            
            print(f"\nAI 추천 결과 (상위 {len(result['recommendations'])}개):")
            for i, menu in enumerate(result['recommendations'], 1):
                print(f"\n{i}. {menu['menu_name']} ({menu['restaurant_name']})")
                print(f"   가격: {menu['price']:,}원")
                print(f"   용기 활용률: {menu['container_utilization']}%")
                print(f"   AI 클러스터 점수: {menu['ai_cluster_score']}")
                print(f"   인기도 점수: {menu['popularity_score']}")
                print(f"   최종 AI 점수: {menu['final_ai_score']}")
                print(f"   음식 유형: {menu['food_flexibility']}")
            
            print(f"\n클러스터 분석:")
            for cluster_name, cluster_info in result['cluster_insights'].items():
                if isinstance(cluster_info, dict) and '메뉴수' in cluster_info:
                    print(f"   {cluster_name}: {cluster_info['메뉴수']}개 메뉴, 평균인기도 {cluster_info['평균인기도']}")
                    print(f"      대표메뉴: {', '.join(cluster_info['대표메뉴'])}")
        else:
            print(f"오류: {result['message']}")
    
    except Exception as e:
        print(f"시스템 오류: {e}")
        print("CSV 파일들이 같은 디렉토리에 있는지 확인해주세요!")
        print("   - final_menus_data.csv")
        print("   - restaurants.csv")