// 전역 변수
let allData = [];
let filteredData = [];
let currentViewData = null;

// 페이지 로드 시 초기화
$(document).ready(function() {
    // 오늘 날짜를 기준으로 기본 검색 범위 설정 (지난 30일)
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById('startDate').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    // 자동완성 설정
    setupAutocomplete();
    
    // 초기 데이터 로드
    loadData();
    
    // 자동 검색 (초기에 모든 데이터 표시)
    searchData();
});

// 데이터 로드
function loadData() {
    const savedDataList = JSON.parse(localStorage.getItem('거래처등록_저장목록') || '{}');
    allData = Object.entries(savedDataList).map(([name, data]) => ({
        ...data,
        savedName: name
    }));
    
    // 자동완성 데이터 업데이트
    updateAutocompleteOptions();
}

// 자동완성 설정
function setupAutocomplete() {
    const autocompleteFields = [
        { inputId: 'regMdFilter', listId: 'regMdAutocomplete' },
        { inputId: 'vendorNameFilter', listId: 'vendorNameAutocomplete' },
        { inputId: 'bizRegNumFilter', listId: 'bizRegNumAutocomplete' },
        { inputId: 'ceoNameFilter', listId: 'ceoNameAutocomplete' },
        { inputId: 'bizTypeFilter', listId: 'bizTypeAutocomplete' },
        { inputId: 'bizItemFilter', listId: 'bizItemAutocomplete' },
        { inputId: 'dealTypeFilter', listId: 'dealTypeAutocomplete' },
        { inputId: 'supplyCategoryFilter', listId: 'supplyCategoryAutocomplete' },
        { inputId: 'contactNameFilter', listId: 'contactNameAutocomplete' }
    ];
    
    autocompleteFields.forEach(field => {
        const input = document.getElementById(field.inputId);
        const list = document.getElementById(field.listId);
        
        input.addEventListener('input', function() {
            showAutocomplete(this, list, field.inputId);
        });
        
        input.addEventListener('blur', function() {
            setTimeout(() => {
                list.style.display = 'none';
            }, 200);
        });
        
        input.addEventListener('focus', function() {
            if (this.value) {
                showAutocomplete(this, list, field.inputId);
            }
        });
    });
}

// 자동완성 옵션 업데이트
function updateAutocompleteOptions() {
    // 각 필드별 고유값 수집
    const options = {
        regMd: new Set(),
        vendorName: new Set(),
        bizRegNum: new Set(),
        ceoName: new Set(),
        bizType: new Set(),
        bizItem: new Set(),
        dealType: new Set(),
        supplyCategory: new Set(),
        contactName: new Set()
    };
    
    allData.forEach(data => {
        if (data.regMd) options.regMd.add(data.regMd);
        if (data.vendorName) options.vendorName.add(data.vendorName);
        if (data.bizRegNum) options.bizRegNum.add(data.bizRegNum);
        if (data.ceoName) options.ceoName.add(data.ceoName);
        if (data.bizType) options.bizType.add(data.bizType);
        if (data.bizItem) options.bizItem.add(data.bizItem);
        if (data.dealType) options.dealType.add(data.dealType);
        if (data.supplyCategory) options.supplyCategory.add(data.supplyCategory);
        if (data.contactName) options.contactName.add(data.contactName);
    });
    
    // 자동완성 데이터 저장
    window.autocompleteOptions = {
        regMdFilter: Array.from(options.regMd),
        vendorNameFilter: Array.from(options.vendorName),
        bizRegNumFilter: Array.from(options.bizRegNum),
        ceoNameFilter: Array.from(options.ceoName),
        bizTypeFilter: Array.from(options.bizType),
        bizItemFilter: Array.from(options.bizItem),
        dealTypeFilter: Array.from(options.dealType),
        supplyCategoryFilter: Array.from(options.supplyCategory),
        contactNameFilter: Array.from(options.contactName)
    };
}

