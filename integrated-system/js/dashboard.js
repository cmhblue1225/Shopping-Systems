/**
 * 통합 대시보드 JavaScript
 * 대시보드 UI 및 데이터 표시 관리
 */

class IntegratedDashboard {
    constructor() {
        this.api = window.IntegratedAPI;
        this.dataManager = window.IntegratedDataManager;
        this.refreshInterval = null;
        this.init();
    }

    async init() {
        console.log('통합 대시보드 초기화 시작...');
        
        // 초기 로딩 표시
        this.showLoading();
        
        try {
            // 데이터 로드 및 표시
            await this.loadDashboardData();
            
            // 시스템 카드 생성
            this.createSystemCards();
            
            // 이벤트 리스너 설정
            this.setupEventListeners();
            
            // 자동 새로고침 설정
            this.setupAutoRefresh();
            
            console.log('통합 대시보드 초기화 완료');
        } catch (error) {
            console.error('대시보드 초기화 오류:', error);
            this.showError('대시보드 로딩 중 오류가 발생했습니다.');
        }
    }

    showLoading() {
        // 로딩 상태 업데이트는 이미 HTML에 구현되어 있음
    }

    async loadDashboardData() {
        try {
            // 통계 데이터 로드
            const stats = await this.api.getDashboardStats();
            this.renderStats(stats);
            
            // 시스템 상태 업데이트
            this.updateSystemStatus();
            
            // 최근 활동 로드
            await this.loadRecentActivity();
            
            // 알림 로드
            await this.loadNotifications();
            
        } catch (error) {
            console.error('대시보드 데이터 로딩 오류:', error);
            throw error;
        }
    }

    renderStats(stats) {
        // KPI 대시보드 업데이트
        this.updateKPIDashboard();
        
        const statsGrid = document.getElementById('statsGrid');
        
        const statsCards = [
            {
                title: '전체 카테고리',
                value: stats.categories.total,
                change: `+${stats.categories.recent} 최근 추가`,
                icon: 'fas fa-tags',
                color: '#4CAF50'
            },
            {
                title: '등록된 품목',
                value: stats.items.total,
                change: `${stats.items.active}개 활성`,
                icon: 'fas fa-box',
                color: '#9C27B0'
            },
            {
                title: '거래처 수',
                value: stats.suppliers.total,
                change: `${stats.suppliers.active}개 활성`,
                icon: 'fas fa-handshake',
                color: '#667eea'
            },
            {
                title: '직원 수',
                value: stats.employees.total,
                change: `${Object.keys(stats.employees.byDepartment).length}개 부서`,
                icon: 'fas fa-users',
                color: '#FF9800'
            },
            {
                title: '신규 등록 요청',
                value: stats.registrations.pending,
                change: `총 ${stats.registrations.total}건`,
                icon: 'fas fa-plus-circle',
                color: '#F44336'
            },
            {
                title: '입고 요청',
                value: stats.requests.pending,
                change: `${stats.requests.completed}건 완료`,
                icon: 'fas fa-truck',
                color: '#00BCD4'
            }
        ];

        statsGrid.innerHTML = statsCards.map(card => `
            <div class="stat-card">
                <div class="stat-header">
                    <span class="stat-title">${card.title}</span>
                    <div class="stat-icon" style="background: ${card.color}">
                        <i class="${card.icon}"></i>
                    </div>
                </div>
                <div class="stat-value">${card.value.toLocaleString()}</div>
                <div class="stat-change">${card.change}</div>
            </div>
        `).join('');
    }

