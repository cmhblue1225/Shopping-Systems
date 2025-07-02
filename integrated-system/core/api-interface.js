/**
 * 통합 API 인터페이스
 * 모든 시스템 간 데이터 교환과 비즈니스 로직을 담당
 */

class IntegratedAPI {
    constructor() {
        this.dataManager = window.IntegratedDataManager;
        this.init();
    }

    init() {
        console.log('통합 API 인터페이스가 초기화되었습니다.');
    }

    // ===========================================
    // 카테고리 관리 API (기준정보관리시스템)
    // ===========================================
    
    async getCategories() {
        return this.dataManager.getData('categories') || [];
    }

    async addCategory(categoryData) {
        const newCategory = {
            ...categoryData,
            groupId: this.generateGroupId(),
            createdAt: new Date().toISOString()
        };
        return this.dataManager.addData('categories', newCategory);
    }

    async updateCategory(id, updates) {
        return this.dataManager.updateData('categories', id, updates);
    }

    async deleteCategory(id) {
        // 카테고리 삭제 전 연관 데이터 확인
        const items = await this.getItemsByCategory(id);
        if (items.length > 0) {
            throw new Error('이 카테고리를 사용하는 품목이 있어 삭제할 수 없습니다.');
        }
        return this.dataManager.deleteData('categories', id);
    }

    async getCategoryHierarchy() {
        const categories = await this.getCategories();
        return this.buildCategoryTree(categories);
    }

    buildCategoryTree(categories) {
        const tree = {};
        categories.forEach(cat => {
            const path = [cat.category1st, cat.category2nd, cat.category3rd, cat.category4th]
                .filter(Boolean);
            this.addToTree(tree, path, cat);
        });
        return tree;
    }

    addToTree(tree, path, data) {
        if (path.length === 0) return;
        const [current, ...rest] = path;
        if (!tree[current]) {
            tree[current] = { children: {}, data: null };
        }
        if (rest.length === 0) {
            tree[current].data = data;
        } else {
            this.addToTree(tree[current].children, rest, data);
        }
    }

    // ===========================================
    // 품목 관리 API (품목정보관리시스템)
    // ===========================================

    async getItems(filters = {}) {
        let items = this.dataManager.getData('items') || [];
        
        // 필터 적용
        if (filters.category) {
            items = items.filter(item => item.category?.includes(filters.category));
        }
        if (filters.supplier) {
            items = items.filter(item => item.supplier === filters.supplier);
        }
        if (filters.searchTerm) {
            items = this.dataManager.search('items', filters.searchTerm, 
                ['itemCode', 'itemName', 'specification']);
        }

        // 연관 데이터 추가 (안전하게)
        for (let item of items) {
            try {
                item.images = await this.getItemImages(item.id) || [];
                item.supplierInfo = await this.getSupplier(item.supplierId) || null;
            } catch (error) {
                console.warn('Failed to load related data for item:', item.id, error);
                item.images = [];
                item.supplierInfo = null;
            }
        }

        return items;
    }

    async getItem(id) {
        const items = this.dataManager.getData('items') || [];
        const item = items.find(item => item.id === id);
        if (item) {
            item.images = await this.getItemImages(id);
            item.supplierInfo = await this.getSupplier(item.supplierId);
        }
        return item;
    }

    async addItem(itemData) {
        // 품목 코드 중복 검사
        const existingItems = await this.getItems();
        if (existingItems.find(item => item.itemCode === itemData.itemCode)) {
            throw new Error('이미 존재하는 품목 코드입니다.');
        }

        const newItem = {
            ...itemData,
            status: '활성',
            createdAt: new Date().toISOString()
        };
        return this.dataManager.addData('items', newItem);
    }

    async updateItem(id, updates) {
        return this.dataManager.updateData('items', id, updates);
    }

    async deleteItem(id) {
        // 삭제 전 연관 데이터 확인
        const registrations = await this.getNewItemRegistrations({ itemId: id });
        if (registrations.length > 0) {
            throw new Error('이 품목을 사용하는 등록 요청이 있어 삭제할 수 없습니다.');
        }
        
        // 이미지 연결 해제
        await this.removeAllItemImageRelations(id);
        
        return this.dataManager.deleteData('items', id);
    }