// 자동완성 표시
function showAutocomplete(input, list, fieldId) {
    const value = input.value.toLowerCase();
    const options = window.autocompleteOptions[fieldId] || [];
    
    if (value.length === 0) {
        list.style.display = 'none';
        return;
    }
    
    const filteredOptions = options.filter(option => 
        option.toLowerCase().includes(value)
    );
    
    if (filteredOptions.length === 0) {
        list.style.display = 'none';
        return;
    }
    
    list.innerHTML = filteredOptions.map(option => 
        `<div class="autocomplete-item" onclick="selectAutocomplete('${fieldId}', '${option}')">${option}</div>`
    ).join('');
    
    list.style.display = 'block';
}

// 자동완성 선택
function selectAutocomplete(fieldId, value) {
    document.getElementById(fieldId).value = value;
    document.getElementById(fieldId.replace('Filter', 'Autocomplete')).style.display = 'none';
}

// 검색 실행
function searchData() {
    const filters = {
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value,
        regMd: document.getElementById('regMdFilter').value.toLowerCase(),
        vendorName: document.getElementById('vendorNameFilter').value.toLowerCase(),
        bizRegNum: document.getElementById('bizRegNumFilter').value.toLowerCase(),
        ceoName: document.getElementById('ceoNameFilter').value.toLowerCase(),
        bizType: document.getElementById('bizTypeFilter').value.toLowerCase(),
        bizItem: document.getElementById('bizItemFilter').value.toLowerCase(),
        dealType: document.getElementById('dealTypeFilter').value.toLowerCase(),
        supplyCategory: document.getElementById('supplyCategoryFilter').value.toLowerCase(),
        contactName: document.getElementById('contactNameFilter').value.toLowerCase()
    };
    
    filteredData = allData.filter(data => {
        // 날짜 필터
        if (filters.startDate && data.regDate < filters.startDate) return false;
        if (filters.endDate && data.regDate > filters.endDate) return false;
        
        // 등록담당자(MD) 필터
        if (filters.regMd && !data.regMd.toLowerCase().includes(filters.regMd)) return false;
        
        // 거래처명 필터
        if (filters.vendorName && !data.vendorName.toLowerCase().includes(filters.vendorName)) return false;
        
        // 사업자등록번호 필터
        if (filters.bizRegNum && !data.bizRegNum.toLowerCase().includes(filters.bizRegNum)) return false;
        
        // 대표자명 필터
        if (filters.ceoName && !data.ceoName.toLowerCase().includes(filters.ceoName)) return false;
        
        // 업태 필터
        if (filters.bizType && !data.bizType.toLowerCase().includes(filters.bizType)) return false;
        
        // 종목 필터
        if (filters.bizItem && !data.bizItem.toLowerCase().includes(filters.bizItem)) return false;
        
        // 거래형태 필터
        if (filters.dealType && !data.dealType.toLowerCase().includes(filters.dealType)) return false;
        
        // 공급카테고리 필터
        if (filters.supplyCategory && !data.supplyCategory.toLowerCase().includes(filters.supplyCategory)) return false;
        
        // 담당자명 필터
        if (filters.contactName && !data.contactName.toLowerCase().includes(filters.contactName)) return false;
        
        return true;
    });
    
    renderResults();
}