    updateKPIDashboard() {
        try {
            // 주문 데이터에서 KPI 계산
            const orders = this.dataManager.getData('orders') || [];
            const customers = this.dataManager.getData('customers') || [];
            const inventory = this.dataManager.getData('inventory') || [];
            
            // 총 매출
            const totalSales = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
            document.getElementById('totalSales').textContent = `₩${totalSales.toLocaleString()}`;
            
            // 총 주문
            document.getElementById('totalOrders').textContent = orders.length;
            
            // 활성 고객
            const activeCustomersCount = customers.filter(c => c.isActive).length;
            document.getElementById('activeCustomers').textContent = activeCustomersCount;
            
            // 위험 재고
            const lowStockCount = inventory.filter(item => {
                const current = item.currentStock || 0;
                const safety = item.safetyStock || 20;
                return current <= safety * 0.5;
            }).length;
            document.getElementById('lowStockItems').textContent = lowStockCount;
            
            // 대기 주문
            const pendingCount = orders.filter(o => ['pending', 'paid'].includes(o.status)).length;
            document.getElementById('pendingOrders').textContent = pendingCount;
            
            // 변화량 업데이트 (더미 데이터)
            document.getElementById('salesChange').textContent = '+12.5%';
            document.getElementById('ordersChange').textContent = `+${Math.floor(Math.random() * 10)}`;
            document.getElementById('customersChange').textContent = `+${Math.floor(Math.random() * 5)}`;
            
        } catch (error) {
            console.error('KPI 업데이트 오류:', error);
        }
    }

    createSystemCards() {
        const systemsGrid = document.getElementById('systemsGrid');
        
        const systems = [
            {
                name: '기준정보관리시스템',
                description: '카테고리 및 업무코드의 중앙 집중 관리',
                icon: 'fas fa-sitemap',
                path: '../기준정보관리시스템/index.html',
                stats: { total: '카테고리', active: '코드', recent: '업데이트' }
            },
            {
                name: '품목정보관리시스템',
                description: '품목과 이미지의 통합 관리 및 다대다 관계 연결',
                icon: 'fas fa-archive',
                path: '../품목정보관리시스템/index.html',
                stats: { total: '품목', active: '이미지', recent: '연결' }
            },
            {
                name: '거래처등록시스템',
                description: '거래처 정보의 체계적 관리',
                icon: 'fas fa-building',
                path: '../거래처등록시스템/index.html',
                stats: { total: '거래처', active: '활성', recent: '신규' }
            },
            {
                name: '물품신규등록시스템',
                description: '새로운 물품의 등록 및 승인 관리',
                icon: 'fas fa-plus-square',
                path: '../물품신규등록시스템/index.html',
                stats: { total: '등록', active: '대기', recent: '승인' }
            },
            {
                name: '입고요청서시스템',
                description: '입고 요청의 효율적 처리',
                icon: 'fas fa-clipboard-list',
                path: '../입고요청서시스템/index.html',
                stats: { total: '요청', active: '처리중', recent: '완료' }
            },
            {
                name: '창고등록시스템',
                description: '창고 정보 및 위치 관리',
                icon: 'fas fa-warehouse',
                path: '../창고등록시스템/index.html',
                stats: { total: '창고', active: '구역', recent: '용량' }
            },
            {
                name: '회사원등록시스템',
                description: '인사 정보의 종합 관리',
                icon: 'fas fa-id-card',
                path: '../회사원등록시스템/index.html',
                stats: { total: '직원', active: '부서', recent: '직급' }
            }
        ];

        systemsGrid.innerHTML = systems.map((system, index) => `
            <a href="${system.path}" class="system-card" target="_blank" rel="noopener noreferrer">
                <div class="system-header">
                    <div class="system-info">
                        <h3>${system.name}</h3>
                        <p>${system.description}</p>
                    </div>
                    <div class="system-icon">
                        <i class="${system.icon}"></i>
                    </div>
                </div>
                <div class="system-stats">
                    <div class="system-stat">
                        <div class="system-stat-value" id="system-${index}-total">-</div>
                        <div class="system-stat-label">${system.stats.total}</div>
                    </div>
                    <div class="system-stat">
                        <div class="system-stat-value" id="system-${index}-active">-</div>
                        <div class="system-stat-label">${system.stats.active}</div>
                    </div>
                    <div class="system-stat">
                        <div class="system-stat-value" id="system-${index}-recent">-</div>
                        <div class="system-stat-label">${system.stats.recent}</div>
                    </div>
                </div>
            </a>
        `).join('');

        // 시스템별 통계 업데이트
        this.updateSystemStats();
    }

