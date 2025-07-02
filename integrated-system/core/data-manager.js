/**
 * 통합 데이터 관리 시스템
 * 모든 시스템의 데이터를 중앙에서 관리하고 동기화
 */

class IntegratedDataManager {
    constructor() {
        this.observers = {};
        this.init();
    }

    init() {
        // 기본 데이터 구조 초기화
        this.initializeDataStructures();
        // 데이터 마이그레이션 (기존 시스템 데이터 통합)
        this.migrateExistingData();
        // 이벤트 리스너 설정
        this.setupEventListeners();
    }

    // 기본 데이터 구조 초기화
    initializeDataStructures() {
        const defaultStructures = {
            // 기준정보관리시스템
            categories: [],
            
            // 품목정보관리시스템
            items: [],
            images: [],
            itemImageRelations: [],
            
            // 거래처등록시스템
            suppliers: [],
            
            // 물품신규등록시스템
            newItemRegistrations: [],
            
            // 입고요청서시스템
            warehouseRequests: [],
            
            // 창고등록시스템
            warehouses: [],
            
            // 회사원등록시스템
            employees: [],
            
            // 통합 시스템 전용 데이터
            workflows: [],
            notifications: [],
            systemConfig: {
                lastSync: new Date().toISOString(),
                autoSync: true,
                syncInterval: 5000
            }
        };

        // localStorage에서 기존 통합 데이터 로드 또는 초기화
        for (const [key, defaultValue] of Object.entries(defaultStructures)) {
            if (!this.getData(key)) {
                this.setData(key, defaultValue);
            }
        }
    }

    // 기존 시스템 데이터 마이그레이션
    migrateExistingData() {
        const migrations = [
            { oldKey: 'categories', newKey: 'categories' },
            { oldKey: 'itemList', newKey: 'items' },
            { oldKey: 'imageList', newKey: 'images', skipIfLarge: true }, // 이미지는 크기가 클 수 있음
            { oldKey: 'itemImageRelations', newKey: 'itemImageRelations' },
            { oldKey: '거래처등록_저장목록', newKey: 'suppliers' },
            { oldKey: '물품신규등록_저장목록', newKey: 'newItemRegistrations' },
            { oldKey: '입고요청서_저장목록', newKey: 'warehouseRequests' },
            { oldKey: '창고등록_저장목록', newKey: 'warehouses' },
            { oldKey: '회사원등록_저장목록', newKey: 'employees' }
        ];

        migrations.forEach(({ oldKey, newKey, skipIfLarge }) => {
            try {
                const oldData = JSON.parse(localStorage.getItem(oldKey) || 'null');
                if (oldData && (!this.getData(newKey) || this.getData(newKey).length === 0)) {
                    // 큰 데이터인 경우 크기 확인
                    if (skipIfLarge) {
                        const dataSize = JSON.stringify(oldData).length;
                        if (dataSize > 2 * 1024 * 1024) { // 2MB 초과시 스킵
                            console.warn(`Skipping migration of ${oldKey} due to size (${(dataSize / 1024 / 1024).toFixed(1)}MB)`);
                            // 빈 배열로 초기화
                            this.setData(newKey, []);
                            return;
                        }
                    }
                    
                    // 배열 데이터 정규화
                    const normalizedData = Array.isArray(oldData) ? oldData : (oldData ? [oldData] : []);
                    this.setData(newKey, normalizedData);
                    console.log(`Migrated data from ${oldKey} to integrated system (${normalizedData.length} items)`);
                }
            } catch (error) {
                console.error(`Migration error for ${oldKey}:`, error);
                // 실패한 경우 빈 배열로 초기화
                this.setData(newKey, []);
            }
        });
    }

    // 데이터 CRUD 작업
    getData(key) {
        try {
            return JSON.parse(localStorage.getItem(`integrated_${key}`) || 'null');
        } catch (error) {
            console.error(`Error getting data for key ${key}:`, error);
            return null;
        }
    }

    setData(key, data) {
        try {
            localStorage.setItem(`integrated_${key}`, JSON.stringify(data));
            this.notifyObservers(key, 'update', data);
            this.updateSyncTime();
            return true;
        } catch (error) {
            console.error(`Error setting data for key ${key}:`, error);
            return false;
        }
    }

