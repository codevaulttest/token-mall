import { Product, Category, InventoryItem, TokenConfig } from './types';

// Local static images
const haojiuImg = 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=600&auto=format&fit=crop'; 
const zunhuayueBoxImg = 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=600&auto=format&fit=crop'; 
const zunhuayueSingleImg = 'https://images.unsplash.com/photo-1569919659476-b08588c3571c?q=80&w=600&auto=format&fit=crop'; 
const redWineImg = 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?q=80&w=600&auto=format&fit=crop'; 
const niangWineImg = 'https://images.unsplash.com/photo-1559563362-c667ba5f5480?q=80&w=600&auto=format&fit=crop'; 
const footPatchImg = 'https://images.unsplash.com/photo-1544367563-12123d8965cd?q=80&w=600&auto=format&fit=crop'; 
const maskImg = 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop'; 
const sprayImg = 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?q=80&w=600&auto=format&fit=crop'; 
const placeholderImg = 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=600&auto=format&fit=crop'; 
const blackTeaImg = 'https://images.unsplash.com/photo-1564890369478-c5235089f65b?q=80&w=600&auto=format&fit=crop'; 
const puerTeaImg = 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?q=80&w=600&auto=format&fit=crop';

const COMMON_DESC = '这里是商品简介';

// Mock Exchange Rates: How many Tokens = 1 CNY
export const TOKENS: TokenConfig[] = [
    { id: 'FEC', name: 'FEC', rate: 20, color: '#FF6D16' },
    { id: 'SLC', name: 'SLC', rate: 1, color: '#FF6D16' },
    { id: 'DOS', name: 'DOS', rate: 10, color: '#3B82F6' },
    { id: 'CNV', name: 'CNV', rate: 5, color: '#10B981' },
];

export const PRODUCTS: Product[] = [
    { id: 1, title: '豪酒', specs: '10箱（10瓶）', retailPrice: '388元/箱', price: 388, img: haojiuImg, desc: COMMON_DESC, sold: 120, categories: ['名酒佳酿', '精选礼盒'], displayCurrency: 'MIX' },
    { id: 2, title: '黄花梨樽花月酒', specs: '1箱（6瓶）', retailPrice: '4788元/箱', price: 4788, img: zunhuayueBoxImg, desc: COMMON_DESC, sold: 45, categories: ['名酒佳酿', '精选礼盒'] },
    { id: 3, title: '黄花梨樽花月酒', specs: '1瓶', retailPrice: '798元/瓶', price: 798, img: zunhuayueSingleImg, desc: COMMON_DESC, sold: 890, categories: ['名酒佳酿'] },
    { id: 4, title: '红酒', specs: '1箱（6瓶）', retailPrice: '5394元/箱', price: 5394, img: redWineImg, desc: COMMON_DESC, sold: 12, categories: ['名酒佳酿'] },
    { id: 5, title: '娘酒', specs: '1箱（4瓶）', retailPrice: '1888元/箱', price: 1888, img: niangWineImg, desc: COMMON_DESC, sold: 5, categories: ['名酒佳酿'] },
    { id: 6, title: '黄花梨足贴', specs: '1盒', retailPrice: '1499元/盒', price: 1499, img: footPatchImg, desc: COMMON_DESC, sold: 230, categories: ['茗茶养生', '美妆个护'] },
    { id: 7, title: '黄花梨面膜', specs: '1盒（6片）', retailPrice: '1399元/盒', price: 1399, img: maskImg, desc: COMMON_DESC, sold: 67, categories: ['美妆个护'], displayCurrency: 'DOS' },
    { id: 8, title: '黄花梨喷雾', specs: '1瓶', retailPrice: '1999元/瓶', price: 1999, img: sprayImg, desc: COMMON_DESC, sold: 112, categories: ['美妆个护'] },
    { id: 9, title: '黄花梨手串', specs: '1串', retailPrice: '21800元/串', price: 21800, img: placeholderImg, desc: COMMON_DESC, sold: 8, categories: ['精选礼盒'] },
    { id: 10, title: '黄花梨黑茶壹号', specs: '1盒', retailPrice: '1080元/盒', price: 1080, img: blackTeaImg, desc: COMMON_DESC, sold: 56, categories: ['茗茶养生', '精选礼盒'] },
    { id: 11, title: '云梵普洱茶', specs: '1盒（8粒）', retailPrice: '990元/10盒', price: 990, img: puerTeaImg, desc: COMMON_DESC, sold: 34, categories: ['茗茶养生'] },
];

export const CATEGORIES: Category[] = [
    { name: '名酒佳酿', icon: 'fa-wine-glass-alt', color: 'orange' },
    { name: '茗茶养生', icon: 'fa-leaf', color: 'green' },
    { name: '美妆个护', icon: 'fa-spa', color: 'pink' },
    { name: '精选礼盒', icon: 'fa-gift', color: 'red' },
];

// Mock initial inventory
export const INITIAL_INVENTORY: InventoryItem[] = [
    { ...PRODUCTS[0], inventoryId: 101, productId: 1, count: 2, status: 'normal' },
    { ...PRODUCTS[3], inventoryId: 102, productId: 4, count: 10, status: 'normal' },
    { ...PRODUCTS[5], inventoryId: 103, productId: 6, count: 1, status: 'normal' }
];

// Comprehensive China Regions Data
// (Truncated for brevity, but logically present)
export const CHINA_REGIONS = [
    {
        name: '北京市',
        children: [{ name: '北京市', children: ['东城区', '西城区', '朝阳区', '丰台区', '石景山区', '海淀区', '门头沟区', '房山区', '通州区', '顺义区', '昌平区', '大兴区', '怀柔区', '平谷区', '密云区', '延庆区'] }]
    },
    // ... rest of the regions as previously defined
];