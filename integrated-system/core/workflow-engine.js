/**
 * 워크플로우 자동화 엔진
 * 시스템 간 비즈니스 프로세스 자동화 및 관리
 */

class WorkflowEngine {
    constructor() {
        this.dataManager = window.IntegratedDataManager;
        this.api = window.IntegratedAPI;
        this.activeWorkflows = new Map();
        this.workflowTemplates = new Map();
        this.eventQueue = [];
        this.init();
    }

    init() {
        this.initializeWorkflowTemplates();
        this.setupEventListeners();
        this.startProcessingEngine();
        console.log('워크플로우 엔진이 초기화되었습니다.');
    }

    initializeWorkflowTemplates() {
        // 신규 품목 등록 워크플로우
        this.registerTemplate('newItemRegistration', {
            name: '신규 품목 등록 승인',
            description: '새로운 품목 등록 요청의 승인 프로세스',
            steps: [
                {
                    id: 'request_submitted',
                    name: '등록 요청 제출',
                    type: 'start',
                    autoExecute: true,
                    actions: ['validateRequest', 'notifyReviewer']
                },
                {
                    id: 'under_review',
                    name: '검토 중',
                    type: 'manual',
                    assignedRole: 'reviewer',
                    timeout: 24 * 60 * 60 * 1000, // 24시간
                    actions: ['sendReminder']
                },
                {
                    id: 'review_complete',
                    name: '검토 완료',
                    type: 'decision',
                    conditions: {
                        approved: { nextStep: 'pending_approval' },
                        rejected: { nextStep: 'rejected' }
                    }
                },
                {
                    id: 'pending_approval',
                    name: '승인 대기',
                    type: 'manual',
                    assignedRole: 'approver',
                    timeout: 48 * 60 * 60 * 1000, // 48시간
                    actions: ['sendReminder']
                },
                {
                    id: 'approved',
                    name: '승인 완료',
                    type: 'end',
                    actions: ['createItems', 'notifyRequester', 'updateInventory']
                },
                {
                    id: 'rejected',
                    name: '반려',
                    type: 'end',
                    actions: ['notifyRequester', 'archiveRequest']
                }
            ],
            triggers: [
                {
                    event: 'data_change',
                    dataKey: 'newItemRegistrations',
                    action: 'add'
                }
            ],
            permissions: {
                viewer: ['request_submitted', 'under_review', 'pending_approval'],
                reviewer: ['under_review', 'review_complete'],
                approver: ['pending_approval', 'approved', 'rejected'],
                admin: ['*']
            }
        });

        // 입고 요청 워크플로우
        this.registerTemplate('warehouseRequest', {
            name: '입고 요청 처리',
            description: '창고 입고 요청의 처리 프로세스',
            steps: [
                {
                    id: 'request_created',
                    name: '입고 요청 생성',
                    type: 'start',
                    autoExecute: true,
                    actions: ['validateWarehouseCapacity', 'notifyWarehouseManager']
                },
                {
                    id: 'capacity_check',
                    name: '용량 확인',
                    type: 'automatic',
                    actions: ['checkAvailableSpace']
                },
                {
                    id: 'schedule_delivery',
                    name: '입고 일정 조정',
                    type: 'manual',
                    assignedRole: 'warehouseManager',
                    actions: ['scheduleSlot']
                },
                {
                    id: 'goods_received',
                    name: '물품 입고',
                    type: 'manual',
                    assignedRole: 'warehouseStaff',
                    actions: ['updateInventory', 'generateReceipt']
                },
                {
                    id: 'completed',
                    name: '입고 완료',
                    type: 'end',
                    actions: ['notifyRequester', 'updateSystemInventory']
                }
            ],
            triggers: [
                {
                    event: 'data_change',
                    dataKey: 'warehouseRequests',
                    action: 'add'
                }
            ]
        });

        // 거래처 변경 알림 워크플로우
        this.registerTemplate('supplierUpdate', {
            name: '거래처 정보 변경 알림',
            description: '거래처 정보 변경 시 관련 시스템 업데이트',
            steps: [
                {
                    id: 'supplier_updated',
                    name: '거래처 정보 변경',
                    type: 'start',
                    autoExecute: true,
                    actions: ['findRelatedItems']
                },
                {
                    id: 'update_related_data',
                    name: '관련 데이터 업데이트',
                    type: 'automatic',
                    actions: ['updateItemSupplierInfo', 'notifyPurchasing']
                },
                {
                    id: 'validation_complete',
                    name: '검증 완료',
                    type: 'end',
                    actions: ['logChanges']
                }
            ],
            triggers: [
                {
                    event: 'data_change',
                    dataKey: 'suppliers',
                    action: 'update'
                }
            ]
        });

        // 카테고리 변경 전파 워크플로우
        this.registerTemplate('categoryUpdate', {
            name: '카테고리 변경 전파',
            description: '카테고리 변경 시 관련 품목 및 시스템 업데이트',
            steps: [
                {
                    id: 'category_changed',
                    name: '카테고리 변경',
                    type: 'start',
                    autoExecute: true,
                    actions: ['findAffectedItems']
                },
                {
                    id: 'propagate_changes',
                    name: '변경사항 전파',
                    type: 'automatic',
                    actions: ['updateItemCategories', 'refreshCategoryMappings']
                },
                {
                    id: 'notify_systems',
                    name: '시스템 알림',
                    type: 'automatic',
                    actions: ['notifyItemManagement', 'notifyRegistrationSystem']
                },
                {
                    id: 'sync_complete',
                    name: '동기화 완료',
                    type: 'end',
                    actions: ['validateDataConsistency']
                }
            ],
            triggers: [
                {
                    event: 'data_change',
                    dataKey: 'categories',
                    action: 'update'
                },
                {
                    event: 'data_change',
                    dataKey: 'categories',
                    action: 'delete'
                }
            ]
        });

        console.log('워크플로우 템플릿이 초기화되었습니다.');
    }

