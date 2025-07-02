/**
 * 스키마 관리자 - 시스템 간 데이터 공유 및 표준화
 * 공통 데이터 구조 정의 및 자동 연동 관리
 */

class SchemaManager {
    constructor() {
        this.dataManager = window.IntegratedDataManager;
        this.sharedSchemas = new Map();
        this.fieldMappings = new Map();
        this.init();
    }

    init() {
        this.defineSharedSchemas();
        this.setupFieldMappings();
        this.initializeSharedData();
        console.log('스키마 관리자가 초기화되었습니다.');
    }

    defineSharedSchemas() {
        // 공통 카테고리 스키마
        this.registerSchema('categories', {
            fields: {
                id: { type: 'string', required: true, shared: true },
                groupId: { type: 'string', required: true, shared: true },
                category1st: { type: 'string', required: true, shared: true },
                category2nd: { type: 'string', shared: true },
                category3rd: { type: 'string', shared: true },
                category4th: { type: 'string', shared: true },
                createdAt: { type: 'datetime', required: true },
                updatedAt: { type: 'datetime' }
            },
            shareWith: ['items', 'newItemRegistrations'],
            displayName: '카테고리'
        });

        // 공통 거래처 스키마
        this.registerSchema('suppliers', {
            fields: {
                id: { type: 'string', required: true, shared: true },
                companyName: { type: 'string', required: true, shared: true },
                businessNumber: { type: 'string', required: true, shared: true },
                contactPerson: { type: 'string', shared: true },
                phone: { type: 'string', shared: true },
                email: { type: 'string', shared: true },
                address: { type: 'string', shared: true },
                status: { type: 'string', default: '활성', shared: true },
                createdAt: { type: 'datetime', required: true },
                updatedAt: { type: 'datetime' }
            },
            shareWith: ['items', 'newItemRegistrations'],
            displayName: '거래처'
        });

        // 공통 직원 스키마
        this.registerSchema('employees', {
            fields: {
                id: { type: 'string', required: true, shared: true },
                employeeId: { type: 'string', required: true, shared: true },
                name: { type: 'string', required: true, shared: true },
                department: { type: 'string', required: true, shared: true },
                position: { type: 'string', required: true, shared: true },
                email: { type: 'string', shared: true },
                phone: { type: 'string', shared: true },
                status: { type: 'string', default: '재직', shared: true },
                createdAt: { type: 'datetime', required: true },
                updatedAt: { type: 'datetime' }
            },
            shareWith: ['newItemRegistrations', 'warehouseRequests'],
            displayName: '직원'
        });

        // 공통 창고 스키마
        this.registerSchema('warehouses', {
            fields: {
                id: { type: 'string', required: true, shared: true },
                warehouseName: { type: 'string', required: true, shared: true },
                location: { type: 'string', required: true, shared: true },
                capacity: { type: 'number', shared: true },
                managerId: { type: 'string', shared: true },
                status: { type: 'string', default: '운영중', shared: true },
                createdAt: { type: 'datetime', required: true },
                updatedAt: { type: 'datetime' }
            },
            shareWith: ['warehouseRequests', 'items'],
            displayName: '창고'
        });

        // 공통 품목 스키마
        this.registerSchema('items', {
            fields: {
                id: { type: 'string', required: true, shared: true },
                itemCode: { type: 'string', required: true, shared: true },
                itemName: { type: 'string', required: true, shared: true },
                specification: { type: 'string', shared: true },
                category: { type: 'string', shared: true },
                categoryId: { type: 'string', shared: true },
                supplierId: { type: 'string', shared: true },
                supplierName: { type: 'string', shared: true },
                unitPrice: { type: 'number', shared: true },
                unit: { type: 'string', shared: true },
                status: { type: 'string', default: '활성', shared: true },
                createdAt: { type: 'datetime', required: true },
                updatedAt: { type: 'datetime' }
            },
            shareWith: ['newItemRegistrations', 'warehouseRequests'],
            displayName: '품목'
        });
    }

    registerSchema(schemaName, schema) {
        this.sharedSchemas.set(schemaName, {
            ...schema,
            name: schemaName
        });
    }

    setupFieldMappings() {
        // 시스템 간 필드 매핑 정의
        this.fieldMappings.set('categories', {
            '기준정보관리시스템': {
                'category1st': 'category1st',
                'category2nd': 'category2nd',
                'category3rd': 'category3rd',
                'category4th': 'category4th'
            },
            '품목정보관리시스템': {
                'categoryPath': 'category1st + " > " + category2nd + " > " + category3rd'
            },
            '물품신규등록시스템': {
                'category': 'category1st + " > " + category2nd'
            }
        });

        this.fieldMappings.set('suppliers', {
            '거래처등록시스템': {
                'companyName': 'companyName',
                'businessNumber': 'businessNumber',
                'contactPerson': 'contactPerson'
            },
            '물품신규등록시스템': {
                'supplierName': 'companyName',
                'supplierId': 'id'
            }
        });

        this.fieldMappings.set('employees', {
            '회사원등록시스템': {
                'name': 'name',
                'employeeId': 'employeeId',
                'department': 'department',
                'position': 'position'
            },
            '물품신규등록시스템': {
                'requesterName': 'name',
                'requesterId': 'id',
                'requesterDept': 'department'
            }
        });
    }