    async updateSystemStats() {
        try {
            const stats = await this.api.getDashboardStats();
            
            // 각 시스템의 통계 업데이트
            const systemStats = [
                [stats.categories.total, '-', stats.categories.recent],
                [stats.items.total, stats.items.active, stats.items.recent],
                [stats.suppliers.total, stats.suppliers.active, '-'],
                [stats.registrations.total, stats.registrations.pending, stats.registrations.approved],
                [stats.requests.total, stats.requests.pending, stats.requests.completed],
                ['-', '-', '-'], // 창고 - 추후 구현
                [stats.employees.total, Object.keys(stats.employees.byDepartment).length, '-']
            ];

            systemStats.forEach((statArray, systemIndex) => {
                statArray.forEach((value, statIndex) => {
                    const element = document.getElementById(`system-${systemIndex}-${['total', 'active', 'recent'][statIndex]}`);
                    if (element) {
                        element.textContent = value === '-' ? '-' : value.toLocaleString();
                    }
                });
            });
        } catch (error) {
            console.error('시스템 통계 업데이트 오류:', error);
        }
    }

    updateSystemStatus() {
        const dataStatus = document.getElementById('dataStatus');
        const lastSync = document.getElementById('lastSync');
        
        try {
            const systemStatus = this.dataManager.getSystemStatus();
            const storageInfo = systemStatus.storageUsage;
            
            dataStatus.innerHTML = `<i class="fas fa-database"></i> ${storageInfo.totalMB}MB 사용 중`;
            
            const syncTime = new Date(systemStatus.lastSync);
            const timeAgo = this.getTimeAgo(syncTime);
            lastSync.innerHTML = `<i class="fas fa-sync"></i> ${timeAgo} 동기화`;
            
        } catch (error) {
            console.error('시스템 상태 업데이트 오류:', error);
            dataStatus.innerHTML = `<i class="fas fa-exclamation-triangle"></i> 상태 확인 오류`;
            lastSync.innerHTML = `<i class="fas fa-times"></i> 동기화 오류`;
        }
    }