    async getItemsByCategory(categoryId) {
        const items = this.dataManager.getData('items') || [];
        return items.filter(item => item.categoryId === categoryId);
    }

    // ===========================================
    // 이미지 관리 API
    // ===========================================

    async getImages() {
        return this.dataManager.getData('images') || [];
    }

    async addImage(imageData) {
        const newImage = {
            ...imageData,
            uploadDate: new Date().toISOString(),
            size: imageData.data ? imageData.data.length : 0
        };
        return this.dataManager.addData('images', newImage);
    }

    async deleteImage(id) {
        // 품목-이미지 연결 해제
        await this.removeAllImageItemRelations(id);
        return this.dataManager.deleteData('images', id);
    }

    async getItemImages(itemId) {
        const relations = this.dataManager.getData('itemImageRelations') || [];
        const imageIds = relations
            .filter(rel => rel.itemId === itemId)
            .map(rel => rel.imageId);
        
        const images = this.dataManager.getData('images') || [];
        return images.filter(img => imageIds.includes(img.id));
    }

    async addItemImageRelation(itemId, imageId) {
        const relations = this.dataManager.getData('itemImageRelations') || [];
        
        // 중복 연결 확인
        const existingRelation = relations.find(rel => 
            rel.itemId === itemId && rel.imageId === imageId
        );
        
        if (existingRelation) {
            throw new Error('이미 연결된 품목과 이미지입니다.');
        }

        const newRelation = {
            id: this.dataManager.generateId(),
            itemId,
            imageId,
            createdAt: new Date().toISOString()
        };
        
        relations.push(newRelation);
        this.dataManager.setData('itemImageRelations', relations);
        return newRelation;
    }

    async removeItemImageRelation(itemId, imageId) {
        const relations = this.dataManager.getData('itemImageRelations') || [];
        const filteredRelations = relations.filter(rel => 
            !(rel.itemId === itemId && rel.imageId === imageId)
        );
        this.dataManager.setData('itemImageRelations', filteredRelations);
    }

    async removeAllItemImageRelations(itemId) {
        const relations = this.dataManager.getData('itemImageRelations') || [];
        const filteredRelations = relations.filter(rel => rel.itemId !== itemId);
        this.dataManager.setData('itemImageRelations', filteredRelations);
    }

    async removeAllImageItemRelations(imageId) {
        const relations = this.dataManager.getData('itemImageRelations') || [];
        const filteredRelations = relations.filter(rel => rel.imageId !== imageId);
        this.dataManager.setData('itemImageRelations', filteredRelations);
    }

    // ===========================================
    // 거래처 관리 API
    // ===========================================

    async getSuppliers(filters = {}) {
        let suppliers = this.dataManager.getData('suppliers') || [];
        
        // 데이터가 배열인지 확인
        if (!Array.isArray(suppliers)) {
            console.warn('Suppliers data is not an array, returning empty array');
            return [];
        }
        
        if (filters.searchTerm) {
            suppliers = this.dataManager.search('suppliers', filters.searchTerm,
                ['companyName', 'businessNumber', 'contactPerson']);
        }
        
        return suppliers;
    }

    async getSupplier(id) {
        const suppliers = await this.getSuppliers();
        if (!Array.isArray(suppliers)) return null;
        return suppliers.find(supplier => supplier && supplier.id === id) || null;
    }

    async addSupplier(supplierData) {
        // 사업자번호 중복 검사
        const existingSuppliers = await this.getSuppliers();
        if (existingSuppliers.find(s => s.businessNumber === supplierData.businessNumber)) {
            throw new Error('이미 등록된 사업자번호입니다.');
        }

        return this.dataManager.addData('suppliers', supplierData);
    }

    async updateSupplier(id, updates) {
        return this.dataManager.updateData('suppliers', id, updates);
    }

    async deleteSupplier(id) {
        // 연관 데이터 확인
        const items = this.dataManager.getData('items') || [];
        const relatedItems = items.filter(item => item.supplierId === id);
        
        if (relatedItems.length > 0) {
            throw new Error('이 거래처를 사용하는 품목이 있어 삭제할 수 없습니다.');
        }
        
        return this.dataManager.deleteData('suppliers', id);
    }