    initializeSharedData() {
        // 공유 데이터 자동 생성 및 동기화
        this.createSharedSelectors();
        this.setupAutoSync();
    }

    createSharedSelectors() {
        // 각 시스템에서 사용할 수 있는 공통 선택기 생성
        window.getSharedCategories = () => this.getFormattedData('categories');
        window.getSharedSuppliers = () => this.getFormattedData('suppliers');
        window.getSharedEmployees = () => this.getFormattedData('employees');
        window.getSharedWarehouses = () => this.getFormattedData('warehouses');
        window.getSharedItems = () => this.getFormattedData('items');

        // 선택 옵션 HTML 생성기
        window.generateCategoryOptions = (selectedValue = '') => 
            this.generateSelectOptions('categories', 'getCategoryPath', selectedValue);
        window.generateSupplierOptions = (selectedValue = '') => 
            this.generateSelectOptions('suppliers', 'companyName', selectedValue);
        window.generateEmployeeOptions = (selectedValue = '') => 
            this.generateSelectOptions('employees', 'name', selectedValue);
        window.generateWarehouseOptions = (selectedValue = '') => 
            this.generateSelectOptions('warehouses', 'warehouseName', selectedValue);
    }

    getFormattedData(schemaName) {
        const data = this.dataManager.getData(schemaName) || [];
        const schema = this.sharedSchemas.get(schemaName);
        
        if (!Array.isArray(data) || !schema) return [];

        return data.map(item => {
            const formatted = {};
            
            // 공유 필드만 추출
            Object.entries(schema.fields).forEach(([fieldName, fieldDef]) => {
                if (fieldDef.shared && item[fieldName] !== undefined) {
                    formatted[fieldName] = item[fieldName];
                }
            });

            // 특별한 계산 필드 추가
            if (schemaName === 'categories') {
                formatted.categoryPath = this.buildCategoryPath(item);
                formatted.displayName = formatted.categoryPath;
            } else if (schemaName === 'suppliers') {
                formatted.displayName = item.companyName;
            } else if (schemaName === 'employees') {
                formatted.displayName = `${item.name} (${item.department})`;
            } else if (schemaName === 'warehouses') {
                formatted.displayName = item.warehouseName;
            } else if (schemaName === 'items') {
                formatted.displayName = `${item.itemCode} - ${item.itemName}`;
            }

            return formatted;
        });
    }

    buildCategoryPath(category) {
        const parts = [
            category.category1st,
            category.category2nd,
            category.category3rd,
            category.category4th
        ].filter(part => part && part.trim());
        
        return parts.join(' > ');
    }

    generateSelectOptions(schemaName, displayField, selectedValue = '') {
        const data = this.getFormattedData(schemaName);
        let options = '<option value="">선택하세요</option>';
        
        data.forEach(item => {
            const value = item.id || '';
            const text = item.displayName || item[displayField] || '';
            const selected = value === selectedValue ? 'selected' : '';
            options += `<option value="${value}" ${selected}>${text}</option>`;
        });
        
        return options;
    }

    setupAutoSync() {
        // 데이터 변경 시 자동 동기화
        ['categories', 'suppliers', 'employees', 'warehouses', 'items'].forEach(schemaName => {
            this.dataManager.subscribe(schemaName, (event) => {
                this.handleDataChange(schemaName, event);
            });
        });
    }

    handleDataChange(schemaName, event) {
        const schema = this.sharedSchemas.get(schemaName);
        if (!schema || !schema.shareWith) return;

        console.log(`공유 데이터 변경 감지: ${schemaName} - ${event.action}`);

        // 관련 시스템에 변경사항 전파
        this.propagateChanges(schemaName, event, schema.shareWith);
        
        // 웹 이벤트 발생
        this.broadcastSchemaChange(schemaName, event);
    }

    propagateChanges(schemaName, event, shareWith) {
        shareWith.forEach(targetSchema => {
            try {
                this.updateRelatedData(schemaName, targetSchema, event);
            } catch (error) {
                console.error(`데이터 전파 오류 (${schemaName} -> ${targetSchema}):`, error);
            }
        });
    }

    updateRelatedData(sourceSchema, targetSchema, event) {
        if (event.action === 'update') {
            const targetData = this.dataManager.getData(targetSchema) || [];
            if (!Array.isArray(targetData)) return;

            let hasChanges = false;
            const updatedData = targetData.map(item => {
                if (this.isRelatedItem(sourceSchema, targetSchema, event.data, item)) {
                    const updatedItem = this.mergeRelatedData(sourceSchema, event.data, item);
                    hasChanges = true;
                    return updatedItem;
                }
                return item;
            });

            if (hasChanges) {
                this.dataManager.setData(targetSchema, updatedData);
                console.log(`관련 데이터 업데이트: ${targetSchema}`);
            }
        }
    }

