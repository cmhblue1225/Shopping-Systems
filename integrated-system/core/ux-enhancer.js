/**
 * UX 개선 및 최적화 모듈
 * 글로벌 검색, 키보드 단축키, 알림 시스템 등 사용자 경험 향상 기능
 */

class UXEnhancer {
    constructor() {
        this.dataManager = window.DataManager;
        this.searchIndex = new Map();
        this.shortcuts = new Map();
        this.notifications = [];
        this.searchModal = null;
        this.init();
    }

    init() {
        this.setupGlobalSearch();
        this.setupKeyboardShortcuts();
        this.setupNotificationSystem();
        this.setupAccessibility();
        this.setupPerformanceOptimization();
        console.log('UX 향상 모듈 초기화 완료');
    }

    // 글로벌 검색 시스템
    setupGlobalSearch() {
        this.createSearchModal();
        this.buildSearchIndex();
        
        // Ctrl+K 또는 Cmd+K로 검색창 활성화
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                this.showSearchModal();
            }
        });

        // 검색 인덱스 주기적 업데이트
        setInterval(() => this.buildSearchIndex(), 30000);
    }

    createSearchModal() {
        const modalHTML = `
            <div id="globalSearchModal" class="search-modal" style="display: none;">
                <div class="search-modal-backdrop"></div>
                <div class="search-modal-content">
                    <div class="search-input-container">
                        <i class="fas fa-search search-icon"></i>
                        <input type="text" id="globalSearchInput" placeholder="전체 시스템 검색... (Ctrl+K)" autocomplete="off">
                        <span class="search-shortcut">ESC</span>
                    </div>
                    <div class="search-categories">
                        <button class="search-category active" data-category="all">전체</button>
                        <button class="search-category" data-category="items">품목</button>
                        <button class="search-category" data-category="orders">주문</button>
                        <button class="search-category" data-category="customers">고객</button>
                        <button class="search-category" data-category="inventory">재고</button>
                    </div>
                    <div class="search-results" id="searchResults">
                        <div class="search-placeholder">
                            <i class="fas fa-search"></i>
                            <p>검색어를 입력하세요</p>
                            <small>Ctrl+K: 검색 | ↑↓: 이동 | Enter: 선택 | ESC: 닫기</small>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);

        // 검색 모달 스타일
        const style = document.createElement('style');
        style.textContent = `
            .search-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: flex-start;
                justify-content: center;
                padding-top: 10vh;
            }
            
            .search-modal-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            }
            
            .search-modal-content {
                position: relative;
                background: white;
                border-radius: 12px;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                width: 90%;
                max-width: 600px;
                max-height: 80vh;
                overflow: hidden;
                animation: searchModalIn 0.2s ease-out;
            }
            
            @keyframes searchModalIn {
                from { opacity: 0; transform: scale(0.95) translateY(-20px); }
                to { opacity: 1; transform: scale(1) translateY(0); }
            }
            
            .search-input-container {
                position: relative;
                padding: 20px;
                border-bottom: 1px solid #eee;
            }
            
            .search-icon {
                position: absolute;
                left: 30px;
                top: 50%;
                transform: translateY(-50%);
                color: #999;
                font-size: 16px;
            }
            
            #globalSearchInput {
                width: 100%;
                padding: 12px 20px 12px 50px;
                border: none;
                font-size: 16px;
                outline: none;
                background: #f8f9fa;
                border-radius: 8px;
            }
            
            .search-shortcut {
                position: absolute;
                right: 30px;
                top: 50%;
                transform: translateY(-50%);
                background: #e9ecef;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 12px;
                color: #6c757d;
            }
            
            .search-categories {
                display: flex;
                padding: 10px 20px;
                gap: 10px;
                border-bottom: 1px solid #eee;
                overflow-x: auto;
            }
            
            .search-category {
                padding: 6px 12px;
                border: none;
                background: #f8f9fa;
                border-radius: 20px;
                font-size: 12px;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
            }
            
            .search-category.active {
                background: #007bff;
                color: white;
            }
            
            .search-results {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .search-placeholder {
                text-align: center;
                padding: 40px 20px;
                color: #999;
            }
            
            .search-placeholder i {
                font-size: 48px;
                margin-bottom: 16px;
                opacity: 0.3;
            }
            
            .search-result-item {
                padding: 12px 20px;
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .search-result-item:hover,
            .search-result-item.selected {
                background: #f8f9fa;
            }
            
            .search-result-title {
                font-weight: 600;
                margin-bottom: 4px;
            }
            
            .search-result-type {
                display: inline-block;
                padding: 2px 6px;
                background: #e9ecef;
                border-radius: 3px;
                font-size: 10px;
                margin-right: 8px;
                text-transform: uppercase;
            }
            
            .search-result-content {
                color: #666;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);

        this.setupSearchEventListeners();
    }

    setupSearchEventListeners() {
        const modal = document.getElementById('globalSearchModal');
        const input = document.getElementById('globalSearchInput');
        const backdrop = modal.querySelector('.search-modal-backdrop');
        
        // 검색 입력 이벤트
        input.addEventListener('input', (e) => {
            this.performSearch(e.target.value);
        });
        
        // 카테고리 필터
        modal.querySelectorAll('.search-category').forEach(btn => {
            btn.addEventListener('click', (e) => {
                modal.querySelectorAll('.search-category').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.performSearch(input.value, e.target.dataset.category);
            });
        });
        
        // 키보드 네비게이션
        input.addEventListener('keydown', (e) => {
            this.handleSearchKeyboard(e);
        });
        
        // 모달 닫기
        backdrop.addEventListener('click', () => this.hideSearchModal());
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.hideSearchModal();
            }
        });
    }

    buildSearchIndex() {
        this.searchIndex.clear();
        
        try {
            // 품목 데이터 인덱싱
            const items = this.dataManager.getData('items') || [];
            items.forEach(item => {
                this.searchIndex.set(`item_${item.itemCode}`, {
                    type: 'items',
                    title: item.itemName,
                    content: `${item.itemCode} - ${item.category1st || ''} - ₩${(item.unitPrice || 0).toLocaleString()}`,
                    data: item,
                    url: '../품목정보관리시스템/index.html'
                });
            });

            // 주문 데이터 인덱싱
            const orders = this.dataManager.getData('orders') || [];
            orders.forEach(order => {
                this.searchIndex.set(`order_${order.orderId}`, {
                    type: 'orders',
                    title: `주문 ${order.orderId}`,
                    content: `${order.customerName} - ₩${order.totalAmount.toLocaleString()} - ${order.status}`,
                    data: order,
                    url: '../주문관리시스템/index.html'
                });
            });

            // 고객 데이터 인덱싱
            const customers = this.dataManager.getData('customers') || [];
            customers.forEach(customer => {
                this.searchIndex.set(`customer_${customer.customerId}`, {
                    type: 'customers',
                    title: customer.name,
                    content: `${customer.phone} - ${customer.grade} - ₩${(customer.totalPurchase || 0).toLocaleString()}`,
                    data: customer,
                    url: '../고객관리시스템/index.html'
                });
            });

            // 재고 데이터 인덱싱
            const inventory = this.dataManager.getData('inventory') || [];
            inventory.forEach(item => {
                this.searchIndex.set(`inventory_${item.itemCode}`, {
                    type: 'inventory',
                    title: `재고: ${item.itemName}`,
                    content: `현재고: ${item.currentStock} - 안전재고: ${item.safetyStock} - ${item.location}`,
                    data: item,
                    url: '../재고관리시스템/index.html'
                });
            });

        } catch (error) {
            console.error('검색 인덱스 구축 오류:', error);
        }
    }

    performSearch(query, category = 'all') {
        const resultsContainer = document.getElementById('searchResults');
        
        if (!query.trim()) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>검색어를 입력하세요</p>
                    <small>Ctrl+K: 검색 | ↑↓: 이동 | Enter: 선택 | ESC: 닫기</small>
                </div>
            `;
            return;
        }

        const results = [];
        const queryLower = query.toLowerCase();

        for (const [key, item] of this.searchIndex) {
            if (category !== 'all' && item.type !== category) continue;
            
            const titleMatch = item.title.toLowerCase().includes(queryLower);
            const contentMatch = item.content.toLowerCase().includes(queryLower);
            
            if (titleMatch || contentMatch) {
                results.push({
                    ...item,
                    relevance: titleMatch ? 2 : 1
                });
            }
        }

        // 관련성 순으로 정렬
        results.sort((a, b) => b.relevance - a.relevance);

        if (results.length === 0) {
            resultsContainer.innerHTML = `
                <div class="search-placeholder">
                    <i class="fas fa-search"></i>
                    <p>검색 결과가 없습니다</p>
                    <small>"${query}"에 대한 결과를 찾을 수 없습니다</small>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = results.slice(0, 20).map((result, index) => `
            <div class="search-result-item ${index === 0 ? 'selected' : ''}" data-url="${result.url}">
                <div class="search-result-title">
                    <span class="search-result-type">${this.getTypeLabel(result.type)}</span>
                    ${result.title}
                </div>
                <div class="search-result-content">${result.content}</div>
            </div>
        `).join('');

        // 결과 클릭 이벤트
        resultsContainer.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                window.open(item.dataset.url, '_blank');
                this.hideSearchModal();
            });
        });
    }

    getTypeLabel(type) {
        const labels = {
            items: '품목',
            orders: '주문',
            customers: '고객',
            inventory: '재고'
        };
        return labels[type] || type;
    }

    handleSearchKeyboard(e) {
        const results = document.querySelectorAll('.search-result-item');
        const selected = document.querySelector('.search-result-item.selected');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (selected && selected.nextElementSibling) {
                selected.classList.remove('selected');
                selected.nextElementSibling.classList.add('selected');
            } else if (results.length > 0) {
                results.forEach(r => r.classList.remove('selected'));
                results[0].classList.add('selected');
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (selected && selected.previousElementSibling) {
                selected.classList.remove('selected');
                selected.previousElementSibling.classList.add('selected');
            } else if (results.length > 0) {
                results.forEach(r => r.classList.remove('selected'));
                results[results.length - 1].classList.add('selected');
            }
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selected) {
                window.open(selected.dataset.url, '_blank');
                this.hideSearchModal();
            }
        }
    }

    showSearchModal() {
        const modal = document.getElementById('globalSearchModal');
        const input = document.getElementById('globalSearchInput');
        
        modal.style.display = 'flex';
        input.focus();
        input.select();
        
        // 포커스 트랩
        modal.addEventListener('keydown', this.trapFocus);
    }

    hideSearchModal() {
        const modal = document.getElementById('globalSearchModal');
        const input = document.getElementById('globalSearchInput');
        
        modal.style.display = 'none';
        input.value = '';
        document.getElementById('searchResults').innerHTML = `
            <div class="search-placeholder">
                <i class="fas fa-search"></i>
                <p>검색어를 입력하세요</p>
                <small>Ctrl+K: 검색 | ↑↓: 이동 | Enter: 선택 | ESC: 닫기</small>
            </div>
        `;
        
        modal.removeEventListener('keydown', this.trapFocus);
    }

    trapFocus(e) {
        const modal = document.getElementById('globalSearchModal');
        const focusableElements = modal.querySelectorAll('input, button, [tabindex]:not([tabindex="-1"])');
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    }

    // 키보드 단축키 시스템
    setupKeyboardShortcuts() {
        // 기본 단축키 등록
        this.registerShortcut('ctrl+s', () => {
            this.saveCurrentForm();
        });

        this.registerShortcut('ctrl+n', () => {
            this.createNewItem();
        });

        this.registerShortcut('ctrl+e', () => {
            this.exportData();
        });

        this.registerShortcut('ctrl+r', () => {
            this.refreshCurrentPage();
        });

        this.registerShortcut('alt+1', () => {
            window.open('../재고관리시스템/index.html', '_blank');
        });

        this.registerShortcut('alt+2', () => {
            window.open('../주문관리시스템/index.html', '_blank');
        });

        this.registerShortcut('alt+3', () => {
            window.open('../고객관리시스템/index.html', '_blank');
        });

        this.registerShortcut('alt+4', () => {
            window.open('../판매분석시스템/index.html', '_blank');
        });

        // 단축키 이벤트 리스너
        document.addEventListener('keydown', (e) => {
            const combo = this.getKeyCombo(e);
            if (this.shortcuts.has(combo)) {
                e.preventDefault();
                this.shortcuts.get(combo)();
            }
        });

        // 단축키 도움말 표시
        this.createShortcutHelper();
    }

    registerShortcut(combo, callback) {
        this.shortcuts.set(combo.toLowerCase(), callback);
    }

    getKeyCombo(e) {
        const keys = [];
        if (e.ctrlKey) keys.push('ctrl');
        if (e.altKey) keys.push('alt');
        if (e.shiftKey) keys.push('shift');
        if (e.metaKey) keys.push('meta');
        keys.push(e.key.toLowerCase());
        return keys.join('+');
    }

    createShortcutHelper() {
        // F1 키로 단축키 도움말 표시
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.showShortcutHelper();
            }
        });
    }

    showShortcutHelper() {
        const shortcuts = [
            { key: 'Ctrl + K', action: '전체 검색' },
            { key: 'Ctrl + S', action: '현재 폼 저장' },
            { key: 'Ctrl + N', action: '새 항목 생성' },
            { key: 'Ctrl + E', action: '데이터 내보내기' },
            { key: 'Ctrl + R', action: '페이지 새로고침' },
            { key: 'Alt + 1', action: '재고관리시스템' },
            { key: 'Alt + 2', action: '주문관리시스템' },
            { key: 'Alt + 3', action: '고객관리시스템' },
            { key: 'Alt + 4', action: '판매분석시스템' },
            { key: 'F1', action: '단축키 도움말' },
            { key: 'ESC', action: '모달 닫기' }
        ];

        const helpModal = document.createElement('div');
        helpModal.className = 'shortcut-help-modal';
        helpModal.innerHTML = `
            <div class="shortcut-help-backdrop"></div>
            <div class="shortcut-help-content">
                <h3><i class="fas fa-keyboard"></i> 키보드 단축키</h3>
                <div class="shortcut-list">
                    ${shortcuts.map(s => `
                        <div class="shortcut-item">
                            <span class="shortcut-key">${s.key}</span>
                            <span class="shortcut-action">${s.action}</span>
                        </div>
                    `).join('')}
                </div>
                <p class="shortcut-tip">💡 단축키를 활용하여 더 빠르게 작업하세요!</p>
            </div>
        `;

        // 스타일 추가
        const style = document.createElement('style');
        style.textContent = `
            .shortcut-help-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .shortcut-help-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(5px);
            }
            
            .shortcut-help-content {
                position: relative;
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 500px;
                width: 90%;
                box-shadow: 0 25px 50px rgba(0, 0, 0, 0.25);
                animation: helpModalIn 0.2s ease-out;
            }
            
            @keyframes helpModalIn {
                from { opacity: 0; transform: scale(0.9); }
                to { opacity: 1; transform: scale(1); }
            }
            
            .shortcut-help-content h3 {
                text-align: center;
                margin-bottom: 20px;
                color: #333;
            }
            
            .shortcut-list {
                max-height: 400px;
                overflow-y: auto;
            }
            
            .shortcut-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 0;
                border-bottom: 1px solid #eee;
            }
            
            .shortcut-key {
                background: #f8f9fa;
                padding: 4px 8px;
                border-radius: 4px;
                font-family: monospace;
                font-size: 12px;
                border: 1px solid #dee2e6;
            }
            
            .shortcut-action {
                color: #666;
            }
            
            .shortcut-tip {
                text-align: center;
                margin-top: 20px;
                color: #28a745;
                font-size: 14px;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(helpModal);

        // 3초 후 또는 클릭 시 닫기
        setTimeout(() => {
            if (helpModal.parentNode) {
                helpModal.remove();
                style.remove();
            }
        }, 5000);

        helpModal.addEventListener('click', (e) => {
            if (e.target === helpModal || e.target.classList.contains('shortcut-help-backdrop')) {
                helpModal.remove();
                style.remove();
            }
        });

        document.addEventListener('keydown', function closeOnEsc(e) {
            if (e.key === 'Escape') {
                helpModal.remove();
                style.remove();
                document.removeEventListener('keydown', closeOnEsc);
            }
        });
    }

    // 스마트 알림 시스템
    setupNotificationSystem() {
        this.createNotificationContainer();
        this.startNotificationMonitoring();
    }

    createNotificationContainer() {
        const container = document.createElement('div');
        container.id = 'ux-notifications';
        container.className = 'ux-notification-container';
        container.innerHTML = '';
        
        const style = document.createElement('style');
        style.textContent = `
            .ux-notification-container {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                pointer-events: none;
            }
            
            .ux-notification {
                background: white;
                border-radius: 8px;
                padding: 16px 20px;
                margin-bottom: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                border-left: 4px solid #007bff;
                max-width: 400px;
                pointer-events: auto;
                animation: notificationSlideIn 0.3s ease-out;
                position: relative;
            }
            
            @keyframes notificationSlideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            .ux-notification.success { border-left-color: #28a745; }
            .ux-notification.warning { border-left-color: #ffc107; }
            .ux-notification.error { border-left-color: #dc3545; }
            .ux-notification.info { border-left-color: #17a2b8; }
            
            .ux-notification-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            
            .ux-notification-title {
                font-weight: 600;
                color: #333;
            }
            
            .ux-notification-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                padding: 0;
                font-size: 18px;
            }
            
            .ux-notification-message {
                color: #666;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .ux-notification-actions {
                margin-top: 12px;
                display: flex;
                gap: 8px;
            }
            
            .ux-notification-action {
                background: #007bff;
                color: white;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                font-size: 12px;
                cursor: pointer;
                transition: background-color 0.2s;
            }
            
            .ux-notification-action:hover {
                background: #0056b3;
            }
            
            .ux-notification-action.secondary {
                background: #6c757d;
            }
            
            .ux-notification-action.secondary:hover {
                background: #545b62;
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(container);
    }

    showNotification(title, message, type = 'info', actions = []) {
        const container = document.getElementById('ux-notifications');
        const notification = document.createElement('div');
        notification.className = `ux-notification ${type}`;
        
        notification.innerHTML = `
            <div class="ux-notification-header">
                <div class="ux-notification-title">${title}</div>
                <button class="ux-notification-close" onclick="this.parentElement.parentElement.remove()">&times;</button>
            </div>
            <div class="ux-notification-message">${message}</div>
            ${actions.length > 0 ? `
                <div class="ux-notification-actions">
                    ${actions.map(action => `
                        <button class="ux-notification-action ${action.type || ''}" onclick="${action.callback}">
                            ${action.label}
                        </button>
                    `).join('')}
                </div>
            ` : ''}
        `;
        
        container.appendChild(notification);
        
        // 자동 제거 (actions가 있는 경우 더 오래 표시)
        const autoRemoveDelay = actions.length > 0 ? 10000 : 5000;
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'notificationSlideIn 0.3s ease-out reverse';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, autoRemoveDelay);
        
        return notification;
    }

    startNotificationMonitoring() {
        // 재고 부족 알림
        setInterval(() => {
            this.checkLowStock();
        }, 60000); // 1분마다

        // 주문 대기 알림
        setInterval(() => {
            this.checkPendingOrders();
        }, 120000); // 2분마다

        // 시스템 성능 알림
        setInterval(() => {
            this.checkSystemPerformance();
        }, 300000); // 5분마다
    }

    checkLowStock() {
        try {
            const inventory = this.dataManager.getData('inventory') || [];
            const lowStockItems = inventory.filter(item => {
                const current = item.currentStock || 0;
                const safety = item.safetyStock || 20;
                return current <= safety * 0.5;
            });

            if (lowStockItems.length > 0) {
                this.showNotification(
                    '⚠️ 재고 부족 알림',
                    `${lowStockItems.length}개 품목의 재고가 부족합니다.`,
                    'warning',
                    [{
                        label: '재고 관리로 이동',
                        callback: `window.open('../재고관리시스템/index.html', '_blank')`,
                        type: 'primary'
                    }]
                );
            }
        } catch (error) {
            console.error('재고 확인 오류:', error);
        }
    }

    checkPendingOrders() {
        try {
            const orders = this.dataManager.getData('orders') || [];
            const pendingOrders = orders.filter(o => ['pending', 'paid'].includes(o.status));

            if (pendingOrders.length > 5) {
                this.showNotification(
                    '📋 주문 처리 알림',
                    `처리 대기 중인 주문이 ${pendingOrders.length}건 있습니다.`,
                    'info',
                    [{
                        label: '주문 관리로 이동',
                        callback: `window.open('../주문관리시스템/index.html', '_blank')`,
                        type: 'primary'
                    }]
                );
            }
        } catch (error) {
            console.error('주문 확인 오류:', error);
        }
    }

    checkSystemPerformance() {
        const loadTime = performance.now();
        if (loadTime > 5000) {
            this.showNotification(
                '🚀 성능 최적화',
                '시스템 로딩 시간이 느려졌습니다. 브라우저 캐시를 정리해보세요.',
                'warning'
            );
        }
    }

    // 접근성 개선
    setupAccessibility() {
        // 포커스 표시 개선
        const style = document.createElement('style');
        style.textContent = `
            *:focus {
                outline: 2px solid #007bff !important;
                outline-offset: 2px !important;
            }
            
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }
        `;
        document.head.appendChild(style);

        // 스크린 리더를 위한 라이브 영역
        const liveRegion = document.createElement('div');
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'sr-only';
        liveRegion.id = 'accessibility-announcements';
        document.body.appendChild(liveRegion);
    }

    announceToScreenReader(message) {
        const liveRegion = document.getElementById('accessibility-announcements');
        if (liveRegion) {
            liveRegion.textContent = message;
            setTimeout(() => {
                liveRegion.textContent = '';
            }, 1000);
        }
    }

    // 성능 최적화
    setupPerformanceOptimization() {
        // 지연 로딩
        this.setupLazyLoading();
        
        // 메모리 관리
        this.setupMemoryManagement();
        
        // 네트워크 최적화
        this.setupNetworkOptimization();
    }

    setupLazyLoading() {
        // 이미지 지연 로딩
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    setupMemoryManagement() {
        // 메모리 사용량 모니터링
        if ('memory' in performance) {
            setInterval(() => {
                const memInfo = performance.memory;
                if (memInfo.usedJSHeapSize > memInfo.jsHeapSizeLimit * 0.9) {
                    this.showNotification(
                        '🧠 메모리 경고',
                        '메모리 사용량이 높습니다. 페이지를 새로고침하는 것을 권장합니다.',
                        'warning',
                        [{
                            label: '새로고침',
                            callback: 'location.reload()',
                            type: 'primary'
                        }]
                    );
                }
            }, 30000);
        }
    }

    setupNetworkOptimization() {
        // 네트워크 상태 모니터링
        if ('connection' in navigator) {
            const connection = navigator.connection;
            if (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g') {
                this.showNotification(
                    '📶 네트워크 최적화',
                    '느린 네트워크가 감지되었습니다. 간소화된 모드로 전환됩니다.',
                    'info'
                );
                document.body.classList.add('slow-network');
            }
        }
    }

    // 유틸리티 메서드들
    saveCurrentForm() {
        const forms = document.querySelectorAll('form');
        if (forms.length > 0) {
            const submitBtn = forms[0].querySelector('button[type="submit"], input[type="submit"]');
            if (submitBtn) {
                submitBtn.click();
                this.announceToScreenReader('폼이 저장되었습니다.');
            }
        }
    }

    createNewItem() {
        const newButtons = document.querySelectorAll('button');
        const createBtn = Array.from(newButtons).find(btn => 
            btn.textContent.includes('신규') || 
            btn.textContent.includes('새') || 
            btn.textContent.includes('+')
        );
        if (createBtn) {
            createBtn.click();
            this.announceToScreenReader('새 항목 생성 모드가 활성화되었습니다.');
        }
    }

    exportData() {
        const exportButtons = document.querySelectorAll('button');
        const exportBtn = Array.from(exportButtons).find(btn => 
            btn.textContent.includes('Excel') || 
            btn.textContent.includes('내보내기') ||
            btn.textContent.includes('다운로드')
        );
        if (exportBtn) {
            exportBtn.click();
            this.announceToScreenReader('데이터 내보내기가 시작되었습니다.');
        }
    }

    refreshCurrentPage() {
        const refreshButtons = document.querySelectorAll('button');
        const refreshBtn = Array.from(refreshButtons).find(btn => 
            btn.textContent.includes('새로고침') || 
            btn.textContent.includes('🔄')
        );
        if (refreshBtn) {
            refreshBtn.click();
            this.announceToScreenReader('페이지가 새로고침되었습니다.');
        } else {
            location.reload();
        }
    }
}

// 전역 인스턴스 생성
window.UXEnhancer = UXEnhancer;

// DOM 로드 후 자동 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (!window.uxEnhancer) {
        window.uxEnhancer = new UXEnhancer();
    }
});