    registerTemplate(id, template) {
        this.workflowTemplates.set(id, {
            ...template,
            id,
            createdAt: new Date().toISOString()
        });
    }

    setupEventListeners() {
        // 데이터 변경 이벤트 감지
        const dataKeys = [
            'categories', 'items', 'suppliers', 'employees',
            'newItemRegistrations', 'warehouseRequests'
        ];

        dataKeys.forEach(key => {
            this.dataManager.subscribe(key, (event) => {
                this.handleDataEvent(key, event);
            });
        });

        // 시스템 이벤트 감지
        window.addEventListener('systemEvent', (e) => {
            this.handleSystemEvent(e.detail);
        });

        // 워크플로우 이벤트 감지
        window.addEventListener('workflowEvent', (e) => {
            this.handleWorkflowEvent(e.detail);
        });
    }

    handleDataEvent(dataKey, event) {
        const workflowEvent = {
            type: 'data_change',
            dataKey,
            action: event.action,
            data: event.data,
            timestamp: new Date().toISOString()
        };

        this.eventQueue.push(workflowEvent);
        this.processEventQueue();
    }

    handleSystemEvent(event) {
        this.eventQueue.push({
            type: 'system_event',
            ...event
        });
        this.processEventQueue();
    }

    handleWorkflowEvent(event) {
        this.eventQueue.push({
            type: 'workflow_event',
            ...event
        });
        this.processEventQueue();
    }

    processEventQueue() {
        while (this.eventQueue.length > 0) {
            const event = this.eventQueue.shift();
            this.processEvent(event);
        }
    }

    processEvent(event) {
        // 이벤트에 매칭되는 워크플로우 템플릿 찾기
        for (const [templateId, template] of this.workflowTemplates) {
            if (this.eventMatchesTemplate(event, template)) {
                this.startWorkflow(templateId, event);
            }
        }

        // 기존 워크플로우 진행
        for (const [workflowId, workflow] of this.activeWorkflows) {
            if (this.eventMatchesWorkflow(event, workflow)) {
                this.progressWorkflow(workflowId, event);
            }
        }
    }

    eventMatchesTemplate(event, template) {
        return template.triggers.some(trigger => 
            trigger.event === event.type &&
            trigger.dataKey === event.dataKey &&
            trigger.action === event.action
        );
    }

    eventMatchesWorkflow(event, workflow) {
        const currentStep = workflow.steps[workflow.currentStepIndex];
        return currentStep && currentStep.waitingForEvent === event.type;
    }

