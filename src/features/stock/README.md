# Stock Management - Real-time Stock Level Monitoring

## Task 5.2 Implementation

This implementation provides real-time stock level monitoring with automatic flow rate calculations and configurable stock alerts.

### Features Implemented

#### 1. StockLevelDisplay Component
- **Real-time stock view by store**: Displays current stock levels for all products in a store
- **Automatic refresh**: Updates every 30 seconds (configurable)
- **Flow rate calculation**: Calculates average daily consumption based on historical movements
- **Stock autonomy**: Shows how many days of stock remain at current consumption rate
- **Alert levels**: Visual indicators for critical, low, and overstock situations

#### 2. Automatic Flow Rate Calculation
- **Historical analysis**: Analyzes stock movements from the last 30 days
- **Daily consumption rate**: Calculates average units consumed per day
- **Predictive autonomy**: Estimates days until stock runs out
- **Real-time updates**: Recalculates when new movements are recorded

#### 3. Configurable Stock Alerts
- **Three alert levels**:
  - **Critical**: ≤ 2 days of stock remaining (default)
  - **Low**: ≤ 7 days of stock remaining (default)
  - **Overstock**: > 30 days of stock remaining (default)
- **Configurable thresholds**: Admin can adjust alert thresholds
- **Visual indicators**: Color-coded badges and icons
- **Alert summary**: Consolidated view of all alerts

### Components

#### StockLevelDisplay
```tsx
<StockLevelDisplay 
  storeId="store-1" 
  refreshInterval={30000} // 30 seconds
/>
```

**Features:**
- Real-time stock levels table
- Flow rate calculations
- Stock autonomy predictions
- Alert indicators
- Auto-refresh functionality

#### StockAlerts
```tsx
<StockAlerts 
  alerts={alerts} 
  maxVisible={5}
  compact={false}
/>
```

**Features:**
- Prioritized alert display
- Compact and full view modes
- Color-coded alert types
- Alert message details

#### StockThresholdConfig
```tsx
<StockThresholdConfig
  currentThresholds={thresholds}
  onThresholdsChange={handleChange}
  onSave={handleSave}
/>
```

**Features:**
- Configurable alert thresholds
- Validation rules
- Real-time preview
- Save/reset functionality

### Hooks

#### useStockLevels
```tsx
const {
  stockLevels,
  alerts,
  isLoading,
  lastUpdated,
  error,
  refresh,
  getCriticalStockItems,
  getLowStockItems,
  getOverstockItems,
  getTotalStockValue,
  getAverageFlowRate
} = useStockLevels(storeId, thresholds, autoRefresh, refreshInterval);
```

**Features:**
- Real-time stock data management
- Automatic flow rate calculations
- Alert generation
- Utility functions for stock analysis
- Error handling

### Services Extended

#### StockService
New methods added:
- `calculateProductFlowRate()`: Calculate flow rate for specific product
- `getEnrichedStockLevels()`: Get stock levels with flow rate data
- `checkStockAlerts()`: Generate alerts based on thresholds
- `getStockSummary()`: Get dashboard summary data

### Data Flow

1. **Stock Movements** → Historical data for flow rate calculation
2. **Current Stock Levels** → Real-time inventory data
3. **Flow Rate Calculation** → Average daily consumption analysis
4. **Alert Generation** → Threshold-based alert creation
5. **Real-time Updates** → Automatic refresh and notifications

### Alert Logic

```typescript
// Alert level determination
if (daysOfStock <= thresholds.critical) {
  alertLevel = 'critical';
} else if (daysOfStock <= thresholds.low) {
  alertLevel = 'low';
} else if (daysOfStock > thresholds.overstock) {
  alertLevel = 'overstock';
} else {
  alertLevel = 'none';
}
```

### Flow Rate Calculation

```typescript
// Calculate average daily consumption
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

const movements = await stockService.getStockMovements(storeId, [thirtyDaysAgo, new Date()]);
const productMovements = movements.filter(m => m.productId === productId);
const totalOutflow = productMovements
  .filter(m => m.type === 'loss' || m.quantity < 0)
  .reduce((sum, m) => sum + Math.abs(m.quantity), 0);

const flowRate = totalOutflow / 30; // units per day
```

### Integration

The StockLevelDisplay is integrated into the existing StockManagement component as a new tab:

```tsx
// In StockManagement.tsx
<Button
  variant={activeTab === 'levels' ? 'default' : 'ghost'}
  onClick={() => setActiveTab('levels')}
>
  <BarChart3 className="h-4 w-4 mr-2" />
  Niveaux de Stock
</Button>
```

### Requirements Fulfilled

✅ **Requirement 4.3**: Real-time stock tracking with automatic updates
✅ **Requirement 4.4**: Configurable alert thresholds for low stock and overstock
✅ **Flow rate calculation**: Automatic calculation of consumption rates
✅ **Real-time display**: Live stock level monitoring
✅ **Alert system**: Configurable thresholds with visual indicators

### Demo

Use the `StockLevelDemo` component to see all features in action:

```tsx
import { StockLevelDemo } from '@/features/stock';

// In your app
<StockLevelDemo />
```

This provides a complete demonstration of the real-time stock monitoring system with all implemented features.