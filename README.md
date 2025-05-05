# DataTable & Tabs Web Components

A collection of highly customizable web components built with Lit. This project provides modern, responsive, and interactive UI components for displaying tabular data and tabbed interfaces.

## Components

### DataTable

A feature-rich data table component with the following features:

- 🔍 Advanced filtering with field-specific search and complex operators for numeric fields
- ↕️ Column sorting (ascending/descending)
- 📄 Pagination with configurable page size
- ✏️ CRUD operations (Create, Read, Update, Delete)
- 🔒 Password protection for data modifications
- 📱 Responsive design for all screen sizes
- 📤 Export to CSV functionality
- 🔄 Real-time data updates
- 🎨 Customizable styling with CSS variables
- 🌐 Dynamic schema support
- 📝 Support for various input types (text, number, date, boolean, select, textarea)
- 🔒 Control field editability with schema attributes

### Tabs

A modern tabbed interface component with the following features:

- 📑 Dynamic tab creation based on provided headers
- 🔄 Simple slot-based content system
- 🎨 Material Design inspired styling
- 🖱️ Smooth tab switching with visual feedback

## Installation

1. Include the Lit library in your project:
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js"></script>
```

2. Include Font Awesome for icons:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
```

3. Copy the component files to your project directory.

## Usage

### DataTable

```html
<script type="module" src="./data-table.js"></script>

<data-table 
  table-title="Users"
  base-api-url="http://localhost:3000"
  list-endpoint="/users"
  create-endpoint="/users"
  update-endpoint="/users"
  delete-endpoint="/users"
  schema-endpoint="/users_schema"
  page-size="5"
  protected
  password="yourpassword"
></data-table>
```

### Tabs

```html
<script type="module" src="./tabs.js"></script>

<custom-tabs headers='["Tab 1", "Tab 2", "Tab 3"]'>
  <div slot="tab-0">Content for Tab 1</div>
  <div slot="tab-1">Content for Tab 2</div>
  <div slot="tab-2">Content for Tab 3</div>
</custom-tabs>
```

## DataTable Configuration

### Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| table-title | String | Table title displayed at the top | "資料表" |
| base-api-url | String | Base URL for API endpoints | - |
| list-endpoint | String | Endpoint for fetching data | - |
| create-endpoint | String | Endpoint for creating records | - |
| update-endpoint | String | Endpoint for updating records | - |
| delete-endpoint | String | Endpoint for deleting records | - |
| schema-endpoint | String | Endpoint for fetching schema | - |
| page-size | Number | Number of records per page | 10 |
| protected | Boolean | Enable password protection | false |
| password | String | Password for protected operations | "123456" |

### Schema Format

The schema should be an array of objects with the following structure:

```json
{
  "key": "fieldName",
  "label": "Field Label",
  "type": "select",
  "required": true,
  "description": "Field description",
  "hidden": false,
  "editable": true,
  "defaultValue": "",
  "options": [
    {
      "value": "option1",
      "label": "Option 1"
    }
  ]
}
```

### Supported Field Types

- string
- number
- email
- boolean
- date
- select
- text

### Field Properties

| Property | Type | Description | Default |
|----------|------|-------------|---------|
| key | String | Unique identifier for the field | Required |
| label | String | Display label for the field | Same as key |
| type | String | Field data type (see supported types) | "string" |
| required | Boolean | Whether field is required | false |
| description | String | Help text shown on hover | null |
| hidden | Boolean | Hide field from table display | false |
| editable | Boolean | Whether field can be edited | true |
| defaultValue | Any | Default value for new records | null |
| options | Array | Options for select fields | [] |
| min | Number | Minimum value (for number fields) | null |
| max | Number | Maximum value (for number fields) | null |

## Tabs Configuration

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| headers | Array (JSON string) | Array of tab titles |

### Slots

Use `slot="tab-X"` where X is the zero-based index of the tab to assign content to specific tabs.

## API Requirements

The components expect the following API endpoints:

### GET /schema_endpoint
Returns the schema definition for the table.

### GET /list_endpoint
Returns an array of data objects.

### POST /create_endpoint
Creates a new record. Request body contains the record data.

### PUT /update_endpoint/:id
Updates an existing record. Request body contains the updated record data.

### DELETE /delete_endpoint/:id
Deletes a record by ID.

## Advanced Features

### Advanced Filtering

The DataTable component supports complex filtering operations for numeric fields:

- Greater than: `>value`
- Less than: `<value`
- Greater than or equal: `>=value`
- Less than or equal: `<=value`
- Range: `min-max`

### Password Protection

Enable the `protected` attribute to require password verification before allowing CRUD operations.

### Field Editability Control

Set the `editable` property to `false` in your schema to make specific fields non-editable:

```json
{
  "key": "id",
  "label": "ID",
  "type": "string",
  "editable": false
}
```

This will:
- Prevent the field from being modified, even in edit mode
- Display the field as read-only with a disabled appearance
- Maintain original values during record updates

## Styling

The components use CSS custom properties for styling. You can override these properties to customize the appearance:

### DataTable

```css
data-table {
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
}
```

### Tabs

```css
custom-tabs {
  --md-sys-color-primary: #6750A4;
  --md-sys-color-on-surface-variant: #49454F;
  --md-sys-color-surface-container-highest: #E7E0EC;
}
```

## Browser Support

These components use modern web technologies and are supported in all modern browsers that support:
- Custom Elements v1
- Shadow DOM v1
- ES2015 (ES6)
- CSS Custom Properties

## Development

This project uses [JSON Server](https://github.com/typicode/json-server) for local API development. The example data and schema are provided in the `db.json` file.

To start the development server:

```bash
npm install -g json-server
json-server --watch db.json
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit pull requests.