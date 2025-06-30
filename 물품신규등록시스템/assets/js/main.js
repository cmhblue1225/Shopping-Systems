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

// 참조부서 동적 추가/삭제 
function addRefDept() { 
  const wrap = document.getElementById('refDeptWrap'); 
  const input = document.createElement('input'); 
  input.type = 'text'; 
  input.className = 'ref-dept-input'; 
  input.name = 'refDept'; 
  input.placeholder = '참조부서'; 
  wrap.appendChild(input); 

  const btn = document.createElement('button'); 
  btn.type = 'button'; 
  btn.className = 'remove-btn'; 
  btn.textContent = '－'; 
  btn.onclick = function() { 
    wrap.removeChild(input); 
    wrap.removeChild(btn); 
  }; 
  wrap.appendChild(btn); 
} 

// 금액, 합계 자동 계산 
for(let i=0;i<10;i++) { 
  if(document.getElementById('qty'+i)) document.getElementById('qty'+i).addEventListener('input', calcRow); 
  if(document.getElementById('price'+i)) document.getElementById('price'+i).addEventListener('input', calcRow); 
} 

function calcRow() { 
  let sum = 0; 
  for(let i=0;i<10;i++) { 
    const qty = Number(document.getElementById('qty'+i)?.value) || 0; 
    const price = Number(document.getElementById('price'+i)?.value) || 0; 
    const amount = qty * price; 
    if(document.getElementById('amount'+i)) document.getElementById('amount'+i).value = amount; 
    sum += amount; 
  } 
  document.getElementById('total').value = sum; 
} 

// ==============================
// 다중 저장/불러오기 기능
// ==============================

