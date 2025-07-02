/**
 * 실시간 데이터 동기화 시스템
 * 모든 시스템 간 실시간 데이터 동기화 및 충돌 해결
 */

class RealtimeSyncManager {
    constructor() {
        this.dataManager = window.IntegratedDataManager;
        this.api = window.IntegratedAPI;
        this.syncQueue = [];
        this.isOnline = navigator.onLine;
        this.syncInterval = null;
        this.conflictResolver = new ConflictResolver();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startSyncMonitoring();
        this.setupOfflineHandler();
        console.log('실시간 동기화 시스템이 초기화되었습니다.');
    }

    setupEventListeners() {
        // 데이터 변경 감지
        const dataKeys = [
            'categories', 'items', 'images', 'itemImageRelations',
            'suppliers', 'newItemRegistrations', 'warehouseRequests',
            'warehouses', 'employees'
        ];

        dataKeys.forEach(key => {
            this.dataManager.subscribe(key, (event) => {
                this.handleDataChange(key, event);
            });
        });

        // 네트워크 상태 변경 감지
        window.addEventListener('online', () => {
            this.isOnline = true;
            this.processSyncQueue();
            this.broadcastSystemEvent('network', 'online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            this.broadcastSystemEvent('network', 'offline');
        });

        // 다른 탭/창에서의 데이터 변경 감지
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('integrated_')) {
                this.handleExternalDataChange(e);
            }
        });

        // 브라우저 가시성 변경 감지
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncAllData();
            }
        });
    }

    handleDataChange(dataKey, event) {
        const syncEvent = {
            id: this.generateSyncId(),
            dataKey,
            action: event.action, // 'add', 'update', 'delete'
            data: event.data,
            timestamp: new Date().toISOString(),
            source: 'local',
            status: 'pending'
        };

        // 동기화 큐에 추가
        this.syncQueue.push(syncEvent);
        
        // 즉시 동기화 시도
        this.processSyncQueue();
        
        // 다른 시스템에 알림
        this.broadcastDataChange(syncEvent);
        
        console.log(`데이터 변경 감지: ${dataKey} - ${event.action}`, event.data);
    }

    handleExternalDataChange(storageEvent) {
        const dataKey = storageEvent.key.replace('integrated_', '');
        const newData = JSON.parse(storageEvent.newValue || 'null');
        const oldData = JSON.parse(storageEvent.oldValue || 'null');

        // 외부 변경사항 감지
        const externalEvent = {
            id: this.generateSyncId(),
            dataKey,
            action: 'external_update',
            data: newData,
            oldData,
            timestamp: new Date().toISOString(),
            source: 'external',
            status: 'processed'
        };

        // 충돌 검사 및 해결
        this.resolveConflicts(externalEvent);
        
        console.log(`외부 데이터 변경 감지: ${dataKey}`, { newData, oldData });
    }

    async processSyncQueue() {
        if (this.syncQueue.length === 0 || !this.isOnline) {
            return;
        }

        const pendingEvents = this.syncQueue.filter(event => event.status === 'pending');
        
        for (const event of pendingEvents) {
            try {
                await this.syncEvent(event);
                event.status = 'synced';
                event.syncedAt = new Date().toISOString();
            } catch (error) {
                console.error('동기화 오류:', error);
                event.status = 'error';
                event.error = error.message;
                event.retryCount = (event.retryCount || 0) + 1;
                
                // 최대 재시도 횟수 초과 시 실패 처리
                if (event.retryCount >= 3) {
                    event.status = 'failed';
                    this.handleSyncFailure(event);
                }
            }
        }

        // 완료된 이벤트 정리 (최근 100개만 유지)
        this.cleanupSyncQueue();
    }

    async syncEvent(event) {
        // 실제 동기화 로직 (현재는 로컬 동기화만 구현)
        // 서버가 있다면 여기서 서버와 동기화
        
        // 데이터 무결성 검증
        if (!this.validateSyncEvent(event)) {
            throw new Error('동기화 이벤트 검증 실패');
        }

        // 관련 시스템에 변경사항 전파
        await this.propagateChange(event);
        
        // 동기화 로그 기록
        this.logSyncEvent(event);
    }

    validateSyncEvent(event) {
        // 필수 필드 검증
        if (!event.id || !event.dataKey || !event.action || !event.timestamp) {
            return false;
        }

        // 데이터 타입별 추가 검증
        switch (event.dataKey) {
            case 'categories':
                return this.validateCategoryData(event.data);
            case 'items':
                return this.validateItemData(event.data);
            case 'suppliers':
                return this.validateSupplierData(event.data);
            default:
                return true;
        }
    }

    validateCategoryData(data) {
        if (!data) return false;
        return data.category1st && typeof data.category1st === 'string';
    }

    validateItemData(data) {
        if (!data) return false;
        return data.itemCode && data.itemName && typeof data.itemCode === 'string';
    }

    validateSupplierData(data) {
        if (!data) return false;
        return data.companyName && typeof data.companyName === 'string';
    }

    async propagateChange(event) {
        // 연관 시스템에 변경사항 전파
        const relatedSystems = this.getRelatedSystems(event.dataKey);
        
        for (const system of relatedSystems) {
            try {
                await this.notifySystem(system, event);
            } catch (error) {
                console.error(`시스템 ${system} 알림 실패:`, error);
            }
        }
    }

    getRelatedSystems(dataKey) {
        const systemRelations = {
            categories: ['items', 'newItemRegistrations'],
            items: ['newItemRegistrations', 'warehouseRequests'],
            suppliers: ['items', 'newItemRegistrations'],
            employees: ['newItemRegistrations', 'warehouseRequests'],
            warehouses: ['warehouseRequests'],
            newItemRegistrations: ['items'],
            warehouseRequests: ['items', 'warehouses']
        };

        return systemRelations[dataKey] || [];
    }

    async notifySystem(systemKey, event) {
        // 시스템별 알림 로직
        const notification = {
            type: 'data_change',
            sourceSystem: event.dataKey,
            targetSystem: systemKey,
            action: event.action,
            data: event.data,
            timestamp: event.timestamp
        };

        // 시스템 업데이트 큐에 추가
        this.addSystemNotification(systemKey, notification);
    }

    addSystemNotification(systemKey, notification) {
        const notifications = this.dataManager.getData('systemNotifications') || {};
        if (!notifications[systemKey]) {
            notifications[systemKey] = [];
        }
        
        notifications[systemKey].push(notification);
        
        // 최대 50개까지만 유지
        if (notifications[systemKey].length > 50) {
            notifications[systemKey] = notifications[systemKey].slice(-50);
        }
        
        this.dataManager.setData('systemNotifications', notifications);
    }

    resolveConflicts(event) {
        const conflicts = this.detectConflicts(event);
        
        if (conflicts.length > 0) {
            console.log('데이터 충돌 감지:', conflicts);
            
            for (const conflict of conflicts) {
                const resolution = this.conflictResolver.resolve(conflict);
                this.applyConflictResolution(resolution);
            }
        }
    }

    detectConflicts(event) {
        const conflicts = [];
        const localData = this.dataManager.getData(event.dataKey) || [];
        
        // 동일한 ID를 가진 항목들 간의 충돌 검사
        if (event.data && event.data.id) {
            const localItem = localData.find(item => item.id === event.data.id);
            
            if (localItem && localItem.updatedAt !== event.data.updatedAt) {
                conflicts.push({
                    type: 'update_conflict',
                    dataKey: event.dataKey,
                    itemId: event.data.id,
                    localData: localItem,
                    externalData: event.data,
                    timestamp: new Date().toISOString()
                });
            }
        }

        return conflicts;
    }

    applyConflictResolution(resolution) {
        switch (resolution.strategy) {
            case 'use_latest':
                this.dataManager.setData(resolution.dataKey, resolution.resolvedData);
                break;
            case 'merge':
                const mergedData = this.mergeData(resolution.localData, resolution.externalData);
                this.dataManager.updateData(resolution.dataKey, resolution.itemId, mergedData);
                break;
            case 'manual':
                this.requestManualResolution(resolution);
                break;
        }
    }

    mergeData(localData, externalData) {
        // 간단한 병합 로직 (나중에 더 정교하게 구현 가능)
        return {
            ...localData,
            ...externalData,
            updatedAt: new Date().toISOString(),
            mergedFrom: [localData.updatedAt, externalData.updatedAt]
        };
    }

    requestManualResolution(resolution) {
        // 사용자 개입이 필요한 충돌의 경우
        const conflictNotification = {
            type: 'conflict_resolution_required',
            title: '데이터 충돌 해결 필요',
            message: `${resolution.dataKey}에서 데이터 충돌이 발생했습니다. 수동 해결이 필요합니다.`,
            data: resolution,
            priority: 'high',
            createdAt: new Date().toISOString()
        };

        this.api.addNotification(
            conflictNotification.type,
            conflictNotification.title,
            conflictNotification.message
        );
    }

    startSyncMonitoring() {
        // 정기적인 동기화 체크 (30초마다)
        this.syncInterval = setInterval(() => {
            this.processSyncQueue();
            this.performHealthCheck();
        }, 30000);

        // 즉시 초기 동기화 수행
        this.syncAllData();
    }

    async syncAllData() {
        try {
            const dataKeys = [
                'categories', 'items', 'images', 'itemImageRelations',
                'suppliers', 'newItemRegistrations', 'warehouseRequests',
                'warehouses', 'employees'
            ];

            for (const key of dataKeys) {
                await this.checkDataIntegrity(key);
            }

            console.log('전체 데이터 동기화 완료');
        } catch (error) {
            console.error('전체 동기화 오류:', error);
        }
    }

    async checkDataIntegrity(dataKey) {
        const data = this.dataManager.getData(dataKey) || [];
        
        // 데이터가 배열이 아닌 경우 건너뛰기
        if (!Array.isArray(data)) {
            console.warn(`${dataKey} is not an array, skipping integrity check`);
            return;
        }
        
        // 데이터 무결성 검사
        const integrityIssues = [];
        
        for (const item of data) {
            if (!item || typeof item !== 'object') continue;
            
            if (!item.id || !item.createdAt) {
                integrityIssues.push({
                    type: 'missing_metadata',
                    item,
                    issue: 'ID 또는 생성일시 누락'
                });
            }
        }

        if (integrityIssues.length > 0 && integrityIssues.length < 100) { // 너무 많은 문제가 있으면 스킵
            console.warn(`${dataKey} 데이터 무결성 문제: ${integrityIssues.length}개`);
            await this.fixIntegrityIssues(dataKey, integrityIssues);
        }
    }

    async fixIntegrityIssues(dataKey, issues) {
        const data = this.dataManager.getData(dataKey) || [];
        let hasChanges = false;

        for (const issue of issues) {
            if (issue.type === 'missing_metadata') {
                const item = issue.item;
                if (!item.id) {
                    item.id = this.dataManager.generateId();
                    hasChanges = true;
                }
                if (!item.createdAt) {
                    item.createdAt = new Date().toISOString();
                    hasChanges = true;
                }
            }
        }

        if (hasChanges) {
            this.dataManager.setData(dataKey, data);
            console.log(`${dataKey} 데이터 무결성 문제 수정 완료`);
        }
    }

    performHealthCheck() {
        const healthStatus = {
            timestamp: new Date().toISOString(),
            isOnline: this.isOnline,
            syncQueueSize: this.syncQueue.length,
            pendingSync: this.syncQueue.filter(e => e.status === 'pending').length,
            failedSync: this.syncQueue.filter(e => e.status === 'failed').length,
            storageUsage: this.dataManager.getStorageUsage()
        };

        // 건강 상태 기록
        this.dataManager.setData('systemHealth', healthStatus);

        // 문제 상황 감지 및 알림
        if (healthStatus.failedSync > 5) {
            this.api.addNotification(
                'system_warning',
                '동기화 실패 알림',
                `${healthStatus.failedSync}개의 동기화 작업이 실패했습니다.`
            );
        }

        if (healthStatus.storageUsage.totalMB > 50) {
            this.api.addNotification(
                'storage_warning',
                '저장공간 경고',
                `로컬 저장공간 사용량이 ${healthStatus.storageUsage.totalMB}MB입니다.`
            );
        }
    }

    setupOfflineHandler() {
        // 오프라인 모드 지원
        this.offlineQueue = [];

        // Service Worker 등록 (선택사항)
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker 등록 성공:', registration);
                })
                .catch(error => {
                    console.log('Service Worker 등록 실패:', error);
                });
        }
    }

    broadcastDataChange(syncEvent) {
        // BroadcastChannel을 사용하여 다른 탭/창에 알림
        if ('BroadcastChannel' in window) {
            const channel = new BroadcastChannel('shopping-systems-sync');
            channel.postMessage({
                type: 'data_change',
                event: syncEvent
            });
        }

        // CustomEvent로 현재 페이지 내 컴포넌트들에 알림
        window.dispatchEvent(new CustomEvent('dataSync', {
            detail: syncEvent
        }));
    }

    broadcastSystemEvent(type, status) {
        window.dispatchEvent(new CustomEvent('systemEvent', {
            detail: { type, status, timestamp: new Date().toISOString() }
        }));
    }

    cleanupSyncQueue() {
        // 성공한 이벤트들 중 오래된 것들 제거 (최근 100개만 유지)
        const completedEvents = this.syncQueue.filter(e => e.status === 'synced');
        if (completedEvents.length > 100) {
            const toRemove = completedEvents.slice(0, completedEvents.length - 100);
            this.syncQueue = this.syncQueue.filter(e => !toRemove.includes(e));
        }
    }

    logSyncEvent(event) {
        const syncLog = this.dataManager.getData('syncLog') || [];
        syncLog.push({
            ...event,
            loggedAt: new Date().toISOString()
        });

        // 최대 1000개 로그 유지
        if (syncLog.length > 1000) {
            syncLog.splice(0, syncLog.length - 1000);
        }

        this.dataManager.setData('syncLog', syncLog);
    }

    handleSyncFailure(event) {
        console.error('동기화 실패:', event);
        
        // 실패 알림 생성
        this.api.addNotification(
            'sync_failure',
            '데이터 동기화 실패',
            `${event.dataKey} 데이터 동기화에 실패했습니다. (재시도: ${event.retryCount}회)`
        );
    }

    generateSyncId() {
        return 'sync_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2);
    }
}

