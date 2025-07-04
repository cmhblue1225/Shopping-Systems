# 기준정보관리 시스템 사용자 가이드

## 목차
1. [시작하기](#시작하기)
2. [카테고리 관리](#카테고리-관리)
3. [카테고리 CRUD 기능](#카테고리-crud-기능) ⭐ NEW
4. [업무코드 관리](#업무코드-관리)
5. [시스템 연동](#시스템-연동)
6. [FAQ](#faq)

---

## 시작하기

### 첫 실행
1. 웹 브라우저에서 `index.html` 파일을 엽니다
2. 메인 화면에서 시스템 현황을 확인합니다
3. 원하는 관리 기능을 선택합니다

### 메인 화면 구성
- **📁 카테고리 관리**: 계층형 카테고리 관리
- **🏷️ 업무코드 관리**: 업무별 코드 체계 관리
- **📊 시스템 현황**: 등록된 데이터 통계

---

## 카테고리 관리

### Excel 파일로 카테고리 불러오기

#### 방법 1: 파일 업로드 (권장)
1. **📁 Excel 파일 업로드** 버튼 클릭
2. 파일 선택 대화상자에서 `카테고리.xlsx` 선택
3. 자동으로 데이터 분석 및 로드
4. 성공 메시지 확인

#### 방법 2: 기본 경로에서 로드
1. **🔄 기본 경로에서 불러오기** 버튼 클릭
2. 시스템이 `../카테고리.xlsx` 경로에서 파일 탐색
3. 파일이 없으면 업로드 방법 안내

### Excel 파일 형식 요구사항
```
컬럼 구조:
- A열: Group ID (숫자)
- B열: category_name_1st (1차 카테고리)
- C열: category_name_2nd (2차 카테고리)  
- D열: category_name_3rd (3차 카테고리)
- E열: category_name_4th (4차 카테고리)

예시:
1 | 생활플러스 | 홈&카서비스 | 세탁/청소 | 세탁수거
2 | 생활플러스 | 홈&카서비스 | 세탁/청소 | 입주/이사청소
```

### 카테고리 탐색하기

#### 계층형 트리 뷰
- **▶ 접기**: 하위 카테고리 숨김
- **▼ 펼치기**: 하위 카테고리 표시
- **● 말단 노드**: 최종 카테고리 (하위 없음)

#### 검색 기능
1. 검색창에 카테고리명 입력
2. **🔍 검색** 버튼 클릭 또는 Enter
3. 매칭되는 카테고리만 표시
4. **✖️ 초기화**로 전체 보기 복원

### 통계 정보 확인
- **총 카테고리**: 전체 카테고리 개수
- **1차~4차 카테고리**: 각 레벨별 개수
- **📊 통계 보기**: 팝업으로 상세 통계 표시

### 데이터 내보내기
1. **📤 카테고리 내보내기** 버튼 클릭
2. JSON 형식으로 다운로드
3. 백업 및 다른 시스템 이전 시 활용

---

## 카테고리 CRUD 기능 ⭐ NEW

### 카테고리 추가하기

#### 새 카테고리 등록
1. **➕ 카테고리 추가** 버튼 클릭
2. 모달 창에서 정보 입력:
   - **1차 카테고리**: 필수 입력 항목
   - **2차 카테고리**: 선택 사항
   - **3차 카테고리**: 선택 사항  
   - **4차 카테고리**: 선택 사항
3. **저장** 버튼으로 등록 완료

#### 주의사항
- **중복 방지**: 동일한 카테고리 경로는 등록할 수 없음
- **Group ID**: 자동으로 생성됨
- **계층 구조**: 상위 카테고리가 있어야 하위 카테고리 생성 가능

### 카테고리 수정하기

#### 개별 수정
1. 수정할 카테고리에 마우스 호버
2. **✏️ 수정** 버튼 클릭
3. 모달에서 정보 수정:
   - 기존 데이터가 자동으로 로드됨
   - 원하는 항목만 수정
4. **저장** 버튼으로 수정 완료

#### 수정 범위
- **모든 레벨**: 1차~4차 카테고리 모두 수정 가능
- **실시간 반영**: 수정 후 즐시 화면에 반영
- **데이터 일관성**: 자동으로 계층 구조 유지

### 카테고리 삭제하기

#### 안전한 삭제
1. 삭제할 카테고리에 마우스 호버
2. **🗑️ 삭제** 버튼 클릭
3. 확인 모달에서 삭제 정보 확인:
   - 카테고리 경로 표시
   - Group ID 확인
4. **삭제** 버튼으로 최종 확인

#### 삭제 제한 사항
- **하위 카테고리 있음**: 하위 카테고리가 있으면 삭제 불가
- **삭제 순서**: 말단 카테고리부터 삭제 후 상위 삭제
- **복구 불가**: 삭제 후 되돌릴 수 없음 (백업 권장)

### CRUD 기능 활용 팁

#### 효율적인 관리
- **일괄 생성**: Excel로 대량 데이터 로드 후 개별 수정
- **단계별 생성**: 1차부터 순차적으로 카테고리 구축
- **내보내기 백업**: 수정 전 현재 상태 백업

#### 사용자 인터페이스
- **호버 효과**: 노드에 마우스를 올리면 액션 버튼 표시
- **모달 닫기**: ESC 키 또는 외부 영역 클릭으로 닫기
- **키보드 내비게이션**: Tab과 Enter로 폼 요소 이동

---

## 업무코드 관리

### 코드 등록
1. **코드 추가** 버튼 클릭
2. 필수 정보 입력:
   - 코드값
   - 코드명
   - 업무 분류
   - 설명
3. **저장** 버튼으로 등록 완료

### 코드 분류별 관리
- **분류별 탭**: 업무 영역별 코드 그룹화
- **일괄 관리**: 동일 분류 코드 일괄 수정
- **코드 중복 검사**: 자동 중복 방지

### 코드 검색 및 필터링
- **코드값 검색**: 정확한 코드로 검색
- **코드명 검색**: 부분 매칭 지원
- **분류별 필터**: 특정 업무 영역만 표시

---

## 시스템 연동

### 품목정보관리시스템과 연동

#### 카테고리 데이터 공유
1. 기준정보관리에서 카테고리 로드
2. 품목정보관리 → 품목 관리
3. **📁 카테고리 불러오기** 클릭
4. 셀렉트 박스에 카테고리 목록 표시

#### 실시간 동기화
- 카테고리 추가 시 자동 반영
- **🔄 카테고리 새로고침**으로 수동 동기화

### 물품신규등록시스템과 연동

#### 자동완성 기능
1. 기준정보관리에서 카테고리 설정
2. 물품등록 시 카테고리 선택창에서 활용
3. 품목코드 입력 시 연관 카테고리 자동 표시

---

## FAQ

### Q1. Excel 파일을 업로드했는데 아무것도 표시되지 않습니다.
**A**: Excel 파일 형식을 확인해주세요.
- 첫 번째 워크시트에 데이터가 있어야 함
- 2번째 행부터 데이터 시작 (1행은 헤더)
- B열(1차 카테고리)에 반드시 값이 있어야 함

### Q2. 카테고리가 너무 많아서 화면이 느려집니다.
**A**: 다음 방법을 시도해보세요.
- 검색 기능으로 필요한 카테고리만 표시
- 브라우저 탭을 새로고침하여 메모리 정리
- 불필요한 카테고리는 Excel에서 미리 정리

### Q3. 다른 시스템에서 카테고리를 불러올 수 없습니다.
**A**: 연동 순서를 확인해주세요.
1. 기준정보관리에서 카테고리 로드 완료
2. 다른 시스템에서 "카테고리 불러오기" 실행
3. 브라우저가 같아야 함 (로컬스토리지 공유)

### Q4. 업로드한 카테고리가 사라졌습니다.
**A**: 로컬스토리지 문제일 수 있습니다.
- 브라우저 개발자도구 → Application → Local Storage 확인
- 'categories' 키에 데이터가 있는지 확인
- 없으면 Excel 파일 재업로드 필요

### Q5. 모바일에서도 사용할 수 있나요?
**A**: 네, 반응형 디자인을 지원합니다.
- 스마트폰: 세로 화면 최적화
- 태블릿: 가로/세로 모두 지원
- 터치 제스처로 트리 탐색 가능

### Q6. 카테고리 데이터를 백업하고 싶습니다.
**A**: 내보내기 기능을 사용하세요.
1. **📤 카테고리 내보내기** 클릭
2. JSON 파일 다운로드
3. 파일을 안전한 곳에 보관

### Q7. 여러 명이 동시에 사용할 수 있나요?
**A**: 현재는 개별 브라우저 기반입니다.
- 각 사용자별로 독립적인 로컬 데이터
- 공유가 필요하면 Excel 파일로 주고받기
- 향후 서버 연동 기능 추가 예정

### Q8. 시스템이 느려지는 경우 해결 방법은?
**A**: 성능 최적화 방법:
- 브라우저 캐시 정리
- 불필요한 탭 닫기
- 대용량 카테고리는 분할하여 관리
- Chrome 브라우저 사용 권장

### Q9. 카테고리를 수정/삭제하려는데 버튼이 보이지 않습니다. ⭐ NEW
**A**: 호버 효과를 확인해주세요.
- 카테고리 노드에 마우스 커서를 올려야 버튼 표시
- 모바일에서는 터치로 버튼 표시
- 브라우저 에러가 있으면 페이지 새로고침

### Q10. 카테고리를 삭제하려는데 "하위 카테고리가 존재한다"는 메시지가 나옵니다. ⭐ NEW
**A**: 계층 구조를 유지하기 위한 안전 장치입니다.
1. 말단 카테고리(4차)부터 삭제
2. 순차적으로 상위 카테고리 삭제
3. 하위 카테고리가 모두 삭제된 후 상위 삭제 가능

### Q11. 새로 추가한 카테고리가 다른 시스템에 반영되지 않습니다. ⭐ NEW
**A**: 다른 시스템에서 카테고리 새로고침을 해주세요.
- 품목정보관리 → **📁 카테고리 불러오기** 클릭
- 물품신규등록 → **🔄 카테고리 새로고침** 클릭
- 또는 브라우저 페이지 새로고침 (F5)

### Q12. 중복된 카테고리를 등록하려는데 오류가 나습니다. ⭐ NEW
**A**: 시스템의 데이터 무결성 보호 기능입니다.
- 동일한 1차-2차-3차-4차 카테고리 조합은 등록 불가
- 카테고리 명칭을 살짝 다르게 하거나 다른 레벨에 등록
- 기존 카테고리를 수정하여 활용

---

## 지원 및 문의

### 기술 지원
- 시스템 오류 발생 시 브라우저 개발자도구의 콘솔 확인
- 에러 메시지와 함께 문의하면 빠른 해결 가능

### 개선 요청
- 새로운 기능 제안 환영
- 사용자 인터페이스 개선 의견 수렴

**연락처**: 개발팀 (시스템 관리자)

### 도움말 요청
- CRUD 기능 사용에 어려움이 있으면 언제든 문의
- 대량 데이터 처리 시 성능 최적화 지원
- 다른 시스템과의 연동 문제 해결 지원

---

## 최신 업데이트 (v1.1.0)

### 새로운 기능
- ➕ **카테고리 추가**: 모달 기반 새 카테고리 생성
- ✏️ **카테고리 수정**: 각 노드별 개별 수정 가능
- 🗑️ **카테고리 삭제**: 하위 카테고리 검증 후 안전한 삭제
- 🔒 **데이터 무결성**: 중복 방지 및 계층 구조 유지

### 개선된 사용자 경험
- 호버 시 액션 버튼 표시
- 모달 기반 직관적 인터페이스
- 삭제 확인 단계로 실수 방지
- ESC 키 또는 외부 클릭으로 모달 닫기