    addData(key, item) {
        const data = this.getData(key) || [];
        const newItem = {
            ...item,
            id: this.generateId(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.push(newItem);
        this.setData(key, data);
        this.notifyObservers(key, 'add', newItem);
        return newItem;
    }

    updateData(key, id, updates) {
        const data = this.getData(key) || [];
        const index = data.findIndex(item => item.id === id);
        
        if (index !== -1) {
            data[index] = {
                ...data[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.setData(key, data);
            this.notifyObservers(key, 'update', data[index]);
            return data[index];
        }
        return null;
    }

    deleteData(key, id) {
        const data = this.getData(key) || [];
        const index = data.findIndex(item => item.id === id);
        
        if (index !== -1) {
            const deletedItem = data.splice(index, 1)[0];
            this.setData(key, data);
            this.notifyObservers(key, 'delete', deletedItem);
            return deletedItem;
        }
        return null;
    }

    // 옵저버 패턴 구현
    subscribe(dataKey, callback) {
        if (!this.observers[dataKey]) {
            this.observers[dataKey] = [];
        }
        this.observers[dataKey].push(callback);
        
        // 구독 해제 함수 반환
        return () => {
            this.observers[dataKey] = this.observers[dataKey].filter(cb => cb !== callback);
        };
    }

    notifyObservers(dataKey, action, data) {
        if (this.observers[dataKey]) {
            this.observers[dataKey].forEach(callback => {
                try {
                    callback({ action, data, key: dataKey });
                } catch (error) {
                    console.error('Error in observer callback:', error);
                }
            });
        }
    }

    // 유틸리티 메서드
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    updateSyncTime() {
        try {
            const config = this.getData('systemConfig') || {};
            config.lastSync = new Date().toISOString();
            // 무한 루프 방지를 위해 직접 localStorage에 저장
            localStorage.setItem('integrated_systemConfig', JSON.stringify(config));
        } catch (error) {
            // 동기화 시간 업데이트 실패는 무시 (중요하지 않음)
            console.warn('동기화 시간 업데이트 실패:', error.message);
        }
    }

    // 데이터 관계 관리
    getRelatedData(sourceKey, sourceId, relationKey) {
        const relations = this.getData(relationKey) || [];
        return relations.filter(rel => 
            rel.sourceKey === sourceKey && rel.sourceId === sourceId
        );
    }

    addRelation(sourceKey, sourceId, targetKey, targetId, metadata = {}) {
        const relations = this.getData('relations') || [];
        const relation = {
            id: this.generateId(),
            sourceKey,
            sourceId,
            targetKey,
            targetId,
            metadata,
            createdAt: new Date().toISOString()
        };
        relations.push(relation);
        this.setData('relations', relations);
        return relation;
    }

    // 검색 기능
    search(dataKey, query, fields = []) {
        const data = this.getData(dataKey) || [];
        const searchTerm = query.toLowerCase();
        
        return data.filter(item => {
            if (fields.length === 0) {
                // 모든 필드에서 검색
                return JSON.stringify(item).toLowerCase().includes(searchTerm);
            } else {
                // 지정된 필드에서만 검색
                return fields.some(field => {
                    const value = this.getNestedValue(item, field);
                    return value && value.toString().toLowerCase().includes(searchTerm);
                });
            }
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => current?.[prop], obj);
    }

    // 데이터 통계
    getStats(dataKey) {
        const data = this.getData(dataKey) || [];
        return {
            total: data.length,
            lastUpdated: Math.max(...data.map(item => new Date(item.updatedAt || item.createdAt || 0).getTime())),
            recent: data.filter(item => {
                const itemDate = new Date(item.createdAt || 0);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return itemDate > weekAgo;
            }).length
        };
    }

    // 데이터 백업 및 복원
    exportData(dataKeys = null) {
        const keysToExport = dataKeys || [
            'categories', 'items', 'images', 'itemImageRelations',
            'suppliers', 'newItemRegistrations', 'warehouseRequests',
            'warehouses', 'employees'
        ];
        
        const exportData = {};
        keysToExport.forEach(key => {
            exportData[key] = this.getData(key);
        });
        
        return {
            data: exportData,
            exportDate: new Date().toISOString(),
            version: '1.0.0'
        };
    }

    importData(importedData) {
        try {
            if (!importedData.data) {
                throw new Error('Invalid import data format');
            }
            
            Object.entries(importedData.data).forEach(([key, data]) => {
                if (data) {
                    this.setData(key, data);
                }
            });
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // 이벤트 리스너 설정
    setupEventListeners() {
        // 다른 탭에서 데이터 변경 감지
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('integrated_')) {
                const dataKey = e.key.replace('integrated_', '');
                const newData = JSON.parse(e.newValue || 'null');
                this.notifyObservers(dataKey, 'external_update', newData);
            }
        });

        // 페이지 언로드 시 정리
        window.addEventListener('beforeunload', () => {
            this.observers = {};
        });
    }

    // 시스템 상태 확인
    getSystemStatus() {
        const config = this.getData('systemConfig') || {};
        return {
            isHealthy: true,
            lastSync: config.lastSync,
            dataIntegrity: this.checkDataIntegrity(),
            storageUsage: this.getStorageUsage()
        };
    }

    checkDataIntegrity() {
        // 데이터 무결성 검사
        const categories = this.getData('categories') || [];
        const items = this.getData('items') || [];
        const suppliers = this.getData('suppliers') || [];
        
        return {
            categoriesCount: categories.length,
            itemsCount: items.length,
            suppliersCount: suppliers.length,
            orphanedItems: items.filter(item => 
                item.category && !categories.find(cat => 
                    cat.category1st === item.category.split(' > ')[0]
                )
            ).length
        };
    }

    getStorageUsage() {
        let totalSize = 0;
        for (let key in localStorage) {
            if (key.startsWith('integrated_')) {
                totalSize += localStorage[key].length;
            }
        }
        return {
            totalBytes: totalSize,
            totalMB: (totalSize / 1024 / 1024).toFixed(2)
        };
    }
}

// 전역 인스턴스 생성
window.IntegratedDataManager = new IntegratedDataManager();

// 다른 시스템에서 사용할 수 있도록 전역 함수 제공
window.getIntegratedData = (key) => window.IntegratedDataManager.getData(key);
window.setIntegratedData = (key, data) => window.IntegratedDataManager.setData(key, data);
window.subscribeToData = (key, callback) => window.IntegratedDataManager.subscribe(key, callback);

console.log('통합 데이터 관리 시스템이 초기화되었습니다.');