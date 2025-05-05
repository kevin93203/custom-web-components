import { LitElement, html, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js';

export class Tabs extends LitElement {
  static properties = {
    headers: { 
      type: Array,
      converter: (value) => {
        try {
          console.log(JSON.parse(value));
          return typeof value === 'string' ? JSON.parse(value) : value;
        } catch {
          return [];
        }
      }
    },
    selectedIndex: { type: Number }
  };

  static styles = css`
    :host {
      --md-sys-color-primary: #6750A4;
      --md-sys-color-on-surface-variant: #49454F;
      --md-sys-color-surface-container-highest: #E7E0EC;
      display: block;
      width: 100%;
    }

    .tab-header {
      display: flex;
      gap: 8px;
      padding: 0 24px;
    }

    .tab-btn {
      position: relative;
      padding: 16px 24px;
      background: none;
      border: none;
      cursor: pointer;
      color: var(--md-sys-color-on-surface-variant);
      font-size: 0.875rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.1px;
      border-radius: 16px 16px 0 0;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .tab-btn:hover {
      background-color: color-mix(in srgb, var(--md-sys-color-primary) 8%, transparent);
    }

    .tab-btn.active {
      color: var(--md-sys-color-primary);
    }

    .tab-btn.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 24px;
      right: 24px;
      height: 2px;
      background-color: var(--md-sys-color-primary);
    }

    .tab-content {
      display: block;
      width: 100%;
      padding: 16px 24px;
      border-radius: 0 0 16px 16px;
      box-sizing: border-box;
    }

    ::slotted(*) {
      display: block;
      width: 100%;
    }
  `;

  constructor() {
    super();
    this.headers = [];
    this.selectedIndex = 0;
  }

  render() {
    return html`
      <div class="tab-header">
        ${this.headers.map((header, index) => html`
          <button 
            class=${this.selectedIndex === index ? 'tab-btn active' : 'tab-btn'}
            @click=${() => this.selectTab(index)}
          >
            ${header}
          </button>
        `)}
      </div>
      
      <div class="tab-content">
        <slot name="tab-${this.selectedIndex}" @slotchange=${this._handleSlotChange}></slot>
      </div>
    `;
  }

  _handleSlotChange(e) {
    this.requestUpdate();
  }

  selectTab(index) {
    this.selectedIndex = index;
    this.requestUpdate();
  }
}

customElements.define('custom-tabs', Tabs);
