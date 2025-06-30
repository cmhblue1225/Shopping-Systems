// --------------------------------------------------------------------------------
// 1. 초기화 (Initialization)
// --------------------------------------------------------------------------------

// jSignature 패드 3개 초기화
$(function() {
  // 서명패드 설정
  const signatureOptions = { 
    width: 150, 
    height: 80, 
    color: "#111", 
    lineWidth: 2, 
    backgroundColor: "#fff" 
  };

  // 서명패드 초기화
  $("#signature-request").jSignature(signatureOptions);
  $("#signature-review").jSignature(signatureOptions);
  $("#signature-approve").jSignature(signatureOptions);

  // 지우기 버튼 이벤트
  $("#clear-signature-request").click(() => $("#signature-request").jSignature("reset"));
  $("#clear-signature-review").click(() => $("#signature-review").jSignature("reset"));
  $("#clear-signature-approve").click(() => $("#signature-approve").jSignature("reset"));

  // 오늘 날짜 자동 설정
  const today = new Date().toISOString().substring(0, 10);
  document.getElementById('regDate').value = today;
});

// --------------------------------------------------------------------------------
// 2. 데이터 관리 (저장/불러오기)
// --------------------------------------------------------------------------------

const LOCAL_STORAGE_KEY = '거래처등록_저장목록';

// 모든 입력 필드의 ID 목록
const ALL_FIELD_IDS = [
  'regDate', 'regMd', 'vendorName', 'bizRegNum', 'corpRegNum', 'ceoName', 'vendorTel', 
  'bizType', 'bizItem', 'bizAddr', 'faxNum', 'websiteUrl', 'contactName', 'contactMobile', 
  'contactEmail', 'paymentContactName', 'paymentContactTel', 'bankName', 'bankAccountNum', 
  'bankAccountHolder', 'taxEmail', 'dealType', 'supplyCategory', 'paymentCycle', 
  'commissionRate', 'contractStartDate', 'contractEndDate', 'shippingAddr', 'returnAddr', 'remark'
];

// 저장 다이얼로그 열기
function showSaveDialog() {
  document.getElementById('saveDialog').style.display = 'flex';
  const vendorName = document.getElementById('vendorName').value.trim();
  const defaultName = vendorName ? `거래처등록_${vendorName}` : `거래처등록_${new Date().toISOString().slice(0,10)}`;
  document.getElementById('saveNameInput').value = defaultName;
}

// 저장 다이얼로그 닫기
function closeSaveDialog() {
  document.getElementById('saveDialog').style.display = 'none';
}

// 데이터 저장
function saveData() {
  const saveName = document.getElementById('saveNameInput').value.trim();
  if (!saveName) {
    alert('저장할 이름을 입력해주세요.');
    return;
  }

  const formData = {};
  ALL_FIELD_IDS.forEach(id => {
    formData[id] = document.getElementById(id).value;
  });

  try {
    formData.signatures = {
      request: $("#signature-request").jSignature("getData", "image"),
      review: $("#signature-review").jSignature("getData", "image"),
      approve: $("#signature-approve").jSignature("getData", "image")
    };
  } catch(e) {
    console.error('서명 데이터 수집 중 오류:', e);
  }
  
  formData.savedAt = new Date().toISOString();

  const savedDataList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
  savedDataList[saveName] = formData;
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedDataList));

  alert('저장되었습니다.');
  closeSaveDialog();
}

// 불러오기 다이얼로그 열기
function showLoadDialog() {
  document.getElementById('loadDialog').style.display = 'flex';
  loadSavedDataList();
}

// 불러오기 다이얼로그 닫기
function closeLoadDialog() {
  document.getElementById('loadDialog').style.display = 'none';
}

