// jSignature 패드 3개 초기화 
$(function(){ 
  $("#signature-request").jSignature({ width: 120, height: 60, color: "#111", lineWidth: 2, backgroundColor: "#fff" }); 
  $("#signature-review").jSignature({ width: 120, height: 60, color: "#111", lineWidth: 2, backgroundColor: "#fff" }); 
  $("#signature-approve").jSignature({ width: 120, height: 60, color: "#111", lineWidth: 2, backgroundColor: "#fff" }); 

  $("#clear-signature-request").click(function() { 
    $("#signature-request").jSignature("reset"); 
  }); 

  $("#clear-signature-review").click(function() { 
    $("#signature-review").jSignature("reset"); 
  }); 

  $("#clear-signature-approve").click(function() { 
    $("#signature-approve").jSignature("reset"); 
  }); 
}); 

// ==============================
// 다중 저장/불러오기 기능
// ==============================

function showSaveDialog() {
  document.getElementById('saveDialog').style.display = 'flex';
  const now = new Date();
  const defaultName = `회사원등록_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  document.getElementById('saveNameInput').value = defaultName;
}

function closeSaveDialog() {
  document.getElementById('saveDialog').style.display = 'none';
}

function saveData() {
  const saveName = document.getElementById('saveNameInput').value.trim();
  if (!saveName) {
    alert('저장할 이름을 입력해주세요.');
    return;
  }

  const formData = {
    regDate: document.getElementById('regDate').value,
    regNo: document.getElementById('regNo').value,
    regUser: document.getElementById('regUser').value,
    employees: [],
    regManager: document.getElementById('regManager').value,
    regContact: document.getElementById('regContact').value,
    regEmail: document.getElementById('regEmail').value,
    remark: document.getElementById('remark').value,
    signatures: {},
    savedAt: new Date().toISOString()
  };

  // 회사원 정보 수집
  for(let i=0; i<8; i++) {
    const empNo = document.getElementById(`empNo${i}`)?.value || '';
    const empName = document.getElementById(`empName${i}`)?.value || '';
    const empDept = document.getElementById(`empDept${i}`)?.value || '';
    const empPosition = document.getElementById(`empPosition${i}`)?.value || '';
    const empHireDate = document.getElementById(`empHireDate${i}`)?.value || '';
    const empPhone = document.getElementById(`empPhone${i}`)?.value || '';
    const empEmail = document.getElementById(`empEmail${i}`)?.value || '';
    const empAddr = document.getElementById(`empAddr${i}`)?.value || '';
    const empAddrDetail = document.getElementById(`empAddrDetail${i}`)?.value || '';
    const empZip = document.getElementById(`empZip${i}`)?.value || '';
    const empGrade = document.getElementById(`empGrade${i}`)?.value || '';

    if(empNo || empName || empDept) {
      formData.employees.push({
        empNo, empName, empDept, empPosition, empHireDate, 
        empPhone, empEmail, empAddr, empAddrDetail, empZip, empGrade
      });
    }
  }

  // 서명 데이터 수집 (다른 시스템들과 동일한 방식)
  try {
    formData.signatures.request = $("#signature-request").jSignature("getData", "image");
    formData.signatures.review = $("#signature-review").jSignature("getData", "image");
    formData.signatures.approve = $("#signature-approve").jSignature("getData", "image");
  } catch(e) {
    console.warn('서명 데이터 수집 중 오류:', e);
  }

  const savedDataList = JSON.parse(localStorage.getItem('회사원등록_저장목록') || '{}');
  savedDataList[saveName] = formData;
  localStorage.setItem('회사원등록_저장목록', JSON.stringify(savedDataList));

  alert('저장되었습니다.');
  closeSaveDialog();
}

function showLoadDialog() {
  document.getElementById('loadDialog').style.display = 'flex';
  loadSavedDataList();
}

function closeLoadDialog() {
  document.getElementById('loadDialog').style.display = 'none';
}

function loadSavedDataList() {
  const savedDataList = JSON.parse(localStorage.getItem('회사원등록_저장목록') || '{}');
  const listContainer = document.getElementById('savedDataList');

  if (Object.keys(savedDataList).length === 0) {
    listContainer.innerHTML = '<div class="empty-list">저장된 데이터가 없습니다.</div>';
    return;
  }

  let html = '';
  for (const [name, data] of Object.entries(savedDataList)) {
    const savedDate = new Date(data.savedAt).toLocaleString('ko-KR');
    html += `
      <div class="saved-item">
        <div class="saved-item-info">
          <div class="saved-item-name">${name}</div>
          <div class="saved-item-date">저장일시: ${savedDate}</div>
        </div>
        <div class="saved-item-actions">
          <button class="load-btn" onclick="loadSavedData('${name}')">불러오기</button>
          <button class="delete-btn" onclick="deleteSavedData('${name}')">삭제</button>
        </div>
      </div>
    `;
  }
  listContainer.innerHTML = html;
}

function loadSavedData(name) {
  const savedDataList = JSON.parse(localStorage.getItem('회사원등록_저장목록') || '{}');
  const data = savedDataList[name];
  
  if (!data) {
    alert('저장된 데이터를 찾을 수 없습니다.');
    return;
  }

  // 기본 정보 복원
  document.getElementById('regDate').value = data.regDate || '';
  document.getElementById('regNo').value = data.regNo || '';
  document.getElementById('regUser').value = data.regUser || '';
  document.getElementById('regManager').value = data.regManager || '';
  document.getElementById('regContact').value = data.regContact || '';
  document.getElementById('regEmail').value = data.regEmail || '';
  document.getElementById('remark').value = data.remark || '';

  // 회사원 정보 복원
  for (let i = 0; i < 8; i++) {
    if (data.employees[i]) {
      const emp = data.employees[i];
      if(document.getElementById(`empNo${i}`)) document.getElementById(`empNo${i}`).value = emp.empNo || '';
      if(document.getElementById(`empName${i}`)) document.getElementById(`empName${i}`).value = emp.empName || '';
      if(document.getElementById(`empDept${i}`)) document.getElementById(`empDept${i}`).value = emp.empDept || '';
      if(document.getElementById(`empPosition${i}`)) document.getElementById(`empPosition${i}`).value = emp.empPosition || '';
      if(document.getElementById(`empHireDate${i}`)) document.getElementById(`empHireDate${i}`).value = emp.empHireDate || '';
      if(document.getElementById(`empPhone${i}`)) document.getElementById(`empPhone${i}`).value = emp.empPhone || '';
      if(document.getElementById(`empEmail${i}`)) document.getElementById(`empEmail${i}`).value = emp.empEmail || '';
      if(document.getElementById(`empAddr${i}`)) document.getElementById(`empAddr${i}`).value = emp.empAddr || '';
      if(document.getElementById(`empAddrDetail${i}`)) document.getElementById(`empAddrDetail${i}`).value = emp.empAddrDetail || '';
      if(document.getElementById(`empZip${i}`)) document.getElementById(`empZip${i}`).value = emp.empZip || '';
      if(document.getElementById(`empGrade${i}`)) document.getElementById(`empGrade${i}`).value = emp.empGrade || '';
    } else {
      // 빈 필드 초기화
      if(document.getElementById(`empNo${i}`)) document.getElementById(`empNo${i}`).value = '';
      if(document.getElementById(`empName${i}`)) document.getElementById(`empName${i}`).value = '';
      if(document.getElementById(`empDept${i}`)) document.getElementById(`empDept${i}`).value = '';
      if(document.getElementById(`empPosition${i}`)) document.getElementById(`empPosition${i}`).value = '';
      if(document.getElementById(`empHireDate${i}`)) document.getElementById(`empHireDate${i}`).value = '';
      if(document.getElementById(`empPhone${i}`)) document.getElementById(`empPhone${i}`).value = '';
      if(document.getElementById(`empEmail${i}`)) document.getElementById(`empEmail${i}`).value = '';
      if(document.getElementById(`empAddr${i}`)) document.getElementById(`empAddr${i}`).value = '';
      if(document.getElementById(`empAddrDetail${i}`)) document.getElementById(`empAddrDetail${i}`).value = '';
      if(document.getElementById(`empZip${i}`)) document.getElementById(`empZip${i}`).value = '';
      if(document.getElementById(`empGrade${i}`)) document.getElementById(`empGrade${i}`).value = '';
    }
  }

  // 서명 데이터 복원 (다른 시스템들과 동일한 방식)
  if(data.signatures) {
    try {
      if(data.signatures.request && data.signatures.request[1]) {
        $("#signature-request").jSignature("reset");
        $("#signature-request").jSignature("setData", "data:" + data.signatures.request[0] + "," + data.signatures.request[1]);
      }
      if(data.signatures.review && data.signatures.review[1]) {
        $("#signature-review").jSignature("reset");
        $("#signature-review").jSignature("setData", "data:" + data.signatures.review[0] + "," + data.signatures.review[1]);
      }
      if(data.signatures.approve && data.signatures.approve[1]) {
        $("#signature-approve").jSignature("reset");
        $("#signature-approve").jSignature("setData", "data:" + data.signatures.approve[0] + "," + data.signatures.approve[1]);
      }
    } catch(e) {
      console.warn('서명 데이터 복원 중 오류:', e);
    }
  }

  closeLoadDialog();
  alert('데이터를 불러왔습니다.');
}

function deleteSavedData(name) {
  if (confirm(`'${name}' 데이터를 삭제하시겠습니까?`)) {
    const savedDataList = JSON.parse(localStorage.getItem('회사원등록_저장목록') || '{}');
    delete savedDataList[name];
    localStorage.setItem('회사원등록_저장목록', JSON.stringify(savedDataList));
    loadSavedDataList();
    alert('삭제되었습니다.');
  }
}

// ==============================
// 엑셀 출력 기능
// ==============================

function downloadExcel() {
  console.log('downloadExcel 함수 실행 시작');
  
  // 라이브러리 체크
  if (!window.ExcelJS) {
    console.error('ExcelJS 라이브러리를 찾을 수 없습니다.');
    alert('ExcelJS 라이브러리를 불러올 수 없습니다.');
    return;
  }
  
  if (!window.saveAs) {
    console.error('FileSaver 라이브러리를 찾을 수 없습니다.');
    alert('FileSaver 라이브러리를 불러올 수 없습니다.');
    return;
  }
  
  console.log('라이브러리 체크 완료, 엑셀 생성 시작');
  
  // 비동기 함수를 별도로 실행
  executeExcelDownload().catch(error => {
    console.error('엑셀 다운로드 오류:', error);
    alert('엑셀 파일 생성 중 오류가 발생했습니다: ' + error.message);
  });
}

async function executeExcelDownload() {
  try {
    console.log('executeExcelDownload 함수 실행');
    
    const ExcelJS = window.ExcelJS;
    
    // 기본 정보 수집
    const regDate = document.getElementById('regDate').value;
    const regNo = document.getElementById('regNo').value;
    const regUser = document.getElementById('regUser').value;
    const regManager = document.getElementById('regManager').value;
    const regContact = document.getElementById('regContact').value;
    const regEmail = document.getElementById('regEmail').value;
    const remark = document.getElementById('remark').value;
    
    console.log('데이터 수집 완료:', { regDate, regNo, regUser, regManager, regContact, regEmail });

  // 회사원 데이터 수집
  const employees = [];
  for(let i = 0; i < 8; i++) {
    const empNo = document.getElementById(`empNo${i}`)?.value || '';
    const empName = document.getElementById(`empName${i}`)?.value || '';
    const empDept = document.getElementById(`empDept${i}`)?.value || '';
    const empPosition = document.getElementById(`empPosition${i}`)?.value || '';
    const empHireDate = document.getElementById(`empHireDate${i}`)?.value || '';
    const empPhone = document.getElementById(`empPhone${i}`)?.value || '';
    const empEmail = document.getElementById(`empEmail${i}`)?.value || '';
    const empAddr = document.getElementById(`empAddr${i}`)?.value || '';
    const empAddrDetail = document.getElementById(`empAddrDetail${i}`)?.value || '';
    const empZip = document.getElementById(`empZip${i}`)?.value || '';
    const empGrade = document.getElementById(`empGrade${i}`)?.value || '';

    employees.push([
      i + 1, empNo, empName, empDept, empPosition, empHireDate, 
      empPhone, empEmail, empAddr, empAddrDetail, empZip, empGrade
    ]);
  }

  // ExcelJS 워크북 생성
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('회사원등록');

  // 시트 데이터 구조 생성 (입고요청서와 유사한 형태)
  const sheet = [
    ['회사원 등록부', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['등록일자', '', '', '등록번호', '', '', '등록자', '', '', '', '', ''],
    [regDate, '', '', regNo, '', '', regUser, '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['순번','사원번호','성명','부서','직책','입사일','전화번호','이메일','주소','상세주소','우편번호','급여등급'],
    ...employees,
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['비고', remark, '', '', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', '', '', '', ''],
    ['등록 담당자', '', regManager, '등록 담당자 연락처', '', regContact, '등록 담당자 이메일', '', regEmail, '', '', ''],
    ['등록 요청자 서명', '', '', '등록 검토자 서명', '', '', '등록 승인자 서명', '', '', '', '', '']
  ];

  // 시트에 데이터 입력
  sheet.forEach((row, i) => ws.addRow(row));

  // 데이터 행 수만큼 동적으로 행 위치 계산
  const dataEndRow = 7 + employees.length;
  console.log('데이터 끝 행:', dataEndRow, '총 직원 수:', employees.length);
  
  // 셀 병합 설정
  console.log('셀 병합 시작');
  ws.mergeCells('A1:L2'); // 제목
  ws.mergeCells('A3:C3'); ws.mergeCells('D3:F3'); ws.mergeCells('G3:L3'); // 기본정보 라벨
  ws.mergeCells('A4:C4'); ws.mergeCells('D4:F4'); ws.mergeCells('G4:L4'); // 기본정보 값
  ws.mergeCells('A5:L5'); // 빈줄
  ws.mergeCells('A6:L6'); // 빈줄
  
  // 동적 병합 설정
  console.log(`동적 병합: A${dataEndRow + 1}:L${dataEndRow + 1}`);
  ws.mergeCells(`A${dataEndRow + 1}:L${dataEndRow + 1}`); // 빈줄
  console.log(`동적 병합: B${dataEndRow + 2}:L${dataEndRow + 2}`);
  ws.mergeCells(`B${dataEndRow + 2}:L${dataEndRow + 2}`); // 비고 내용
  console.log(`동적 병합: A${dataEndRow + 3}:L${dataEndRow + 3}`);
  ws.mergeCells(`A${dataEndRow + 3}:L${dataEndRow + 3}`); // 빈줄
  
  // 등록 담당자 정보 행 병합 설정
  console.log(`담당자 병합: A${dataEndRow + 4}:B${dataEndRow + 4}`);
  ws.mergeCells(`A${dataEndRow + 4}:B${dataEndRow + 4}`); // 등록 담당자 라벨
  console.log(`담당자 병합: D${dataEndRow + 4}:E${dataEndRow + 4}`);
  ws.mergeCells(`D${dataEndRow + 4}:E${dataEndRow + 4}`); // 등록 담당자 연락처 라벨
  console.log(`담당자 병합: G${dataEndRow + 4}:H${dataEndRow + 4}`);
  ws.mergeCells(`G${dataEndRow + 4}:H${dataEndRow + 4}`); // 등록 담당자 이메일 라벨
  console.log(`담당자 병합: I${dataEndRow + 4}:L${dataEndRow + 4}`);
  ws.mergeCells(`I${dataEndRow + 4}:L${dataEndRow + 4}`); // 이메일 값
  
  // 서명란 병합 (오직 나머지 빈 셀들만)
  const signatureRow = dataEndRow + 5;
  // 서명 종류 문자열 셀을 2배로 확장, 서명 이미지는 단일 셀
  // A-B: 요청자 서명 문자열, C: 요청자 서명 이미지, D-E: 검토자 서명 문자열, F: 검토자 서명 이미지, G-H: 승인자 서명 문자열, I: 승인자 서명 이미지
  ws.mergeCells(`A${signatureRow}:B${signatureRow}`); // 요청자 서명 문자열 2배
  // C열: 요청자 서명 이미지 (단일 셀)
  ws.mergeCells(`D${signatureRow}:E${signatureRow}`); // 검토자 서명 문자열 2배
  // F열: 검토자 서명 이미지 (단일 셀)
  ws.mergeCells(`G${signatureRow}:H${signatureRow}`); // 승인자 서명 문자열 2배
  // I열: 승인자 서명 이미지 (단일 셀)
  ws.mergeCells(`J${signatureRow}:L${signatureRow}`); // 나머지 빈 셀들

  // 폰트 및 스타일 설정
  ws.getRow(1).font = { name: '맑은 고딕', size: 16, bold: true };
  ws.getRow(7).font = { bold: true }; // 헤더행 (7번째 행)
  ws.getRow(signatureRow).font = { bold: true }; // 서명란

  // 열 너비 설정
  ws.columns.forEach(col => { col.width = 12; });

  // 모든 셀 중앙정렬
  ws.eachRow((row) => {
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });
  });

  // 모든 셀에 테두리 적용
  const maxRow = signatureRow;
  for (let row = 1; row <= maxRow; row++) {
    for (let col = 1; col <= 12; col++) {
      const cell = ws.getCell(row, col);
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      };
    }
  }

  // 서명 이미지 추가 함수
  function addSignatureToExcel(divId, col, row) {
    try {
      var datapair = $(divId).jSignature("getData", "image");
      if(datapair && datapair.length > 1 && datapair[1]) {
        var base64 = datapair[1];
        var imageId = workbook.addImage({
          base64: "data:image/png;base64," + base64,
          extension: 'png'
        });
        ws.addImage(imageId, {
          tl: { col: col, row: row },
          ext: { width: 120, height: 60 }
        });
      }
    } catch(e) {
      console.warn('서명 이미지 추가 중 오류:', e);
    }
  }

  // 서명 추가 (반 셀 위로 이동, 단일 셀 위치에 맞게)
  addSignatureToExcel("#signature-request", 2.1, signatureRow - 1.3);  // C열 (요청자 서명)
  addSignatureToExcel("#signature-review", 5.1, signatureRow - 1.3);   // F열 (검토자 서명)
  addSignatureToExcel("#signature-approve", 8.1, signatureRow - 1.3);  // I열 (승인자 서명)

  // 엑셀 파일 저장
  const buf = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buf], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "회사원등록.xlsx");
  
  console.log('엑셀 파일 다운로드 완료');
  
  // 자동 저장 (다른 시스템과 동일)
  saveToLocalStorage();
  
  } catch (error) {
    console.error('엑셀 출력 중 오류 발생:', error);
    alert('엑셀 파일 생성 중 오류가 발생했습니다: ' + error.message);
  }
}

// 자동 저장 함수 (다른 시스템들과 동일한 패턴)
function saveToLocalStorage() {
  try {
    const autoSaveData = {
      regDate: document.getElementById('regDate').value,
      regNo: document.getElementById('regNo').value,
      regUser: document.getElementById('regUser').value,
      employees: [],
      regManager: document.getElementById('regManager').value,
      regContact: document.getElementById('regContact').value,
      regEmail: document.getElementById('regEmail').value,
      remark: document.getElementById('remark').value,
      autoSavedAt: new Date().toISOString()
    };

    for(let i = 0; i < 8; i++) {
      const empNo = document.getElementById(`empNo${i}`)?.value || '';
      const empName = document.getElementById(`empName${i}`)?.value || '';
      if(empNo || empName) {
        autoSaveData.employees.push({
          empNo, 
          empName: document.getElementById(`empName${i}`)?.value || '',
          empDept: document.getElementById(`empDept${i}`)?.value || '',
          empPosition: document.getElementById(`empPosition${i}`)?.value || '',
          empHireDate: document.getElementById(`empHireDate${i}`)?.value || '',
          empPhone: document.getElementById(`empPhone${i}`)?.value || '',
          empEmail: document.getElementById(`empEmail${i}`)?.value || '',
          empAddr: document.getElementById(`empAddr${i}`)?.value || '',
          empAddrDetail: document.getElementById(`empAddrDetail${i}`)?.value || '',
          empZip: document.getElementById(`empZip${i}`)?.value || '',
          empGrade: document.getElementById(`empGrade${i}`)?.value || ''
        });
      }
    }

    localStorage.setItem('회사원등록_자동저장', JSON.stringify(autoSaveData));
  } catch(e) {
    console.warn('자동 저장 중 오류:', e);
  }
}

// ==============================
// 인쇄 기능
// ==============================

function printDocument() {
  window.print();
}

// ==============================
// 회사원 등록 기능
// ==============================

function registerEmployee() {
  const employees = [];
  let hasData = false;

  for(let i = 0; i < 8; i++) {
    const empNo = document.getElementById(`empNo${i}`)?.value || '';
    const empName = document.getElementById(`empName${i}`)?.value || '';
    const empDept = document.getElementById(`empDept${i}`)?.value || '';
    
    if(empNo || empName || empDept) {
      hasData = true;
      const empPosition = document.getElementById(`empPosition${i}`)?.value || '';
      const empHireDate = document.getElementById(`empHireDate${i}`)?.value || '';
      const empPhone = document.getElementById(`empPhone${i}`)?.value || '';
      const empEmail = document.getElementById(`empEmail${i}`)?.value || '';
      const empAddr = document.getElementById(`empAddr${i}`)?.value || '';
      const empAddrDetail = document.getElementById(`empAddrDetail${i}`)?.value || '';
      const empZip = document.getElementById(`empZip${i}`)?.value || '';
      const empGrade = document.getElementById(`empGrade${i}`)?.value || '';

      employees.push({
        empNo, empName, empDept, empPosition, empHireDate,
        empPhone, empEmail, empAddr, empAddrDetail, empZip, empGrade
      });
    }
  }

  if(!hasData) {
    alert('등록할 회사원 정보가 없습니다.');
    return;
  }

  const registrationData = {
    regDate: document.getElementById('regDate').value,
    regNo: document.getElementById('regNo').value,
    regUser: document.getElementById('regUser').value,
    employees: employees,
    regManager: document.getElementById('regManager').value,
    regContact: document.getElementById('regContact').value,
    regEmail: document.getElementById('regEmail').value,
    remark: document.getElementById('remark').value,
    registeredAt: new Date().toISOString()
  };

  // 로컬스토리지에 등록된 회사원 목록 저장
  const registeredEmployees = JSON.parse(localStorage.getItem('등록된_회사원목록') || '[]');
  registeredEmployees.push(registrationData);
  localStorage.setItem('등록된_회사원목록', JSON.stringify(registeredEmployees));

  alert(`${employees.length}명의 회사원이 성공적으로 등록되었습니다.`);
}