import {LitElement, html, css} from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

class DataTable extends LitElement {
  connectedCallback() {
    super.connectedCallback();
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css';
    document.head.appendChild(link);
  }

  static properties = {
    title: { type: String },
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
    passwordVerified: { type: Boolean }
  };

  constructor() {
    super();
    this.title = this.getAttribute('title') || 'DataTable';
    this.data = [];
    this.schema = [];
    this.filterText = '';
    this.sortColumn = '';
    this.sortDirection = 'asc';
    this.editingIndex = -1;
    this.editingRow = {};
    this.isNewRow = false;
    this.loading = true;
    this.currentPage = 1;
    this.pageSize = parseInt(this.getAttribute('page-size')) || 10;
    this.isPasswordProtected = this.hasAttribute('protected');
    this.passwordVerified = !this.isPasswordProtected;
    this.password = this.getAttribute('password') || '123456'; // 預設密碼

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
      color: #334155;
      padding: 1.5rem;
      max-width: 1200px;
      margin: 0 auto;
      overflow-x: auto;
      /* 新增橫向滾動條支援 */
      --primary-color: #3b82f6;
      --primary-hover: #2563eb;
      --danger-color: #ef4444;
      --danger-hover: #dc2626;
      --surface-color: #ffffff;
      --border-color: #e2e8f0;
      --hover-color: #f8fafc;
      --header-color: #f1f5f9;
      --text-color: #334155;
      --text-light: #64748b;
      --shadow: 0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px 0 rgba(0,0,0,0.06);
      --radius: 0.5rem;
    }

