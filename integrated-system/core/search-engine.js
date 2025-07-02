/**
 * 통합 검색 및 보고서 시스템
 * 모든 시스템의 데이터를 통합 검색하고 분석 보고서를 생성
 */

class IntegratedSearchEngine {
    constructor() {
        this.dataManager = window.IntegratedDataManager;
        this.api = window.IntegratedAPI;
        this.searchIndexes = new Map();
        this.reportTemplates = new Map();
        this.init();
    }

    init() {
        this.buildSearchIndexes();
        this.initializeReportTemplates();
        this.setupSearchOperators();
        console.log('통합 검색 엔진이 초기화되었습니다.');
    }

    buildSearchIndexes() {
        const dataTypes = [
            'categories', 'items', 'images', 'suppliers',
            'employees', 'warehouses', 'newItemRegistrations', 'warehouseRequests'
        ];

        dataTypes.forEach(dataType => {
            this.buildIndex(dataType);
        });

        // 데이터 변경 시 인덱스 재구축
        dataTypes.forEach(dataType => {
            this.dataManager.subscribe(dataType, () => {
                this.buildIndex(dataType);
            });
        });
    }

    buildIndex(dataType) {
        const data = this.dataManager.getData(dataType) || [];
        const index = new Map();

        // 데이터가 배열인지 확인
        if (!Array.isArray(data)) {
            console.warn(`${dataType} is not an array, skipping index build`);
            this.searchIndexes.set(dataType, index);
            return;
        }

        data.forEach(item => {
            if (!item || typeof item !== 'object') return;
            
            try {
                // 전체 텍스트 인덱스 생성
                const searchableText = this.extractSearchableText(item);
                const tokens = this.tokenize(searchableText);
                
                tokens.forEach(token => {
                    if (!index.has(token)) {
                        index.set(token, []);
                    }
                    index.get(token).push(item);
                });
            } catch (error) {
                console.warn(`Failed to index item in ${dataType}:`, error);
            }
        });

        this.searchIndexes.set(dataType, index);
        console.log(`${dataType} 검색 인덱스 구축 완료: ${data.length}개 항목`);
    }

    extractSearchableText(item) {
        const excludeFields = ['id', 'createdAt', 'updatedAt', 'images', 'data'];
        const searchableValues = [];

        const extractValue = (obj, path = '') => {
            for (const [key, value] of Object.entries(obj)) {
                if (excludeFields.includes(key)) continue;
                
                if (typeof value === 'string' || typeof value === 'number') {
                    searchableValues.push(String(value));
                } else if (Array.isArray(value)) {
                    value.forEach(item => {
                        if (typeof item === 'object' && item !== null) {
                            extractValue(item, `${path}.${key}`);
                        } else {
                            searchableValues.push(String(item));
                        }
                    });
                } else if (typeof value === 'object' && value !== null) {
                    extractValue(value, `${path}.${key}`);
                }
            }
        };

        extractValue(item);
        return searchableValues.join(' ');
    }

    tokenize(text) {
        if (!text) return [];
        
        return text
            .toLowerCase()
            .replace(/[^\w\s가-힣]/g, ' ') // 특수문자 제거
            .split(/\s+/)
            .filter(token => token.length > 0)
            .filter(token => !this.isStopWord(token));
    }

    isStopWord(word) {
        const stopWords = new Set([
            '의', '가', '이', '을', '를', '에', '와', '과', '로', '으로',
            'and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for'
        ]);
        return stopWords.has(word);
    }

    setupSearchOperators() {
        this.operators = {
            AND: (results1, results2) => this.intersectResults(results1, results2),
            OR: (results1, results2) => this.unionResults(results1, results2),
            NOT: (results1, results2) => this.subtractResults(results1, results2)
        };
    }

