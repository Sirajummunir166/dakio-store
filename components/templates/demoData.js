// Demo data shown when store has no real products yet
// All images from Unsplash CDN — free, high quality

const U = (id, w = 600) => `https://images.unsplash.com/photo-${id}?w=${w}&q=82&auto=format&fit=crop`

export const DEMO = {

  fashion: {
    hero:  U('1595777457583-95e059d581b8', 1600),
    heroTitle: 'Effortless Style, Every Day',
    heroSub:   'Premium fashion curated for modern Bangladesh. Free delivery over ৳2000.',
    announce:  'Free delivery over ৳2000  ·  Easy return  ·  Cash on delivery nationwide',
    categoriesList: [
      { id: 'fw', name: 'Women' },
      { id: 'fm', name: 'Men' },
      { id: 'fk', name: 'Kids' },
      { id: 'fs', name: 'Shoes' },
      { id: 'fb', name: 'Bags' },
      { id: 'fa', name: 'Accessories' },
    ],
    categoryImages: {
      women:       U('1595777457583-95e059d581b8', 600),
      men:         U('1581044777550-4cfa60707c03', 600),
      kids:        U('1503454537847-6011ff137924', 600),
      shoes:       U('1542291026-7eec264c27ff', 600),
      bags:        U('1591561954555-7044c87f7c0a', 600),
      accessories: U('1567401893414-76b7b1e5a7a5', 600),
    },
    styleImages: {
      casual:     U('1515886657613-9f3515b0c78f', 400),
      office:     U('1506629082955-511b1aa562c8', 400),
      party:      U('1539104009244-6f311c57a903', 400),
      modest:     U('1591047139829-d91aecb6caea', 400),
      streetwear: U('1556821840-3b63f3c0a672', 400),
    },
    products: [
      { id: 'f1', name: 'Linen Blend Midi Dress',     sellingPrice: 2490, mrp: 3200, imageUrl: U('1595777457583-95e059d581b8'), images: [U('1595777457583-95e059d581b8'), U('1539104009244-6f311c57a903')], category: { id: 'fw', name: 'Women' }, totalStock: 12 },
      { id: 'f2', name: 'Essential Oxford Shirt',      sellingPrice: 1190, mrp: 1490, imageUrl: U('1581044777550-4cfa60707c03'), images: [U('1581044777550-4cfa60707c03'), U('1473966968600-fa801b869a1a')], category: { id: 'fm', name: 'Men' }, totalStock: 20 },
      { id: 'f3', name: 'Tailored Wide-Leg Trouser',   sellingPrice: 1690, imageUrl: U('1506629082955-511b1aa562c8'), images: [U('1506629082955-511b1aa562c8'), U('1515886657613-9f3515b0c78f')], category: { id: 'fw', name: 'Women' }, totalStock: 8 },
      { id: 'f4', name: 'Premium Cotton Polo',         sellingPrice:  890, imageUrl: U('1521572163474-6864f9cf17ab'), category: { id: 'fm', name: 'Men' }, totalStock: 15 },
      { id: 'f5', name: 'Embroidered Kurti',           sellingPrice: 1390, mrp: 1790, imageUrl: U('1591047139829-d91aecb6caea'), images: [U('1591047139829-d91aecb6caea'), U('1572804013647-31a469c3f0d0')], category: { id: 'fw', name: 'Women' }, totalStock: 10 },
      { id: 'f6', name: 'Slim Fit Chino',              sellingPrice: 1490, imageUrl: U('1473966968600-fa801b869a1a'), category: { id: 'fm', name: 'Men' }, totalStock: 18 },
      { id: 'f7', name: 'Handloom Panjabi',            sellingPrice: 1890, imageUrl: U('1512436991641-6745cdb1723f'), category: { id: 'fm', name: 'Men' }, totalStock: 6 },
      { id: 'f8', name: 'Silk Blend Scarf',            sellingPrice:  590, imageUrl: U('1567401893414-76b7b1e5a7a5'), category: { id: 'fa', name: 'Accessories' }, totalStock: 25 },
      { id: 'f9', name: 'Leather Crossbody Bag',       sellingPrice: 2190, mrp: 2790, imageUrl: U('1591561954555-7044c87f7c0a'), category: { id: 'fb', name: 'Bags' }, totalStock: 7 },
      { id: 'f10', name: 'Classic White Sneaker',      sellingPrice: 2790, imageUrl: U('1542291026-7eec264c27ff'), images: [U('1542291026-7eec264c27ff'), U('1491553895911-0055eca6402d')], category: { id: 'fs', name: 'Shoes' }, totalStock: 9 },
    ],
  },

  tech: {
    hero:  U('1518770660439-4636190af475', 1400),
    heroTitle: 'Next-Gen Tech',
    heroSub:   'Latest gadgets at unbeatable prices. 7-day returns guaranteed.',
    announce:  '⚡ Flash Deal: Up to 30% off on select electronics — Today only!',
    categories: ['All', 'Audio', 'Wearables', 'Accessories'],
    products: [
      { id: 't1', name: 'Wireless Noise-Cancelling Earbuds', sellingPrice: 2990, imageUrl: U('1605464315-52831764a8e5'), category: { id: 'ta', name: 'Audio' } },
      { id: 't2', name: 'Smart Fitness Watch',               sellingPrice: 4490, imageUrl: U('1523275335684-37898b6baf30'), category: { id: 'tw', name: 'Wearables' } },
      { id: 't3', name: 'Bluetooth Over-Ear Headphones',    sellingPrice: 3290, imageUrl: U('1505740420928-5e560c06d30e'), category: { id: 'ta', name: 'Audio' } },
      { id: 't4', name: 'USB-C Fast Charger 65W',           sellingPrice:  890, imageUrl: U('1585771724684-38269d6639fd'), category: { id: 'tc', name: 'Accessories' } },
      { id: 't5', name: 'Portable Power Bank 20000mAh',     sellingPrice: 1890, imageUrl: U('1574944985070-8f3ebc6b79d2'), category: { id: 'tc', name: 'Accessories' } },
      { id: 't6', name: 'Mechanical Gaming Keyboard',       sellingPrice: 3490, imageUrl: U('1587829741301-dc798b83add3'), category: { id: 'tc', name: 'Accessories' } },
      { id: 't7', name: 'Smart Band Pro',                   sellingPrice: 1490, imageUrl: U('1576243345690-4e4b79b63288'), category: { id: 'tw', name: 'Wearables' } },
      { id: 't8', name: 'True Wireless Sport Earphones',    sellingPrice: 1990, imageUrl: U('1572635196237-14b3f281503f'), category: { id: 'ta', name: 'Audio' } },
    ],
  },

  organic: {
    hero:     U('1542838132-92c53300491e', 1400),
    heroTitle: 'তাজা শাকসবজি, সরাসরি কৃষকের খামার থেকে',
    heroSub:   'প্রতিদিন সকালে তাজা সংগ্রহ — কোনো কেমিক্যাল নেই',
    announce:  '🌿 সকাল ৭টা থেকে রাত ১০টা ডেলিভারি | ৫০০ টাকার উপরে ফ্রি ডেলিভারি',
    products: [
      // শাকসবজি
      { id: 'ov1', name: 'লাল টমেটো',        unit: '৫০০ গ্রাম', sellingPrice:  45, mrp:  60, imageUrl: U('1546094096-0df4bcaaa337'), category: { id: 'ov', name: 'শাকসবজি' } },
      { id: 'ov2', name: 'পালং শাক',          unit: '১ আঁটি',   sellingPrice:  30, mrp:  40, imageUrl: U('1576045057995-568f588f82fb'), category: { id: 'ov', name: 'শাকসবজি' } },
      { id: 'ov3', name: 'দেশি গাজর',         unit: '৫০০ গ্রাম', sellingPrice:  55, mrp:  70, imageUrl: U('1447175008436-054170c2e979'), category: { id: 'ov', name: 'শাকসবজি' } },
      { id: 'ov4', name: 'লাল আলু',           unit: '১ কেজি',   sellingPrice:  40, mrp:  50, imageUrl: U('1518977676601-b53f82aba655'), category: { id: 'ov', name: 'শাকসবজি' } },
      // ফলমূল
      { id: 'of1', name: 'পাকা কলা',          unit: '১ ডজন',    sellingPrice:  80, mrp: 100, imageUrl: U('1571771894821-ce9b6c11b08e'), category: { id: 'of', name: 'ফলমূল' } },
      { id: 'of2', name: 'হিমসাগর আম',        unit: '১ কেজি',   sellingPrice: 220, mrp: 280, imageUrl: U('1553279768-865429fa0078'),   category: { id: 'of', name: 'ফলমূল' } },
      { id: 'of3', name: 'আমদানি আপেল',       unit: '৫০০ গ্রাম', sellingPrice: 190, mrp: 230, imageUrl: U('1567306226416-28f0efdc88ce'), category: { id: 'of', name: 'ফলমূল' } },
      { id: 'of4', name: 'মৌসুমী ফলের ঝুড়ি', unit: '১.৫ কেজি', sellingPrice: 380, mrp: 450, imageUrl: U('1610832958506-aa56368176cf'), category: { id: 'of', name: 'ফলমূল' } },
      // মাছ ও মাংস
      { id: 'om1', name: 'রুই মাছ (কাটা)',    unit: '৫০০ গ্রাম', sellingPrice: 280, mrp: 320, imageUrl: U('1544551763-77ef2d0cbe89'), category: { id: 'om', name: 'মাছ ও মাংস' } },
      { id: 'om2', name: 'দেশি মুরগি',        unit: '১ কেজি',   sellingPrice: 480, mrp: 550, imageUrl: U('1565299624946-b28f40a04680'), category: { id: 'om', name: 'মাছ ও মাংস' } },
      { id: 'om3', name: 'ফার্মের ডিম',       unit: '১ ডজন',    sellingPrice: 145, mrp: 165, imageUrl: U('1582722872445-44dc5f7e3c8f'), category: { id: 'om', name: 'মাছ ও মাংস' } },
      { id: 'om4', name: 'ইলিশ মাছ',          unit: '৫০০ গ্রাম', sellingPrice: 650, mrp: 750, imageUrl: U('1535620032090-5e57a48fee97'), category: { id: 'om', name: 'মাছ ও মাংস' } },
      // দুধ ও শস্য
      { id: 'od1', name: 'গরুর খাঁটি দুধ',   unit: '১ লিটার',  sellingPrice:  90, mrp: 100, imageUrl: U('1563636619-e9143da7973b'), category: { id: 'od', name: 'দুধ ও শস্য' } },
      { id: 'od2', name: 'মিনিকেট চাল',       unit: '২ কেজি',   sellingPrice: 160, mrp: 180, imageUrl: U('1536304929831-ee1ca9d44906'), category: { id: 'od', name: 'দুধ ও শস্য' } },
      { id: 'od3', name: 'দেশি মসুর ডাল',     unit: '৫০০ গ্রাম', sellingPrice: 120, mrp: 140, imageUrl: U('1611575619423-ef62cc539ef0'), category: { id: 'od', name: 'দুধ ও শস্য' } },
      { id: 'od4', name: 'গাওয়া ঘি',          unit: '২০০ গ্রাম', sellingPrice: 450, mrp: 500, imageUrl: U('1484723091739-30e6f17a9b7c'), category: { id: 'od', name: 'দুধ ও শস্য' } },
    ],
  },

  beauty: {
    hero:  U('1522335789203-aabd1fc54bc9', 1400),
    heroTitle: 'Reveal Your Best Self',
    heroSub:   'Premium beauty essentials. Cruelty-free. Dermatologist approved.',
    announce:  '✨ Buy 2 Get 1 Free on all skincare — Use code: GLOW3',
    categories: ['Skincare', 'Makeup', 'Hair Care', 'Fragrance'],
    products: [
      { id: 'b1', name: 'Vitamin C Brightening Serum', sellingPrice: 1490, imageUrl: U('1556228720-195a672e8a03'), category: { id: 'bs', name: 'Skincare' } },
      { id: 'b2', name: 'Matte Finish Foundation',     sellingPrice:  890, imageUrl: U('1596462502278-27bfdc403348'), category: { id: 'bm', name: 'Makeup' } },
      { id: 'b3', name: 'Hydrating Face Moisturizer',  sellingPrice:  990, imageUrl: U('1571781926291-c477ebfd024b'), category: { id: 'bs', name: 'Skincare' } },
      { id: 'b4', name: 'Rose Water Toner (200ml)',    sellingPrice:  490, imageUrl: U('1619451334792-150fd785ee74'), category: { id: 'bs', name: 'Skincare' } },
      { id: 'b5', name: 'Long-Lasting Lip Color Set',  sellingPrice:  690, imageUrl: U('1583241800698-e8ab01830a26'), category: { id: 'bm', name: 'Makeup' } },
      { id: 'b6', name: 'Argan Oil Hair Serum',        sellingPrice:  790, imageUrl: U('1522338242992-e1d3aea3dc66'), category: { id: 'bh', name: 'Hair Care' } },
      { id: 'b7', name: 'French Rose Eau de Parfum',   sellingPrice: 2490, imageUrl: U('1590156562745-5adf4f1e3818'), category: { id: 'bf', name: 'Fragrance' } },
      { id: 'b8', name: 'Collagen Eye Cream (30ml)',   sellingPrice: 1190, imageUrl: U('1617575521317-d7d57d2be8b6'), category: { id: 'bs', name: 'Skincare' } },
    ],
  },

  bold: {
    hero:  U('1483985988355-763728e1935b', 1400),
    heroTitle: 'DROP SEASON 2025',
    heroSub:   'Limited drops. Unlimited style. Be first. Be bold.',
    announce:  '⚡ NEW DROP LIVE — Sizes going fast. Shop before it sells out.',
    categories: ['New Drop', 'Footwear', 'Apparel', 'Accessories'],
    products: [
      { id: 'bl1', name: 'Air Mesh Running Shoes',      sellingPrice: 3490, imageUrl: U('1542291026-7eec264c27ff'), category: { id: 'bls', name: 'Footwear' } },
      { id: 'bl2', name: 'Oversized Graphic Hoodie',    sellingPrice: 1890, imageUrl: U('1556821840-3b63f3c0a672'), category: { id: 'bla', name: 'Apparel' } },
      { id: 'bl3', name: 'Street Style Jogger Pants',   sellingPrice: 1490, imageUrl: U('1539185441755-769473a23570'), category: { id: 'bla', name: 'Apparel' } },
      { id: 'bl4', name: 'Low-Top Leather Sneakers',    sellingPrice: 2990, imageUrl: U('1491553895911-0055eca6402d'), category: { id: 'bls', name: 'Footwear' } },
      { id: 'bl5', name: 'Tactical Crossbody Bag',      sellingPrice: 1290, imageUrl: U('1553062407-98eeb64c6a62'), category: { id: 'blx', name: 'Accessories' } },
      { id: 'bl6', name: 'Snapback Cap',                sellingPrice:  590, imageUrl: U('1521369749756-af76b36d3b59'), category: { id: 'blx', name: 'Accessories' } },
      { id: 'bl7', name: 'Premium Sports Socks (3-Pack)',sellingPrice:  390, imageUrl: U('1542291026-7eec264c27ff'), category: { id: 'blx', name: 'Accessories' } },
      { id: 'bl8', name: 'Reflective Track Jacket',     sellingPrice: 2390, imageUrl: U('1509631179647-0177331693ae'), category: { id: 'bla', name: 'Apparel' } },
    ],
  },

  minimal: {
    hero:  U('1441986300917-64674bd600d8', 1400),
    heroTitle: 'Shop the Collection',
    heroSub:   'Curated products for modern living. Quality you can trust.',
    announce:  '🎁 Free delivery on orders above Tk 1,500 — Shop now',
    categories: ['All Products', 'New In', 'Best Sellers', 'Sale'],
    products: [
      { id: 'm1', name: 'Minimalist Leather Watch',    sellingPrice: 2890, imageUrl: U('1523275335684-37898b6baf30'), category: { id: 'mc', name: 'Accessories' } },
      { id: 'm2', name: 'Canvas Tote Bag',             sellingPrice:  890, imageUrl: U('1591561954555-7044c87f7c0a'), category: { id: 'mc', name: 'Accessories' } },
      { id: 'm3', name: 'Ceramic Mug Set (2 pcs)',     sellingPrice:  690, imageUrl: U('1514228742587-6b1558fcca3d'), category: { id: 'mh', name: 'Home' } },
      { id: 'm4', name: 'Linen Pillow Cover',          sellingPrice:  490, imageUrl: U('1555041469-a586ea2b097c'), category: { id: 'mh', name: 'Home' } },
      { id: 'm5', name: 'Bamboo Desk Organizer',       sellingPrice:  790, imageUrl: U('1611174797136-5d0c1e9b7e9b'), category: { id: 'mh', name: 'Home' } },
      { id: 'm6', name: 'Scented Soy Candle',          sellingPrice:  590, imageUrl: U('1603905066517-f1ad3b2ddfce'), category: { id: 'mh', name: 'Home' } },
      { id: 'm7', name: 'Stainless Steel Tumbler',     sellingPrice:  990, imageUrl: U('1602143407151-7111542de6e8'), category: { id: 'mc', name: 'Accessories' } },
      { id: 'm8', name: 'Notebook Set (3 pcs)',        sellingPrice:  450, imageUrl: U('1531346878377-a5be20888e57'), category: { id: 'mc', name: 'Accessories' } },
    ],
  },

}

export function getDemoProducts(templateKey) {
  return DEMO[templateKey]?.products || DEMO.minimal.products
}

export function getDemoHero(templateKey) {
  return DEMO[templateKey]?.hero || DEMO.minimal.hero
}

export function getDemoAnnounce(templateKey) {
  return DEMO[templateKey]?.announce || DEMO.minimal.announce
}