    // ===========================================
    // 직원 관리 API
    // ===========================================

    async getEmployees(filters = {}) {
        let employees = this.dataManager.getData('employees') || [];
        
        if (filters.department) {
            employees = employees.filter(emp => emp.department === filters.department);
        }
        if (filters.position) {
            employees = employees.filter(emp => emp.position === filters.position);
        }
        if (filters.searchTerm) {
            employees = this.dataManager.search('employees', filters.searchTerm,
                ['name', 'employeeId', 'email', 'phone']);
        }
        
        return employees;
    }

    async getEmployee(id) {
        const employees = this.dataManager.getData('employees') || [];
        return employees.find(emp => emp.id === id);
    }

    async addEmployee(employeeData) {
        // 사원번호 중복 검사
        const existingEmployees = await this.getEmployees();
        if (existingEmployees.find(emp => emp.employeeId === employeeData.employeeId)) {
            throw new Error('이미 존재하는 사원번호입니다.');
        }

        return this.dataManager.addData('employees', employeeData);
    }

    // ===========================================
    // 창고 관리 API
    // ===========================================

    async getWarehouses() {
        return this.dataManager.getData('warehouses') || [];
    }

    async addWarehouse(warehouseData) {
        return this.dataManager.addData('warehouses', warehouseData);
    }

    // ===========================================
    // 신규 품목 등록 API
    // ===========================================

    async getNewItemRegistrations(filters = {}) {
        let registrations = this.dataManager.getData('newItemRegistrations') || [];
        
        if (filters.status) {
            registrations = registrations.filter(reg => reg.status === filters.status);
        }
        if (filters.requesterId) {
            registrations = registrations.filter(reg => reg.requesterId === filters.requesterId);
        }
        
        // 연관 데이터 추가
        for (let registration of registrations) {
            registration.requesterInfo = await this.getEmployee(registration.requesterId);
            registration.itemsInfo = await Promise.all(
                (registration.items || []).map(async item => ({
                    ...item,
                    supplierInfo: await this.getSupplier(item.supplierId),
                    warehouseInfo: await this.getWarehouse(item.warehouseId)
                }))
            );
        }
        
        return registrations;
    }

    async addNewItemRegistration(registrationData) {
        const newRegistration = {
            ...registrationData,
            status: '대기',
            requestDate: new Date().toISOString(),
            registrationNumber: this.generateRegistrationNumber()
        };
        
        const result = this.dataManager.addData('newItemRegistrations', newRegistration);
        
        // 워크플로우 시작
        await this.startWorkflow('newItemRegistration', result.id);
        
        return result;
    }

    async updateRegistrationStatus(id, status, approverInfo = null) {
        const updates = { 
            status,
            updatedAt: new Date().toISOString()
        };
        
        if (approverInfo) {
            updates.approverInfo = approverInfo;
            updates.approvedAt = new Date().toISOString();
        }
        
        const result = this.dataManager.updateData('newItemRegistrations', id, updates);
        
        // 승인 완료 시 품목을 실제 품목 목록에 추가
        if (status === '승인완료') {
            await this.processApprovedRegistration(id);
        }
        
        return result;
    }

    async processApprovedRegistration(registrationId) {
        const registration = await this.getNewItemRegistration(registrationId);
        if (!registration || registration.status !== '승인완료') {
            throw new Error('승인 완료된 등록 요청을 찾을 수 없습니다.');
        }

        // 등록된 품목들을 실제 품목 목록에 추가
        for (const item of registration.items || []) {
            try {
                await this.addItem({
                    ...item,
                    registrationId: registrationId,
                    approvedBy: registration.approverInfo
                });
            } catch (error) {
                console.error('품목 추가 중 오류:', error);
            }
        }
    }

    // ===========================================
    // 입고 요청서 API
    // ===========================================

    async getWarehouseRequests(filters = {}) {
        let requests = this.dataManager.getData('warehouseRequests') || [];
        
        if (filters.status) {
            requests = requests.filter(req => req.status === filters.status);
        }
        if (filters.warehouseId) {
            requests = requests.filter(req => req.warehouseId === filters.warehouseId);
        }
        
        return requests;
    }

