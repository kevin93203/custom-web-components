# DataTable Web Component

A highly customizable and feature-rich data table web component built with Lit. This component provides a modern, responsive, and interactive way to display and manage tabular data with built-in features for sorting, filtering, pagination, and CRUD operations.

## Features

- 🔍 Advanced filtering with field-specific search
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

## Installation

1. Include the Lit library in your project:
```html
<script type="module" src="https://cdn.jsdelivr.net/gh/lit/dist@3/core/lit-core.min.js"></script>
```

2. Include Font Awesome for icons:
```html
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
```

3. Copy the `DataTable.js` file to your project directory.

## Usage

1. Import the component in your HTML file:
```html
<script type="module" src="./DataTable.js"></script>
```

2. Use the component in your HTML:
```html
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

## Configuration

### Attributes

| Attribute | Type | Description | Default |
|-----------|------|-------------|---------|
| table-title | String | Table title displayed at the top | "DataTable" |
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
  "type": "text",
  "required": true,
  "description": "Field description",
  "hidden": false,
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

- text
- number
- email
- boolean
- date
- select
- textarea

## API Requirements

The component expects the following API endpoints:

### GET /schema
Returns the schema definition for the table.

### GET /data
Returns an array of data objects.

### POST /data
Creates a new record. Request body contains the record data.

### PUT /data/:id
Updates an existing record. Request body contains the updated record data.

### DELETE /data/:id
Deletes a record by ID.

## Styling

The component uses CSS custom properties for styling. You can override these properties to customize the appearance:

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

## Browser Support

This component uses modern web technologies and is supported in all modern browsers that support:
- Custom Elements v1
- Shadow DOM v1
- ES2015 (ES6)
- CSS Custom Properties

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit pull requests.