    isRelatedItem(sourceSchema, targetSchema, sourceItem, targetItem) {
        // 관계 매핑 정의
        const relationships = {
            'categories': {
                'items': (cat, item) => item.categoryId === cat.id,
                'newItemRegistrations': (cat, reg) => 
                    reg.items && reg.items.some(item => item.categoryId === cat.id)
            },
            'suppliers': {
                'items': (sup, item) => item.supplierId === sup.id,
                'newItemRegistrations': (sup, reg) => 
                    reg.items && reg.items.some(item => item.supplierId === sup.id)
            },
            'employees': {
                'newItemRegistrations': (emp, reg) => reg.requesterId === emp.id,
                'warehouseRequests': (emp, req) => req.requesterId === emp.id
            },
            'warehouses': {
                'warehouseRequests': (wh, req) => req.warehouseId === wh.id,
                'items': (wh, item) => item.warehouseId === wh.id
            }
        };

        const relationCheck = relationships[sourceSchema]?.[targetSchema];
        return relationCheck ? relationCheck(sourceItem, targetItem) : false;
    }

    mergeRelatedData(sourceSchema, sourceItem, targetItem) {
        // 공유 필드를 대상 항목에 병합
        const schema = this.sharedSchemas.get(sourceSchema);
        if (!schema) return targetItem;

        const mergedItem = { ...targetItem };

        Object.entries(schema.fields).forEach(([fieldName, fieldDef]) => {
            if (fieldDef.shared && sourceItem[fieldName] !== undefined) {
                // 특별한 매핑 규칙 적용
                const mappedValue = this.applyFieldMapping(sourceSchema, fieldName, sourceItem[fieldName], sourceItem);
                if (mappedValue !== undefined) {
                    mergedItem[fieldName] = mappedValue;
                }
            }
        });

        mergedItem.updatedAt = new Date().toISOString();
        return mergedItem;
    }

    applyFieldMapping(sourceSchema, fieldName, fieldValue, sourceItem) {
        // 특별한 매핑 로직
        if (sourceSchema === 'categories' && fieldName === 'category') {
            return this.buildCategoryPath(sourceItem);
        }
        if (sourceSchema === 'suppliers' && fieldName === 'supplierName') {
            return sourceItem.companyName;
        }
        return fieldValue;
    }

    broadcastSchemaChange(schemaName, event) {
        // 다른 시스템에서 감지할 수 있는 이벤트 발생
        window.dispatchEvent(new CustomEvent('sharedDataChange', {
            detail: {
                schema: schemaName,
                action: event.action,
                data: event.data,
                timestamp: new Date().toISOString()
            }
        }));
    }

    // 공개 메서드들
    getSchema(schemaName) {
        return this.sharedSchemas.get(schemaName);
    }

    validateData(schemaName, data) {
        const schema = this.getSchema(schemaName);
        if (!schema) return { valid: false, errors: ['Unknown schema'] };

        const errors = [];
        
        Object.entries(schema.fields).forEach(([fieldName, fieldDef]) => {
            if (fieldDef.required && (data[fieldName] === undefined || data[fieldName] === '')) {
                errors.push(`${fieldName} is required`);
            }
        });

        return { valid: errors.length === 0, errors };
    }

    normalizeData(schemaName, data) {
        const schema = this.getSchema(schemaName);
        if (!schema) return data;

        const normalized = { ...data };

        Object.entries(schema.fields).forEach(([fieldName, fieldDef]) => {
            if (fieldDef.default && normalized[fieldName] === undefined) {
                normalized[fieldName] = fieldDef.default;
            }
            
            if (fieldDef.type === 'datetime' && !normalized[fieldName]) {
                if (fieldName === 'createdAt') {
                    normalized[fieldName] = new Date().toISOString();
                }
            }
        });

        return normalized;
    }

    // 샘플 데이터 생성
    generateSampleData() {
        console.log('샘플 공유 데이터 생성 시작...');

        // 기본 직원 데이터
        const sampleEmployees = [
            { employeeId: 'EMP001', name: '김철수', department: '구매팀', position: '팀장', email: 'kim@company.com' },
            { employeeId: 'EMP002', name: '이영희', department: '구매팀', position: '주임', email: 'lee@company.com' },
            { employeeId: 'EMP003', name: '박민수', department: '창고팀', position: '팀장', email: 'park@company.com' }
        ];

        // 기본 창고 데이터
        const sampleWarehouses = [
            { warehouseName: '본사창고', location: '서울시 강남구', capacity: 1000, managerId: 'EMP003' },
            { warehouseName: '분점창고', location: '부산시 해운대구', capacity: 500, managerId: 'EMP003' }
        ];

        // 데이터 저장
        sampleEmployees.forEach(emp => {
            const normalized = this.normalizeData('employees', emp);
            this.dataManager.addData('employees', normalized);
        });

        sampleWarehouses.forEach(wh => {
            const normalized = this.normalizeData('warehouses', wh);
            this.dataManager.addData('warehouses', normalized);
        });

        console.log('샘플 공유 데이터 생성 완료');
    }
}

// 전역 인스턴스 생성
window.SchemaManager = new SchemaManager();

console.log('스키마 관리자가 로드되었습니다.');