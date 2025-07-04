# 🏷️ 기준정보관리시스템 v1.1.0 (통합 연동)

## 🌟 v3.0.0 통합 시스템 연동 완료
이제 기준정보관리시스템이 **Shopping Systems 통합 플랫폼**과 완전히 연동됩니다!

### 🚀 새로운 통합 기능
- **🔄 실시간 동기화**: 카테고리 변경 시 모든 연결된 시스템에 즉시 반영
- **🎯 자동 전파**: 품목정보관리, 물품신규등록 시스템에서 카테고리 자동 업데이트
- **🏠 통합 네비게이션**: 우상단 통합 대시보드 버튼으로 원클릭 이동
- **📱 실시간 알림**: 데이터 변경 시 즉시 알림 표시
- **🔗 스마트 연결**: 다른 시스템에서 이 카테고리를 자동으로 선택 가능

## 개요
기준정보관리 시스템은 카테고리와 업무코드를 통합 관리하는 웹 기반 시스템입니다. 4단계 계층형 카테고리 구조를 지원하며, Excel 파일 연동을 통해 대용량 카테고리 데이터를 효율적으로 관리할 수 있습니다.

**v3.0.0부터 모든 카테고리 데이터가 통합 시스템과 실시간으로 동기화됩니다.**

## 주요 기능

### 📁 카테고리 관리
- **4단계 계층구조**: 1차~4차 카테고리까지 체계적 관리
- **Excel 연동**: 카테고리.xlsx 파일 직접 업로드 또는 기본 경로 로드
- **계층형 트리뷰**: 접기/펼치기 기능으로 직관적인 탐색
- **실시간 검색**: 카테고리명으로 즉시 검색
- **통계 대시보드**: 각 레벨별 카테고리 개수 표시
- **CRUD 기능**: 카테고리 추가, 수정, 삭제 완전 지원 ⭐ NEW
- **팝업 모달**: 깔끔한 입력/수정 인터페이스
- **계층 구조 보호**: 하위 카테고리 존재 시 삭제 방지
- **중복 방지**: 동일한 카테고리 경로 중복 등록 차단

### 🏷️ 업무코드 관리
- **코드 체계 관리**: 업무별 코드 등록 및 관리
- **분류별 정리**: 업무 영역별 코드 분류
- **검색 및 필터링**: 효율적인 코드 조회

## 기술 스펙

### 프론트엔드
- **HTML5 + CSS3**: 반응형 웹 디자인
- **JavaScript ES6**: 모던 자바스크립트
- **ExcelJS**: Excel 파일 처리
- **Local Storage**: 브라우저 로컬 저장소 활용

### 지원 브라우저
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 파일 구조
```
기준정보관리시스템/
├── index.html              # 메인 페이지
├── category-manage.html     # 카테고리 관리
├── code-manage.html         # 업무코드 관리 (예정)
├── assets/
│   ├── js/
│   │   └── libs/
│   │       └── exceljs.min.js
│   └── css/
├── docs/
│   ├── README.md           # 이 파일
│   └── user-guide.md       # 사용자 가이드
└── config/
    └── app-config.json     # 설정 파일
```

## 설치 및 실행

### 1. 환경 준비
- 웹 서버 환경 또는 로컬 파일 시스템
- 모던 웹 브라우저

### 2. 실행 방법
```bash
# 웹 서버 환경
http://localhost/기준정보관리시스템/

# 로컬 파일 시스템
file:///path/to/기준정보관리시스템/index.html
```

## 데이터 연동

### 카테고리 데이터 형식
Excel 파일(.xlsx) 형식으로 다음과 같은 구조를 지원합니다:

| Group ID | category_name_1st | category_name_2nd | category_name_3rd | category_name_4th |
|----------|-------------------|-------------------|-------------------|-------------------|
| 1        | 생활플러스         | 홈&카서비스        | 세탁/청소          | 세탁수거           |
| 2        | 생활플러스         | 홈&카서비스        | 세탁/청소          | 입주/이사청소       |

### 로컬스토리지 구조
```javascript
// 카테고리 데이터
localStorage.setItem('categories', JSON.stringify([
  {
    groupId: 1,
    category1st: "생활플러스",
    category2nd: "홈&카서비스", 
    category3rd: "세탁/청소",
    category4th: "세탁수거"
  }
]));
```

## 다른 시스템과의 연동

### 품목정보관리시스템 연동
- **데이터 공유**: 로컬스토리지를 통한 카테고리 데이터 공유
- **실시간 동기화**: 카테고리 업데이트 시 즉시 반영

### 물품신규등록시스템 연동
- **카테고리 선택**: 등록 시 카테고리 자동완성
- **데이터 일관성**: 통일된 카테고리 체계 적용

## 성능 최적화

### 대용량 데이터 처리
- **가상 스크롤링**: 수천 개 카테고리 효율적 렌더링
- **지연 로딩**: 필요 시에만 하위 카테고리 로드
- **메모리 관리**: 불필요한 DOM 요소 제거

### 사용자 경험
- **빠른 검색**: 인덱스 기반 실시간 필터링
- **직관적 UI**: 트리 구조 시각화
- **반응형 디자인**: 모바일/태블릿 지원

## 문제 해결

### 자주 발생하는 문제

1. **Excel 파일 로드 실패**
   ```
   문제: 카테고리.xlsx 파일을 찾을 수 없음
   해결: "Excel 파일 업로드" 버튼으로 직접 업로드
   ```

2. **브라우저 호환성**
   ```
   문제: 구버전 브라우저에서 동작 안 함
   해결: Chrome 80+ 또는 Firefox 75+ 사용 권장
   ```

3. **로컬스토리지 용량 초과**
   ```
   문제: 대용량 카테고리 데이터로 인한 저장 실패
   해결: 브라우저 캐시 정리 후 재시도
   ```

4. **카테고리 삭제 실패**
   ```
   문제: "하위 카테고리가 존재하여 삭제할 수 없습니다" 메시지
   해결: 하위 카테고리를 먼저 삭제한 후 상위 카테고리 삭제
   ```

5. **중복 카테고리 등록 오류**
   ```
   문제: "동일한 카테고리가 이미 존재합니다" 메시지
   해결: 카테고리 경로 확인 후 다른 이름으로 등록
   ```

## 개발자 정보

### 버전 정보
- **현재 버전**: v1.1.0 ⭐ UPDATED
- **최종 업데이트**: 2025-07-01
- **개발 환경**: HTML5, JavaScript ES6, ExcelJS

### 업데이트 내역
#### v1.1.0 (2025-07-01)
- ✅ **카테고리 CRUD 기능 추가**
  - 카테고리 추가: 팝업 모달을 통한 새 카테고리 생성
  - 카테고리 수정: 각 노드별 개별 수정 가능
  - 카테고리 삭제: 하위 카테고리 검증 후 안전한 삭제
- ✅ **사용자 인터페이스 개선**
  - 호버 시 액션 버튼 표시
  - 모달 기반 입력 폼
  - 삭제 확인 다이얼로그
- ✅ **데이터 무결성 강화**
  - 중복 카테고리 등록 방지
  - 계층 구조 일관성 검증
  - 자동 Group ID 생성

#### v1.0.0 (초기 버전)
- 기본 카테고리 관리 기능
- Excel 파일 연동
- 계층형 트리뷰

### 라이선스
이 프로젝트는 교육용 목적으로 개발되었습니다.

### 지원 및 문의
시스템 사용 중 문제가 발생하면 user-guide.md를 참조하거나 개발팀에 문의하시기 바랍니다.