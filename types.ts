
export interface Product {
    id: number;
    title: string;
    specs: string;
    price: number; // Base price in CNY for calculation
    retailPrice: string; // Display string
    img: string;
    detailUrl?: string;
    tokenPrice?: Partial<Record<TokenConfig['id'], number>>;
    desc: string;
    sold: number;
    categories: string[];
    displayCurrency?: 'FEC' | 'DOS' | 'MIX'; // Optional override for display
    productType?: '数字商品' | '实物' | '充值';
}

export interface Category {
    name: string;
    icon: string;
    color: string;
}

export interface InventoryItem extends Product {
    inventoryId: number; // Unique ID for the inventory entry
    productId: number;
    count: number;
    status: 'normal' | 'frozen';
}

export interface ActionLog {
    id: string;
    orderId: string;
    date: string;
    type: string;
    item: string;
    img: string;
    count: number;
    status: string;
}

export interface Address {
    id: string;
    name: string;
    phone: string;
    fullAddress: string;
    isDefault: boolean;
}

export interface TokenConfig {
    id: 'FEC' | 'SLC' | 'DOS' | 'CNV';
    name: string;
    rate: number; // Exchange rate: How many Tokens per 1 CNY
    color: string;
}

export type ViewState = 'home' | 'inventory' | 'category' | 'history' | 'redemption_history';
export type ModalType = 'none' | 'product_detail' | 'action_pickup' | 'action_transfer' | 'action_history' | 'bulk_pickup' | 'bulk_transfer';
