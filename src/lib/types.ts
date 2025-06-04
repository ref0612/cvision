export const VAT_RATE = 0.19; // 19% IVA

export interface IncomeRecord {
  id: string;
  date: Date;
  source: string;
  amount: number;       // Monto Total (CON IVA incluido, ingresado por el usuario)
  netAmount: number;    // Monto Neto (calculado, SIN IVA)
  ivaAmount: number;    // IVA (calculado)
  description?: string;
}

export interface ExpenseRecord {
  id: string;
  date: Date;
  category: string; // e.g., operating costs, marketing
  amount: number;
  description?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  purchasePrice: number; // Cost per unit
  description?: string;
  sku?: string; // Stock Keeping Unit
  supplier?: string;
  lastRestocked?: Date;
}

// For Custom Cost Analysis: Products are made from InventoryItems
export interface ProductComponent {
  inventoryItemId: string | null; // If linked to inventory, this is the inventory item's ID. Null if manual.
  itemName: string;       // Name of the component. (Read-only if linked, editable if manual)
  quantity: number;
  purchasePriceAtTimeOfAssembly: number; // Cost of one unit of this component. (Read-only if linked, editable if manual)
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  components: ProductComponent[];
  desiredProfitMargin: number; // User input, e.g., 30 for 30%

  // Calculated fields
  totalComponentCost?: number;
  netSalePriceWithoutIVA?: number;
  ivaAmountOnSale?: number;
  finalSalePriceWithIVA?: number;
}

// Order Management Types
export interface OrderItem {
  id: string; // Unique ID for the order item line
  productName: string;
  quantity: number;
  unitPriceWithVat: number; // Price per unit WITH IVA (user input)
  netUnitPrice: number;     // Calculated price per unit BEFORE IVA
}

export type OrderStatus = 'Recibido' | 'Elaborado' | 'Completado' | 'Anulado';

export const ORDER_STATUSES: OrderStatus[] = ['Recibido', 'Elaborado', 'Completado', 'Anulado'];

export interface Order {
  id: string;
  orderDate: Date;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;    // Calculated (sum of item.quantity * item.unitPriceWithVat) - effectively, this is the grand total with VAT
  totalNetAmount: number; // Calculated sum of (item.quantity * item.netUnitPrice)
  totalIvaAmount: number; // Calculated (totalAmount - totalNetAmount)
  status: OrderStatus;
  description?: string;
}