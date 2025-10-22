# Mug Serial Number Generation System

## Overview

This system automatically generates unique mug serial numbers for each mug ordered, based on the customer's bike number. The serial numbers follow a specific pattern that ensures uniqueness across all orders.

## How It Works

### Serial Number Format
- **Pattern**: `{SERIES_CODE}{SEQUENTIAL_NUMBER}`
- **Example**: `TN10XY1`, `KL01AB2`, `TN22ZZ1`

### Series Code Extraction
- Takes the first 6 characters from the bike number
- Examples:
  - `TN10XY2345` → Series: `TN10XY`
  - `KL01AB1234` → Series: `KL01AB`
  - `TN22ZZ9999` → Series: `TN22ZZ`

### Sequential Numbering
- Each series maintains its own sequential counter
- Numbers start from 1 and increment for each new mug in that series
- Multiple mugs in the same order get consecutive numbers

## Example Output

```
Bike Number    → Mug Serial
TN10XY2345     → TN10XY1
KL01AB1234     → KL01AB1  
KL01AB5678     → KL01AB2
TN10XY6789     → TN10XY2
KL01AB4321     → KL01AB3
TN22ZZ9999     → TN22ZZ1
```

## API Integration

### Order Creation Request

When creating an order with mug items, include the following in your request:

```json
{
  "items": [
    {
      "productId": "product_id_here",
      "productName": "Custom Mug",
      "quantity": 2,
      "price": 299,
      "isMug": true,
      "bikeNumber": "TN10XY2345"
    }
  ],
  "shippingAddressId": "address_id_here",
  "paymentMethod": "phonepe"
}
```

### Response

The order will include generated mug serials:

```json
{
  "success": true,
  "data": {
    "orderNumber": "ORD-1234567890-001",
    "items": [
      {
        "productId": "product_id_here",
        "productName": "Custom Mug",
        "quantity": 2,
        "price": 299,
        "totalPrice": 598,
        "mugSerial": "TN10XY1,TN10XY2"
      }
    ],
    "orderStatus": "pending"
  }
}
```

## Database Schema

### Order Model Updates

The `Order` model has been updated to include mug serial information:

```javascript
items: [{
  // ... existing fields ...
  mugSerial: {
    type: String,
    required: false, // Only for mug products
  },
}]
```

### Storage Format

- **Single mug**: `"TN10XY1"`
- **Multiple mugs**: `"TN10XY1,TN10XY2,TN10XY3"`

## Utility Functions

### `generateMugSerial(bikeNumber)`
- Generates a single mug serial for the given bike number
- Returns: `Promise<string>`

### `generateMultipleMugSerials(bikeNumber, quantity)`
- Generates multiple consecutive mug serials
- Returns: `Promise<string[]>`

## Error Handling

- If mug serial generation fails, the order creation continues without the serial
- Errors are logged but don't prevent order completion
- Database queries are optimized to handle large numbers of existing orders

## Testing

Run the test script to verify mug serial generation:

```bash
node scripts/testMugSerialGeneration.js
```

## Implementation Details

1. **Database Queries**: Efficiently finds existing serials using regex patterns
2. **Concurrency**: Handles multiple simultaneous orders safely
3. **Performance**: Optimized queries to work with large order volumes
4. **Flexibility**: Works with any bike number format (6+ characters)

## Future Enhancements

- Add validation for bike number format
- Implement serial number reservation system
- Add admin interface for serial number management
- Export serial numbers to CSV/Excel format