    startWorkflow(templateId, triggerEvent) {
        const template = this.workflowTemplates.get(templateId);
        if (!template) return;

        const workflowId = this.generateWorkflowId();
        const workflow = {
            id: workflowId,
            templateId,
            name: template.name,
            description: template.description,
            status: 'active',
            currentStepIndex: 0,
            steps: [...template.steps],
            data: {
                triggerEvent,
                entityId: triggerEvent.data?.id,
                entityType: triggerEvent.dataKey
            },
            startedAt: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            history: []
        };

        this.activeWorkflows.set(workflowId, workflow);
        this.saveWorkflowState();

        console.log(`워크플로우 시작: ${template.name} (${workflowId})`);
        
        // 첫 번째 단계 실행
        this.executeStep(workflowId, 0);

        // 워크플로우 시작 알림
        this.api.addNotification(
            'workflow_started',
            `워크플로우 시작: ${template.name}`,
            `새로운 워크플로우가 시작되었습니다.`
        );

        return workflowId;
    }

    async executeStep(workflowId, stepIndex) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow || stepIndex >= workflow.steps.length) return;

        const step = workflow.steps[stepIndex];
        workflow.currentStepIndex = stepIndex;
        workflow.lastUpdated = new Date().toISOString();

        console.log(`워크플로우 단계 실행: ${workflow.name} - ${step.name}`);

        // 단계 실행 이력 기록
        workflow.history.push({
            stepId: step.id,
            stepName: step.name,
            startedAt: new Date().toISOString(),
            status: 'started'
        });

        try {
            let result = null;

            switch (step.type) {
                case 'start':
                case 'automatic':
                    result = await this.executeAutomaticStep(workflow, step);
                    break;
                case 'manual':
                    result = await this.executeManualStep(workflow, step);
                    break;
                case 'decision':
                    result = await this.executeDecisionStep(workflow, step);
                    break;
                case 'end':
                    result = await this.executeEndStep(workflow, step);
                    break;
            }

            // 단계 완료 기록
            const historyEntry = workflow.history[workflow.history.length - 1];
            historyEntry.completedAt = new Date().toISOString();
            historyEntry.status = 'completed';
            historyEntry.result = result;

            // 다음 단계로 진행
            if (step.type !== 'end' && !step.waitForManualApproval) {
                await this.moveToNextStep(workflowId, result);
            }

        } catch (error) {
            console.error(`워크플로우 단계 실행 오류: ${error.message}`);
            
            // 오류 기록
            const historyEntry = workflow.history[workflow.history.length - 1];
            historyEntry.completedAt = new Date().toISOString();
            historyEntry.status = 'error';
            historyEntry.error = error.message;

            // 워크플로우 중단
            workflow.status = 'error';
            workflow.error = error.message;

            this.api.addNotification(
                'workflow_error',
                `워크플로우 오류: ${workflow.name}`,
                `단계 "${step.name}"에서 오류가 발생했습니다: ${error.message}`
            );
        }

        this.saveWorkflowState();
    }

    async executeAutomaticStep(workflow, step) {
        const results = {};

        // 단계에 정의된 액션들 실행
        for (const actionName of step.actions || []) {
            try {
                const actionResult = await this.executeAction(actionName, workflow, step);
                results[actionName] = actionResult;
            } catch (error) {
                console.error(`액션 실행 오류 (${actionName}):`, error);
                results[actionName] = { error: error.message };
            }
        }

        return results;
    }

    async executeManualStep(workflow, step) {
        // 수동 단계는 사용자 입력 대기
        workflow.waitingForInput = true;
        workflow.assignedTo = step.assignedRole;

        // 담당자에게 알림
        await this.notifyAssignee(workflow, step);

        // 타임아웃 설정
        if (step.timeout) {
            setTimeout(() => {
                this.handleStepTimeout(workflow.id, step.id);
            }, step.timeout);
        }

        return { status: 'waiting_for_input' };
    }

    async executeDecisionStep(workflow, step) {
        // 결정 단계는 조건에 따라 다음 단계 결정
        const decision = await this.evaluateDecisionConditions(workflow, step);
        return { decision, nextStep: step.conditions[decision]?.nextStep };
    }

    async executeEndStep(workflow, step) {
        // 종료 단계 액션 실행
        const results = await this.executeAutomaticStep(workflow, step);
        
        // 워크플로우 완료
        workflow.status = 'completed';
        workflow.completedAt = new Date().toISOString();

        console.log(`워크플로우 완료: ${workflow.name}`);

        this.api.addNotification(
            'workflow_completed',
            `워크플로우 완료: ${workflow.name}`,
            `워크플로우가 성공적으로 완료되었습니다.`
        );

        return results;
    }

    async executeAction(actionName, workflow, step) {
        const actionHandlers = {
            // 검증 액션
            validateRequest: () => this.validateRequest(workflow),
            validateWarehouseCapacity: () => this.validateWarehouseCapacity(workflow),
            
            // 알림 액션
            notifyReviewer: () => this.notifyReviewer(workflow),
            notifyApprover: () => this.notifyApprover(workflow),
            notifyRequester: () => this.notifyRequester(workflow),
            notifyWarehouseManager: () => this.notifyWarehouseManager(workflow),
            sendReminder: () => this.sendReminder(workflow, step),
            
            // 데이터 액션
            createItems: () => this.createItemsFromRequest(workflow),
            updateInventory: () => this.updateInventory(workflow),
            updateSystemInventory: () => this.updateSystemInventory(workflow),
            
            // 관계 액션
            findRelatedItems: () => this.findRelatedItems(workflow),
            updateItemSupplierInfo: () => this.updateItemSupplierInfo(workflow),
            updateItemCategories: () => this.updateItemCategories(workflow),
            
            // 시스템 액션
            archiveRequest: () => this.archiveRequest(workflow),
            logChanges: () => this.logChanges(workflow),
            validateDataConsistency: () => this.validateDataConsistency(workflow)
        };

        const handler = actionHandlers[actionName];
        if (handler) {
            return await handler();
        } else {
            console.warn(`알 수 없는 액션: ${actionName}`);
            return { error: `Unknown action: ${actionName}` };
        }
    }

    // 액션 구현 메서드들
    async validateRequest(workflow) {
        const requestData = workflow.data.triggerEvent.data;
        const validationResult = {
            isValid: true,
            errors: []
        };

        // 필수 필드 검증
        if (!requestData.items || requestData.items.length === 0) {
            validationResult.isValid = false;
            validationResult.errors.push('등록할 품목이 없습니다.');
        }

        // 품목별 검증
        for (const item of requestData.items || []) {
            if (!item.itemCode || !item.itemName) {
                validationResult.isValid = false;
                validationResult.errors.push(`품목 정보가 불완전합니다: ${item.itemName || 'Unknown'}`);
            }
        }

        return validationResult;
    }

    async notifyReviewer(workflow) {
        const notification = {
            type: 'review_required',
            title: '검토 요청',
            message: `새로운 품목 등록 요청이 검토를 기다리고 있습니다.`,
            workflowId: workflow.id,
            targetRole: 'reviewer'
        };

        return await this.api.addNotification(
            notification.type,
            notification.title,
            notification.message
        );
    }

    async createItemsFromRequest(workflow) {
        const requestData = workflow.data.triggerEvent.data;
        const createdItems = [];

        for (const itemData of requestData.items || []) {
            try {
                const newItem = await this.api.addItem({
                    ...itemData,
                    status: '활성',
                    sourceWorkflow: workflow.id,
                    approvedAt: new Date().toISOString()
                });
                createdItems.push(newItem);
            } catch (error) {
                console.error('품목 생성 오류:', error);
            }
        }

        return { createdItems, count: createdItems.length };
    }

    async moveToNextStep(workflowId, stepResult) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) return;

        const currentStep = workflow.steps[workflow.currentStepIndex];
        let nextStepIndex = workflow.currentStepIndex + 1;

        // 결정 단계의 경우 조건에 따라 다음 단계 결정
        if (currentStep.type === 'decision' && stepResult.nextStep) {
            nextStepIndex = workflow.steps.findIndex(step => step.id === stepResult.nextStep);
        }

        if (nextStepIndex < workflow.steps.length) {
            await this.executeStep(workflowId, nextStepIndex);
        } else {
            // 워크플로우 완료
            workflow.status = 'completed';
            workflow.completedAt = new Date().toISOString();
            console.log(`워크플로우 완료: ${workflow.name}`);
        }
    }

    progressWorkflow(workflowId, event) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow || !workflow.waitingForInput) return;

        // 수동 승인 이벤트 처리
        if (event.type === 'workflow_event' && event.action === 'approve') {
            this.handleManualApproval(workflowId, event.data);
        }
    }

    async handleManualApproval(workflowId, approvalData) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow) return;

        workflow.waitingForInput = false;
        
        // 승인 결과에 따라 다음 단계 결정
        const nextStepResult = {
            approved: approvalData.approved,
            comments: approvalData.comments,
            approver: approvalData.approver
        };

        await this.moveToNextStep(workflowId, nextStepResult);
    }

    handleStepTimeout(workflowId, stepId) {
        const workflow = this.activeWorkflows.get(workflowId);
        if (!workflow || !workflow.waitingForInput) return;

        console.log(`워크플로우 단계 타임아웃: ${workflow.name} - ${stepId}`);

        // 타임아웃 알림
        this.api.addNotification(
            'workflow_timeout',
            `워크플로우 타임아웃: ${workflow.name}`,
            `단계 "${stepId}"가 시간 초과되었습니다.`
        );

        // 리마인더 액션 실행
        const currentStep = workflow.steps[workflow.currentStepIndex];
        if (currentStep.actions && currentStep.actions.includes('sendReminder')) {
            this.executeAction('sendReminder', workflow, currentStep);
        }
    }

    saveWorkflowState() {
        const workflowData = Array.from(this.activeWorkflows.entries()).map(([id, workflow]) => ({
            id,
            ...workflow
        }));
        
        this.dataManager.setData('activeWorkflows', workflowData);
    }

    loadWorkflowState() {
        const workflowData = this.dataManager.getData('activeWorkflows') || [];
        
        this.activeWorkflows.clear();
        workflowData.forEach(workflow => {
            this.activeWorkflows.set(workflow.id, workflow);
        });
    }

    startProcessingEngine() {
        // 저장된 워크플로우 상태 복원
        this.loadWorkflowState();

        // 정기적인 워크플로우 상태 체크 (1분마다)
        setInterval(() => {
            this.checkWorkflowHealth();
        }, 60000);
    }

    checkWorkflowHealth() {
        for (const [workflowId, workflow] of this.activeWorkflows) {
            // 중단된 워크플로우 재시작
            if (workflow.status === 'active' && workflow.waitingForInput) {
                const currentStep = workflow.steps[workflow.currentStepIndex];
                const waitTime = Date.now() - new Date(workflow.lastUpdated).getTime();
                
                // 24시간 이상 대기 중인 경우 알림
                if (waitTime > 24 * 60 * 60 * 1000) {
                    this.api.addNotification(
                        'workflow_stalled',
                        `워크플로우 지연: ${workflow.name}`,
                        `워크플로우가 24시간 이상 대기 중입니다.`
                    );
                }
            }
        }
    }

    generateWorkflowId() {
        return 'workflow_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2);
    }

    // 공개 API 메서드들
    getActiveWorkflows() {
        return Array.from(this.activeWorkflows.values());
    }

    getWorkflow(workflowId) {
        return this.activeWorkflows.get(workflowId);
    }

    approveStep(workflowId, approvalData) {
        const event = {
            type: 'workflow_event',
            action: 'approve',
            workflowId,
            data: approvalData,
            timestamp: new Date().toISOString()
        };

        this.eventQueue.push(event);
        this.processEventQueue();
    }

    rejectStep(workflowId, rejectionData) {
        const event = {
            type: 'workflow_event',
            action: 'reject',
            workflowId,
            data: rejectionData,
            timestamp: new Date().toISOString()
        };

        this.eventQueue.push(event);
        this.processEventQueue();
    }
}

// 전역 인스턴스 생성
window.WorkflowEngine = new WorkflowEngine();

// 전역 함수 제공
window.approveWorkflowStep = (workflowId, approvalData) => {
    window.WorkflowEngine.approveStep(workflowId, approvalData);
};

window.rejectWorkflowStep = (workflowId, rejectionData) => {
    window.WorkflowEngine.rejectStep(workflowId, rejectionData);
};

console.log('워크플로우 엔진이 초기화되었습니다.');