function showSaveDialog() {
  document.getElementById('saveDialog').style.display = 'flex';
  const now = new Date();
  const defaultName = `신규상품등록_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
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
    reqDate: document.getElementById('reqDate').value,
    reqNo: document.getElementById('reqNo').value,
    reqUser: document.getElementById('reqUser').value,
    refDept: [],
    items: [],
    manager: document.getElementById('manager').value,
    contact: document.getElementById('contact').value,
    email: document.getElementById('email').value,
    remark: document.getElementById('remark').value,
    signatures: {},
    savedAt: new Date().toISOString()
  };

  const refDeptInputs = document.getElementsByName('refDept');
  for(let i=0; i<refDeptInputs.length; i++) {
    if(refDeptInputs[i].value.trim()) {
      formData.refDept.push(refDeptInputs[i].value.trim());
    }
  }

  for(let i=0; i<11; i++) {
    formData.items.push({
      code: document.getElementById('code'+i)?.value || "",
      item: document.getElementById('item'+i)?.value || "",
      spec: document.getElementById('spec'+i)?.value || "",
      unit: document.getElementById('unit'+i)?.value || "",
      qty: document.getElementById('qty'+i)?.value || "",
      price: document.getElementById('price'+i)?.value || "",
      amount: document.getElementById('amount'+i)?.value || "",
      vendor: document.getElementById('vendor'+i)?.value || "",
      cat: document.getElementById('cat'+i)?.value || "",
      wh: document.getElementById('wh'+i)?.value || "",
      note: document.getElementById('note'+i)?.value || ""
    });
  }

  try {
    formData.signatures.request = $("#signature-request").jSignature("getData", "image");
    formData.signatures.review = $("#signature-review").jSignature("getData", "image");
    formData.signatures.approve = $("#signature-approve").jSignature("getData", "image");
  } catch(e) {
    console.log('서명 데이터 수집 중 오류:', e);
  }

  const savedDataList = JSON.parse(localStorage.getItem('물품신규등록_저장목록') || '{}');
  savedDataList[saveName] = formData;
  localStorage.setItem('물품신규등록_저장목록', JSON.stringify(savedDataList));

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
  const savedDataList = JSON.parse(localStorage.getItem('신규상품등록_저장목록') || '{}');
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
  const savedDataList = JSON.parse(localStorage.getItem('물품신규등록_저장목록') || '{}');
  const data = savedDataList[name];
  
  if (!data) {
    alert('저장된 데이터를 찾을 수 없습니다.');
    return;
  }

  document.getElementById('reqDate').value = data.reqDate || '';
  document.getElementById('reqNo').value = data.reqNo || '';
  document.getElementById('reqUser').value = data.reqUser || '';
  document.getElementById('manager').value = data.manager || '';
  document.getElementById('contact').value = data.contact || '';
  document.getElementById('email').value = data.email || '';
  document.getElementById('remark').value = data.remark || '';

  const refDeptWrap = document.getElementById('refDeptWrap');
  refDeptWrap.innerHTML = '';
  if(data.refDept && data.refDept.length > 0) {
    data.refDept.forEach((dept, index) => {
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

  if(data.items) {
    for(let i=0; i<11 && i<data.items.length; i++) {
      const item = data.items[i];
      if(document.getElementById('code'+i)) document.getElementById('code'+i).value = item.code || '';
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

  calcRow();
  closeLoadDialog();
  alert('데이터를 불러왔습니다.');
}

function deleteSavedData(name) {
  if (confirm(`'${name}' 데이터를 삭제하시겠습니까?`)) {
    const savedDataList = JSON.parse(localStorage.getItem('신규상품등록_저장목록') || '{}');
    delete savedDataList[name];
    localStorage.setItem('신규상품등록_저장목록', JSON.stringify(savedDataList));
    loadSavedDataList();
    alert('삭제되었습니다.');
  }
}

// 기존 로컬스토리지 저장 함수 (호환성을 위해 유지)
function saveToLocalStorage() {
  const formData = {
    reqDate: document.getElementById('reqDate').value,
    reqNo: document.getElementById('reqNo').value,
    reqUser: document.getElementById('reqUser').value,
    refDept: [],
    items: [],
    manager: document.getElementById('manager').value,
    contact: document.getElementById('contact').value,
    email: document.getElementById('email').value,
    remark: document.getElementById('remark').value,
    signatures: {}
  };

  // 참조부서 수집
  const refDeptInputs = document.getElementsByName('refDept');
  for(let i=0; i<refDeptInputs.length; i++) {
    if(refDeptInputs[i].value.trim()) {
      formData.refDept.push(refDeptInputs[i].value.trim());
    }
  }

  // 품목 데이터 수집
  for(let i=0; i<11; i++) {
    formData.items.push({
      code: document.getElementById('code'+i)?.value || "",
      item: document.getElementById('item'+i)?.value || "",
      spec: document.getElementById('spec'+i)?.value || "",
      unit: document.getElementById('unit'+i)?.value || "",
      qty: document.getElementById('qty'+i)?.value || "",
      price: document.getElementById('price'+i)?.value || "",
      amount: document.getElementById('amount'+i)?.value || "",
      vendor: document.getElementById('vendor'+i)?.value || "",
      cat: document.getElementById('cat'+i)?.value || "",
      wh: document.getElementById('wh'+i)?.value || "",
      note: document.getElementById('note'+i)?.value || ""
    });
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
  localStorage.setItem('물품신규등록_임시저장', JSON.stringify(formData));
  alert('임시저장이 완료되었습니다.');
}

// 로컬스토리지 불러오기 함수
function loadFromLocalStorage() {
  const savedData = localStorage.getItem('물품신규등록_임시저장');
  if(!savedData) {
    alert('저장된 데이터가 없습니다.');
    return;
  }

  const formData = JSON.parse(savedData);
  
  // 기본 정보 복원
  document.getElementById('reqDate').value = formData.reqDate || '';
  document.getElementById('reqNo').value = formData.reqNo || '';
  document.getElementById('reqUser').value = formData.reqUser || '';
  document.getElementById('manager').value = formData.manager || '';
  document.getElementById('contact').value = formData.contact || '';
  document.getElementById('email').value = formData.email || '';
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
    for(let i=0; i<11 && i<formData.items.length; i++) {
      const item = formData.items[i];
      if(document.getElementById('code'+i)) document.getElementById('code'+i).value = item.code || '';
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
  // 참조부서 여러개 
  const refDeptInputs = document.getElementsByName('refDept'); 
  const refDeptArr = []; 
  for(let i=0;i<refDeptInputs.length;i++) { 
    if(refDeptInputs[i].value.trim()) refDeptArr.push(refDeptInputs[i].value.trim()); 
  } 
  const refDept = refDeptArr.join(', '); 

  const reqDate = document.getElementById('reqDate').value; 
  const reqNo = document.getElementById('reqNo').value; 
  const reqUser = document.getElementById('reqUser').value; 
  const manager = document.getElementById('manager').value; 
  const contact = document.getElementById('contact').value; 
  const email = document.getElementById('email').value; 
  const remark = document.getElementById('remark').value; 
  const total = Number(document.getElementById('total').value); 

  // 품목 
  const items = []; 
  for(let i=0;i<10;i++) { 
    items.push([ 
      i+1, 
      document.getElementById('code'+i)?.value || "",
      document.getElementById('item'+i)?.value || "",
      document.getElementById('spec'+i)?.value || "", 
      document.getElementById('unit'+i)?.value || "", 
      Number(document.getElementById('qty'+i)?.value) || 0, 
      Number(document.getElementById('price'+i)?.value) || 0, 
      Number(document.getElementById('amount'+i)?.value) || 0, 
      document.getElementById('vendor'+i)?.value || "", 
      document.getElementById('cat'+i)?.value || "", 
      document.getElementById('wh'+i)?.value || "", 
      document.getElementById('note'+i)?.value || "" 
    ]); 
  } 

  // ExcelJS 워크북 생성 
  const workbook = new ExcelJS.Workbook(); 
  const ws = workbook.addWorksheet('신규상품등록'); 
  const sheet = [ 
    ['신규상품등록', '', '', '', '', '', '', '', '', '', '', ''], 
    ['', '', '', '', '', '', '', '', '', '', '', ''], 
    ['등록일자', '', '', '', '등록번호', '', '', '', '등록자', '', '', ''], 
    [reqDate, '', '', '', reqNo, '', '', '',reqUser, '', '', ''], 
    ['', '', '', '', '', '', '', '', '', '', '', ''], 
    ['참조부서', '', refDept, '', '', '', '', '', '', '', ''], 
    ['', '', '', '', '', '', '', '', '', '', '', ''], 
    ['순번','상품코드','품명','규격','단위','수량','단가','금액','거래처','카테고리','입고 창고','비고'], 
    ...items, 
    ['합계', '', '', '', '', '', '', total, '', '', '', ''], 
    ['비고', remark, '', '', '', '', '', '', '', '', '', ''], 
    ['', '', '', '', '', '', '', '', '', '', '', ''], 
    ['', '', '', '', '', '', '', '', '', '', '', ''], 
    ['신규등록 담당자', '', manager,'', '신규등록 담당자 연락처', '', contact, '', '신규등록 담당자 이메일', '', email, ''], 
    ['등록자 서명','(서명란)','검토자 서명','(서명란)','승인자 서명','(서명란)','','','','','',''] 
  ]; 

  // 시트에 데이터 입력 
  sheet.forEach((row, i) => ws.addRow(row)); 
  ws.mergeCells('A1:L2'); // 제목 
  ws.mergeCells('A3:D3'); ws.mergeCells('E3:H3'); ws.mergeCells('I3:L3');
  ws.mergeCells('A4:D4'); ws.mergeCells('E4:H4'); ws.mergeCells('I4:L4');
  ws.mergeCells('A5:L5'); // 빈줄 
  ws.mergeCells('A6:B6'); ws.mergeCells('C6:L6'); 
  ws.mergeCells('A7:L7'); // 빈줄 
  ws.mergeCells('A19:G19'); 
  ws.mergeCells('A20:A21'); ws.mergeCells('B20:L21'); 
  ws.mergeCells('A22:L22'); // 비고 
  ws.mergeCells('A23:B23'); ws.mergeCells('E23:F23'); ws.mergeCells('I23:J23'); 
  ws.mergeCells('C23:D23'); ws.mergeCells('G23:H23'); ws.mergeCells('K23:L23'); 
  ws.mergeCells('G24:L24'); // 서명란 우측 

  // 스타일 지정 (간략화, 필요시 확장 가능) 
  ws.getRow(1).font = { name: '맑은 고딕', size: 16, bold: true }; 
  ws.getRow(8).font = { bold: true }; 
  ws.getRow(15).font = { bold: true }; // 서명란 

  ws.columns.forEach(col => { col.width = 16; }); 

  // 모든 셀 중앙정렬(가로·세로) 
  ws.eachRow((row) => { 
    row.eachCell({ includeEmpty: true }, (cell) => { 
      cell.alignment = { horizontal: 'center', vertical: 'middle' }; 
    }); 
  }); 

  // A1~L24 모든 셀에 thin 테두리 적용 
  for (let row = 1; row <= 24; row++) { 
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
  // 등록자 서명: B16 (col:1, row:15) 
  addSignatureToExcel("#signature-request", 1.1, 22.2); 
  // 검토자 서명: D16 (col:3, row:15) 
  addSignatureToExcel("#signature-review", 3.1, 22.2); 
  // 승인자 서명: F16 (col:5, row:15) 
  addSignatureToExcel("#signature-approve", 5.1, 22.2); 

  // 엑셀 파일 저장 
  const buf = await workbook.xlsx.writeBuffer(); 
  saveAs(new Blob([buf], {type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"}), "신규상품등록.xlsx"); 
  
  // 자동 저장
  saveToLocalStorage();
}

function printDocument() {
  // 인쇄용 창 생성
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  
  // 참조부서 여러개 수집
  const refDeptInputs = document.getElementsByName('refDept');
  const refDeptArr = [];
  for(let i=0;i<refDeptInputs.length;i++) {
    if(refDeptInputs[i].value.trim()) refDeptArr.push(refDeptInputs[i].value.trim());
  }
  const refDept = refDeptArr.join(', ');

  // 데이터 수집
  const reqDate = document.getElementById('reqDate').value;
  const reqNo = document.getElementById('reqNo').value;
  const reqUser = document.getElementById('reqUser').value;
  const manager = document.getElementById('manager').value;
  const contact = document.getElementById('contact').value;
  const email = document.getElementById('email').value;
  const remark = document.getElementById('remark').value;
  const total = Number(document.getElementById('total').value);

  // 품목 데이터 수집
  const items = [];
  for(let i=0;i<11;i++) {
    const code = document.getElementById('code'+i)?.value || "";
    const item = document.getElementById('item'+i)?.value || "";
    const spec = document.getElementById('spec'+i)?.value || "";
    const unit = document.getElementById('unit'+i)?.value || "";
    const qty = Number(document.getElementById('qty'+i)?.value) || 0;
    const price = Number(document.getElementById('price'+i)?.value) || 0;
    const amount = Number(document.getElementById('amount'+i)?.value) || 0;
    const vendor = document.getElementById('vendor'+i)?.value || "";
    const cat = document.getElementById('cat'+i)?.value || "";
    const wh = document.getElementById('wh'+i)?.value || "";
    const note = document.getElementById('note'+i)?.value || "";
    
    items.push({
      no: i+1, code, item,  spec, unit, qty, price, amount, vendor, cat, wh, note
    });
  }

  // 서명 데이터 수집
  const requestSignature = $("#signature-request").jSignature("getData", "image");
  const reviewSignature = $("#signature-review").jSignature("getData", "image");
  const approveSignature = $("#signature-approve").jSignature("getData", "image");

  // 인쇄용 HTML 생성
  const printHTML = generatePrintHTML({
    reqDate, reqNo, reqUser, refDept, manager, contact, email, remark, total, items,
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
  let itemRows = '';
  data.items.forEach(item => {
    itemRows += `
      <tr>
        <td>${item.no}</td>
        <td>${item.code}</td>
        <td>${item.item}</td>
        <td>${item.spec}</td>
        <td>${item.unit}</td>
        <td>${item.qty || ''}</td>
        <td>${item.price || ''}</td>
        <td>${item.amount || ''}</td>
        <td>${item.vendor}</td>
        <td>${item.cat}</td>
        <td>${item.wh}</td>
        <td>${item.note}</td>
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
      <title>신규상품등록</title>
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
        .item-table th, .item-table td { padding: 1px; font-size: 7px; }
        .item-table th:nth-child(1), .item-table td:nth-child(1) { width: 3%; }
        .item-table th:nth-child(2), .item-table td:nth-child(2) { width: 11%; }
        .item-table th:nth-child(3), .item-table td:nth-child(3) { width: 9%; }
        .item-table th:nth-child(4), .item-table td:nth-child(4) { width: 4%; }
        .item-table th:nth-child(5), .item-table td:nth-child(5) { width: 5%; }
        .item-table th:nth-child(6), .item-table td:nth-child(6) { width: 7%; }
        .item-table th:nth-child(7), .item-table td:nth-child(7) { width: 7%; }
        .item-table th:nth-child(8), .item-table td:nth-child(8) { width: 11%; }
        .item-table th:nth-child(9), .item-table td:nth-child(9) { width: 9%; }
        .item-table th:nth-child(10), .item-table td:nth-child(10) { width: 9%; }
        .item-table th:nth-child(11), .item-table td:nth-child(11) { width: 25%; }
      </style>
    </head>
    <body>
      <div class="title">신규상품등록</div>
      
      <table>
        <tr>
          <th>등록일자</th>
          <td>${data.reqDate}</td>
          <th>등록번호</th>
          <td>${data.reqNo}</td>
          <th>등록자</th>
          <td>${data.reqUser}</td>
        </tr>
        <tr>
          <th>참조부서</th>
          <td colspan="7" class="wide">${data.refDept}</td>
        </tr>
      </table>

      <table class="item-table">
        <tr>
          <th>순번</th><th>상품코드</th><th>품명</th><th>규격</th><th>단위</th><th>수량</th><th>단가</th><th>금액</th><th>거래처</th><th>카테고리</th><th>입고 창고</th><th>비고</th>
        </tr>
        ${itemRows}
        <tr>
          <td colspan="7" style="text-align:right;font-weight:bold;">합계</td>
          <td style="font-weight:bold;">${data.total.toLocaleString()}</td>
          <td colspan="5"></td>
        </tr>
      </table>

      <table>
        <tr>
          <th>비고</th>
          <td colspan="10" class="wide">${data.remark}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th>신규등록 담당자</th>
          <td>${data.manager}</td>
          <th>신규등록 담당자 연락처</th>
          <td>${data.contact}</td>
          <th>신규등록 담당자 이메일</th>
          <td colspan="2">${data.email}</td>
        </tr>
      </table>

      <table>
        <tr>
          <th>등록자 서명</th>
          <td class="signature-cell" colspan="2">${requestSignatureImg}</td>
          <th>검토자 서명</th>
          <td class="signature-cell" colspan="2">${reviewSignatureImg}</td>
          <th>승인자 서명</th>
          <td class="signature-cell" colspan="2">${approveSignatureImg}</td>
        </tr>
      </table>
    </body>
    </html>
  `;
}