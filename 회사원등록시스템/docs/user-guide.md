# 회사원등록시스템 사용자 가이드

## 🚀 빠른 시작

### 첫 번째 회사원 등록
1. `index.html` 파일을 브라우저에서 열기
2. "회사원 등록" 버튼 클릭 → 정보 입력 → 서명 → 저장/출력

---

## 📝 회사원 정보 등록 가이드 (`register.html`)

### 1. 기본 정보 입력
- **등록일자**: 회사원 등록 날짜를 선택합니다.
- **등록번호**: 고유한 등록 번호를 입력합니다.
- **등록자**: 등록을 수행하는 담당자 이름을 입력합니다.

### 2. 회사원 정보 입력 (최대 8명)

| 필드 | 설명 | 예시 |
|---|---|---|
| **사원번호** | 회사 내 고유한 사원 번호 | EMP001 |
| **성명** | 회사원의 실명 | 김철수 |
| **부서** | 소속 부서명 | 개발팀 |
| **직책** | 직급 또는 역할 | 팀장 |
| **입사일** | 회사 입사 날짜 | 2020-03-15 |
| **전화번호** | 연락 가능한 전화번호 | 010-1234-5678 |
| **이메일** | 업무용 이메일 주소 | kim.cs@company.com |
| **주소** | 거주지 주소 | 서울시 강남구 테헤란로 123 |
| **상세주소** | 상세 주소 정보 | 현대빌딩 10층 |
| **우편번호** | 우편번호 | 06234 |
| **급여등급** | 급여 등급 | A급 |

### 3. 추가 정보
- **비고**: 회사원 등록 시 주의사항 및 특이사항을 입력합니다.
- **등록 담당자**: 등록 업무를 담당한 직원의 이름
- **등록 담당자 연락처**: 등록 담당자의 연락처
- **등록 담당자 이메일**: 등록 담당자의 이메일 주소

---

## ✍️ 전자 서명 기능

### 서명란 구성
1. **등록 요청자 서명**: 등록을 요청한 담당자의 서명
2. **등록 검토자 서명**: 등록 내용을 검토한 담당자의 서명
3. **등록 승인자 서명**: 최종 승인한 관리자의 서명

### 서명 입력 방법
- 서명 패드 영역에 마우스나 터치로 서명을 그립니다.
- "지우기" 버튼으로 서명을 초기화할 수 있습니다.

---

## 💾 데이터 관리 기능

### 📁 다중 저장 시스템
```
💾 저장 버튼 클릭
↓
🏷️ 저장할 이름 입력 (자동 생성된 이름 사용 가능)
↓
✅ 여러 개의 서로 다른 회사원 등록 데이터 저장
✅ 모든 입력 데이터 + 서명 이미지 저장
✅ 저장일시 자동 기록
✅ 브라우저 종료 후에도 보존
```

**저장되는 데이터:**
- 기본 정보 (등록일자, 등록번호, 등록자 등)
- 회사원 정보 (최대 8명)
- 비고 내용
- 등록 담당자 정보
- 3개 서명 이미지 데이터
- 저장일시 (자동 기록)

**저장 이름 자동 생성:**
- 형식: `회사원등록_YYYYMMDD_HHMM`
- 예시: `회사원등록_20250630_1030`

### 📂 다중 불러오기
```
📂 불러오기 버튼 클릭
↓
📋 저장된 데이터 목록 표시
↓
✅ 원하는 데이터 선택하여 불러오기
↓
✅ 모든 입력 필드 복원
✅ 서명 이미지 복원
```

**목록 관리 기능:**
- **이름 표시**: 저장 시 지정한 이름
- **날짜 표시**: 저장일시 자동 표시
- **선택 불러오기**: 원하는 데이터만 선택 가능
- **개별 삭제**: 불필요한 데이터 개별 삭제

---

## 📊 출력 및 인쇄

### 엑셀 출력 (.xlsx)
- **파일명**: `회사원등록.xlsx`
- **포함 내용**: 
  - 모든 입력 데이터
  - 서명 이미지 (PNG 형식)
- **호환성**: Microsoft Excel, Google Sheets, LibreOffice

### 웹 인쇄
- **용지 설정**: A4 가로 방향 권장
- **포함 내용**: 모든 데이터 + 서명
- **최적화**: 브라우저 인쇄에 맞춰 스타일 조정
- **배경 그래픽**: 인쇄 설정에서 활성화 권장

---

## 🔍 회사원 조회 가이드 (`search.html`)

### 1. 검색 필터 사용
다양한 조건으로 저장된 회사원 등록 데이터를 검색할 수 있습니다.

| 필터 항목 | 설명 | 예시 |
|---|---|---|
| **등록일자** | 특정 기간 내 등록된 데이터 검색 | 2025-01-01 ~ 2025-01-31 |
| **등록번호** | 특정 등록번호로 검색 (부분 일치 가능) | EMP001 |
| **등록자** | 등록자 이름으로 검색 (부분 일치 가능) | 인사관리자 |
| **사원명** | 사원 이름으로 검색 (부분 일치 가능) | 김철수 |
| **부서** | 부서명으로 검색 (부분 일치 가능) | 개발팀 |
| **직책** | 직책으로 검색 (부분 일치 가능) | 팀장 |
| **급여등급** | 급여등급으로 검색 (부분 일치 가능) | A급 |
| **등록담당자** | 등록 담당자 이름으로 검색 (부분 일치 가능) | 김인사 |

💡 **자동 완성**: 검색 필드에 입력 시 기존 데이터에 기반한 자동 완성 목록이 표시됩니다. 목록에서 선택하여 정확한 검색을 할 수 있습니다.

