from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import traceback
from ai_model import AIFoodRecommendationSystem

app = Flask(__name__)
CORS(app)  # CORS 허용

# AI 추천 시스템 초기화 (서버 시작시 한번만)
try:
    print("AI 추천 시스템 초기화 중...")
    recommender = AIFoodRecommendationSystem()
    print("서버 준비 완료!")
except Exception as e:
    print(f"AI 시스템 초기화 실패: {e}")
    recommender = None

# HTML 템플릿 (기존 HTML과 동일하지만 실제 API 호출)
HTML_TEMPLATE = '''
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AI 음식 추천 시스템 (실제 연동)</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        
        .container {
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        h1 {
            text-align: center;
            color: #333;
            margin-bottom: 30px;
        }
        
        .status {
            text-align: center;
            padding: 10px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        
        .status.connected {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        
        .status.error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        
        .input-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        
        .input-group {
            margin-bottom: 15px;
        }
        
        label {
            display: block;
            margin-bottom: 5px;
            font-weight: bold;
            color: #555;
        }
        
        input, select {
            width: 100%;
            padding: 10px;
            border: 2px solid #ddd;
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        
        input:focus, select:focus {
            border-color: #007bff;
            outline: none;
        }
        
        .size-inputs {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 10px;
        }
        
        .recommend-btn {
            width: 100%;
            padding: 15px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 18px;
            font-weight: bold;
            cursor: pointer;
            transition: background-color 0.3s;
        }
        
        .recommend-btn:hover {
            background: #0056b3;
        }
        
        .recommend-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        
        .results {
            margin-top: 30px;
        }
        
        .menu-item {
            background: white;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
            transition: transform 0.2s;
        }
        
        .menu-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }
        
        .menu-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;
        }
        
        .menu-name {
            font-size: 18px;
            font-weight: bold;
            color: #333;
        }
        
        .ai-score {
            background: #28a745;
            color: white;
            padding: 4px 8px;
            border-radius: 15px;
            font-size: 14px;
            font-weight: bold;
        }
        
        .menu-details {
            color: #666;
            font-size: 14px;
            margin-bottom: 5px;
        }
        
        .menu-extra {
            color: #888;
            font-size: 12px;
        }
        
        .restaurant-name {
            color: #007bff;
            font-weight: bold;
        }
        
        .error {
            background: #f8d7da;
            color: #721c24;
            padding: 15px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
        
        .stats {
            background: #e7f3ff;
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            color: #0056b3;
        }
        
        .ai-info {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            color: #856404;
            padding: 10px;
            border-radius: 5px;
            margin-bottom: 15px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 AI 음식 추천 시스템 (실제 연동)</h1>
        
        <div id="connection-status" class="status">
            연결 상태 확인 중...
        </div>
        
        <div class="input-section">
            <div class="ai-info">
                ⚡ 실제 AI 모델(K-Means 클러스터링)과 연동되어 동작합니다. 용기 적합성(50%) + AI 클러스터링(30%) + 인기도(20%) 점수로 추천됩니다.
            </div>
            
            <div class="input-group">
                <label>용기 크기 (cm)</label>
                <div class="size-inputs">
                    <input type="number" id="width" placeholder="가로" min="1" max="50" value="20">
                    <input type="number" id="length" placeholder="세로" min="1" max="50" value="15">
                    <input type="number" id="height" placeholder="높이" min="1" max="20" value="8">
                </div>
            </div>
            
            <div class="input-group">
                <label for="category">음식 카테고리</label>
                <select id="category">
                    <option value="">카테고리를 선택하세요</option>
                    <option value="한식">한식</option>
                    <option value="중식">중식</option>
                    <option value="일식">일식</option>
                    <option value="양식">양식</option>
                    <option value="기타">기타</option>
                </select>
            </div>
            
            <button class="recommend-btn" onclick="getRecommendations()">
                🍽️ AI 메뉴 추천받기
            </button>
        </div>
        
        <div id="results" class="results"></div>
    </div>

    <script>
        // 서버 연결 상태 확인
        async function checkConnection() {
            try {
                const response = await fetch('/api/health');
                const data = await response.json();
                
                const statusDiv = document.getElementById('connection-status');
                if (data.status === 'ok') {
                    statusDiv.className = 'status connected';
                    statusDiv.textContent = `✅ AI 시스템 연결됨 (메뉴 ${data.total_menus}개, 식당 ${data.total_restaurants}개)`;
                } else {
                    throw new Error('AI 시스템 오류');
                }
            } catch (error) {
                const statusDiv = document.getElementById('connection-status');
                statusDiv.className = 'status error';
                statusDiv.textContent = '❌ AI 시스템 연결 실패 - 서버를 확인해주세요';
            }
        }
        
        // 실제 AI 추천 함수
        async function getRecommendations() {
            const width = parseInt(document.getElementById('width').value);
            const length = parseInt(document.getElementById('length').value);
            const height = parseInt(document.getElementById('height').value);
            const category = document.getElementById('category').value;
            const resultsDiv = document.getElementById('results');
            
            // 입력 검증
            if (!width || !length || !height || !category) {
                resultsDiv.innerHTML = '<div class="error">모든 필드를 입력해주세요.</div>';
                return;
            }
            
            if (width <= 0 || length <= 0 || height <= 0) {
                resultsDiv.innerHTML = '<div class="error">용기 크기는 0보다 커야 합니다.</div>';
                return;
            }
            
            // 로딩 표시
            resultsDiv.innerHTML = '<div class="loading">🤖 AI가 실제 데이터를 분석하고 있습니다...</div>';
            
            try {
                // 실제 AI 모델 API 호출
                const response = await fetch('/api/recommendations', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        width: width,
                        length: length,
                        height: height,
                        category: category
                    })
                });
                
                const result = await response.json();
                
                if (result.status === 'success') {
                    displayResults(result, width, length, height, category);
                } else {
                    resultsDiv.innerHTML = `<div class="error">오류: ${result.message}</div>`;
                }
                
            } catch (error) {
                console.error('API 호출 오류:', error);
                resultsDiv.innerHTML = '<div class="error">서버와 통신할 수 없습니다. ai_model.py가 실행 중인지 확인해주세요.</div>';
            }
        }
        
        function displayResults(result, width, length, height, category) {
            const resultsDiv = document.getElementById('results');
            const recommendations = result.recommendations;
            const summary = result.analysis_summary;
            
            if (recommendations.length === 0) {
                resultsDiv.innerHTML = '<div class="error">조건에 맞는 메뉴가 없습니다.</div>';
                return;
            }
            
            const containerVolume = width * length * height;
            
            let html = `
                <div class="stats">
                    📊 AI 분석 결과: ${width}×${length}×${height}cm 용기 (${containerVolume}cm³) | ${category} 카테고리<br>
                    🤖 ${result.ai_method}<br>
                    📈 총 후보: ${summary.total_candidates}개 | 평균 AI점수: ${summary.avg_ai_score} | 유연한음식: ${summary.flexible_count}개 | 비유연한음식: ${summary.rigid_count}개
                </div>
            `;
            
            recommendations.forEach((menu, index) => {
                html += `
                    <div class="menu-item">
                        <div class="menu-header">
                            <div class="menu-name">${index + 1}. ${menu.menu_name}</div>
                            <div class="ai-score">AI점수 ${menu.final_ai_score}</div>
                        </div>
                        <div class="menu-details">
                            <span class="restaurant-name">${menu.restaurant_name}</span> | 
                            ${menu.price.toLocaleString()}원 | 
                            용기 활용률 ${menu.container_utilization}%
                        </div>
                        <div class="menu-extra">
                            AI 클러스터: ${menu.ai_cluster_score} | 인기도: ${menu.popularity_score} | 
                            음식유형: ${menu.food_flexibility} | 크기: ${menu.menu_size.width}×${menu.menu_size.length}×${menu.menu_size.height}cm
                        </div>
                    </div>
                `;
            });
            
            resultsDiv.innerHTML = html;
        }
        
        // 페이지 로드시 연결 상태 확인
        window.onload = function() {
            checkConnection();
        };
        
        // 엔터키로 검색
        document.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                getRecommendations();
            }
        });
    </script>
</body>
</html>
'''