    async loadRecentActivity() {
        const activityList = document.getElementById('activityList');
        
        try {
            // 최근 활동 데이터 수집
            const activities = await this.collectRecentActivities();
            
            if (activities.length === 0) {
                activityList.innerHTML = `
                    <div class="activity-item">
                        <div class="activity-icon" style="background: #6c757d;">
                            <i class="fas fa-info"></i>
                        </div>
                        <div class="activity-content">
                            <div class="activity-title">최근 활동이 없습니다</div>
                            <div class="activity-desc">시스템을 사용하면 활동 내역이 여기에 표시됩니다.</div>
                        </div>
                        <div class="activity-time">-</div>
                    </div>
                `;
                return;
            }

            activityList.innerHTML = activities.map(activity => `
                <div class="activity-item">
                    <div class="activity-icon" style="background: ${activity.color};">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-desc">${activity.description}</div>
                    </div>
                    <div class="activity-time">${this.getTimeAgo(new Date(activity.timestamp))}</div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('최근 활동 로드 오류:', error);
            activityList.innerHTML = `
                <div class="activity-item">
                    <div class="activity-icon" style="background: #dc3545;">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">활동 로드 오류</div>
                        <div class="activity-desc">최근 활동을 불러오는 중 오류가 발생했습니다.</div>
                    </div>
                    <div class="activity-time">-</div>
                </div>
            `;
        }
    }

    async collectRecentActivities() {
        const activities = [];
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

        try {
            // 각 시스템의 최근 데이터 수집
            const dataTypes = [
                { key: 'categories', name: '카테고리', icon: 'fas fa-tags', color: '#4CAF50' },
                { key: 'items', name: '품목', icon: 'fas fa-box', color: '#9C27B0' },
                { key: 'suppliers', name: '거래처', icon: 'fas fa-handshake', color: '#667eea' },
                { key: 'employees', name: '직원', icon: 'fas fa-users', color: '#FF9800' },
                { key: 'newItemRegistrations', name: '신규등록', icon: 'fas fa-plus-circle', color: '#F44336' },
                { key: 'warehouseRequests', name: '입고요청', icon: 'fas fa-truck', color: '#00BCD4' }
            ];

            for (const dataType of dataTypes) {
                const data = this.dataManager.getData(dataType.key) || [];
                const recentItems = data.filter(item => {
                    const itemDate = new Date(item.createdAt || item.updatedAt || 0);
                    return itemDate > oneDayAgo;
                }).slice(0, 3); // 최신 3개만

                recentItems.forEach(item => {
                    activities.push({
                        title: `${dataType.name} ${item.name || item.itemName || item.companyName || item.category1st || '항목'}`,
                        description: `새로운 ${dataType.name.toLowerCase()}이(가) 추가되었습니다.`,
                        timestamp: item.createdAt || item.updatedAt || now.toISOString(),
                        icon: dataType.icon,
                        color: dataType.color
                    });
                });
            }

            // 시간순 정렬 (최신순)
            activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            
            return activities.slice(0, 10); // 최신 10개만 반환
        } catch (error) {
            console.error('활동 수집 오류:', error);
            return [];
        }
    }

    async loadNotifications() {
        const notificationsList = document.getElementById('notificationsList');
        
        try {
            const notifications = await this.api.getNotifications();
            
            if (notifications.length === 0) {
                notificationsList.innerHTML = `
                    <div class="notification-item">
                        <div class="notification-badge read"></div>
                        <div class="activity-content">
                            <div class="activity-title">알림이 없습니다</div>
                            <div class="activity-desc">새로운 알림이 있으면 여기에 표시됩니다.</div>
                        </div>
                        <div class="activity-time">-</div>
                    </div>
                `;
                return;
            }

            notificationsList.innerHTML = notifications.slice(0, 5).map(notif => `
                <div class="notification-item">
                    <div class="notification-badge ${notif.isRead ? 'read' : ''}"></div>
                    <div class="activity-content">
                        <div class="activity-title">${notif.title}</div>
                        <div class="activity-desc">${notif.message}</div>
                    </div>
                    <div class="activity-time">${this.getTimeAgo(new Date(notif.createdAt))}</div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('알림 로드 오류:', error);
            notificationsList.innerHTML = `
                <div class="notification-item">
                    <div class="notification-badge"></div>
                    <div class="activity-content">
                        <div class="activity-title">알림 로드 오류</div>
                        <div class="activity-desc">알림을 불러오는 중 오류가 발생했습니다.</div>
                    </div>
                    <div class="activity-time">-</div>
                </div>
            `;
        }
    }

    setupEventListeners() {
        // 데이터 변경 감지
        this.dataManager.subscribe('categories', () => this.refreshDashboard());
        this.dataManager.subscribe('items', () => this.refreshDashboard());
        this.dataManager.subscribe('suppliers', () => this.refreshDashboard());
        this.dataManager.subscribe('employees', () => this.refreshDashboard());
        this.dataManager.subscribe('newItemRegistrations', () => this.refreshDashboard());
        this.dataManager.subscribe('warehouseRequests', () => this.refreshDashboard());

        // 윈도우 포커스 시 새로고침
        window.addEventListener('focus', () => {
            this.refreshDashboard();
        });
    }

    setupAutoRefresh() {
        // 30초마다 자동 새로고침
        this.refreshInterval = setInterval(() => {
            this.refreshDashboard();
        }, 30000);

        // 페이지 언로드 시 인터벌 정리
        window.addEventListener('beforeunload', () => {
            if (this.refreshInterval) {
                clearInterval(this.refreshInterval);
            }
        });
    }

    async refreshDashboard() {
        try {
            await this.loadDashboardData();
            this.updateSystemStats();
            console.log('대시보드가 새로고침되었습니다.');
        } catch (error) {
            console.error('대시보드 새로고침 오류:', error);
        }
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return '방금 전';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}일 전`;
        return date.toLocaleDateString('ko-KR');
    }

    showError(message) {
        console.error(message);
        // 사용자에게 오류 표시 (선택적으로 toast 알림 등 구현)
    }
}

// 전역 함수들
function refreshActivity() {
    if (window.dashboard) {
        window.dashboard.loadRecentActivity();
    }
}

function markAllAsRead() {
    if (window.dashboard && window.IntegratedAPI) {
        // 모든 알림을 읽음으로 표시
        const notifications = window.IntegratedDataManager.getData('notifications') || [];
        notifications.forEach(notif => notif.isRead = true);
        window.IntegratedDataManager.setData('notifications', notifications);
        window.dashboard.loadNotifications();
    }
}

// 페이지 로드 완료 시 대시보드 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new IntegratedDashboard();
});

console.log('통합 대시보드 스크립트가 로드되었습니다.');