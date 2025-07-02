/**
 * 레거시 시스템 통합 어댑터
 * 기존 시스템들이 통합 시스템의 데이터를 사용할 수 있도록 연결
 */

(function() {
    'use strict';

    // 통합 시스템이 로드될 때까지 대기
    function waitForIntegratedSystem() {
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                if (window.IntegratedDataManager && window.SchemaManager) {
                    clearInterval(checkInterval);
                    resolve();
                }
            }, 100);
        });
    }

    // 기존 시스템 감지 및 연동
    async function initializeLegacyIntegration() {
        await waitForIntegratedSystem();
        
        console.log('레거시 시스템 통합 시작...');

        // 현재 페이지가 어떤 시스템인지 감지
        const currentSystem = detectCurrentSystem();
        console.log(`현재 시스템: ${currentSystem}`);

        if (currentSystem) {
            setupSystemIntegration(currentSystem);
        }

        // 공통 기능 추가
        addIntegratedFeatures();
        
        console.log('레거시 시스템 통합 완료');
    }

    function detectCurrentSystem() {
        const path = window.location.pathname;
        const title = document.title;

        if (path.includes('기준정보관리시스템') || title.includes('기준정보')) {
            return 'categories';
        } else if (path.includes('품목정보관리시스템') || title.includes('품목정보')) {
            return 'items';
        } else if (path.includes('거래처등록시스템') || title.includes('거래처')) {
            return 'suppliers';
        } else if (path.includes('물품신규등록시스템') || title.includes('물품신규')) {
            return 'newItemRegistrations';
        } else if (path.includes('입고요청서시스템') || title.includes('입고요청')) {
            return 'warehouseRequests';
        } else if (path.includes('창고등록시스템') || title.includes('창고')) {
            return 'warehouses';
        } else if (path.includes('회사원등록시스템') || title.includes('회사원')) {
            return 'employees';
        }
        
        return null;
    }

    function setupSystemIntegration(systemType) {
        switch (systemType) {
            case 'categories':
                setupCategorySystemIntegration();
                break;
            case 'items':
                setupItemSystemIntegration();
                break;
            case 'suppliers':
                setupSupplierSystemIntegration();
                break;
            case 'newItemRegistrations':
                setupNewItemRegistrationIntegration();
                break;
            case 'warehouseRequests':
                setupWarehouseRequestIntegration();
                break;
            case 'warehouses':
                setupWarehouseSystemIntegration();
                break;
            case 'employees':
                setupEmployeeSystemIntegration();
                break;
        }
    }

    function setupCategorySystemIntegration() {
        // 카테고리 시스템에서 통합 데이터 사용
        window.addEventListener('load', () => {
            // 기존 로드 함수 오버라이드
            if (window.loadCategoriesFromStorage) {
                const originalLoad = window.loadCategoriesFromStorage;
                window.loadCategoriesFromStorage = function() {
                    const integratedCategories = window.getIntegratedData('categories') || [];
                    if (integratedCategories.length > 0) {
                        console.log('통합 시스템에서 카테고리 데이터 로드');
                        return integratedCategories;
                    }
                    return originalLoad.call(this);
                };
            }

            // 저장 함수 오버라이드
            if (window.saveCategoriesData) {
                const originalSave = window.saveCategoriesData;
                window.saveCategoriesData = function(data) {
                    // 통합 시스템에도 저장
                    window.setIntegratedData('categories', data);
                    return originalSave.call(this, data);
                };
            }
        });
    }

    function setupItemSystemIntegration() {
        window.addEventListener('load', () => {
            // 카테고리 선택기 업데이트
            updateCategorySelectors();
            
            // 거래처 선택기 업데이트
            updateSupplierSelectors();

            // 데이터 변경 감지
            window.addEventListener('sharedDataChange', (e) => {
                if (e.detail.schema === 'categories') {
                    updateCategorySelectors();
                } else if (e.detail.schema === 'suppliers') {
                    updateSupplierSelectors();
                }
            });
        });
    }

    function setupSupplierSystemIntegration() {
        window.addEventListener('load', () => {
            // 거래처 데이터 통합 관리
            if (window.loadSupplierData) {
                const originalLoad = window.loadSupplierData;
                window.loadSupplierData = function() {
                    const integratedSuppliers = window.getIntegratedData('suppliers') || [];
                    if (integratedSuppliers.length > 0) {
                        console.log('통합 시스템에서 거래처 데이터 로드');
                        return integratedSuppliers;
                    }
                    return originalLoad.call(this);
                };
            }
        });
    }

    function setupNewItemRegistrationIntegration() {
        window.addEventListener('load', () => {
            // 자동완성 기능 추가
            setupAutoComplete();
            
            // 카테고리, 거래처, 직원 선택기 업데이트
            updateAllSelectors();

            // 실시간 데이터 업데이트
            window.addEventListener('sharedDataChange', () => {
                updateAllSelectors();
            });
        });
    }

    function setupWarehouseRequestIntegration() {
        window.addEventListener('load', () => {
            // 창고, 직원, 품목 선택기 업데이트
            updateWarehouseSelectors();
            updateEmployeeSelectors();
            updateItemSelectors();
        });
    }

    function setupWarehouseSystemIntegration() {
        window.addEventListener('load', () => {
            // 창고 데이터 통합 관리
            enhanceWarehouseManagement();
        });
    }

    function setupEmployeeSystemIntegration() {
        window.addEventListener('load', () => {
            // 직원 데이터 통합 관리
            enhanceEmployeeManagement();
        });
    }

    // 선택기 업데이트 함수들
    function updateCategorySelectors() {
        const categorySelects = document.querySelectorAll('select[name*="category"], #categorySelect, .category-select');
        categorySelects.forEach(select => {
            if (window.generateCategoryOptions) {
                const currentValue = select.value;
                select.innerHTML = window.generateCategoryOptions(currentValue);
            }
        });
    }

    function updateSupplierSelectors() {
        const supplierSelects = document.querySelectorAll('select[name*="supplier"], #supplierSelect, .supplier-select');
        supplierSelects.forEach(select => {
            if (window.generateSupplierOptions) {
                const currentValue = select.value;
                select.innerHTML = window.generateSupplierOptions(currentValue);
            }
        });
    }

    function updateEmployeeSelectors() {
        const employeeSelects = document.querySelectorAll('select[name*="employee"], #employeeSelect, .employee-select');
        employeeSelects.forEach(select => {
            if (window.generateEmployeeOptions) {
                const currentValue = select.value;
                select.innerHTML = window.generateEmployeeOptions(currentValue);
            }
        });
    }

    function updateWarehouseSelectors() {
        const warehouseSelects = document.querySelectorAll('select[name*="warehouse"], #warehouseSelect, .warehouse-select');
        warehouseSelects.forEach(select => {
            if (window.generateWarehouseOptions) {
                const currentValue = select.value;
                select.innerHTML = window.generateWarehouseOptions(currentValue);
            }
        });
    }

    function updateItemSelectors() {
        const itemSelects = document.querySelectorAll('select[name*="item"], #itemSelect, .item-select');
        itemSelects.forEach(select => {
            if (window.getSharedItems) {
                const items = window.getSharedItems();
                let options = '<option value="">선택하세요</option>';
                items.forEach(item => {
                    options += `<option value="${item.id}">${item.displayName}</option>`;
                });
                select.innerHTML = options;
            }
        });
    }

    function updateAllSelectors() {
        updateCategorySelectors();
        updateSupplierSelectors();
        updateEmployeeSelectors();
        updateWarehouseSelectors();
        updateItemSelectors();
    }

    // 자동완성 기능
    function setupAutoComplete() {
        // 품목 코드 자동완성
        const itemCodeInputs = document.querySelectorAll('input[name*="itemCode"], #itemCode, .item-code-input');
        itemCodeInputs.forEach(input => {
            input.addEventListener('input', function() {
                const code = this.value.trim();
                if (code.length >= 3) {
                    autoFillItemData(this, code);
                }
            });
        });

        // 거래처명 자동완성
        const supplierInputs = document.querySelectorAll('input[name*="supplier"], .supplier-input');
        supplierInputs.forEach(input => {
            input.addEventListener('input', function() {
                const name = this.value.trim();
                if (name.length >= 2) {
                    autoFillSupplierData(this, name);
                }
            });
        });
    }

    function autoFillItemData(input, itemCode) {
        if (!window.getSharedItems) return;

        const items = window.getSharedItems();
        const matchedItem = items.find(item => 
            item.itemCode && item.itemCode.toLowerCase().includes(itemCode.toLowerCase())
        );

        if (matchedItem) {
            // 관련 필드 자동 입력
            const form = input.closest('form') || document;
            
            const itemNameField = form.querySelector('input[name*="itemName"], #itemName');
            if (itemNameField && !itemNameField.value) {
                itemNameField.value = matchedItem.itemName || '';
            }

            const specField = form.querySelector('input[name*="specification"], #specification');
            if (specField && !specField.value) {
                specField.value = matchedItem.specification || '';
            }

            const priceField = form.querySelector('input[name*="price"], #unitPrice');
            if (priceField && !priceField.value) {
                priceField.value = matchedItem.unitPrice || '';
            }

            // 카테고리 선택
            const categorySelect = form.querySelector('select[name*="category"]');
            if (categorySelect && matchedItem.categoryId) {
                categorySelect.value = matchedItem.categoryId;
            }

            // 거래처 선택
            const supplierSelect = form.querySelector('select[name*="supplier"]');
            if (supplierSelect && matchedItem.supplierId) {
                supplierSelect.value = matchedItem.supplierId;
            }

            console.log('품목 정보 자동 입력 완료:', matchedItem.itemName);
        }
    }

    function autoFillSupplierData(input, supplierName) {
        if (!window.getSharedSuppliers) return;

        const suppliers = window.getSharedSuppliers();
        const matchedSupplier = suppliers.find(supplier => 
            supplier.companyName && supplier.companyName.toLowerCase().includes(supplierName.toLowerCase())
        );

        if (matchedSupplier) {
            const form = input.closest('form') || document;
            
            // 거래처 정보 자동 입력
            const contactField = form.querySelector('input[name*="contact"], #contactPerson');
            if (contactField && !contactField.value) {
                contactField.value = matchedSupplier.contactPerson || '';
            }

            const phoneField = form.querySelector('input[name*="phone"], #supplierPhone');
            if (phoneField && !phoneField.value) {
                phoneField.value = matchedSupplier.phone || '';
            }

            console.log('거래처 정보 자동 입력 완료:', matchedSupplier.companyName);
        }
    }

    // 공통 기능 추가
    function addIntegratedFeatures() {
        // 통합 시스템으로 이동 버튼 추가
        addIntegratedSystemButton();
        
        // 실시간 알림 표시
        setupNotificationDisplay();
        
        // 데이터 동기화 상태 표시
        addSyncStatusIndicator();
    }

    function addIntegratedSystemButton() {
        // 통합 대시보드 링크 버튼 추가
        const button = document.createElement('button');
        button.innerHTML = '🏠 통합 대시보드';
        button.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 10px 15px;
            border-radius: 25px;
            cursor: pointer;
            font-family: 'Noto Sans KR', sans-serif;
            font-size: 14px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transition: transform 0.2s ease;
        `;
        
        button.addEventListener('mouseover', () => {
            button.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseout', () => {
            button.style.transform = 'translateY(0)';
        });

        button.addEventListener('click', () => {
            window.open('../integrated-system/index.html', '_blank');
        });

        document.body.appendChild(button);
    }

    function setupNotificationDisplay() {
        // 알림 컨테이너 생성
        const notificationContainer = document.createElement('div');
        notificationContainer.id = 'integrated-notifications';
        notificationContainer.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            z-index: 999;
            max-width: 300px;
        `;
        document.body.appendChild(notificationContainer);

        // 데이터 변경 알림 감지
        window.addEventListener('sharedDataChange', (e) => {
            showNotification(`${e.detail.schema} 데이터가 업데이트되었습니다.`);
        });
    }

    function showNotification(message) {
        const container = document.getElementById('integrated-notifications');
        if (!container) return;

        const notification = document.createElement('div');
        notification.style.cssText = `
            background: #4CAF50;
            color: white;
            padding: 12px 16px;
            margin-bottom: 10px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-size: 14px;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        notification.textContent = message;

        container.appendChild(notification);

        // 애니메이션
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // 3초 후 제거
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    function addSyncStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'sync-status';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            background: #28a745;
            color: white;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-family: 'Noto Sans KR', sans-serif;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        `;
        indicator.innerHTML = '🔄 동기화됨';
        document.body.appendChild(indicator);

        // 동기화 상태 모니터링
        if (window.IntegratedDataManager) {
            window.IntegratedDataManager.subscribe('systemConfig', () => {
                indicator.innerHTML = '🔄 동기화중...';
                indicator.style.background = '#ffc107';
                
                setTimeout(() => {
                    indicator.innerHTML = '✅ 동기화됨';
                    indicator.style.background = '#28a745';
                }, 1000);
            });
        }
    }

    // 페이지 로드 시 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeLegacyIntegration);
    } else {
        initializeLegacyIntegration();
    }

})();