### 2. 검색 실행 및 초기화
- **🔍 검색 버튼**: 입력된 필터 조건에 따라 데이터를 검색하고 결과를 표시합니다.
- **🔄 초기화 버튼**: 모든 검색 필드를 초기 상태로 되돌립니다.

### 3. 검색 결과 확인
- **결과 목록**: 검색 조건에 맞는 회사원 등록 데이터 목록이 테이블 형태로 표시됩니다.
- **총 건수**: 검색된 총 데이터 수가 상단에 표시됩니다.
- **테이블 항목**: 등록일자, 등록번호, 등록자, 총 사원수, 주요 부서, 등록담당자, 담당자 연락처, 저장일시 등 핵심 정보가 요약되어 있습니다.

### 4. 검색 결과 작업
- **☑️ 전체 선택/해제**: 테이블의 모든 항목을 선택하거나 해제합니다.
- **📊 선택 항목 엑셀 출력**: 선택된 등록 데이터를 하나의 엑셀 파일로 출력합니다.
- **🖨️ 선택 항목 인쇄**: 선택된 등록 데이터를 인쇄합니다.
- **📄 상세보기**: 각 행의 "상세" 버튼을 클릭하면 해당 등록 데이터의 모든 상세 내용을 모달 창에서 확인할 수 있습니다.
  - 상세 보기 모달 내에서도 해당 등록 데이터만 엑셀 출력 또는 인쇄가 가능합니다.
- **🗑️ 삭제**: 각 행의 "삭제" 버튼을 클릭하면 해당 등록 데이터를 로컬 저장소에서 영구적으로 삭제합니다.

---

## 🎲 더미 데이터 생성 가이드 (`index.html`)

- **🎲 더미 데이터 생성 버튼**: 메인 페이지에서 이 버튼을 클릭하면 테스트 및 시연을 위해 30개의 가상 회사원 등록 데이터가 로컬 저장소에 추가됩니다.
- **주의**: 기존에 저장된 데이터와 함께 추가되므로, 테스트 목적으로만 사용하고 실제 중요한 데이터와 혼합되지 않도록 주의하십시오.

---

## 🌐 오프라인 사용

### 완전 오프라인 지원
- ✅ **인터넷 불필요**: 모든 라이브러리 로컬 저장
- ✅ **독립 실행**: 단일 HTML 파일로 동작
- ✅ **이식성**: USB, 네트워크 드라이브에서 실행 가능

### 포함된 라이브러리
- jQuery 3.6.0 (89KB)
- jSignature (전자 서명)
- ExcelJS (925KB)
- FileSaver.js (3KB)

---

## ⚙️ 설정 및 커스터마이징

### 기본값 변경
`data/sample-data.json` 파일에서 다음 항목 수정 가능:
- 기본 회사원 데이터
- 부서 목록
- 직책 목록
- 급여 등급 목록

### 스타일 커스터마이징
`assets/css/styles.css` 파일에서 디자인 수정 가능

---

## 🛠️ 문제 해결

### 일반적인 문제

#### ❌ 서명이 저장되지 않음
- **해결**: JavaScript 활성화 확인
- **방법**: 브라우저 설정 → 보안 → JavaScript 허용

#### ❌ 엑셀 파일 다운로드 실패
- **해결**: 팝업 차단 해제
- **방법**: 주소창 옆 팝업 차단 아이콘 클릭 → 허용

#### ❌ 인쇄 시 서명이 보이지 않음
- **해결**: 배경 그래픽 인쇄 활성화
- **방법**: 인쇄 설정 → 더보기 → 배경 그래픽 체크

#### ❌ 저장된 데이터가 사라짐
- **원인**: 브라우저 데이터 삭제, 시크릿 모드 사용
- **해결**: 일반 모드에서 사용, 브라우저 데이터 보존

#### ❌ 저장된 데이터 목록이 비어있음
- **원인**: 아직 저장한 데이터가 없거나 브라우저 데이터가 삭제됨
- **해결**: 새로운 데이터를 저장하거나 백업된 데이터 복원

### 브라우저별 최적 설정

#### Chrome (권장)
- 모든 기능 완벽 지원
- 서명 품질 최고

#### Firefox
- 전체 기능 지원
- 인쇄 시 페이지 설정 확인

#### Safari
- iOS/macOS에서 터치 서명 우수
- 팝업 차단 해제 필요

#### Edge
- Windows 환경에서 안정적
- 엑셀 파일 호환성 우수

---

## 📱 모바일 사용

### 지원 기능
- ✅ 터치 서명
- ✅ 모든 입력 기능
- ✅ 임시저장/불러오기
- ⚠️ 엑셀 출력 (앱 설치 필요)

### 권장 사용법
1. **세로 모드**: 입력 작업
2. **가로 모드**: 서명 작성
3. **확대**: 세밀한 서명을 위해 화면 확대 활용

---

## 💡 활용 팁

### 효율적인 작업 흐름
1. **템플릿 활용**: 자주 사용하는 회사원 정보는 별도 저장하여 재사용
2. **체계적 저장**: 프로젝트별, 날짜별로 구분하여 저장
3. **일괄 작업**: 여러 회사원 등록 시 기본 정보 복사 활용
4. **검토 단계**: 출력 전 미리보기로 내용 확인

### 데이터 관리 전략
- **명명 규칙**: 일관된 저장 이름 규칙 사용 (예: 부서명_날짜)
- **정기 정리**: 불필요한 저장 데이터 정기적으로 삭제
- **백업 관리**: 중요한 등록 데이터는 엑셀로 추가 저장
- **분류 관리**: 부서별, 월별로 데이터를 체계적으로 분류