// 결과 테이블 렌더링
function renderResults() {
    const tbody = document.getElementById('resultsTableBody');
    const resultsCount = document.getElementById('resultsCount');
    
    resultsCount.textContent = `총 ${filteredData.length}건`;
    
    if (filteredData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="13" class="empty-state">
                    <div class="empty-state-icon">🏢</div>
                    <div>검색 결과가 없습니다.</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredData.map((data, index) => {
        const savedDate = new Date(data.savedAt).toLocaleString('ko-KR');
        
        return `
            <tr>
                <td><input type="checkbox" class="row-checkbox" data-index="${index}"></td>
                <td>${data.regDate}</td>
                <td>${data.regMd}</td>
                <td>${data.vendorName}</td>
                <td>${data.bizRegNum}</td>
                <td>${data.ceoName}</td>
                <td>${data.bizType}</td>
                <td>${data.dealType}</td>
                <td>${data.supplyCategory}</td>
                <td>${data.contactName}</td>
                <td>${data.contactMobile}</td>
                <td>${savedDate}</td>
                <td>
                    <button class="view-btn" onclick="viewDetail(${index})">상세</button>
                    <button class="delete-btn" onclick="deleteData('${data.savedName}', ${index})">삭제</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 필터 초기화
function resetFilters() {
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    document.getElementById('regMdFilter').value = '';
    document.getElementById('vendorNameFilter').value = '';
    document.getElementById('bizRegNumFilter').value = '';
    document.getElementById('ceoNameFilter').value = '';
    document.getElementById('bizTypeFilter').value = '';
    document.getElementById('bizItemFilter').value = '';
    document.getElementById('dealTypeFilter').value = '';
    document.getElementById('supplyCategoryFilter').value = '';
    document.getElementById('contactNameFilter').value = '';
    
    // 오늘 날짜를 기준으로 기본 검색 범위 재설정
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById('startDate').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('endDate').value = today.toISOString().split('T')[0];
    
    searchData();
}

// 전체 선택/해제
function toggleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAllCheckbox');
    const rowCheckboxes = document.querySelectorAll('.row-checkbox');
    
    rowCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
}

// 선택된 항목 엑셀 출력
function exportSelectedToExcel() {
    const selectedIndexes = [];
    document.querySelectorAll('.row-checkbox:checked').forEach(checkbox => {
        selectedIndexes.push(parseInt(checkbox.dataset.index));
    });
    
    if (selectedIndexes.length === 0) {
        alert('엑셀로 출력할 항목을 선택해주세요.');
        return;
    }
    
    const selectedData = selectedIndexes.map(index => filteredData[index]);
    exportToExcel(selectedData, `거래처등록_조회결과_${new Date().toISOString().split('T')[0]}.xlsx`);
}

// 선택된 항목 인쇄
function printSelected() {
    const selectedIndexes = [];
    document.querySelectorAll('.row-checkbox:checked').forEach(checkbox => {
        selectedIndexes.push(parseInt(checkbox.dataset.index));
    });
    
    if (selectedIndexes.length === 0) {
        alert('인쇄할 항목을 선택해주세요.');
        return;
    }
    
    const selectedData = selectedIndexes.map(index => filteredData[index]);
    printData(selectedData);
}

// 상세보기
function viewDetail(index) {
    currentViewData = filteredData[index];
    const dialog = document.getElementById('viewDialog');
    const content = document.getElementById('viewDialogContent');
    
    // 상세 정보 HTML 생성
    content.innerHTML = `
        <div style="font-size: 14px;">
            <h4>등록자 정보</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">등록일</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.regDate}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">등록 담당자 (MD)</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.regMd}</td>
                </tr>
            </table>
            
            <h4>1. 기본 정보</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">거래처명</th>
                    <td style="border: 1px solid #ddd; padding: 8px;" colspan="3">${currentViewData.vendorName}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">사업자등록번호</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.bizRegNum}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">법인등록번호</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.corpRegNum || ''}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">대표자명</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.ceoName}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">대표전화</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.vendorTel}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">업태</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.bizType}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">종목</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.bizItem}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">사업장 주소</th>
                    <td style="border: 1px solid #ddd; padding: 8px;" colspan="3">${currentViewData.bizAddr}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">팩스번호</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.faxNum}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">쇼핑몰/웹사이트</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.websiteUrl}</td>
                </tr>
            </table>
            
            <h4>2. 담당자 정보</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">담당자명</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.contactName}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">휴대폰번호</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.contactMobile}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">이메일</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.contactEmail}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">정산 담당자</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.paymentContactName || ''}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">정산 담당자 연락처</th>
                    <td style="border: 1px solid #ddd; padding: 8px;" colspan="3">${currentViewData.paymentContactTel || ''}</td>
                </tr>
            </table>
            
            <h4>3. 정산 정보</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">은행명</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.bankName}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">계좌번호</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.bankAccountNum}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">예금주</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.bankAccountHolder}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">세금계산서 발행 이메일</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.taxEmail}</td>
                </tr>
            </table>
            
            <h4>4. 계약 및 운영 정보</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">거래형태</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.dealType}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">공급 카테고리</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.supplyCategory}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">정산주기/지급조건</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.paymentCycle}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">수수료율 (%)</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.commissionRate}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">계약 시작일</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.contractStartDate}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">계약 종료일</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.contractEndDate}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">출고지 주소</th>
                    <td style="border: 1px solid #ddd; padding: 8px;" colspan="3">${currentViewData.shippingAddr}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">반품/교환 주소</th>
                    <td style="border: 1px solid #ddd; padding: 8px;" colspan="3">${currentViewData.returnAddr}</td>
                </tr>
            </table>
            
            <h4>5. 특이사항</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;" colspan="4">${currentViewData.remark}</td>
                </tr>
            </table>
        </div>
    `;
    
    dialog.style.display = 'flex';
}

// 상세보기 다이얼로그 닫기
function closeViewDialog() {
    document.getElementById('viewDialog').style.display = 'none';
    currentViewData = null;
}

// 단일 항목 엑셀 출력
function exportSingleToExcel() {
    if (!currentViewData) return;
    
    exportToExcel([currentViewData], `거래처등록_${currentViewData.vendorName}_${currentViewData.regDate}.xlsx`);
}

// 단일 항목 인쇄
function printSingle() {
    if (!currentViewData) return;
    
    printData([currentViewData]);
}

// 엑셀 출력 함수
async function exportToExcel(data, filename) {
    try {
        const ExcelJS = window.ExcelJS;
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('거래처등록');
        
        // 헤더 설정
        worksheet.columns = [
            { header: '등록일', key: 'regDate', width: 12 },
            { header: '등록담당자(MD)', key: 'regMd', width: 15 },
            { header: '거래처명', key: 'vendorName', width: 25 },
            { header: '사업자등록번호', key: 'bizRegNum', width: 18 },
            { header: '법인등록번호', key: 'corpRegNum', width: 20 },
            { header: '대표자명', key: 'ceoName', width: 12 },
            { header: '대표전화', key: 'vendorTel', width: 15 },
            { header: '업태', key: 'bizType', width: 15 },
            { header: '종목', key: 'bizItem', width: 15 },
            { header: '사업장주소', key: 'bizAddr', width: 30 },
            { header: '팩스번호', key: 'faxNum', width: 15 },
            { header: '웹사이트', key: 'websiteUrl', width: 25 },
            { header: '담당자명', key: 'contactName', width: 12 },
            { header: '담당자연락처', key: 'contactMobile', width: 15 },
            { header: '담당자이메일', key: 'contactEmail', width: 25 },
            { header: '정산담당자', key: 'paymentContactName', width: 12 },
            { header: '정산담당자연락처', key: 'paymentContactTel', width: 15 },
            { header: '은행명', key: 'bankName', width: 12 },
            { header: '계좌번호', key: 'bankAccountNum', width: 20 },
            { header: '예금주', key: 'bankAccountHolder', width: 15 },
            { header: '세금계산서이메일', key: 'taxEmail', width: 25 },
            { header: '거래형태', key: 'dealType', width: 12 },
            { header: '공급카테고리', key: 'supplyCategory', width: 15 },
            { header: '정산주기', key: 'paymentCycle', width: 20 },
            { header: '수수료율(%)', key: 'commissionRate', width: 12 },
            { header: '계약시작일', key: 'contractStartDate', width: 12 },
            { header: '계약종료일', key: 'contractEndDate', width: 12 },
            { header: '출고지주소', key: 'shippingAddr', width: 30 },
            { header: '반품/교환주소', key: 'returnAddr', width: 30 },
            { header: '특이사항', key: 'remark', width: 30 }
        ];
        
        // 데이터 추가
        data.forEach(item => {
            worksheet.addRow({
                regDate: item.regDate,
                regMd: item.regMd,
                vendorName: item.vendorName,
                bizRegNum: item.bizRegNum,
                corpRegNum: item.corpRegNum || '',
                ceoName: item.ceoName,
                vendorTel: item.vendorTel,
                bizType: item.bizType,
                bizItem: item.bizItem,
                bizAddr: item.bizAddr,
                faxNum: item.faxNum,
                websiteUrl: item.websiteUrl,
                contactName: item.contactName,
                contactMobile: item.contactMobile,
                contactEmail: item.contactEmail,
                paymentContactName: item.paymentContactName || '',
                paymentContactTel: item.paymentContactTel || '',
                bankName: item.bankName,
                bankAccountNum: item.bankAccountNum,
                bankAccountHolder: item.bankAccountHolder,
                taxEmail: item.taxEmail,
                dealType: item.dealType,
                supplyCategory: item.supplyCategory,
                paymentCycle: item.paymentCycle,
                commissionRate: item.commissionRate,
                contractStartDate: item.contractStartDate,
                contractEndDate: item.contractEndDate,
                shippingAddr: item.shippingAddr,
                returnAddr: item.returnAddr,
                remark: item.remark
            });
        });
        
        // 스타일 적용
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE9ECEF' }
        };
        
        // 테두리 적용
        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
            row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                cell.border = {
                    top: { style: 'thin' },
                    left: { style: 'thin' },
                    bottom: { style: 'thin' },
                    right: { style: 'thin' }
                };
            });
        });
        
        // 파일 저장
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, filename);
        
    } catch (error) {
        console.error('엑셀 출력 오류:', error);
        alert('엑셀 파일 생성 중 오류가 발생했습니다: ' + error.message);
    }
}

// 인쇄 함수
function printData(data) {
    const printWindow = window.open('', '_blank');
    
    const printContent = data.map(item => {
        return `
            <div style="page-break-after: always; margin-bottom: 30px;">
                <h2 style="text-align: center; margin-bottom: 20px;">거래처 등록 신청서</h2>
                
                <h4>등록자 정보</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">등록일</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.regDate}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">등록 담당자 (MD)</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.regMd}</td>
                    </tr>
                </table>
                
                <h4>1. 기본 정보</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">거래처명</th>
                        <td style="border: 1px solid #000; padding: 8px;" colspan="3">${item.vendorName}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">사업자등록번호</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.bizRegNum}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">법인등록번호</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.corpRegNum || ''}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">대표자명</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.ceoName}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">대표전화</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.vendorTel}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">업태</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.bizType}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">종목</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.bizItem}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">사업장 주소</th>
                        <td style="border: 1px solid #000; padding: 8px;" colspan="3">${item.bizAddr}</td>
                    </tr>
                </table>
                
                <h4>2. 담당자 정보</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">담당자명</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.contactName}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">휴대폰번호</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.contactMobile}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">이메일</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.contactEmail}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">정산 담당자</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.paymentContactName || ''}</td>
                    </tr>
                </table>
                
                <h4>3. 정산 정보</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">은행명</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.bankName}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">계좌번호</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.bankAccountNum}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">예금주</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.bankAccountHolder}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">세금계산서 발행 이메일</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.taxEmail}</td>
                    </tr>
                </table>
                
                <h4>4. 계약 및 운영 정보</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">거래형태</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.dealType}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">공급 카테고리</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.supplyCategory}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">정산주기/지급조건</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.paymentCycle}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">수수료율 (%)</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.commissionRate}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">계약 시작일</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.contractStartDate}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">계약 종료일</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.contractEndDate}</td>
                    </tr>
                </table>
                
                <h4>5. 특이사항</h4>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <td style="border: 1px solid #000; padding: 8px;" colspan="4">${item.remark}</td>
                    </tr>
                </table>
            </div>
        `;
    }).join('');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>거래처 등록 신청서 인쇄</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                table { border-collapse: collapse; }
                th, td { border: 1px solid #000; padding: 8px; text-align: center; }
                th { background-color: #f5f5f5; }
                @media print { 
                    body { margin: 0; }
                    .page-break { page-break-after: always; }
                }
            </style>
        </head>
        <body>
            ${printContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// 데이터 삭제
function deleteData(savedName, index) {
    if (confirm('이 데이터를 삭제하시겠습니까?')) {
        const savedDataList = JSON.parse(localStorage.getItem('거래처등록_저장목록') || '{}');
        delete savedDataList[savedName];
        localStorage.setItem('거래처등록_저장목록', JSON.stringify(savedDataList));
        
        // 데이터 재로드 및 검색
        loadData();
        searchData();
        
        alert('데이터가 삭제되었습니다.');
    }
}