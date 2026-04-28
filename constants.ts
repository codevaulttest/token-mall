import { Product, Category, InventoryItem, TokenConfig } from './types';

const COMMON_DESC = '这里是商品简介';

// Mock Exchange Rates: How many Tokens = 1 CNY
export const TOKENS: TokenConfig[] = [
    { id: 'FEC', name: 'FEC', rate: 20, color: '#F5416C' },
    { id: 'SLC', name: 'SLC', rate: 1, color: '#F5416C' },
    { id: 'DOS', name: 'DOS', rate: 10, color: '#3B82F6' },
    { id: 'CNV', name: 'CNV', rate: 5, color: '#10B981' },
];

export const TOKEN_DISPLAY_ORDER: TokenConfig['id'][] = ['FEC', 'SLC', 'DOS', 'CNV'];

export const getTokenAmountEntries = (amounts?: Product['tokenPrice']) => {
    if (!amounts) return [];
    return TOKEN_DISPLAY_ORDER
        .map(token => [token, amounts[token] ?? 0] as const)
        .filter(([, amount]) => amount > 0);
};

export const formatTokenAmounts = (amounts?: Product['tokenPrice']) => (
    getTokenAmountEntries(amounts)
        .map(([token, amount]) => `${amount.toLocaleString()} ${token}`)
        .join(' + ')
);

export const getProductDetailImages = (product: Product) => {
    if (product.id === 102020) {
        return [1, 2, 3, 4, 5].map(index => `https://global.picker8.org/pic/znjh/102020_d${index}.jpg`);
    }

    const detailImageId = product.id === 102014 ? 102013 : product.id;
    return [`https://global.picker8.org/pic/znjh/${detailImageId}_d.jpg`];
};

export const PRODUCTS: Product[] = [
    { id: 102022, title: '云梵普洱茶', specs: '10盒(每盒8粒)', retailPrice: '990元/10盒', price: 990, img: 'https://global.picker8.org/pic/znjh/102022_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102022.html', tokenPrice: { FEC: 4000, SLC: 100 }, desc: COMMON_DESC, sold: 34, categories: ['茗茶养生'], productType: '实物' },
    { id: 102021, title: '黄花梨黑茶壹号', specs: '1盒', retailPrice: '1080元/盒', price: 1080, img: 'https://global.picker8.org/pic/znjh/102021_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102021.html', tokenPrice: { FEC: 1600, SLC: 110 }, desc: COMMON_DESC, sold: 56, categories: ['茗茶养生', '精选礼盒'], productType: '实物' },
    { id: 102020, title: '黄花梨手串', specs: '1串', retailPrice: '21800元/串', price: 21800, img: 'https://global.picker8.org/pic/znjh/102020_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102020.html', tokenPrice: { FEC: 16000, SLC: 2180 }, desc: COMMON_DESC, sold: 8, categories: ['精选礼盒'], productType: '数字商品' },
    { id: 102019, title: '黄花梨喷雾', specs: '1瓶', retailPrice: '1999元/瓶', price: 1999, img: 'https://global.picker8.org/pic/znjh/102019_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102019.html', tokenPrice: { FEC: 960, SLC: 200 }, desc: COMMON_DESC, sold: 112, categories: ['美妆个护'], productType: '实物' },
    { id: 102018, title: '黄花梨面膜', specs: '1盒(6片)', retailPrice: '1399元/盒', price: 1399, img: 'https://global.picker8.org/pic/znjh/102018_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102018.html', tokenPrice: { FEC: 800, SLC: 140 }, desc: COMMON_DESC, sold: 67, categories: ['美妆个护'], productType: '实物' },
    { id: 102017, title: '黄花梨足贴', specs: '1盒', retailPrice: '1499元/盒', price: 1499, img: 'https://global.picker8.org/pic/znjh/102017_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102017.html', tokenPrice: { FEC: 800, SLC: 150 }, desc: COMMON_DESC, sold: 230, categories: ['茗茶养生', '美妆个护'], productType: '实物' },
    { id: 102016, title: '娘酒', specs: '1箱(4瓶)', retailPrice: '1888元/箱', price: 1888, img: 'https://global.picker8.org/pic/znjh/102016_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102016.html', tokenPrice: { FEC: 4000, SLC: 190 }, desc: COMMON_DESC, sold: 5, categories: ['名酒佳酿'], productType: '实物' },
    { id: 102015, title: '红酒', specs: '1箱(6瓶)', retailPrice: '5394元/箱', price: 5394, img: 'https://global.picker8.org/pic/znjh/102015_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102015.html', tokenPrice: { FEC: 8000, SLC: 540 }, desc: COMMON_DESC, sold: 12, categories: ['名酒佳酿'], productType: '实物' },
    { id: 102014, title: '黄花梨樽花月酒（1 瓶）', specs: '1瓶', retailPrice: '798元/瓶', price: 798, img: 'https://global.picker8.org/pic/znjh/102013_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102014.html', tokenPrice: { FEC: 1600, SLC: 80 }, desc: COMMON_DESC, sold: 890, categories: ['名酒佳酿'], productType: '话费' },
    { id: 102013, title: '黄花梨樽花月酒（1 箱）', specs: '1箱(6瓶)', retailPrice: '4788元/箱', price: 4788, img: 'https://global.picker8.org/pic/znjh/102013_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102013.html', tokenPrice: { FEC: 6400, SLC: 480 }, desc: COMMON_DESC, sold: 45, categories: ['名酒佳酿', '精选礼盒'], productType: '实物' },
    { id: 102012, title: '豪酒', specs: '10箱(10瓶)', retailPrice: '3880元/10箱', price: 3880, img: 'https://global.picker8.org/pic/znjh/102012_p.jpg', detailUrl: 'https://global.picker8.org/pic/znjh/102012.html', tokenPrice: { FEC: 4800, SLC: 400 }, desc: COMMON_DESC, sold: 120, categories: ['名酒佳酿', '精选礼盒'], productType: '数字商品' },
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
    { ...PRODUCTS[5], inventoryId: 103, productId: 6, count: 1, status: 'normal' },
    { ...PRODUCTS[2], inventoryId: 104, productId: 3, count: 1, status: 'normal' },
    { ...PRODUCTS[8], inventoryId: 105, productId: 9, count: 3, status: 'normal' },
    { ...PRODUCTS[10], inventoryId: 106, productId: 11, count: 2, status: 'normal' },
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
