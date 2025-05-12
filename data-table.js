import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class DataTable extends LitElement {
  static properties = {
    tableTitle: { type: String },
    data: { type: Array },
    schema: { type: Array },
    filterText: { type: String },
    sortColumn: { type: String },
    sortDirection: { type: String },
    editingIndex: { type: Number },
    editingRow: { type: Object },
    isNewRow: { type: Boolean },
    loading: { type: Boolean },
    currentPage: { type: Number },
    pageSize: { type: Number },
    apiConfig: { type: Object },
    baseApiUrl: { type: String },
    listEndpoint: { type: String },
    createEndpoint: { type: String },
    updateEndpoint: { type: String },
    deleteEndpoint: { type: String },
    schemaEndpoint: { type: String },
    isPasswordProtected: { type: Boolean },
    passwordVerified: { type: Boolean },
    password: { type: String },
    filterColumn: { type: String },
    truncateMaxLength: { type: Number },
  };

  constructor() {
    super();
    this.tableTitle = this.getAttribute('table-title') || '資料表';
    this.data = [];
    this.schema = [];
    this.filterText = '';
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.editingIndex = -1;
    this.editingRow = {};
    this.isNewRow = false;
    this.loading = true; // 確保初始值為 true
    this.currentPage = 1;
    this.pageSize = parseInt(this.getAttribute('page-size')) || 10;
    this.isPasswordProtected = this.hasAttribute('protected');
    this.passwordVerified = !this.isPasswordProtected;
    this.password = this.getAttribute('password') || '123456';
    this.filterColumn = '';
    this.truncateMaxLength = 50; 

    // Initialize API configuration from attributes
    this.apiConfig = {
      baseApiUrl: this.getAttribute('base-api-url'),
      listEndpoint: this.getAttribute('list-endpoint'),
      createEndpoint: this.getAttribute('create-endpoint'),
      updateEndpoint: this.getAttribute('update-endpoint'),
      deleteEndpoint: this.getAttribute('delete-endpoint'),
      schemaEndpoint: this.getAttribute('schema-endpoint')
    };
  }

  static styles = css`
    :host {
      display: block;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: var(--text-color);
      padding: 1.5rem;
      margin: 0 auto;
      overflow-x: auto;
      width: 100%;
      box-sizing: border-box;
      
      /* 更新配色方案 */
      --primary-color: #4f46e5;
      --primary-hover: #4338ca;
      --danger-color: #dc2626;
      --danger-hover: #b91c1c;
      --surface-color: #ffffff;
      --border-color: #e5e7eb;
      --hover-color: #f9fafb;
      --header-color: #f2f4ff;
      --disabled-color: #f8fafc;
      --text-color: #1f2937;
      --text-light: #6b7280;
      --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
      --shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
      --radius-sm: 0.375rem;
      --radius: 0.5rem;
    }

    h2 {
      margin-top: 0;
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-color);
    }

    .controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
      background: var(--surface-color);
      padding: 0.75rem;
      border-radius: var(--radius);
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      gap: 1rem;
    }

    .controls-group {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      flex-wrap: wrap;
      gap: 0.5rem;
      flex: 1; // 讓 controls-group 佔滿可用空間
    }

    .search-container {
      display: flex;
      flex: 1; /* 讓 search-container 在 search-group 中佔滿剩餘空間 */
      min-width: 0; /* 允許容器收縮 */
      position: relative;
    }

    .search-container input[type="text"] {
      width: 100%;
      min-width: 0; /* 允許容器收縮 */
      max-width: 100%;
      padding: 0.5rem 0.75rem 0.5rem 2.25rem;
    }

    .search-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1; /* 讓 search-group 在 controls-group 中佔滿剩餘空間 */
      min-width: 0; /* 允許容器收縮 */
    }

    .search-field-select {
      box-sizing: border-box;
      width: auto;
      min-width: 0; /* 允許容器收縮 */
      max-width: 180px;
      flex-shrink: 1; /* 允許收縮 */
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      background: var(--surface-color);
      color: var(--text-color);
    }

    .search-field-select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-light);
      pointer-events: none;
    }

    input[type="text"] {
      padding: 0.5rem 0.75rem 0.5rem 2.25rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      transition: all 0.2s;
      background: var(--surface-color);
    }

    input[type="text"]:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }

    button {
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.15s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      font-weight: 500;
      height: 36px;
      min-width: 36px;
    }

    button:hover:not(:disabled) {
      transform: translateY(-1px);
    }

    button:active:not(:disabled) {
      transform: translateY(0);
    }

    button:disabled, select:disabled, input:disabled, textarea:disabled {
      cursor: not-allowed;
      opacity: 0.6;
      background-color: var(--disabled-color);
    }

    button.btn-primary {
      background-color: var(--primary-color);
      color: white;
    }

    button.btn-primary:hover:not(:disabled) {
      background-color: var(--primary-hover);
    }

    button.btn-secondary {
      background-color: var(--surface-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      padding: 0.5rem 0.75rem;
      height: 36px;
      gap: 0.375rem;
    }

    button.btn-secondary:hover:not(:disabled) {
      background-color: var(--hover-color);
      border-color: var(--text-light);
    }

    button.btn-secondary span {
      font-size: 0.875rem;
    }

    .btn-icon {
      padding: 0.5rem;
      background-color: transparent;
      color: var(--text-light);
      border-radius: var(--radius-sm);
      min-width: 36px;
    }

    .btn-icon:hover:not(:disabled) {
      background-color: var(--hover-color);
      color: var(--text-color);
      transform: none;
    }

    .btn-edit {
      color: var(--primary-color);
    }

    .btn-delete {
      color: var(--danger-color);
    }

    .loading-spinner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      background: white;
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow);
      font-size: 0.875rem;
    }

    table {
      width: 100%;
      min-width: 800px;
      border-collapse: separate;
      border-spacing: 0;
      box-shadow: var(--shadow-sm);
      border-radius: var(--radius);
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    table tr:hover {
      background: var(--hover-color);
    }

    th {
      background: var(--header-color);
      position: relative;
      padding-right: 1.5rem;
      cursor: pointer;
      white-space: nowrap;
    }

    th.sorted-asc::after,
    th.sorted-desc::after {
      content: '';
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      width: 0;
      height: 0;
      border-left: 4px solid transparent;
      border-right: 4px solid transparent;
    }

    th.sorted-asc::after {
      border-bottom: 4px solid var(--text-color);
    }

    th.sorted-desc::after {
      border-top: 4px solid var(--text-color);
    }

    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      border-left: 1px solid var(--border-color);
      font-size: 0.875rem;
      white-space: nowrap;
    }

    .column-header {
      display: flex; 
      align-items: center; 
      justify-content: space-between; 
      gap: 0.5rem;
    }

    .field input,
    .field select {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      transition: all 0.2s;
      background: var(--surface-color);
      color: var(--text-color);
    }

    .field textarea {
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      transition: all 0.2s;
      background: var(--surface-color);
      color: var(--text-color);
      /* min-height: 60px; */
      resize: vertical;
      font-family: inherit;
    }

    .field textarea:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }

    .field input[type="checkbox"] {
      width: auto;
      margin: 0;
      cursor: pointer;
    }

    .field input:focus,
    .field select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(79, 70, 229, 0.1);
    }

    .field input.invalid,
    .field select.invalid {
      border-color: var(--danger-color);
    }

    .field .error-message {
      color: var(--danger-color);
      font-size: 0.75rem;
      margin-top: 0.25rem;
      min-height: 1rem;
      white-space: nowrap;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      align-items: center; /* 確保按鈕垂直置中 */
    }

    .actions button {
      padding: 0.5rem;
      min-width: auto;
      white-space: nowrap;
    }

    .actions .btn-primary {
      padding: 0.5rem 1rem;
    }

    .pagination {
      margin-top: 1.5rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem;
    }

    .pagination-info {
      font-size: 0.875rem;
      color: var(--text-light);
      margin: 0 1rem;
    }

    .pagination button {
      background: var(--surface-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      min-width: 2.5rem;
      height: 2.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.875rem;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 0.75rem;
      transition: all 0.2s;
    }

    .pagination button:hover:not(:disabled) {
      background: var(--hover-color);
      border-color: var(--text-light);
      transform: translateY(-1px);
      color: var(--text-color);
    }

    .pagination button:disabled {
      background: var(--disabled-color);
      color: var(--text-light);
      cursor: not-allowed;
    }

    .pagination button.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }

    .pagination-pages {
      display: flex;
      gap: 0.25rem;
    }

    .table-wrapper {
      position: relative;
      width: 100%;
      overflow-x: auto;
    }

    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
    }

    .loading-spinner {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      background: white;
      border-radius: var(--radius-sm);
      box-shadow: var(--shadow);
      font-size: 0.875rem;
    }

    .loading-spinner .loading-fallback {
      width: 20px;
      height: 20px;
      border: 2px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem;
      background: var(--surface-color);
      border-radius: var(--radius);
      border: 1px solid var(--border-color);
      color: var(--text-light);
    }

    /* RWD 樣式 */
    @media (max-width: 768px) {
      .controls {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
      }

      .controls-group {
        width: 100%;
      }

      .search-group {
        width: 100%;
        flex-wrap: nowrap;
      }

      .search-container {
        flex: 1;
      }
    }

    @media (max-width: 480px) {
      .search-group {
        flex-direction: column;
        align-items: stretch;
      }

      .search-field-select {
        max-width: none;
        width: 100%;
      }

      .controls-group:last-child {
        justify-content: space-between;
      }

      button.btn-secondary span {
        display: none;
      }

      button.btn-secondary i {
        margin: 0;
      }
    }

    /* 確保按鈕在小螢幕上的呈現 */
    @media (max-width: 380px) {
      .controls-group:last-child {
        justify-content: center;
        gap: 0.25rem;
      }

      button.btn-secondary {
        padding: 0.5rem;
        min-width: 36px;
        width: 36px;
      }
    }
  `;

  get loadingOrEditing() {
    return this.loading || this.editingIndex !== -1;
  }

  get filteredData() {
    const keyword = this.filterText.toLowerCase();
    return this.data
      .filter(row => {
        if (!keyword) return true;
        if (!this.filterColumn) {
          // 如果沒有選擇特定欄位，搜尋所有欄位
          return Object.values(row).some(val =>
            val !== null && String(val).toLowerCase().includes(keyword)
          );
        } else {
          // 找到欄位定義以確定類型
          const field = this.schema.find(f => f.key === this.filterColumn);
          if (!field) return false;

          const value = row[this.filterColumn];
          if (value === null) return false;

          // 數值型別的特殊處理
          if (field.type === 'number') {
            const numericValue = Number(value);

            // 檢查各種運算符的情況
            if (keyword.startsWith('>=')) {
              const searchValue = Number(keyword.slice(2));
              return !isNaN(searchValue) && numericValue >= searchValue;
            }
            if (keyword.startsWith('<=')) {
              const searchValue = Number(keyword.slice(2));
              return !isNaN(searchValue) && numericValue <= searchValue;
            }
            if (keyword.startsWith('>')) {
              const searchValue = Number(keyword.slice(1));
              return !isNaN(searchValue) && numericValue > searchValue;
            }
            if (keyword.startsWith('<')) {
              const searchValue = Number(keyword.slice(1));
              return !isNaN(searchValue) && numericValue < searchValue;
            }
            if (keyword.includes('-')) {
              // 範圍搜尋 (例如: 20-30)
              const [min, max] = keyword.split('-').map(Number);
              return !isNaN(min) && !isNaN(max) && numericValue >= min && numericValue <= max;
            }

            // 精確匹配
            const searchValue = Number(keyword);
            return !isNaN(searchValue) && numericValue === searchValue;
          } else {
            // 其他類型使用普通文字搜尋
            return String(value).toLowerCase().includes(keyword);
          }
        }
      })
      .sort((a, b) => {
        if (!this.sortColumn) return 0;
        const valA = a[this.sortColumn];
        const valB = b[this.sortColumn];
        if (valA === null) return 1;
        if (valB === null) return -1;
        if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }

  getPaginatedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredData.slice(start, end);
  }

  handleSort(column) {
    if (this.loading) return; // 如果正在載入中，禁止排序
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  handleEdit(index) {
    if (this.loading) return; // 如果正在載入中，禁止編輯
    // 計算實際的數據索引
    const actualIndex = (this.currentPage - 1) * this.pageSize + index;
    const actualData = this.filteredData[actualIndex];

    if (!actualData) return; // 安全檢查

    this.editingIndex = index;
    this.editingRow = { ...actualData };
    this.isNewRow = false;
  }

  handleInput(key, e) {
    const field = this.schema.find(f => f.key === key);
    if (!field || field.editable === false) return; // 如果欄位不可編輯，則不處理其輸入

    let value = e.target.value;

    // Convert input value to correct type
    if (field && field.type === 'number') {
      value = value === '' ? null : Number(value);
    } else if (field && field.type === 'boolean') {
      value = e.target.checked;
    }

    this.editingRow = { ...this.editingRow, [key]: value };
  }

  async handleSave(index) {
    if (this.loading) return;
    if (!this.validateForm()) {
      this.requestUpdate();
      return;
    }
    
    // 找到當前編輯的原始資料以保留不可編輯欄位的值
    let originalRow = {};
    
    if (!this.isNewRow) {
      // 如果是編輯現有行，獲取原始資料
      const actualIndex = (this.currentPage - 1) * this.pageSize + index;
      const actualData = this.filteredData[actualIndex];
      if (actualData) {
        originalRow = { ...actualData };
      }
    }
    
    // 合併編輯的值，同時保留不可編輯欄位的原始值
    let row = { ...this.editingRow };
    
    // 對於不可編輯的欄位，使用原始值
    if (!this.isNewRow) {
      this.schema.forEach(field => {
        if (field.editable === false && originalRow[field.key] !== undefined) {
          row[field.key] = originalRow[field.key];
        }
      });
    }

    // Convert empty string to null for select fields
    this.schema.forEach(field => {
      if (field.type === 'select' && row[field.key] === '') {
        row[field.key] = null;
      }
    });

    // Validate required fields
    const missingFields = this.schema
      .filter(field => field.required && field.editable !== false && (row[field.key] === null || row[field.key] === ''))
      .map(field => field.label || field.key);

    if (missingFields.length > 0) {
      alert(`請填寫以下必填欄位: ${missingFields.join(', ')}`);
      return;
    }

    this.loading = true;
    try {
      if (this.isNewRow) {
        // Remove temporary ID
        const { id, ...newRow } = row;

        const res = await fetch(`${this.apiConfig.baseApiUrl}${this.apiConfig.createEndpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newRow)
        });

        if (!res.ok) throw new Error('Failed to add data');
        const savedRow = await res.json();

        // Replace temporary row
        this.data = [savedRow, ...this.data.filter(r => r.id !== row.id)];
      } else {
        const id = row.id;
        const res = await fetch(`${this.apiConfig.baseApiUrl}${this.apiConfig.updateEndpoint}/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(row)
        });

        if (!res.ok) throw new Error('Failed to update data');
        const updatedRow = await res.json();

        // 找到原始數據中的索引位置
        const originalIndex = this.data.findIndex(item => item.id === id);
        if (originalIndex !== -1) {
          this.data[originalIndex] = updatedRow;
          this.data = [...this.data];
        }
      }

      this.editingIndex = -1;
      this.editingRow = {};
      this.isNewRow = false;
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed: ' + error.message);
    } finally {
      this.loading = false;
    }
  }

  handleCancel() {
    if (this.loading) return; // 如果正在載入中，禁止取消
    // If adding a new row and user cancels, remove the temporary row
    if (this.isNewRow) {
      this.data = this.data.filter(row => !row.id.toString().startsWith('temp-'));
    }
    this.editingIndex = -1;
    this.editingRow = {};
    this.isNewRow = false;
  }

  async handleDelete(index) {
    if (this.loading) return;
    if (!confirm('Are you sure you want to delete this record?')) return;

    // 計算實際的數據索引
    const actualIndex = (this.currentPage - 1) * this.pageSize + index;
    const actualData = this.filteredData[actualIndex];

    if (!actualData) return; // 安全檢查

    const id = actualData.id;
    try {
      const res = await fetch(`${this.apiConfig.baseApiUrl}${this.apiConfig.deleteEndpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete data');

      // 從原始數據中刪除
      this.data = this.data.filter(row => row.id !== id);

      // 如果當前頁變成空的，且不是第一頁，則自動跳轉到前一頁
      const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
      if (this.currentPage > 1 && this.currentPage > totalPages) {
        this.currentPage--;
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed: ' + error.message);
    }
  }

  handleNew() {
    if (this.loading) return; // 如果正在載入中，禁止新增
    // Check if already editing a new row
    if (this.isNewRow) return;

    // Create empty row based on schema
    const empty = {};
    this.schema.forEach(field => {
      empty[field.key] = field.defaultValue !== undefined ? field.defaultValue : null;
    });

    // Add temporary ID
    empty.id = 'temp-' + Date.now();

    // Add to beginning of data
    this.data = [empty, ...this.data];
    this.editingIndex = 0;
    this.editingRow = { ...empty };
    this.isNewRow = true;
  }

  exportToCSV() {
    if (this.loading) return; // 如果正在載入中，禁止匯出
    const exportData = this.filteredData.length > 0 ? this.filteredData : this.data;
    if (exportData.length === 0) return;

    const headers = Object.keys(exportData[0]).map(field =>
      `"${field.replace(/"/g, '""')}"`
    ).join(',');

    const rows = exportData.map(row =>
      Object.values(row).map(value =>
        `"${String(value).replace(/"/g, '""')}"`
      ).join(',')
    ).join('\n');

    const csvContent = `\uFEFF${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.csv';
    link.click();
  }

  renderInputField(field, value, isLoading) {
    const key = field.key;
    const isEditable = field.editable !== false; // 如果editable屬性未定義或為true，則可編輯
    const commonProps = {
      disabled: isLoading || !isEditable, // 根據editable狀態設置禁用屬性
      required: field.required,
      class: field.required && (value === null || value === '') ? 'invalid' : '',
      style: !isEditable ? 'background-color: var(--disabled-color); cursor: not-allowed;' : '',
      name: key, // 添加name屬性方便驗證時識別
      'data-field-key': key // 加一個額外的屬性以防萬一
    };

    switch (field.type) {
      case 'number':
        return html`
          <div class="field">
            <input
              type="number"
              .value=${value !== null ? value : ''}
              @input=${e => {
                this.handleInput(key, e);
                this.adjustNumberInputWidth(e.target);
              }}
              min=${field.min !== undefined ? field.min : ''}
              max=${field.max !== undefined ? field.max : ''}
              style="width: ${this.calculateNumberWidth(value)}ch;"
              ...=${commonProps}
            />
            ${html`<div class="error-message">${field.required && (value === null || value === '') ? `${field.label}為必填欄位`:``}</div>`}
          </div>
        `;
      case 'boolean':
        return html`
          <div class="field">
            <input
              type="checkbox"
              ?checked=${value}
              @change=${e => this.handleInput(key, e)}
              ?disabled=${isLoading || !isEditable}
              style=${!isEditable ? 'cursor: not-allowed; opacity: 0.6;' : ''}
            />
            ${html`<div class="error-message">${field.required && (value === null || value === '') ? `${field.label}為必填欄位`:``}</div>`}
          </div>
        `;
      case 'date':
        return html`
          <div class="field">
            <input
              type="date"
              .value=${value || ''}
              @input=${e => this.handleInput(key, e)}
              ...=${commonProps}
            />
            ${html`<div class="error-message">${field.required && (value === null || value === '') ? `${field.label}為必填欄位`:``}</div>`}
          </div>
        `;
      case 'select':
        return html`
          <div class="field">
            <select 
              @change=${e => this.handleInput(key, e)}
              ?disabled=${isLoading || !isEditable}
              style=${!isEditable ? 'background-color: var(--disabled-color); cursor: not-allowed;' : ''}
            >
              <option value="" ?selected=${value === null || value === ''}>請選擇</option>
              ${field.options.map(option => html`
                <option value=${option.value} ?selected=${value === option.value}>
                  ${option.label}
                </option>
              `)}
            </select>
            ${html`<div class="error-message">${field.required && (value === null || value === '') ? `${field.label}為必填欄位`:``}</div>`}
          </div>
        `;
      case 'text':
        return html`
          <div class="field">
            <textarea
              .value=${value !== null ? value : ''}
              @input=${e => {
                this.handleInput(key, e);
                this.adjustTextareaWidth(e.target);
              }}
              rows=${field.rows || 3}
              style="width: ${this.calculateTextareaWidth(value)}ch; ${!isEditable ? 'background-color: var(--disabled-color); cursor: not-allowed;' : ''}"
              ...=${commonProps}
            ></textarea>
            ${html`<div class="error-message">${field.required && (value === null || value === '') ? `${field.label}為必填欄位`:``}</div>`}
          </div>
        `;
      default: // string, email, etc.
        return html`
          <div class="field">
            <input
              type=${field.type || 'text'}
              .value=${value !== null ? value : ''}
              @input=${e => this.handleInput(key, e)}
              maxlength=${field.maxLength || ''}
              size=${String(value).length || 1}
              ...=${commonProps}
            />
            ${html`<div class="error-message">${field.required && (value === null || value === '') ? `${field.label}為必填欄位`:``}</div>`}
          </div>
        `;
    }
  }

  renderTypeIcon(type) {
    const icons = {
      'string': html`<i class="fas fa-font"></i>`,
      'number': html`<i class="fas fa-hashtag"></i>`,
      'email': html`<i class="fas fa-envelope"></i>`,
      'boolean': html`<i class="fas fa-check-circle"></i>`,
      'date': html`<i class="fas fa-calendar-day"></i>`,
      'select': html`<i class="fas fa-caret-down"></i>`,
      'text': html`<i class="fas fa-align-left"></i>`
    };
    return icons[type] || '';
  }

  renderColumnHeader(field) {
    return html`
      <div class="column-header">
        <div>
          ${this.renderTypeIcon(field.type)} ${field.label || field.key}
        </div>
        ${field.description ? html`
          <i class="fas fa-info-circle" 
             style="color: var(--text-light); cursor: help;" 
             title="${field.description}">
          </i>
        ` : ''}
      </div>
    `;
  }

  renderPaginationControls() {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    const currentPage = this.currentPage;

    // 計算要顯示的頁碼範圍
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // 調整起始頁碼，確保總是顯示5個頁碼（如果有足夠的頁數）
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    // 生成頁碼按鈕
    const pageButtons = [];
    for (let i = startPage; i <= endPage; i++) {
      pageButtons.push(html`
        <button 
          class=${i === currentPage ? 'active' : ''} 
          @click=${() => this.currentPage = i}
          ?disabled=${this.loadingOrEditing}
        >${i}</button>
      `);
    }

    return html`
      <div class="pagination">
        <button 
          ?disabled=${currentPage === 1 || this.loadingOrEditing}
          @click=${() => this.currentPage = 1}
        >
          <i class="fas fa-angles-left"></i>
        </button>
        <button 
          ?disabled=${currentPage === 1 || this.loadingOrEditing}
          @click=${() => this.currentPage--}
        >
          <i class="fas fa-angle-left"></i>
        </button>
        
        <div class="pagination-pages">
          ${pageButtons}
        </div>

        <button 
          ?disabled=${currentPage === totalPages || this.loadingOrEditing}
          @click=${() => this.currentPage++}
        >
          <i class="fas fa-angle-right"></i>
        </button>
        <button 
          ?disabled=${currentPage === totalPages || this.loadingOrEditing}
          @click=${() => this.currentPage = totalPages}
        >
          <i class="fas fa-angles-right"></i>
        </button>
        
        <div class="pagination-info">
          第 ${currentPage} 頁，共 ${totalPages} 頁
        </div>
      </div>
    `;
  }

  getSearchPlaceholder() {
    if (!this.filterColumn) return '搜尋...';

    const field = this.schema.find(f => f.key === this.filterColumn);
    if (!field) return '搜尋...';

    if (field.type === 'number') {
      return `輸入數字：可用 >, <, >=, <= 或 範圍 (如：20-30)`;
    } else if (field.type === 'boolean') {
      return `輸入 true 或 false`;
    }

    return `搜尋 ${field.label || ''}...`;
  }

  renderSearchControls() {
    const visibleSchema = this.schema.filter(field => !field.hidden);

    return html`
      <div class="search-group">
        <select 
          class="search-field-select"
          @change=${e => this.filterColumn = e.target.value}
          ?disabled=${this.loadingOrEditing}
        >
          <option value="">搜尋全部欄位</option>
          ${visibleSchema.map(field => html`
            <option value=${field.key} ?selected=${this.filterColumn === field.key}>
              ${field.label}
            </option>
          `)}
        </select>
        <div class="search-container">
          <i class="fas fa-search search-icon"></i>
          <input 
            type="text" 
            .value=${this.filterText} 
            @input=${e => !this.loading && (this.filterText = e.target.value, this.currentPage = 1)}
            placeholder=${this.getSearchPlaceholder()}
            ?disabled=${this.loadingOrEditing}
          />
        </div>
      </div>
    `;
  }

  renderPasswordToggle() {
    if (!this.isPasswordProtected) return null;
    return html`
      <button class="btn-icon" @click=${this.handlePasswordToggle.bind(this)} ?disabled=${this.loadingOrEditing}>
        ${this.passwordVerified ? html`<i class="fas fa-lock-open"></i>` : html`<i class="fas fa-lock"></i>`}
      </button>
    `;
  }

  handlePasswordToggle() {
    if (!this.passwordVerified) {
      if (this.checkPassword()) {
        this.passwordVerified = true;
      } else {
        alert('密碼錯誤！');
      }
    } else {
      this.passwordVerified = false;
    }
    this.requestUpdate();
  }

  checkPassword() {
    const input = prompt('請輸入密碼以進行操作:');
    return input === this.password;
  }

  withPasswordProtection(callback) {
    if (!this.isPasswordProtected || this.passwordVerified) {
      callback();
    } else {
      alert('請先通過密碼驗證！');
    }
  }

  // 截斷字串
  truncateString(str, maxLength) {
    if (!str) return '';
    return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
  }

  render() {
    if (!this.schema.length) {
      return html`
        <div class="empty-state">
          ${this.loading ? html`
            <div class="loading-overlay">
              <div class="loading-spinner">
                <span class="loading-fallback"></span>
                <span>處理中...</span>
              </div>
            </div>
          ` : html`
            <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
            <p>Could not load field definitions</p>
          `}
        </div>
      `;
    }

    // Filter out hidden fields
    const visibleSchema = this.schema.filter(field => !field.hidden);
    const paginatedData = this.getPaginatedData();
    const showControls = !this.isPasswordProtected || this.passwordVerified;

    return html`
      <div>
        <h2>${this.tableTitle}</h2>
        
        <div class="controls">
          <div class="controls-group">
            ${this.renderPasswordToggle()}
            ${this.renderSearchControls()}
          </div>

          <div class="controls-group">
            ${showControls ? html` <button class="btn-secondary" 
              @click=${() => this.withPasswordProtection(() => this.handleNew())}
              ?disabled=${this.loadingOrEditing}
            >
              <i class="fas fa-plus"></i>
              <span>新增</span>
            </button>` : ''}
            <button class="btn-secondary" 
              @click=${() => this.exportToCSV()}
              ?disabled=${this.loadingOrEditing}
              title="匯出 CSV"
            >
              <i class="fas fa-file-export"></i>
              <span>匯出</span>
            </button>
            <button class="btn-secondary" 
              @click=${() => this.fetchSchemaAndData()}
              ?disabled=${this.loadingOrEditing}
              title="重新載入資料"
            >
              <i class="fas fa-sync-alt"></i>
              <span>重整</span>
            </button>
          </div>
        </div>
        
        <div class="table-wrapper">
          <div class="table-container">
            ${this.loading ? html`
              <div class="loading-overlay">
                <div class="loading-spinner">
                  <span class="loading-fallback"></span>
                  <span>處理中...</span>
                </div>
              </div>
            ` : ''}
            <table>
              <thead>
                <tr>
                  ${showControls ? html`<th><i class="fas fa-cog"></i>操作</th>` : ''}
                  ${visibleSchema.map(field => html`
                    <th 
                      @click=${() => !this.loadingOrEditing && this.handleSort(field.key)}
                      class=${this.sortColumn === field.key ? `sorted-${this.sortDirection}` : ''}
                      style=${this.loadingOrEditing ? 'cursor: not-allowed;' : ''}
                    >
                      ${this.renderColumnHeader(field)}
                    </th>
                  `)}
                </tr>
              </thead>
              <tbody>
                ${paginatedData.map((row, index) => html`
                  <tr>
                     ${showControls ? html`<td>
                      <div class="field">
                        <div class="actions">
                          ${this.editingIndex === index ?
                            html`
                              <button class="btn-icon" 
                                @click=${this.handleCancel}
                                ?disabled=${this.loading}
                              >
                                <i class="fas fa-times"></i>
                              </button>
                              <button class="btn-primary" 
                                @click=${() => this.withPasswordProtection(() => this.handleSave(index))}
                                ?disabled=${this.loading}
                              >
                                <i class="fas fa-save"></i> 儲存
                              </button>
                            ` :
                            html`
                              <button class="btn-icon btn-delete" 
                                @click=${() => this.withPasswordProtection(() => this.handleDelete(index))}
                                ?disabled=${this.loadingOrEditing}
                              >
                                <i class="fas fa-trash-alt"></i>
                              </button>
                              <button class="btn-icon btn-edit" 
                                @click=${() => this.withPasswordProtection(() => this.handleEdit(index))}
                                ?disabled=${this.loadingOrEditing}
                              >
                                <i class="fas fa-edit"></i>
                              </button>
                            `}
                        </div>
                        ${this.editingIndex === index ?
                          html`<div class="error-message"></div>` : ''}
                      </div>
                    </td>` : ''}
                    ${visibleSchema.map(field => html`
                      <td title="${row[field.key]}">
                        ${this.editingIndex === index ?
                          // 如果欄位設置為不可編輯，則即使在編輯模式下也顯示為靜態文本
                          (field.editable === false ?
                            (field.type === 'boolean'
                              ? (row[field.key] ? html`<i class="fas fa-check text-success"></i>` : html`<i class="fas fa-times text-danger"></i>`)
                              : field.type === 'select'
                                ? html`${field.options.find(opt => opt.value === row[field.key])?.label || row[field.key]}`
                                : (row[field.key] !== null ? row[field.key] : '')) :
                            html`${this.renderInputField(field, this.editingRow[field.key], this.loading)}`) :
                          field.type === 'boolean'
                            ? (row[field.key] ? html`<i class="fas fa-check text-success"></i>` : html`<i class="fas fa-times text-danger"></i>`)
                            : field.type === 'text'
                              ? html`<pre>${this.truncateString(row[field.key], this.truncateMaxLength)}</pre>`
                              : field.type === 'select'
                                ? html`${field.options.find(opt => opt.value === row[field.key])?.label || row[field.key]}`
                                : (row[field.key] !== null ? row[field.key] : '')}
                      </td>
                    `)}
                  </tr>
                `)}
              </tbody>
            </table>
          </div>
        </div>
        ${this.renderPaginationControls()}
      </div>
    `;
  }

  validateForm() {
    const fields = this.shadowRoot.querySelectorAll('input, select, textarea');
    let valid = true;
    
    fields.forEach(field => {
      // 僅驗證可編輯且必填的欄位
      const fieldName = field.name || field.getAttribute('data-field-key');
      const schema = fieldName ? this.schema.find(f => f.key === fieldName) : null;
      
      if (schema && schema.editable === false) {
        // 不可編輯欄位不進行驗證
        return;
      }
      
      if (field.required && !field.value) {
        field.classList.add('invalid');
        valid = false;
      } else {
        field.classList.remove('invalid');
      }
    });
    
    return valid;
  }

  // Fetch schema and data from server
  async fetchSchemaAndData() {
    this.loading = true;
    try {
      // Fetch schema
      const schemaRes = await fetch(`${this.apiConfig.baseApiUrl}${this.apiConfig.schemaEndpoint}`);
      if (!schemaRes.ok) throw new Error('Failed to fetch schema');
      this.schema = await schemaRes.json();

      // Fetch data
      const dataRes = await fetch(`${this.apiConfig.baseApiUrl}${this.apiConfig.listEndpoint}`);
      if (!dataRes.ok) throw new Error('Failed to fetch data');
      this.data = await dataRes.json();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      this.loading = false;
    }
  }

  createRenderRoot() {
    // Create a shadow DOM root for the component
    const root = this.attachShadow({ mode: 'open' });

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';

    const head = document.createElement('head');
    const style = document.createElement('style');
    style.textContent = this.constructor.styles.cssText;

    head.appendChild(link);
    head.appendChild(style);
    root.appendChild(head);

    return root;
  }

  async connectedCallback() {
    super.connectedCallback();
    // 確保元件在DOM樹中完全連接後再初始化
    await new Promise(resolve => {
      if (this.isConnected) {
        resolve();
      } else {
        // 如果尚未連接，等待連接
        const observer = new MutationObserver((mutations, obs) => {
          if (this.isConnected) {
            resolve();
            obs.disconnect();
          }
        });
        observer.observe(document.body, { childList: true, subtree: true });
        // 以防萬一，設置一個超時
        setTimeout(resolve, 1000);
      }
    });

    await this.fetchSchemaAndData();
  }

  // 計算數字輸入框的寬度
  calculateNumberWidth(value) {
    if (value === null || value === '') return 8; // 預設最小寬度
    
    const strValue = String(value);
    // 根據數字長度計算寬度：包含數字本身、小數點、負號，再加上一些內邊距空間
    const baseWidth = strValue.length;
    const extraSpace = 3; // 為了美觀和使用體驗增加一些額外空間
    
    return baseWidth + extraSpace;
  }

  // 動態調整數字輸入框的寬度
  adjustNumberInputWidth(input) {
    const value = input.value;
    input.style.width = `${this.calculateNumberWidth(value)}ch`;
  }

  // 計算文本區域的寬度
  calculateTextareaWidth(value) {
    if (value === null || value === '') return 40; // 預設最小寬度
    
    // 找出最長的行並計算其寬度
    const lines = String(value).split('\n');
    const maxLineLength = Math.max(...lines.map(line => line.length));
    
    // 根據最長行的長度計算寬度，並確保有合理的最小和最大寬度
    const minWidth = 40; // 最小寬度
    const maxWidth = 80; // 最大寬度
    
    return Math.min(Math.max(maxLineLength + 5, minWidth), maxWidth);
  }

  // 動態調整文本區域的寬度
  adjustTextareaWidth(textarea) {
    const value = textarea.value;
    textarea.style.width = `${this.calculateTextareaWidth(value)}ch`;
  }
}

customElements.define('data-table', DataTable);