/**
 * 충돌 해결기
 */
class ConflictResolver {
    resolve(conflict) {
        switch (conflict.type) {
            case 'update_conflict':
                return this.resolveUpdateConflict(conflict);
            default:
                return this.resolveDefault(conflict);
        }
    }

    resolveUpdateConflict(conflict) {
        const localTime = new Date(conflict.localData.updatedAt || 0);
        const externalTime = new Date(conflict.externalData.updatedAt || 0);

        // 최신 데이터 사용 전략
        if (externalTime > localTime) {
            return {
                strategy: 'use_latest',
                dataKey: conflict.dataKey,
                resolvedData: conflict.externalData,
                reason: '외부 데이터가 더 최신'
            };
        } else if (localTime > externalTime) {
            return {
                strategy: 'keep_local',
                dataKey: conflict.dataKey,
                resolvedData: conflict.localData,
                reason: '로컬 데이터가 더 최신'
            };
        } else {
            // 동일한 시간이면 병합
            return {
                strategy: 'merge',
                dataKey: conflict.dataKey,
                itemId: conflict.itemId,
                localData: conflict.localData,
                externalData: conflict.externalData,
                reason: '동일한 업데이트 시간으로 병합 필요'
            };
        }
    }

    resolveDefault(conflict) {
        return {
            strategy: 'manual',
            conflict,
            reason: '수동 해결 필요'
        };
    }
}

// 전역 인스턴스 생성
window.RealtimeSyncManager = new RealtimeSyncManager();

console.log('실시간 동기화 시스템이 초기화되었습니다.');