    async addWarehouseRequest(requestData) {
        const newRequest = {
            ...requestData,
            status: '요청',
            requestDate: new Date().toISOString(),
            requestNumber: this.generateRequestNumber()
        };
        
        return this.dataManager.addData('warehouseRequests', newRequest);
    }

    // ===========================================
    // 워크플로우 관리
    // ===========================================

    async startWorkflow(type, entityId) {
        const workflow = {
            id: this.dataManager.generateId(),
            type,
            entityId,
            status: '진행중',
            steps: this.getWorkflowSteps(type),
            currentStep: 0,
            createdAt: new Date().toISOString()
        };
        
        const workflows = this.dataManager.getData('workflows') || [];
        workflows.push(workflow);
        this.dataManager.setData('workflows', workflows);
        
        return workflow;
    }

    getWorkflowSteps(type) {
        const workflowTemplates = {
            newItemRegistration: [
                { name: '등록 요청', status: '완료' },
                { name: '검토 대기', status: '대기' },
                { name: '승인 검토', status: '대기' },
                { name: '승인 완료', status: '대기' }
            ],
            warehouseRequest: [
                { name: '입고 요청', status: '완료' },
                { name: '재고 확인', status: '대기' },
                { name: '입고 승인', status: '대기' },
                { name: '입고 완료', status: '대기' }
            ]
        };
        
        return workflowTemplates[type] || [];
    }

    // ===========================================
    // 알림 시스템
    // ===========================================

    async addNotification(type, title, message, targetUsers = []) {
        const notification = {
            id: this.dataManager.generateId(),
            type,
            title,
            message,
            targetUsers,
            isRead: false,
            createdAt: new Date().toISOString()
        };
        
        const notifications = this.dataManager.getData('notifications') || [];
        notifications.push(notification);
        this.dataManager.setData('notifications', notifications);
        
        return notification;
    }

    async getNotifications(userId = null) {
        const notifications = this.dataManager.getData('notifications') || [];
        
        if (userId) {
            return notifications.filter(notif => 
                notif.targetUsers.length === 0 || notif.targetUsers.includes(userId)
            );
        }
        
        return notifications;
    }

    // ===========================================
    // 유틸리티 메서드
    // ===========================================

    generateGroupId() {
        return 'GRP_' + Date.now().toString(36).toUpperCase();
    }

    generateRegistrationNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const sequence = String(Date.now() % 10000).padStart(4, '0');
        
        return `REG-${year}${month}${day}-${sequence}`;
    }

    generateRequestNumber() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const sequence = String(Date.now() % 10000).padStart(4, '0');
        
        return `WH-${year}${month}${day}-${sequence}`;
    }

    // ===========================================
    // 통계 및 리포트
    // ===========================================

    async getDashboardStats() {
        const [categories, items, suppliers, employees, registrations, requests] = await Promise.all([
            this.getCategories(),
            this.getItems(),
            this.getSuppliers(),
            this.getEmployees(),
            this.getNewItemRegistrations(),
            this.getWarehouseRequests()
        ]);

        return {
            categories: {
                total: categories.length,
                recent: categories.filter(cat => this.isRecent(cat.createdAt)).length
            },
            items: {
                total: items.length,
                active: items.filter(item => item.status === '활성').length,
                recent: items.filter(item => this.isRecent(item.createdAt)).length
            },
            suppliers: {
                total: suppliers.length,
                active: suppliers.filter(sup => sup.status !== '비활성').length
            },
            employees: {
                total: employees.length,
                byDepartment: this.groupBy(employees, 'department')
            },
            registrations: {
                total: registrations.length,
                pending: registrations.filter(reg => reg.status === '대기').length,
                approved: registrations.filter(reg => reg.status === '승인완료').length
            },
            requests: {
                total: requests.length,
                pending: requests.filter(req => req.status === '요청').length,
                completed: requests.filter(req => req.status === '완료').length
            }
        };
    }

    isRecent(dateString, days = 7) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return date > daysAgo;
    }

    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key] || '미분류';
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }
}

// 전역 인스턴스 생성
window.IntegratedAPI = new IntegratedAPI();

console.log('통합 API 인터페이스가 초기화되었습니다.');