    // 통합 검색 메인 메서드
    async search(query, options = {}) {
        const {
            dataTypes = ['categories', 'items', 'suppliers', 'employees'],
            maxResults = 100,
            sortBy = 'relevance',
            filters = {},
            fuzzy = true
        } = options;

        console.log(`통합 검색 수행: "${query}"`);

        try {
            // 쿼리 파싱
            const parsedQuery = this.parseQuery(query);
            
            // 각 데이터 타입별 검색
            const results = {};
            for (const dataType of dataTypes) {
                results[dataType] = await this.searchInDataType(dataType, parsedQuery, {
                    fuzzy,
                    filters: filters[dataType] || {}
                });
            }

            // 결과 통합 및 정렬
            const combinedResults = this.combineResults(results, sortBy);
            
            // 결과 제한
            const limitedResults = combinedResults.slice(0, maxResults);

            // 검색 로그 기록
            this.logSearch(query, options, limitedResults.length);

            return {
                query,
                results: limitedResults,
                totalCount: combinedResults.length,
                dataTypeResults: results,
                searchTime: Date.now()
            };

        } catch (error) {
            console.error('검색 오류:', error);
            throw error;
        }
    }

    parseQuery(query) {
        // 간단한 쿼리 파서 (AND, OR, NOT 지원)
        const tokens = query.toLowerCase().split(/\s+/);
        const parsed = {
            terms: [],
            operators: [],
            phrases: []
        };

        // 따옴표 안의 구문 추출
        const phraseRegex = /"([^"]+)"/g;
        let match;
        while ((match = phraseRegex.exec(query)) !== null) {
            parsed.phrases.push(match[1]);
        }

        // 연산자와 일반 용어 분리
        let currentTerm = '';
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            if (this.operators[token.toUpperCase()]) {
                if (currentTerm) {
                    parsed.terms.push(currentTerm);
                    currentTerm = '';
                }
                parsed.operators.push(token.toUpperCase());
            } else if (!token.match(/^".*"$/)) {
                currentTerm += (currentTerm ? ' ' : '') + token;
            }
        }
        
        if (currentTerm) {
            parsed.terms.push(currentTerm);
        }

        return parsed;
    }

    async searchInDataType(dataType, parsedQuery, options = {}) {
        const index = this.searchIndexes.get(dataType);
        if (!index) return [];

        let results = [];

        // 일반 용어 검색
        for (const term of parsedQuery.terms) {
            const termResults = this.searchTerm(index, term, options.fuzzy);
            results = results.length === 0 ? termResults : 
                     this.intersectResults(results, termResults);
        }

        // 구문 검색
        for (const phrase of parsedQuery.phrases) {
            const phraseResults = this.searchPhrase(dataType, phrase);
            results = results.length === 0 ? phraseResults :
                     this.intersectResults(results, phraseResults);
        }

        // 필터 적용
        if (options.filters && Object.keys(options.filters).length > 0) {
            results = this.applyFilters(results, options.filters);
        }

        // 중복 제거 및 점수 계산
        return this.deduplicateAndScore(results, parsedQuery);
    }

    searchTerm(index, term, fuzzy = true) {
        const results = [];
        const termTokens = this.tokenize(term);

        for (const token of termTokens) {
            // 정확 매치
            if (index.has(token)) {
                results.push(...index.get(token));
            }

            // 퍼지 매치
            if (fuzzy) {
                for (const [indexToken, items] of index) {
                    if (this.calculateSimilarity(token, indexToken) > 0.8) {
                        results.push(...items);
                    }
                }
            }
        }

        return results;
    }

    searchPhrase(dataType, phrase) {
        const data = this.dataManager.getData(dataType) || [];
        return data.filter(item => {
            const text = this.extractSearchableText(item).toLowerCase();
            return text.includes(phrase.toLowerCase());
        });
    }

    calculateSimilarity(str1, str2) {
        // Levenshtein Distance 기반 유사도 계산
        const matrix = [];
        const len1 = str1.length;
        const len2 = str2.length;

        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                if (str1[i - 1] === str2[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j - 1] + 1
                    );
                }
            }
        }

        const distance = matrix[len1][len2];
        const maxLength = Math.max(len1, len2);
        return (maxLength - distance) / maxLength;
    }

    applyFilters(results, filters) {
        return results.filter(item => {
            for (const [field, value] of Object.entries(filters)) {
                const itemValue = this.getNestedValue(item, field);
                
                if (Array.isArray(value)) {
                    if (!value.includes(itemValue)) return false;
                } else if (typeof value === 'object' && value.min !== undefined) {
                    const numValue = parseFloat(itemValue);
                    if (value.min !== undefined && numValue < value.min) return false;
                    if (value.max !== undefined && numValue > value.max) return false;
                } else if (itemValue !== value) {
                    return false;
                }
            }
            return true;
        });
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, prop) => current?.[prop], obj);
    }

    deduplicateAndScore(results, parsedQuery) {
        const uniqueResults = new Map();
        
        results.forEach(item => {
            if (!uniqueResults.has(item.id)) {
                const score = this.calculateRelevanceScore(item, parsedQuery);
                uniqueResults.set(item.id, { ...item, _searchScore: score });
            }
        });

        return Array.from(uniqueResults.values());
    }

    calculateRelevanceScore(item, parsedQuery) {
        let score = 0;
        const text = this.extractSearchableText(item).toLowerCase();

        // 용어 빈도 점수
        parsedQuery.terms.forEach(term => {
            const termCount = (text.match(new RegExp(term.toLowerCase(), 'g')) || []).length;
            score += termCount * 10;
        });

        // 구문 정확도 점수
        parsedQuery.phrases.forEach(phrase => {
            if (text.includes(phrase.toLowerCase())) {
                score += 50;
            }
        });

        // 필드별 가중치
        const fieldWeights = {
            name: 3,
            title: 3,
            itemName: 3,
            companyName: 3,
            category: 2,
            description: 1
        };

        Object.entries(fieldWeights).forEach(([field, weight]) => {
            if (item[field]) {
                const fieldText = String(item[field]).toLowerCase();
                parsedQuery.terms.forEach(term => {
                    if (fieldText.includes(term.toLowerCase())) {
                        score += weight * 20;
                    }
                });
            }
        });

        return score;
    }

    combineResults(results, sortBy) {
        const combined = [];
        
        Object.entries(results).forEach(([dataType, items]) => {
            items.forEach(item => {
                combined.push({
                    ...item,
                    _dataType: dataType,
                    _searchScore: item._searchScore || 0
                });
            });
        });

        // 정렬
        switch (sortBy) {
            case 'relevance':
                combined.sort((a, b) => (b._searchScore || 0) - (a._searchScore || 0));
                break;
            case 'date':
                combined.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                break;
            case 'name':
                combined.sort((a, b) => {
                    const nameA = a.name || a.itemName || a.companyName || '';
                    const nameB = b.name || b.itemName || b.companyName || '';
                    return nameA.localeCompare(nameB);
                });
                break;
        }

        return combined;
    }

    intersectResults(results1, results2) {
        const ids1 = new Set(results1.map(item => item.id));
        return results2.filter(item => ids1.has(item.id));
    }

    unionResults(results1, results2) {
        const combined = [...results1];
        const ids1 = new Set(results1.map(item => item.id));
        
        results2.forEach(item => {
            if (!ids1.has(item.id)) {
                combined.push(item);
            }
        });
        
        return combined;
    }

    subtractResults(results1, results2) {
        const ids2 = new Set(results2.map(item => item.id));
        return results1.filter(item => !ids2.has(item.id));
    }

    logSearch(query, options, resultCount) {
        const searchLog = this.dataManager.getData('searchLog') || [];
        searchLog.push({
            id: this.generateId(),
            query,
            options,
            resultCount,
            timestamp: new Date().toISOString()
        });

        // 최대 1000개 로그 유지
        if (searchLog.length > 1000) {
            searchLog.splice(0, searchLog.length - 1000);
        }

        this.dataManager.setData('searchLog', searchLog);
    }

    // 보고서 시스템
    initializeReportTemplates() {
        // 재고 현황 보고서
        this.registerReportTemplate('inventory_status', {
            name: '재고 현황 보고서',
            description: '전체 품목의 재고 현황과 통계',
            generator: this.generateInventoryReport.bind(this)
        });

        // 거래처 분석 보고서
        this.registerReportTemplate('supplier_analysis', {
            name: '거래처 분석 보고서',
            description: '거래처별 거래 현황 및 성과 분석',
            generator: this.generateSupplierReport.bind(this)
        });

        // 신규 등록 현황 보고서
        this.registerReportTemplate('registration_status', {
            name: '신규 등록 현황 보고서',
            description: '신규 품목 등록 요청 현황 및 처리 통계',
            generator: this.generateRegistrationReport.bind(this)
        });

        // 시스템 사용 현황 보고서
        this.registerReportTemplate('system_usage', {
            name: '시스템 사용 현황 보고서',
            description: '시스템별 사용 현황 및 성능 통계',
            generator: this.generateSystemUsageReport.bind(this)
        });

        // 워크플로우 성과 보고서
        this.registerReportTemplate('workflow_performance', {
            name: '워크플로우 성과 보고서',
            description: '워크플로우 처리 시간 및 효율성 분석',
            generator: this.generateWorkflowReport.bind(this)
        });
    }

    registerReportTemplate(id, template) {
        this.reportTemplates.set(id, {
            ...template,
            id,
            createdAt: new Date().toISOString()
        });
    }

    async generateReport(templateId, options = {}) {
        const template = this.reportTemplates.get(templateId);
        if (!template) {
            throw new Error(`보고서 템플릿을 찾을 수 없습니다: ${templateId}`);
        }

        console.log(`보고서 생성: ${template.name}`);

        try {
            const reportData = await template.generator(options);
            
            const report = {
                id: this.generateId(),
                templateId,
                name: template.name,
                description: template.description,
                data: reportData,
                options,
                generatedAt: new Date().toISOString(),
                generatedBy: options.userId || 'system'
            };

            // 보고서 저장
            const reports = this.dataManager.getData('reports') || [];
            reports.push(report);
            this.dataManager.setData('reports', reports);

            return report;

        } catch (error) {
            console.error('보고서 생성 오류:', error);
            throw error;
        }
    }

    async generateInventoryReport(options = {}) {
        const items = await this.api.getItems();
        const categories = await this.api.getCategories();
        const suppliers = await this.api.getSuppliers();

        const report = {
            summary: {
                totalItems: items.length,
                activeItems: items.filter(item => item.status === '활성').length,
                totalCategories: categories.length,
                totalSuppliers: suppliers.length
            },
            categoryBreakdown: this.groupBy(items, 'category'),
            supplierBreakdown: this.groupBy(items, 'supplier'),
            statusBreakdown: this.groupBy(items, 'status'),
            recentItems: items
                .filter(item => this.isRecent(item.createdAt, 7))
                .slice(0, 10),
            lowStockItems: items.filter(item => 
                item.currentStock && item.currentStock < (item.minStock || 10)
            )
        };

        return report;
    }

    async generateSupplierReport(options = {}) {
        const suppliers = await this.api.getSuppliers();
        const items = await this.api.getItems();

        const supplierStats = suppliers.map(supplier => {
            const supplierItems = items.filter(item => item.supplierId === supplier.id);
            return {
                ...supplier,
                itemCount: supplierItems.length,
                categories: [...new Set(supplierItems.map(item => item.category))].length,
                lastOrderDate: supplierItems.reduce((latest, item) => {
                    const itemDate = new Date(item.lastOrderDate || 0);
                    return itemDate > latest ? itemDate : latest;
                }, new Date(0))
            };
        });

        return {
            summary: {
                totalSuppliers: suppliers.length,
                activeSuppliers: suppliers.filter(s => s.status !== '비활성').length,
                averageItemsPerSupplier: items.length / suppliers.length
            },
            topSuppliers: supplierStats
                .sort((a, b) => b.itemCount - a.itemCount)
                .slice(0, 10),
            recentSuppliers: suppliers
                .filter(s => this.isRecent(s.createdAt, 30))
                .slice(0, 5),
            supplierPerformance: supplierStats.map(s => ({
                name: s.companyName,
                itemCount: s.itemCount,
                categories: s.categories,
                lastActivity: s.lastOrderDate
            }))
        };
    }

    async generateRegistrationReport(options = {}) {
        const registrations = await this.api.getNewItemRegistrations();
        
        const statusCounts = this.groupBy(registrations, 'status');
        const monthlyStats = this.groupByMonth(registrations, 'requestDate');

        return {
            summary: {
                totalRequests: registrations.length,
                pendingRequests: statusCounts['대기'] || 0,
                approvedRequests: statusCounts['승인완료'] || 0,
                rejectedRequests: statusCounts['반려'] || 0
            },
            monthlyTrend: monthlyStats,
            averageProcessingTime: this.calculateAverageProcessingTime(registrations),
            topRequesters: this.getTopRequesters(registrations),
            recentRequests: registrations
                .sort((a, b) => new Date(b.requestDate) - new Date(a.requestDate))
                .slice(0, 10)
        };
    }

    async generateSystemUsageReport(options = {}) {
        const searchLog = this.dataManager.getData('searchLog') || [];
        const syncLog = this.dataManager.getData('syncLog') || [];
        const systemHealth = this.dataManager.getData('systemHealth') || {};

        return {
            searchStatistics: {
                totalSearches: searchLog.length,
                recentSearches: searchLog.filter(log => 
                    this.isRecent(log.timestamp, 7)
                ).length,
                popularQueries: this.getPopularQueries(searchLog),
                averageResultCount: searchLog.reduce((sum, log) => 
                    sum + log.resultCount, 0) / searchLog.length
            },
            syncStatistics: {
                totalSyncs: syncLog.length,
                recentSyncs: syncLog.filter(log => 
                    this.isRecent(log.timestamp, 7)
                ).length,
                syncErrors: syncLog.filter(log => log.status === 'error').length
            },
            systemHealth: {
                storageUsage: systemHealth.storageUsage,
                lastHealthCheck: systemHealth.timestamp,
                systemStatus: systemHealth.isOnline ? '정상' : '오프라인'
            }
        };
    }

    async generateWorkflowReport(options = {}) {
        const workflows = this.dataManager.getData('activeWorkflows') || [];
        const completedWorkflows = workflows.filter(w => w.status === 'completed');

        return {
            summary: {
                totalWorkflows: workflows.length,
                activeWorkflows: workflows.filter(w => w.status === 'active').length,
                completedWorkflows: completedWorkflows.length,
                errorWorkflows: workflows.filter(w => w.status === 'error').length
            },
            averageCompletionTime: this.calculateAverageWorkflowTime(completedWorkflows),
            workflowTypes: this.groupBy(workflows, 'templateId'),
            recentWorkflows: workflows
                .sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt))
                .slice(0, 10)
        };
    }

    // 유틸리티 메서드들
    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key] || '미분류';
            groups[group] = (groups[group] || 0) + 1;
            return groups;
        }, {});
    }

    groupByMonth(array, dateKey) {
        return array.reduce((groups, item) => {
            const date = new Date(item[dateKey]);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            groups[monthKey] = (groups[monthKey] || 0) + 1;
            return groups;
        }, {});
    }

    isRecent(dateString, days = 7) {
        if (!dateString) return false;
        const date = new Date(dateString);
        const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return date > daysAgo;
    }

    calculateAverageProcessingTime(registrations) {
        const completed = registrations.filter(r => r.status === '승인완료' && r.requestDate && r.approvedAt);
        if (completed.length === 0) return 0;

        const totalTime = completed.reduce((sum, reg) => {
            const start = new Date(reg.requestDate);
            const end = new Date(reg.approvedAt);
            return sum + (end - start);
        }, 0);

        return Math.round(totalTime / completed.length / (1000 * 60 * 60 * 24)); // 일 단위
    }

    getTopRequesters(registrations) {
        const requesterCounts = this.groupBy(registrations, 'requesterId');
        return Object.entries(requesterCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([requesterId, count]) => ({ requesterId, count }));
    }

    getPopularQueries(searchLog) {
        const queryCounts = this.groupBy(searchLog, 'query');
        return Object.entries(queryCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([query, count]) => ({ query, count }));
    }

    calculateAverageWorkflowTime(workflows) {
        if (workflows.length === 0) return 0;

        const totalTime = workflows.reduce((sum, workflow) => {
            const start = new Date(workflow.startedAt);
            const end = new Date(workflow.completedAt);
            return sum + (end - start);
        }, 0);

        return Math.round(totalTime / workflows.length / (1000 * 60 * 60)); // 시간 단위
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // 공개 API
    getReportTemplates() {
        return Array.from(this.reportTemplates.values());
    }

    getReports() {
        return this.dataManager.getData('reports') || [];
    }

    deleteReport(reportId) {
        const reports = this.getReports();
        const filteredReports = reports.filter(report => report.id !== reportId);
        this.dataManager.setData('reports', filteredReports);
    }
}

// 전역 인스턴스 생성
window.IntegratedSearchEngine = new IntegratedSearchEngine();

// 전역 함수 제공
window.searchIntegrated = async (query, options) => {
    return await window.IntegratedSearchEngine.search(query, options);
};

window.generateReport = async (templateId, options) => {
    return await window.IntegratedSearchEngine.generateReport(templateId, options);
};

console.log('통합 검색 및 보고서 시스템이 초기화되었습니다.');