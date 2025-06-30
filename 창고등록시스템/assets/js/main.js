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

// 창고 등록 기능
function registerWarehouse() {
  // 데이터베이스가 구축되지 않아 실제 등록은 수행하지 않음
  alert('창고 등록 기능입니다. 데이터베이스 구축 후 사용 가능합니다.');
  // 향후 실제 등록 로직이 추가될 예정
} 

// 창고 등록 시스템에서는 금액 계산이 불필요하므로 제거됨 

// ==============================
// 다중 저장/불러오기 기능
// ==============================

function showSaveDialog() {
  document.getElementById('saveDialog').style.display = 'flex';
  const now = new Date();
  const defaultName = `창고등록_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
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
    warehouses: [],
    regManager: document.getElementById('regManager').value,
    regContact: document.getElementById('regContact').value,
    regEmail: document.getElementById('regEmail').value,
    remark: document.getElementById('remark').value,
    signatures: {},
    savedAt: new Date().toISOString()
  };

  for(let i=0; i<8; i++) {
    const whCode = document.getElementById('whCode'+i)?.value || "";
    const whName = document.getElementById('whName'+i)?.value || "";
    if(whCode || whName) {
      formData.warehouses.push({
        code: whCode,
        name: whName,
        type: document.getElementById('whType'+i)?.value || "",
        addr: document.getElementById('whAddr'+i)?.value || "",
        addrDetail: document.getElementById('whAddrDetail'+i)?.value || "",
        zip: document.getElementById('whZip'+i)?.value || "",
        region: document.getElementById('whRegion'+i)?.value || "",
        manager: document.getElementById('whManager'+i)?.value || "",
        phone: document.getElementById('whPhone'+i)?.value || "",
        email: document.getElementById('whEmail'+i)?.value || ""
      });
    }
  }

  try {
    formData.signatures.request = $("#signature-request").jSignature("getData", "image");
    formData.signatures.review = $("#signature-review").jSignature("getData", "image");
    formData.signatures.approve = $("#signature-approve").jSignature("getData", "image");
  } catch(e) {
    console.log('서명 데이터 수집 중 오류:', e);
  }

  const savedDataList = JSON.parse(localStorage.getItem('창고등록_저장목록') || '{}');
  savedDataList[saveName] = formData;
  localStorage.setItem('창고등록_저장목록', JSON.stringify(savedDataList));

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
  const savedDataList = JSON.parse(localStorage.getItem('창고등록_저장목록') || '{}');
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
  const savedDataList = JSON.parse(localStorage.getItem('창고등록_저장목록') || '{}');
  const data = savedDataList[name];
  
  if (!data) {
    alert('저장된 데이터를 찾을 수 없습니다.');
    return;
  }

  document.getElementById('regDate').value = data.regDate || '';
  document.getElementById('regNo').value = data.regNo || '';
  document.getElementById('regUser').value = data.regUser || '';
  document.getElementById('regManager').value = data.regManager || '';
  document.getElementById('regContact').value = data.regContact || '';
  document.getElementById('regEmail').value = data.regEmail || '';
  document.getElementById('remark').value = data.remark || '';

  // 창고 데이터 복원
  if(data.warehouses) {
    // 모든 창고 입력 필드 초기화
    for(let i=0; i<8; i++) {
      if(document.getElementById('whCode'+i)) document.getElementById('whCode'+i).value = '';
      if(document.getElementById('whName'+i)) document.getElementById('whName'+i).value = '';
      if(document.getElementById('whType'+i)) document.getElementById('whType'+i).value = '';
      if(document.getElementById('whAddr'+i)) document.getElementById('whAddr'+i).value = '';
      if(document.getElementById('whAddrDetail'+i)) document.getElementById('whAddrDetail'+i).value = '';
      if(document.getElementById('whZip'+i)) document.getElementById('whZip'+i).value = '';
      if(document.getElementById('whRegion'+i)) document.getElementById('whRegion'+i).value = '';
      if(document.getElementById('whManager'+i)) document.getElementById('whManager'+i).value = '';
      if(document.getElementById('whPhone'+i)) document.getElementById('whPhone'+i).value = '';
      if(document.getElementById('whEmail'+i)) document.getElementById('whEmail'+i).value = '';
    }
    
    // 저장된 창고 데이터 복원
    for(let i=0; i<data.warehouses.length && i<8; i++) {
      const wh = data.warehouses[i];
      if(document.getElementById('whCode'+i)) document.getElementById('whCode'+i).value = wh.code || '';
      if(document.getElementById('whName'+i)) document.getElementById('whName'+i).value = wh.name || '';
      if(document.getElementById('whType'+i)) document.getElementById('whType'+i).value = wh.type || '';
      if(document.getElementById('whAddr'+i)) document.getElementById('whAddr'+i).value = wh.addr || '';
      if(document.getElementById('whAddrDetail'+i)) document.getElementById('whAddrDetail'+i).value = wh.addrDetail || '';
      if(document.getElementById('whZip'+i)) document.getElementById('whZip'+i).value = wh.zip || '';
      if(document.getElementById('whRegion'+i)) document.getElementById('whRegion'+i).value = wh.region || '';
      if(document.getElementById('whManager'+i)) document.getElementById('whManager'+i).value = wh.manager || '';
      if(document.getElementById('whPhone'+i)) document.getElementById('whPhone'+i).value = wh.phone || '';
      if(document.getElementById('whEmail'+i)) document.getElementById('whEmail'+i).value = wh.email || '';
    }
  }

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
      console.log('서명 데이터 복원 중 오류:', e);
    }
  }

  // 창고 등록 시스템에서는 계산 불필요
  closeLoadDialog();
  alert('데이터를 불러왔습니다.');
}

function deleteSavedData(name) {
  if (confirm(`'${name}' 데이터를 삭제하시겠습니까?`)) {
    const savedDataList = JSON.parse(localStorage.getItem('입고요청서_저장목록') || '{}');
    delete savedDataList[name];
    localStorage.setItem('입고요청서_저장목록', JSON.stringify(savedDataList));
    loadSavedDataList();
    alert('삭제되었습니다.');
  }
}

// 기존 로컬스토리지 저장 함수 (호환성을 위해 유지)
function saveToLocalStorage() {
  const formData = {
    regDate: document.getElementById('regDate').value,
    regNo: document.getElementById('regNo').value,
    regUser: document.getElementById('regUser').value,
    warehouses: [],
    regManager: document.getElementById('regManager').value,
    regContact: document.getElementById('regContact').value,
    regEmail: document.getElementById('regEmail').value,
    remark: document.getElementById('remark').value,
    signatures: {}
  };

  // 창고 데이터 수집
  for(let i=0; i<8; i++) {
    const whCode = document.getElementById('whCode'+i)?.value || "";
    const whName = document.getElementById('whName'+i)?.value || "";
    if(whCode || whName) {
      formData.warehouses.push({
        code: whCode,
        name: whName,
        type: document.getElementById('whType'+i)?.value || "",
        addr: document.getElementById('whAddr'+i)?.value || "",
        addrDetail: document.getElementById('whAddrDetail'+i)?.value || "",
        zip: document.getElementById('whZip'+i)?.value || "",
        region: document.getElementById('whRegion'+i)?.value || "",
        manager: document.getElementById('whManager'+i)?.value || "",
        phone: document.getElementById('whPhone'+i)?.value || "",
        email: document.getElementById('whEmail'+i)?.value || ""
      });
    }
  }

  // 서명 데이터 수집
  try {
    formData.signatures.request = $("#signature-request").jSignature("getData", "image");
    formData.signatures.review = $("#signature-review").jSignature("getData", "image");
    formData.signatures.approve = $("#signature-approve").jSignature("getData", "image");
  } catch(e) {
    console.log('서명 데이터 수집 중 오류:', e);
  }

  // 로컬스토리지에 저장
  localStorage.setItem('창고등록_임시저장', JSON.stringify(formData));
  alert('임시저장이 완료되었습니다.');
}

// 로컬스토리지 불러오기 함수
function loadFromLocalStorage() {
  const savedData = localStorage.getItem('창고등록_임시저장');
  if(!savedData) {
    alert('저장된 데이터가 없습니다.');
    return;
  }

  const formData = JSON.parse(savedData);
  
  // 기본 정보 복원
  document.getElementById('regDate').value = formData.regDate || '';
  document.getElementById('regNo').value = formData.regNo || '';
  document.getElementById('regUser').value = formData.regUser || '';
  document.getElementById('regManager').value = formData.regManager || '';
  document.getElementById('regContact').value = formData.regContact || '';
  document.getElementById('regEmail').value = formData.regEmail || '';
  document.getElementById('remark').value = formData.remark || '';

  // 참조부서 복원
  const refDeptWrap = document.getElementById('refDeptWrap');
  refDeptWrap.innerHTML = '';
  if(formData.refDept && formData.refDept.length > 0) {
    formData.refDept.forEach((dept, index) => {
      if(index === 0) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'ref-dept-input';
        input.name = 'refDept';
        input.value = dept;
        refDeptWrap.appendChild(input);
      } else {
        addRefDept();
        const inputs = document.getElementsByName('refDept');
        inputs[inputs.length-1].value = dept;
      }
    });
  } else {
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'ref-dept-input';
    input.name = 'refDept';
    refDeptWrap.appendChild(input);
  }

  // 품목 데이터 복원
  if(formData.items) {
    for(let i=0; i<10 && i<formData.items.length; i++) {
      const item = formData.items[i];
      if(document.getElementById('item'+i)) document.getElementById('item'+i).value = item.item || '';
      if(document.getElementById('spec'+i)) document.getElementById('spec'+i).value = item.spec || '';
      if(document.getElementById('unit'+i)) document.getElementById('unit'+i).value = item.unit || '';
      if(document.getElementById('qty'+i)) document.getElementById('qty'+i).value = item.qty || '';
      if(document.getElementById('price'+i)) document.getElementById('price'+i).value = item.price || '';
      if(document.getElementById('amount'+i)) document.getElementById('amount'+i).value = item.amount || '';
      if(document.getElementById('vendor'+i)) document.getElementById('vendor'+i).value = item.vendor || '';
      if(document.getElementById('cat'+i)) document.getElementById('cat'+i).value = item.cat || '';
      if(document.getElementById('wh'+i)) document.getElementById('wh'+i).value = item.wh || '';
      if(document.getElementById('note'+i)) document.getElementById('note'+i).value = item.note || '';
    }
  }

  // 서명 데이터 복원
  if(formData.signatures) {
    try {
      if(formData.signatures.request && formData.signatures.request[1]) {
        $("#signature-request").jSignature("reset");
        $("#signature-request").jSignature("setData", "data:" + formData.signatures.request[0] + "," + formData.signatures.request[1]);
      }
      if(formData.signatures.review && formData.signatures.review[1]) {
        $("#signature-review").jSignature("reset");
        $("#signature-review").jSignature("setData", "data:" + formData.signatures.review[0] + "," + formData.signatures.review[1]);
      }
      if(formData.signatures.approve && formData.signatures.approve[1]) {
        $("#signature-approve").jSignature("reset");
        $("#signature-approve").jSignature("setData", "data:" + formData.signatures.approve[0] + "," + formData.signatures.approve[1]);
      }
    } catch(e) {
      console.log('서명 데이터 복원 중 오류:', e);
    }
  }

  // 금액 재계산
  calcRow();
  alert('데이터를 불러왔습니다.');
}

async function downloadExcel() { 
  const regDate = document.getElementById('regDate').value; 
  const regNo = document.getElementById('regNo').value; 
  const regUser = document.getElementById('regUser').value; 
  const regManager = document.getElementById('regManager').value; 
  const regContact = document.getElementById('regContact').value; 
  const regEmail = document.getElementById('regEmail').value; 
  const remark = document.getElementById('remark').value; 

  // 창고 데이터 
  const warehouses = []; 
  for(let i=0;i<8;i++) { 
    const whCode = document.getElementById('whCode'+i)?.value || "";
    const whName = document.getElementById('whName'+i)?.value || "";
    if(whCode || whName) {
      warehouses.push([ 
        warehouses.length + 1, 
        whCode, 
        whName, 
        document.getElementById('whType'+i)?.value || "", 
        document.getElementById('whAddr'+i)?.value || "", 
        document.getElementById('whAddrDetail'+i)?.value || "", 
        document.getElementById('whZip'+i)?.value || "", 
        document.getElementById('whRegion'+i)?.value || "", 
        document.getElementById('whManager'+i)?.value || "", 
        document.getElementById('whPhone'+i)?.value || "", 
        document.getElementById('whEmail'+i)?.value || "" 
      ]); 
    }
  } 

  // ExcelJS 워크북 생성 
  const workbook = new ExcelJS.Workbook(); 
  const ws = workbook.addWorksheet('창고등록'); 
  const sheet = [ 
    ['창고 등록', '', '', '', '', '', '', '', '', '', ''], 
    ['', '', '', '', '', '', '', '', '', '', ''], 
    ['등록일자', '', '', '등록번호', '', '', '등록자', '', '', '', ''], 
    [regDate, '', '', regNo, '', '', regUser, '', '', '', ''], 
    ['', '', '', '', '', '', '', '', '', '', ''], 
    ['순번','창고 코드','창고 이름','창고 유형','주소','상세 주소','우편번호','지역','담당자명','담당자 연락처','이메일'], 
    ...warehouses 
  ];
  
  // 듷부 행들 추가
  const warehouseEndRow = 6 + warehouses.length;
  sheet.push(['', '', '', '', '', '', '', '', '', '', '']); // 빈줄
  sheet.push(['비고', remark, '', '', '', '', '', '', '', '', '']); // 비고
  sheet.push(['', '', '', '', '', '', '', '', '', '', '']); // 빈줄
  sheet.push(['등록 담당자', regManager, '', '등록 담당자 연락처', regContact, '', '등록 담당자 이메일', regEmail, '', '', '']); 
  sheet.push(['등록 요청자 서명', '', '등록 검토자 서명', '', '등록 승인자 서명', '', '', '', '', '', '']); 

  // 시트에 데이터 입력 
  sheet.forEach((row, i) => ws.addRow(row)); 
  
  const totalRows = sheet.length;
  const signatureRow = totalRows;
  const managerRow = totalRows - 1;
  const remarkRow = totalRows - 2;
  
  // 셀 병합
  ws.mergeCells('A1:K2'); // 제목 
  ws.mergeCells('A3:C3'); ws.mergeCells('D3:F3'); ws.mergeCells('G3:K3'); 
  ws.mergeCells('A4:C4'); ws.mergeCells('D4:F4'); ws.mergeCells('G4:K4'); 
  ws.mergeCells('A5:K5'); // 빈줄
  
  // 비고 행 병합
  ws.mergeCells(`B${remarkRow}:K${remarkRow}`);
  
  // 등록 담당자 행 병합
  ws.mergeCells(`B${managerRow}:C${managerRow}`); 
  ws.mergeCells(`E${managerRow}:F${managerRow}`); 
  ws.mergeCells(`H${managerRow}:K${managerRow}`);
  
  // 서명란 병합
  ws.mergeCells(`B${signatureRow}:B${signatureRow}`); 
  ws.mergeCells(`D${signatureRow}:D${signatureRow}`); 
  ws.mergeCells(`F${signatureRow}:F${signatureRow}`); // 등록 승인자 서명
  ws.mergeCells(`G${signatureRow}:K${signatureRow}`); // 나머지 빈 셀 

  // 스타일 지정 (간략화, 필요시 확장 가능) 
  ws.getRow(1).font = { name: '맑은 고딕', size: 16, bold: true }; 
  ws.getRow(6).font = { bold: true }; // 창고 테이블 헤더
  ws.getRow(signatureRow).font = { bold: true }; // 서명란 

  ws.columns.forEach(col => { col.width = 16; });
  // 창고 등록 테이블의 이메일 컴럼(11번째)만 더 넓게 설정
  ws.getColumn(11).width = 28; 

  // 모든 셀 중앙정렬(가로·세로) 
  ws.eachRow((row) => { 
    row.eachCell({ includeEmpty: true }, (cell) => { 
      cell.alignment = { horizontal: 'center', vertical: 'middle' }; 
    }); 
  }); 

  // 모든 셀에 thin 테두리 적용 
  for (let row = 1; row <= totalRows; row++) { 
    for (let col = 1; col <= 11; col++) { 
      const cell = ws.getCell(row, col); 
      cell.border = { 
        top: { style: 'thin' }, 
        left: { style: 'thin' }, 
        bottom: { style: 'thin' }, 
        right: { style: 'thin' } 
      }; 
    } 
  } 

  // 각 서명 이미지 삽입 
  function addSignatureToExcel(divId, col, row) { 
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
  } 
  // 서명 이미지 삽입 (서명란 행에 맞춘) 
  addSignatureToExcel("#signature-request", 1.1, signatureRow - 0.8); 
  addSignatureToExcel("#signature-review", 3.1, signatureRow - 0.8); 
  addSignatureToExcel("#signature-approve", 5.1, signatureRow - 0.8); 

  // 엑셀 파일 저장 
  const buf = await workbook.xlsx.writeBuffer(); 
  saveAs(new Blob([buf], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "창고등록.xlsx"); 
  
  // 자동 저장
  saveToLocalStorage();
}

function printDocument() {
  // 인쇄용 창 생성
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  // 데이터 수집
  const regDate = document.getElementById('regDate').value;
  const regNo = document.getElementById('regNo').value;
  const regUser = document.getElementById('regUser').value;
  const regManager = document.getElementById('regManager').value;
  const regContact = document.getElementById('regContact').value;
  const regEmail = document.getElementById('regEmail').value;
  const remark = document.getElementById('remark').value;

  // 창고 데이터 수집
  const warehouses = [];
  for(let i=0;i<8;i++) {
    const whCode = document.getElementById('whCode'+i)?.value || "";
    const whName = document.getElementById('whName'+i)?.value || "";
    const whType = document.getElementById('whType'+i)?.value || "";
    const whAddr = document.getElementById('whAddr'+i)?.value || "";
    const whAddrDetail = document.getElementById('whAddrDetail'+i)?.value || "";
    const whZip = document.getElementById('whZip'+i)?.value || "";
    const whRegion = document.getElementById('whRegion'+i)?.value || "";
    const whManager = document.getElementById('whManager'+i)?.value || "";
    const whPhone = document.getElementById('whPhone'+i)?.value || "";
    const whEmail = document.getElementById('whEmail'+i)?.value || "";
    
    if(whCode || whName) {
      warehouses.push({
        no: warehouses.length + 1, whCode, whName, whType, whAddr, whAddrDetail, whZip, whRegion, whManager, whPhone, whEmail
      });
    }
  }

  // 서명 데이터 수집
  const requestSignature = $("#signature-request").jSignature("getData", "image");
  const reviewSignature = $("#signature-review").jSignature("getData", "image");
  const approveSignature = $("#signature-approve").jSignature("getData", "image");

  // 인쇄용 HTML 생성
  const printHTML = generatePrintHTML({
    regDate, regNo, regUser, regManager, regContact, regEmail, remark, warehouses,
    requestSignature, reviewSignature, approveSignature
  });

  // 인쇄 창에 HTML 작성 및 인쇄
  printWindow.document.write(printHTML);
  printWindow.document.close();
  
  // 이미지 로딩 대기 후 인쇄
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
  
  // 자동 저장
  saveToLocalStorage();
}

function generatePrintHTML(data) {
  let warehouseRows = '';
  data.warehouses.forEach(wh => {
    warehouseRows += `
      <tr>
        <td>${wh.no}</td>
        <td>${wh.whCode}</td>
        <td>${wh.whName}</td>
        <td>${wh.whType}</td>
        <td>${wh.whAddr}</td>
        <td>${wh.whAddrDetail}</td>
        <td>${wh.whZip}</td>
        <td>${wh.whRegion}</td>
        <td>${wh.whManager}</td>
        <td>${wh.whPhone}</td>
        <td>${wh.whEmail}</td>
      </tr>
    `;
  });

  const requestSignatureImg = data.requestSignature && data.requestSignature[1] ? 
    `<img src="data:image/png;base64,${data.requestSignature[1]}" class="signature-img">` : '';
  const reviewSignatureImg = data.reviewSignature && data.reviewSignature[1] ? 
    `<img src="data:image/png;base64,${data.reviewSignature[1]}" class="signature-img">` : '';
  const approveSignatureImg = data.approveSignature && data.approveSignature[1] ? 
    `<img src="data:image/png;base64,${data.approveSignature[1]}" class="signature-img">` : '';

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
      <meta charset="UTF-8">
      <title>창고 등록</title>
      <style>
        @page { size: A4 landscape; margin: 5mm; }
        body { font-family: '맑은 고딕', Arial, sans-serif; margin: 0; padding: 0; font-size: 9px; }
        table { border-collapse: collapse; width: 100%; margin-bottom: 2px; }
        th, td { border: 1px solid #000; padding: 1px 2px; text-align: center; font-size: 8px; word-wrap: break-word; }
        th { background: #f1f1f1; font-weight: bold; }
        .title { font-size: 16px; font-weight: bold; text-align: center; padding: 5px 0; }
        .wide { text-align: left; }
        .signature-cell { vertical-align: middle; position: relative; }
        .signature-img { 
          width: 150px !important; 
          height: 80px !important; 
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }
        .warehouse-table th, .warehouse-table td { padding: 1px; font-size: 7px; }
        .warehouse-table th:nth-child(1), .warehouse-table td:nth-child(1) { width: 3%; }
        .warehouse-table th:nth-child(2), .warehouse-table td:nth-child(2) { width: 8%; }
        .warehouse-table th:nth-child(3), .warehouse-table td:nth-child(3) { width: 10%; }
        .warehouse-table th:nth-child(4), .warehouse-table td:nth-child(4) { width: 8%; }
        .warehouse-table th:nth-child(5), .warehouse-table td:nth-child(5) { width: 15%; }
        .warehouse-table th:nth-child(6), .warehouse-table td:nth-child(6) { width: 10%; }
        .warehouse-table th:nth-child(7), .warehouse-table td:nth-child(7) { width: 8%; }
        .warehouse-table th:nth-child(8), .warehouse-table td:nth-child(8) { width: 6%; }
        .warehouse-table th:nth-child(9), .warehouse-table td:nth-child(9) { width: 8%; }
        .warehouse-table th:nth-child(10), .warehouse-table td:nth-child(10) { width: 12%; }
        .warehouse-table th:nth-child(11), .warehouse-table td:nth-child(11) { width: 12%; }
      </style>
    </head>
    <body>
      <div class="title">창고 등록</div>
      
      <table>
        <tr>
          <th>등록일자</th>
          <td>${data.regDate}</td>
          <th>등록번호</th>
          <td>${data.regNo}</td>
          <th>등록자</th>
          <td colspan="3">${data.regUser}</td>
        </tr>
      </table>

      <table class="warehouse-table">
        <tr>
          <th>순번</th><th>창고 코드</th><th>창고 이름</th><th>창고 유형</th><th>주소</th><th>상세 주소</th><th>우편번호</th><th>지역</th><th>담당자명</th><th>담당자 연락처</th><th>이메일</th>
        </tr>
        ${warehouseRows}
      </table>

      <table>
        <tr>
          <th>비고</th>
          <td colspan="10" class="wide">${data.remark}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th>등록 담당자</th>
          <td>${data.regManager}</td>
          <th>등록 담당자 연락처</th>
          <td>${data.regContact}</td>
          <th>등록 담당자 이메일</th>
          <td colspan="2">${data.regEmail}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th>등록 요청자 서명</th>
          <td class="signature-cell" colspan="2">${requestSignatureImg}</td>
          <th>등록 검토자 서명</th>
          <td class="signature-cell" colspan="2">${reviewSignatureImg}</td>
          <th>등록 승인자 서명</th>
          <td class="signature-cell" colspan="2">${approveSignatureImg}</td>
        </tr>
      </table>
    </body>
    </html>
  `;
}