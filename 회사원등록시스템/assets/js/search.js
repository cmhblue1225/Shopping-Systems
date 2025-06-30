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
    const savedDataList = JSON.parse(localStorage.getItem('회사원등록_저장목록') || '{}');
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
        { inputId: 'regNoFilter', listId: 'regNoAutocomplete' },
        { inputId: 'regUserFilter', listId: 'regUserAutocomplete' },
        { inputId: 'empNameFilter', listId: 'empNameAutocomplete' },
        { inputId: 'deptFilter', listId: 'deptAutocomplete' },
        { inputId: 'positionFilter', listId: 'positionAutocomplete' },
        { inputId: 'gradeFilter', listId: 'gradeAutocomplete' },
        { inputId: 'managerFilter', listId: 'managerAutocomplete' }
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
        regNo: new Set(),
        regUser: new Set(),
        empName: new Set(),
        dept: new Set(),
        position: new Set(),
        grade: new Set(),
        manager: new Set()
    };
    
    allData.forEach(data => {
        if (data.regNo) options.regNo.add(data.regNo);
        if (data.regUser) options.regUser.add(data.regUser);
        if (data.regManager) options.manager.add(data.regManager);
        
        if (data.employees) {
            data.employees.forEach(emp => {
                if (emp.empName) options.empName.add(emp.empName);
                if (emp.empDept) options.dept.add(emp.empDept);
                if (emp.empPosition) options.position.add(emp.empPosition);
                if (emp.empGrade) options.grade.add(emp.empGrade);
            });
        }
    });
    
    // 자동완성 데이터 저장
    window.autocompleteOptions = {
        regNoFilter: Array.from(options.regNo),
        regUserFilter: Array.from(options.regUser),
        empNameFilter: Array.from(options.empName),
        deptFilter: Array.from(options.dept),
        positionFilter: Array.from(options.position),
        gradeFilter: Array.from(options.grade),
        managerFilter: Array.from(options.manager)
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
        regNo: document.getElementById('regNoFilter').value.toLowerCase(),
        regUser: document.getElementById('regUserFilter').value.toLowerCase(),
        empName: document.getElementById('empNameFilter').value.toLowerCase(),
        dept: document.getElementById('deptFilter').value.toLowerCase(),
        position: document.getElementById('positionFilter').value.toLowerCase(),
        grade: document.getElementById('gradeFilter').value.toLowerCase(),
        manager: document.getElementById('managerFilter').value.toLowerCase()
    };
    
    filteredData = allData.filter(data => {
        // 날짜 필터
        if (filters.startDate && data.regDate < filters.startDate) return false;
        if (filters.endDate && data.regDate > filters.endDate) return false;
        
        // 등록번호 필터
        if (filters.regNo && !data.regNo.toLowerCase().includes(filters.regNo)) return false;
        
        // 등록자 필터
        if (filters.regUser && !data.regUser.toLowerCase().includes(filters.regUser)) return false;
        
        // 등록담당자 필터
        if (filters.manager && !data.regManager.toLowerCase().includes(filters.manager)) return false;
        
        // 회사원 관련 필터 (하나라도 일치하면 포함)
        if (filters.empName || filters.dept || filters.position || filters.grade) {
            const hasMatchingEmployee = data.employees.some(emp => {
                if (filters.empName && !emp.empName.toLowerCase().includes(filters.empName)) return false;
                if (filters.dept && !emp.empDept.toLowerCase().includes(filters.dept)) return false;
                if (filters.position && !emp.empPosition.toLowerCase().includes(filters.position)) return false;
                if (filters.grade && !emp.empGrade.toLowerCase().includes(filters.grade)) return false;
                return true;
            });
            if (!hasMatchingEmployee) return false;
        }
        
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
                <td colspan="10" class="empty-state">
                    <div class="empty-state-icon">👥</div>
                    <div>검색 결과가 없습니다.</div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = filteredData.map((data, index) => {
        const empCount = data.employees.length;
        const mainDepts = [...new Set(data.employees.map(emp => emp.empDept))].slice(0, 3).join(', ');
        const savedDate = new Date(data.savedAt).toLocaleString('ko-KR');
        
        return `
            <tr>
                <td><input type="checkbox" class="row-checkbox" data-index="${index}"></td>
                <td>${data.regDate}</td>
                <td>${data.regNo}</td>
                <td>${data.regUser}</td>
                <td>${empCount}명</td>
                <td>${mainDepts}</td>
                <td>${data.regManager}</td>
                <td>${data.regContact}</td>
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
    document.getElementById('regNoFilter').value = '';
    document.getElementById('regUserFilter').value = '';
    document.getElementById('empNameFilter').value = '';
    document.getElementById('deptFilter').value = '';
    document.getElementById('positionFilter').value = '';
    document.getElementById('gradeFilter').value = '';
    document.getElementById('managerFilter').value = '';
    
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
    exportToExcel(selectedData, `회사원등록_조회결과_${new Date().toISOString().split('T')[0]}.xlsx`);
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
    const empRows = currentViewData.employees.map((emp, idx) => `
        <tr>
            <td>${idx + 1}</td>
            <td>${emp.empNo}</td>
            <td>${emp.empName}</td>
            <td>${emp.empDept}</td>
            <td>${emp.empPosition}</td>
            <td>${emp.empHireDate}</td>
            <td>${emp.empPhone}</td>
            <td>${emp.empEmail}</td>
            <td>${emp.empAddr}</td>
            <td>${emp.empAddrDetail}</td>
            <td>${emp.empZip}</td>
            <td>${emp.empGrade}</td>
        </tr>
    `).join('');
    
    content.innerHTML = `
        <div style="font-size: 14px;">
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">등록일자</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.regDate}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">등록번호</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.regNo}</td>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">등록자</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.regUser}</td>
                </tr>
            </table>
            
            <h4>회사원 정보</h4>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">순번</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">사원번호</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">성명</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">부서</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">직책</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">입사일</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">전화번호</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">이메일</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">주소</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">상세주소</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">우편번호</th>
                        <th style="border: 1px solid #ddd; padding: 6px; background: #f5f5f5;">급여등급</th>
                    </tr>
                </thead>
                <tbody>
                    ${empRows}
                </tbody>
            </table>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">비고</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.remark}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">등록담당자</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.regManager}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">담당자 연락처</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.regContact}</td>
                </tr>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; background: #f5f5f5;">담당자 이메일</th>
                    <td style="border: 1px solid #ddd; padding: 8px;">${currentViewData.regEmail}</td>
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
    
    exportToExcel([currentViewData], `회사원등록_${currentViewData.regNo}_${currentViewData.regDate}.xlsx`);
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
        const worksheet = workbook.addWorksheet('회사원등록');
        
        // 헤더 설정
        worksheet.columns = [
            { header: '등록일자', key: 'regDate', width: 12 },
            { header: '등록번호', key: 'regNo', width: 12 },
            { header: '등록자', key: 'regUser', width: 12 },
            { header: '사원번호', key: 'empNo', width: 12 },
            { header: '성명', key: 'empName', width: 12 },
            { header: '부서', key: 'empDept', width: 15 },
            { header: '직책', key: 'empPosition', width: 12 },
            { header: '입사일', key: 'empHireDate', width: 12 },
            { header: '전화번호', key: 'empPhone', width: 15 },
            { header: '이메일', key: 'empEmail', width: 25 },
            { header: '주소', key: 'empAddr', width: 30 },
            { header: '상세주소', key: 'empAddrDetail', width: 20 },
            { header: '우편번호', key: 'empZip', width: 12 },
            { header: '급여등급', key: 'empGrade', width: 12 },
            { header: '등록담당자', key: 'regManager', width: 12 },
            { header: '담당자연락처', key: 'regContact', width: 15 },
            { header: '담당자이메일', key: 'regEmail', width: 25 },
            { header: '비고', key: 'remark', width: 30 }
        ];
        
        // 데이터 추가
        data.forEach(item => {
            item.employees.forEach(emp => {
                worksheet.addRow({
                    regDate: item.regDate,
                    regNo: item.regNo,
                    regUser: item.regUser,
                    empNo: emp.empNo,
                    empName: emp.empName,
                    empDept: emp.empDept,
                    empPosition: emp.empPosition,
                    empHireDate: emp.empHireDate,
                    empPhone: emp.empPhone,
                    empEmail: emp.empEmail,
                    empAddr: emp.empAddr,
                    empAddrDetail: emp.empAddrDetail,
                    empZip: emp.empZip,
                    empGrade: emp.empGrade,
                    regManager: item.regManager,
                    regContact: item.regContact,
                    regEmail: item.regEmail,
                    remark: item.remark
                });
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
        const empRows = item.employees.map((emp, idx) => `
            <tr>
                <td>${idx + 1}</td>
                <td>${emp.empNo}</td>
                <td>${emp.empName}</td>
                <td>${emp.empDept}</td>
                <td>${emp.empPosition}</td>
                <td>${emp.empHireDate}</td>
                <td>${emp.empPhone}</td>
                <td>${emp.empEmail}</td>
                <td>${emp.empAddr}</td>
                <td>${emp.empAddrDetail}</td>
                <td>${emp.empZip}</td>
                <td>${emp.empGrade}</td>
            </tr>
        `).join('');
        
        return `
            <div style="page-break-after: always; margin-bottom: 30px;">
                <h2 style="text-align: center; margin-bottom: 20px;">회사원 등록부</h2>
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">등록일자</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.regDate}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">등록번호</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.regNo}</td>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">등록자</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.regUser}</td>
                    </tr>
                </table>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
                    <thead>
                        <tr>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">순번</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">사원번호</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">성명</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">부서</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">직책</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">입사일</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">전화번호</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">이메일</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">주소</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">상세주소</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">우편번호</th>
                            <th style="border: 1px solid #000; padding: 6px; background: #f5f5f5;">급여등급</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${empRows}
                    </tbody>
                </table>
                
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">비고</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.remark}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">등록담당자</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.regManager}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">담당자 연락처</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.regContact}</td>
                    </tr>
                    <tr>
                        <th style="border: 1px solid #000; padding: 8px; background: #f5f5f5;">담당자 이메일</th>
                        <td style="border: 1px solid #000; padding: 8px;">${item.regEmail}</td>
                    </tr>
                </table>
            </div>
        `;
    }).join('');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>회사원 등록부 인쇄</title>
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
        const savedDataList = JSON.parse(localStorage.getItem('회사원등록_저장목록') || '{}');
        delete savedDataList[savedName];
        localStorage.setItem('회사원등록_저장목록', JSON.stringify(savedDataList));
        
        // 데이터 재로드 및 검색
        loadData();
        searchData();
        
        alert('데이터가 삭제되었습니다.');
    }
}