// 저장된 데이터 목록 표시
function loadSavedDataList() {
  const savedDataList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
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
          <button class="load-btn" onclick="loadSavedData('''${name}''')">불러오기</button>
          <button class="delete-btn" onclick="deleteSavedData('''${name}''')">삭제</button>
        </div>
      </div>
    `;
  }
  listContainer.innerHTML = html;
}

// 선택한 데이터 불러오기
function loadSavedData(name) {
  const savedDataList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
  const data = savedDataList[name];
  
  if (!data) {
    alert('저장된 데이터를 찾을 수 없습니다.');
    return;
  }

  ALL_FIELD_IDS.forEach(id => {
    if(document.getElementById(id)) {
      document.getElementById(id).value = data[id] || '';
    }
  });

  // 서명 데이터 복원
  try {
    $("#signature-request").jSignature("reset");
    $("#signature-review").jSignature("reset");
    $("#signature-approve").jSignature("reset");
    if(data.signatures) {
      if(data.signatures.request && data.signatures.request[1]) $("#signature-request").jSignature("setData", "data:" + data.signatures.request.join(","));
      if(data.signatures.review && data.signatures.review[1]) $("#signature-review").jSignature("setData", "data:" + data.signatures.review.join(","));
      if(data.signatures.approve && data.signatures.approve[1]) $("#signature-approve").jSignature("setData", "data:" + data.signatures.approve.join(","));
    }
  } catch(e) {
    console.error('서명 데이터 복원 중 오류:', e);
  }

  closeLoadDialog();
  alert('데이터를 불러왔습니다.');
}

// 데이터 삭제
function deleteSavedData(name) {
  if (confirm(`'${name}' 데이터를 삭제하시겠습니까?`)) {
    const savedDataList = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '{}');
    delete savedDataList[name];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(savedDataList));
    loadSavedDataList();
    alert('삭제되었습니다.');
  }
}

// --------------------------------------------------------------------------------
// 3. 엑셀 및 인쇄 기능
// --------------------------------------------------------------------------------

// 현재 폼 데이터 수집
function getFormData() {
  const data = {};
  ALL_FIELD_IDS.forEach(id => {
    data[id] = document.getElementById(id).value;
  });
  try {
    data.signatures = {
      request: $("#signature-request").jSignature("getData", "image"),
      review: $("#signature-review").jSignature("getData", "image"),
      approve: $("#signature-approve").jSignature("getData", "image")
    };
  } catch(e) {
    console.error('서명 데이터 수집 중 오류:', e);
    data.signatures = {};
  }
  return data;
}

// 엑셀 다운로드 (v5 - 가독성 개선)
async function downloadExcel() {
  const data = getFormData();
  const workbook = new ExcelJS.Workbook();
  const ws = workbook.addWorksheet('거래처등록신청서');

  // --- 스타일 정의 (폰트 및 크기 조정) ---
  const border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
  const titleStyle = { font: { name: '맑은 고딕', size: 22, bold: true }, alignment: { vertical: 'middle', horizontal: 'center' } };
  const sectionStyle = { font: { name: '맑은 고딕', size: 14, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } }, border: { bottom: { style: 'medium', color: { argb: 'FF000000' } } } };
  const headerStyle = { font: { name: '맑은 고딕', size: 12, bold: true }, fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } }, alignment: { vertical: 'middle', horizontal: 'center' }, border };
  const cellStyle = { font: { name: '맑은 고딕', size: 12 }, alignment: { vertical: 'middle', horizontal: 'left', wrapText: true, indent: 1 }, border };
  const remarkStyle = { ...cellStyle, alignment: { ...cellStyle.alignment, vertical: 'top' } };
  const signatureHeaderStyle = { ...headerStyle, font: { ...headerStyle.font, size: 12 } };
  const signatureCellStyle = { alignment: { vertical: 'middle', horizontal: 'center' }, border };

  // --- 레이아웃 설정 (열 너비 확장) ---
  ws.columns = [ { width: 20 }, { width: 25 }, { width: 25 }, { width: 20 }, { width: 25 }, { width: 25 } ];

  // --- 헬퍼 함수 ---
  const applyStyleToRow = (row, style) => {
    row.eachCell({ includeEmpty: true }, cell => { cell.style = style; });
  };

  // --- 시트 생성 (행 높이 조정) ---
  ws.addRow([]);
  const titleRow = ws.addRow(['거래처 등록 신청서']);
  titleRow.height = 50; // 높이 증가
  ws.mergeCells(titleRow.number, 1, titleRow.number, 6);
  titleRow.getCell(1).style = titleStyle;
  ws.addRow([]);

  const addSection = (title) => {
    const row = ws.addRow([title]);
    row.height = 42; // 높이 증가
    ws.mergeCells(row.number, 1, row.number, 6);
    row.getCell(1).style = sectionStyle;
  };

  const addDataRow = (item1, item2 = null) => {
    const row = ws.addRow([]);
    row.height = 34; // 높이 증가

    row.getCell(1).value = item1.header;
    row.getCell(1).style = headerStyle;
    ws.mergeCells(row.number, 2, row.number, item2 ? 3 : 6);
    row.getCell(2).value = item1.value;
    applyStyleToRow(row, cellStyle);
    row.getCell(1).style = headerStyle;

    if (item2) {
      row.getCell(4).value = item2.header;
      row.getCell(4).style = headerStyle;
      ws.mergeCells(row.number, 5, row.number, 6);
      row.getCell(5).value = item2.value;
    }
  };

  // --- 데이터 채우기 ---
  addSection('■ 등록자 정보');
  addDataRow({ header: '등록일', value: data.regDate }, { header: '등록 담당자 (MD)', value: data.regMd });

  addSection('■ 1. 기본 정보');
  addDataRow({ header: '거래처명', value: data.vendorName });
  addDataRow({ header: '사업자등록번호', value: data.bizRegNum }, { header: '법인등록번호', value: data.corpRegNum });
  addDataRow({ header: '대표자명', value: data.ceoName }, { header: '대표전화', value: data.vendorTel });
  addDataRow({ header: '업태', value: data.bizType }, { header: '종목', value: data.bizItem });
  addDataRow({ header: '사업장 주소', value: data.bizAddr });
  addDataRow({ header: '팩스번호', value: data.faxNum }, { header: '쇼핑몰/웹사이트', value: data.websiteUrl });

  addSection('■ 2. 담당자 정보');
  addDataRow({ header: '담당자명', value: data.contactName }, { header: '휴대폰번호', value: data.contactMobile });
  addDataRow({ header: '이메일', value: data.contactEmail }, { header: '정산 담당자', value: data.paymentContactName });
  addDataRow({ header: '정산 담당자 연락처', value: data.paymentContactTel });

  addSection('■ 3. 정산 정보');
  addDataRow({ header: '은행명', value: data.bankName }, { header: '계좌번호', value: data.bankAccountNum });
  addDataRow({ header: '예금주', value: data.bankAccountHolder }, { header: '세금계산서 이메일', value: data.taxEmail });

  addSection('■ 4. 계약 및 운영 정보');
  addDataRow({ header: '거래형태', value: data.dealType }, { header: '공급 카테고리', value: data.supplyCategory });
  addDataRow({ header: '정산주기/지급조건', value: data.paymentCycle }, { header: '수수료율 (%)', value: data.commissionRate });
  addDataRow({ header: '계약 시작일', value: data.contractStartDate }, { header: '계약 종료일', value: data.contractEndDate });
  addDataRow({ header: '출고지 주소', value: data.shippingAddr });
  addDataRow({ header: '반품/교환 주소', value: data.returnAddr });

  addSection('■ 5. 특이사항');
  const remarkRow = ws.addRow([data.remark]);
  remarkRow.height = 100; // 높이 증가
  ws.mergeCells(remarkRow.number, 1, remarkRow.number, 6);

  // 병합된 모든 셀(A~F)에 테두리 적용
  for (let i = 1; i <= 6; i++) {
  remarkRow.getCell(i).style = {
    ...remarkStyle,
    border: {
      ...remarkStyle.border,
      top: { style: 'thin', color: { argb: 'FF000000' } }
    }
  };
}
  //ws.addRow([]);

  addSection('■ 6. 승인');
  const sigHeaderRow = ws.addRow(['담당자 (MD)', '', '팀장 검토', '', '부서장 승인', '']);
  sigHeaderRow.height = 28; // 높이 증가
  ws.mergeCells(sigHeaderRow.number, 1, sigHeaderRow.number, 2);
  ws.mergeCells(sigHeaderRow.number, 3, sigHeaderRow.number, 4);
  ws.mergeCells(sigHeaderRow.number, 5, sigHeaderRow.number, 6);
  sigHeaderRow.getCell(1).style = signatureHeaderStyle;
  sigHeaderRow.getCell(3).style = signatureHeaderStyle;
  sigHeaderRow.getCell(5).style = signatureHeaderStyle;

  const sigCellRow = ws.addRow([]);
  sigCellRow.height = 110; // 높이 증가
  ws.mergeCells(sigCellRow.number, 1, sigCellRow.number, 2);
  ws.mergeCells(sigCellRow.number, 3, sigCellRow.number, 4);
  ws.mergeCells(sigCellRow.number, 5, sigCellRow.number, 6);
  applyStyleToRow(sigCellRow, signatureCellStyle);
  for (let i = 1; i <= 6; i++) {
  sigHeaderRow.getCell(i).style = signatureHeaderStyle;
}

  const addSignature = (sigData, col) => {
    if (sigData && sigData[1]) {
      const imageId = workbook.addImage({ base64: `data:image/png;base64,${sigData[1]}`, extension: 'png' });
      ws.addImage(imageId, {
        tl: { col: col, row: sigCellRow.number - 1 + 0.2 },
        ext: { width: 150, height: 80 }
      });
    }
  };
  addSignature(data.signatures.request, 0.2);
  addSignature(data.signatures.review, 2.2);
  addSignature(data.signatures.approve, 4.2);

  // --- 파일 저장 ---
  const buf = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `${data.vendorName || '거래처'}_등록신청서.xlsx`);
}

// 인쇄
function printDocument() {
  const data = getFormData();
  const printWindow = window.open('', '_blank', 'width=1000,height=800');
  
  const signatureImg = (sigData) => sigData && sigData[1] ? `<img src="data:image/png;base64,${sigData[1]}" class="signature-img">` : '';

  const html = `
    <!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><title>거래처 등록 신청서</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body { font-family: '맑은 고딕', sans-serif; font-size: 10pt; }
      table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
      th, td { border: 1px solid #333; padding: 5px; text-align: left; vertical-align: middle; }
      th { background-color: #f2f2f2; text-align: center; font-weight: bold; }
      .title { font-size: 20pt; font-weight: bold; text-align: center; margin-bottom: 20px; }
      .section-title { font-size: 12pt; font-weight: bold; margin-top: 15px; margin-bottom: 5px; padding-bottom: 3px; border-bottom: 2px solid #333; }
      .signature-cell { height: 100px; text-align: center; position: relative; }
      .signature-img { max-width: 150px; max-height: 80px; }
    </style></head><body>
    <div class="title">거래처 등록 신청서</div>
    <div class="section-title">등록자 정보</div>
    <table>
      <tr><th>등록일</th><td>${data.regDate}</td><th>등록 담당자 (MD)</th><td>${data.regMd}</td></tr>
    </table>
    <div class="section-title">1. 기본 정보</div>
    <table>
      <tr><th style="width:15%;">거래처명</th><td colspan="3">${data.vendorName}</td></tr>
      <tr><th>사업자등록번호</th><td style="width:35%;">${data.bizRegNum}</td><th style="width:15%;">법인등록번호</th><td style="width:35%;">${data.corpRegNum}</td></tr>
      <tr><th>대표자명</th><td>${data.ceoName}</td><th>대표전화</th><td>${data.vendorTel}</td></tr>
      <tr><th>업태</th><td>${data.bizType}</td><th>종목</th><td>${data.bizItem}</td></tr>
      <tr><th>사업장 주소</th><td colspan="3">${data.bizAddr}</td></tr>
      <tr><th>팩스번호</th><td>${data.faxNum}</td><th>쇼핑몰/웹사이트</th><td>${data.websiteUrl}</td></tr>
    </table>
    <div class="section-title">2. 담당자 정보</div>
    <table>
      <tr><th style="width:15%;">담당자명</th><td style="width:35%;">${data.contactName}</td><th style="width:15%;">휴대폰번호</th><td style="width:35%;">${data.contactMobile}</td></tr>
      <tr><th>이메일</th><td>${data.contactEmail}</td><th>정산 담당자</th><td>${data.paymentContactName}</td></tr>
      <tr><th>정산 담당자 연락처</th><td colspan="3">${data.paymentContactTel}</td></tr>
    </table>
    <div class="section-title">3. 정산 정보</div>
    <table>
      <tr><th style="width:15%;">은행명</th><td style="width:35%;">${data.bankName}</td><th style="width:15%;">계좌번호</th><td style="width:35%;">${data.bankAccountNum}</td></tr>
      <tr><th>예금주</th><td>${data.bankAccountHolder}</td><th>세금계산서 이메일</th><td>${data.taxEmail}</td></tr>
    </table>
    <div class="section-title">4. 계약 및 운영 정보</div>
    <table>
      <tr><th style="width:15%;">거래형태</th><td style="width:35%;">${data.dealType}</td><th style="width:15%;">공급 카테고리</th><td style="width:35%;">${data.supplyCategory}</td></tr>
      <tr><th>정산주기/지급조건</th><td>${data.paymentCycle}</td><th>수수료율 (%)</th><td>${data.commissionRate}</td></tr>
      <tr><th>계약 시작일</th><td>${data.contractStartDate}</td><th>계약 종료일</th><td>${data.contractEndDate}</td></tr>
      <tr><th>출고지 주소</th><td colspan="3">${data.shippingAddr}</td></tr>
      <tr><th>반품/교환 주소</th><td colspan="3">${data.returnAddr}</td></tr>
    </table>
    <div class="section-title">5. 특이사항</div>
    <table><tr><td style="height: 80px; vertical-align: top;">${data.remark}</td></tr></table>
    <div class="section-title">6. 승인</div>
    <table>
      <tr><th style="width:33.3%;">담당자 (MD)</th><th style="width:33.3%;">팀장 검토</th><th style="width:33.3%;">부서장 승인</th></tr>
      <tr>
        <td class="signature-cell">${signatureImg(data.signatures.request)}</td>
        <td class="signature-cell">${signatureImg(data.signatures.review)}</td>
        <td class="signature-cell">${signatureImg(data.signatures.approve)}</td>
      </tr>
    </table>
    </body></html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 500);
}