    h2 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      color: #1e293b;
    }

    .controls {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.25rem;
      align-items: center;
    }

    input[type="text"] {
      padding: 0.625rem 0.875rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      flex-grow: 1;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    input[type="text"]:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    button {
      padding: 0.625rem 1rem;
      border: none;
      border-radius: var(--radius);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      font-weight: 500;
    }

    button:hover {
      transform: translateY(-1px);
    }

    button:active {
      transform: translateY(0);
    }

    .btn-primary {
      background-color: var(--primary-color);
      color: white;
    }

    .btn-primary:hover {
      background-color: var(--primary-hover);
    }

    .btn-danger {
      background-color: var(--danger-color);
      color: white;
    }

    .btn-danger:hover {
      background-color: var(--danger-hover);
    }

    .btn-icon {
      padding: 0.5rem;
      border-radius: var(--radius);
      background-color: transparent;
      color: var(--text-light);
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background-color: rgba(0, 0, 0, 0.05);
      color: var(--text-color);
    }

    .btn-edit {
      color: var(--primary-color);
    }

    .btn-delete {
      color: var(--danger-color);
    }

    .table-wrapper {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      min-width: 800px;
      /* 設定最小寬度，讓欄位不會太擠 */
      border-collapse: separate;
      border-spacing: 0;
      box-shadow: var(--shadow);
      border-radius: var(--radius);
      overflow: hidden;
    }

    th, td {
      padding: 0.875rem 1rem;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
    }

    th {
      background-color: var(--header-color);
      font-weight: 600;
      color: var(--text-color);
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
      user-select: none;
    }

    th:hover {
      background-color: #e5e9f0;
    }

    th.sorted-asc::after {
      content: "\\f0d8";
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      margin-left: 0.5rem;
      opacity: 0.7;
      font-size: 0.875rem;
    }

    th.sorted-desc::after {
      content: "\\f0d7";
      font-family: "Font Awesome 5 Free";
      font-weight: 900;
      margin-left: 0.5rem;
      opacity: 0.7;
      font-size: 0.875rem;
    }

    tr:hover {
      background-color: var(--hover-color);
    }

    tr:last-child td {
      border-bottom: none;
    }

    .type-icon {
      margin-right: 0.5rem;
      opacity: 0.7;
      font-size: 0.875rem;
    }

    .loading {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem 0;
      color: var(--text-light);
      gap: 0.75rem;
    }

    .loading i {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .empty-state {
      text-align: center;
      padding: 3rem 0;
      color: var(--text-light);
    }

    .actions {
      display: flex;
      gap: 0.5rem;
    }

    input, select {
      width: 100%;
      box-sizing: border-box;
      padding: 0.5rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius);
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    input:focus, select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
    }

    input[type="checkbox"] {
      width: auto;
    }

    .invalid {
      border-color: var(--danger-color) !important;
    }
    .error-message {
      color: var(--danger-color);
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }
    .required {
      color: var(--danger-color);
      position: relative;
      margin-left: 0.25rem;
      top: -0.2em;
      font-size: 0.8em;
    }
    .pagination {
      margin-top: 1rem;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 0.5rem;
    }
    .pagination button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--radius);
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      font-weight: 500;
    }
    .pagination button:hover {
      transform: translateY(-1px);
    }
    .pagination button:active {
      transform: translateY(0);
    }
  `;

  get filteredData() {
    const keyword = this.filterText.toLowerCase();
    return this.data
      .filter(row =>
        Object.values(row).some(val =>
          val !== null && String(val).toLowerCase().includes(keyword)
        )
      )
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
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
  }

  handleEdit(index) {
    this.editingIndex = index;
    this.editingRow = { ...this.filteredData[index] };
    this.isNewRow = false;
  }

  handleInput(key, e) {
    const field = this.schema.find(f => f.key === key);
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
    if (!this.validateForm()) {
      this.requestUpdate();
      return;
    }
    const row = this.editingRow;

    // Validate required fields
    const missingFields = this.schema
      .filter(field => field.required && (row[field.key] === null || row[field.key] === ''))
      .map(field => field.label || field.key);

    if (missingFields.length > 0) {
      alert(`請填寫以下必填欄位: ${missingFields.join(', ')}`);
      return;
    }

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
        const originalIndex = this.data.findIndex(item => item.id === id);
        this.data[originalIndex] = updatedRow;
        this.data = [...this.data];
      }

      this.editingIndex = -1;
      this.editingRow = {};
      this.isNewRow = false;
    } catch (error) {
      console.error('Save failed:', error);
      alert('Save failed: ' + error.message);
    }
  }

  handleCancel() {
    // If adding a new row and user cancels, remove the temporary row
    if (this.isNewRow) {
      this.data = this.data.filter(row => !row.id.toString().startsWith('temp-'));
    }
    this.editingIndex = -1;
    this.editingRow = {};
    this.isNewRow = false;
  }

  async handleDelete(index) {
    if (!confirm('Are you sure you want to delete this record?')) return;

    const id = this.filteredData[index].id;
    try {
      const res = await fetch(`${this.apiConfig.baseApiUrl}${this.apiConfig.deleteEndpoint}/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete data');
      this.data = this.data.filter(row => row.id !== id);
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Delete failed: ' + error.message);
    }
  }

  handleNew() {
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

    const csvContent = `${headers}\n${rows}`;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'data.csv';
    link.click();
  }

  renderInputField(field, value) {
    const key = field.key;
    switch (field.type) {
      case 'number':
        return html`
          <div class="field">
            <input
              type="number"
              .value=${value !== null ? value : ''}
              @input=${e => this.handleInput(key, e)}
              ?required=${field.required}
              min=${field.min !== undefined ? field.min : ''}
              max=${field.max !== undefined ? field.max : ''}
              class=${field.required && (value === null || value === '') ? 'invalid' : ''}
            />
            ${field.required && (value === null || value === '') ? html`<div class="error-message">${field.label}為必填欄位</div>` : ''}
          </div>
        `;
      case 'boolean':
        return html`
          <div class="field">
            <input
              type="checkbox"
              ?checked=${value}
              @change=${e => this.handleInput(key, e)}
            />
          </div>
        `;
      case 'date':
        return html`
          <div class="field">
            <input
              type="date"
              .value=${value || ''}
              @input=${e => this.handleInput(key, e)}
              ?required=${field.required}
              class=${field.required && (value === null || value === '') ? 'invalid' : ''}
            />
            ${field.required && (value === null || value === '') ? html`<div class="error-message">${field.label}為必填欄位</div>` : ''}
          </div>
        `;
      case 'select':
        return html`
          <div class="field">
            <select @change=${e => this.handleInput(key, e)}>
              <option value="" ?selected=${value === null || value === ''}>Select...</option>
              ${field.options.map(option => html`
                <option value=${option.value} ?selected=${value === option.value}>
                  ${option.label}
                </option>
              `)}
            </select>
          </div>
        `;
      default: // text, email, etc.
        return html`
          <div class="field">
            <input
              type=${field.type || 'text'}
              .value=${value !== null ? value : ''}
              @input=${e => this.handleInput(key, e)}
              ?required=${field.required}
              maxlength=${field.maxLength || ''}
              class=${field.required && (value === null || value === '') ? 'invalid' : ''}
            />
            ${field.required && (value === null || value === '') ? html`<div class="error-message">${field.label}為必填欄位</div>` : ''}
          </div>
        `;
    }
  }

  renderTypeIcon(type) {
    const icons = {
      'text': html`<i class="fas fa-font"></i>`,
      'number': html`<i class="fas fa-hashtag"></i>`,
      'email': html`<i class="fas fa-envelope"></i>`,
      'boolean': html`<i class="fas fa-check-circle"></i>`,
      'date': html`<i class="fas fa-calendar-day"></i>`,
      'select': html`<i class="fas fa-caret-down"></i>`
    };
    return icons[type] || '';
  }

  renderPaginationControls() {
    const totalPages = Math.ceil(this.filteredData.length / this.pageSize);

    return html`
      <div class="pagination">
        <button class="pagination-button" ?disabled=${this.currentPage === 1} @click=${() => this.currentPage--}>
          ← Previous
        </button>
        <span>Page ${this.currentPage} of ${totalPages}</span>
        <button class="pagination-button" ?disabled=${this.currentPage === totalPages} @click=${() => this.currentPage++}>
          Next →
        </button>
      </div>
    `;
  }

  renderPasswordToggle() {
    if (!this.isPasswordProtected) return null;
    return html`
      <button class="btn-icon" @click=${this.handlePasswordToggle.bind(this)}>
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

  render() {
    if (this.loading) {
      return html`
        <div class="loading">
          <i class="fas fa-spinner"></i>
          <span>Loading data...</span>
        </div>
      `;
    }

    if (!this.schema.length) {
      return html`
        <div class="empty-state">
          <i class="fas fa-exclamation-circle" style="font-size: 2rem; margin-bottom: 1rem;"></i>
          <p>Could not load field definitions</p>
        </div>
      `;
    }

    if (!this.data.length) {
      const showControls = !this.isPasswordProtected || this.passwordVerified;
      return html`
        <div class="controls">
          ${this.renderPasswordToggle()}
          <div style="position: relative; flex-grow: 1;">
            <input 
              style="width: 100%;"
              type="text" 
              .value=${this.filterText} 
              @input=${e => this.filterText = e.target.value}
              placeholder="Search..."
            />
          </div>
          ${showControls ? html`
            <button class="btn-primary" @click=${() => this.withPasswordProtection(() => this.handleNew())}>
              <i class="fas fa-plus"></i> Add New
            </button>
            <button class="btn-primary" @click=${() => this.withPasswordProtection(() => this.exportToCSV())}>
              <i class="fas fa-file-csv"></i> Export CSV
            </button>
          ` : ''}
        </div>
        <div class="empty-state">
          <i class="fas fa-database" style="font-size: 2rem; margin-bottom: 1rem;"></i>
          <p>No data available</p>
        </div>
      `;
    }

    // Filter out hidden fields
    const visibleSchema = this.schema.filter(field => !field.hidden);

    const paginatedData = this.getPaginatedData();
    const showControls = !this.isPasswordProtected || this.passwordVerified;

    return html`
      <div>
        <!-- Font Awesome 5 CSS (from CDN) -->
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        
        <h2>${this.title}</h2>
        
        <div class="controls">
          ${this.renderPasswordToggle()}
          <div style="position: relative; flex-grow: 1;">
            <input 
              style="width: 100%;"
              type="text" 
              .value=${this.filterText} 
              @input=${e => this.filterText = e.target.value}
              placeholder="Search..."
            />
          </div>
          ${showControls ? html`
            <button class="btn-primary" @click=${() => this.withPasswordProtection(() => this.handleNew())}>
                <i class="fas fa-plus"></i> Add New
            </button>
            <button class="btn-primary" @click=${() => this.withPasswordProtection(() => this.exportToCSV())}>
              <i class="fas fa-file-csv"></i> Export CSV
            </button>
          ` : ''}
        </div>
        
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                ${visibleSchema.map(field => html`
                  <th 
                    @click=${() => this.handleSort(field.key)}
                    class=${this.sortColumn === field.key ? `sorted-${this.sortDirection}` : ''}
                  >
                    ${this.renderTypeIcon(field.type)} ${field.label || field.key}
                  </th>
                `)}
                ${showControls ? html`<th><i class="fas fa-cog"></i>操作</th>` : ''}
              </tr>
            </thead>
            <tbody>
              ${paginatedData.map((row, index) => html`
                <tr>
                  ${visibleSchema.map(field => html`
                    <td>
                      ${this.editingIndex === index ?
        this.renderInputField(field, this.editingRow[field.key]) :
        field.type === 'boolean'
          ? (row[field.key] ? html`<i class="fas fa-check text-success"></i>` : html`<i class="fas fa-times text-danger"></i>`)
          : (row[field.key] !== null ? row[field.key] : '')}
                    </td>
                  `)}
                  ${showControls ? html`<td>
                    <div class="actions">
                      ${this.editingIndex === index ?
          html`
                          <button class="btn-primary" @click=${() => this.withPasswordProtection(() => this.handleSave(index))}>
                            <i class="fas fa-save"></i> Save
                          </button>
                          <button class="btn-icon" @click=${this.handleCancel}>
                            <i class="fas fa-times"></i>
                          </button>
                        ` :
          html`
                          <button class="btn-icon btn-edit" @click=${() => this.withPasswordProtection(() => this.handleEdit(index))}>
                            <i class="fas fa-edit"></i>
                          </button>
                          <button class="btn-icon btn-delete" @click=${() => this.withPasswordProtection(() => this.handleDelete(index))}>
                            <i class="fas fa-trash-alt"></i>
                          </button>
                        `}
                    </div>
                  </td>` : ''}
                </tr>
              `)}
            </tbody>
          </table>
        </div>
        ${this.renderPaginationControls()}
      </div>
    `;
  }

  validateForm() {
    const fields = this.shadowRoot.querySelectorAll('input, select');
    let valid = true;
    fields.forEach(field => {
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
    try {
      // Fetch schema
      const schemaRes = await fetch(`${this.apiConfig.baseApiUrl}${this.apiConfig.schemaEndpoint}`);
      if (!schemaRes.ok) throw new Error('Failed to fetch schema');
      this.schema = await schemaRes.json();

      // Fetch data
      const dataRes = await fetch(`${this.apiConfig.baseApiUrl}${this.apiConfig.listEndpoint}`);
      if (!dataRes.ok) throw new Error('Failed to fetch data');
      this.data = await dataRes.json();

      this.loading = false;
    } catch (error) {
      console.error('Error loading data:', error);
      this.loading = false;
    }
  }

  async connectedCallback() {
    super.connectedCallback();
    await this.fetchSchemaAndData();
  }

  // Reload data
  async refreshData() {
    try {
      const res = await fetch('http://localhost:3000/rows');
      if (!res.ok) throw new Error('Could not reload data');
      const data = await res.json();
      this.data = data;
    } catch (error) {
      console.error('Data reload failed:', error);
    }
  }
}

customElements.define('data-table', DataTable);