@app.route('/')
def index():
    """메인 페이지"""
    return render_template_string(HTML_TEMPLATE)

@app.route('/api/health', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    if recommender is None:
        return jsonify({
            'status': 'error', 
            'message': 'AI 시스템이 초기화되지 않았습니다'
        }), 500
    
    try:
        system_info = recommender.get_system_info()
        return jsonify({
            'status': 'ok',
            'total_menus': system_info['총메뉴수'],
            'total_restaurants': system_info['총식당수'],
            'ai_method': system_info['AI기법']
        })
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """AI 추천 API"""
    if recommender is None:
        return jsonify({
            'status': 'error', 
            'message': 'AI 시스템이 초기화되지 않았습니다'
        }), 500
    
    try:
        data = request.json
        width = data.get('width')
        length = data.get('length') 
        height = data.get('height')
        category = data.get('category')
        
        # 입력 검증
        if not all([width, length, height, category]):
            return jsonify({
                'status': 'error',
                'message': '모든 필드를 입력해주세요'
            }), 400
        
        # AI 추천 실행
        result = recommender.get_ai_recommendations(
            user_width=width,
            user_length=length, 
            user_height=height,
            category=category,
            top_k=10
        )
        
        return jsonify(result)
        
    except Exception as e:
        print(f"API 오류: {e}")
        print(traceback.format_exc())
        return jsonify({
            'status': 'error',
            'message': f'서버 오류: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 AI 음식 추천 시스템 서버 시작")
    print("📱 브라우저에서 http://localhost:5000 접속")
    print("="*50)
    
    app.run(debug=True, host='0.0.0.0', port=5000)