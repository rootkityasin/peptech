export interface ProductItem {
  id: string
  name: string
  handle: string
  tag: string
  application?: string
  price: number
  subscribePrice?: number
  image: string
  description?: string
  rating?: number
  reviewCount?: number
}

export const COMPLETE_PEN_SET = {
  id: "complete-pen-set",
  name: "Complete PEPTECH® Pen Set",
  handle: "complete-pen-set",
  tag: "PEN SYSTEM",
  rating: 4.9,
  reviewCount: 264,
  subtitle: "One system. Multiple possibilities.",
  description: "Get started with the complete PEPTECH® system. Includes reusable pen, a compatible prefilled cartridge, 14 instructions and all accessories you need for accurate, reliable testing.",
  price: 249.00,
  subscribePrice: 224.10,
  images: [
    "/images/peptech/mockup2.webp",
    "/images/peptech/front.webp",
    "/images/peptech/back.webp",
    "/images/peptech/cartridge.webp",
    "/images/peptech/pen.webp"
  ],
  whatsIncluded: [
    { icon: "🖊️", title: "Reusable PEPTECH® pen", desc: "Precision engineered" },
    { icon: "💧", title: "1 x Compatible cartridge", desc: "Pre-filled and ready to use" },
    { icon: "📄", title: "Instruction guide", desc: "Step-by-step with illustrations" },
    { icon: "📍", title: "Starter accessories", desc: "Needles, caps and components" },
    { icon: "💳", title: "Device passport / batch card", desc: "With QR verification" },
    { icon: "📦", title: "Premium storage box", desc: "Keep everything organized" },
  ],
  specifications: [
    { label: "Compatibility", value: "PEPTECH® refill cartridges" },
    { label: "Dosage format", value: "0.5mL per cartridge" },
    { label: "Materials", value: "Medical-grade Aluminum & polymer" },
    { label: "Storage", value: "Room temperature (15-30°C)" },
    { label: "Batch no.", value: "PT-PS-001" },
    { label: "SKU", value: "PPS-1000" },
    { label: "Quality verified", value: "✔ Lab tested & certified" },
  ]
}

export const FEATURED_PEN_SETS: ProductItem[] = [
  {
    id: "pen-set-rt40",
    name: "RT40",
    handle: "complete-pen-set?model=RT40",
    tag: "PEN SYSTEM",
    application: "Food Safety Testing",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-cc1236",
    name: "C.C-1236",
    handle: "complete-pen-set?model=C.C-1236",
    tag: "PEN SYSTEM",
    application: "Environmental Testing",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-tbs30",
    name: "TB-S30",
    handle: "complete-pen-set?model=TB-S30",
    tag: "PEN SYSTEM",
    application: "Healthcare Testing",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-ifc137",
    name: "IFC-137",
    handle: "complete-pen-set?model=IFC-137",
    tag: "PEN SYSTEM",
    application: "Industrial Hygiene",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-gvk0050",
    name: "GVK-00 50",
    handle: "complete-pen-set?model=GVK-00%2050",
    tag: "PEN SYSTEM",
    application: "Water Quality Testing",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "pen-set-melatonin2",
    name: "Melatonin II",
    handle: "complete-pen-set?model=Melatonin%20II",
    tag: "PEN SYSTEM",
    application: "Mycotoxin Detection",
    price: 249.00,
    image: "/images/peptech/front.webp",
  },
]

export const REFILL_CARTRIDGES: ProductItem[] = [
  {
    id: "cartridge-rt40",
    name: "RT40",
    handle: "rt40-cartridge",
    tag: "Test Cartridge",
    price: 39.00,
    subscribePrice: 35.10,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-cc1236",
    name: "C.C-1236",
    handle: "cc1236-cartridge",
    tag: "Test Cartridge",
    price: 39.00,
    subscribePrice: 35.10,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-tbs30",
    name: "TB-S30",
    handle: "tbs30-cartridge",
    tag: "Test Cartridge",
    price: 25.00,
    subscribePrice: 22.50,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-ifc137",
    name: "IFC-137",
    handle: "ifc137-cartridge",
    tag: "Test Cartridge",
    price: 39.00,
    subscribePrice: 35.10,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-gvk0050",
    name: "GVK-00 50",
    handle: "gvk0050-cartridge",
    tag: "Test Cartridge",
    price: 35.00,
    subscribePrice: 31.50,
    image: "/images/peptech/cartridge.webp",
  },
  {
    id: "cartridge-melatonin2",
    name: "Melatonin II",
    handle: "melatonin2-cartridge",
    tag: "Test Cartridge",
    price: 33.00,
    subscribePrice: 29.70,
    image: "/images/peptech/cartridge.webp",
  },
]

export const FREEZE_DRIED_VIALS: ProductItem[] = [
  {
    id: "vial-5mg",
    name: "Research Grade 5 mg",
    handle: "vial-5mg",
    tag: "Freeze-Dried Vial",
    price: 129.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "vial-10mg",
    name: "Research Grade 10 mg",
    handle: "vial-10mg",
    tag: "Freeze-Dried Vial",
    price: 199.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "vial-25mg",
    name: "Research Grade 25 mg",
    handle: "vial-25mg",
    tag: "Freeze-Dried Vial",
    price: 349.00,
    image: "/images/peptech/front.webp",
  },
  {
    id: "vial-50mg",
    name: "Research Grade 50 mg",
    handle: "vial-50mg",
    tag: "Freeze-Dried Vial",
    price: 599.00,
    image: "/images/peptech/front.webp",
  },
]

export const CUSTOMER_REVIEWS = [
  {
    name: "Michael T.",
    verified: true,
    rating: 5,
    quote: "Excellent product and service. Highly recommended for any research lab.",
  },
  {
    name: "Dr. Emily R.",
    verified: true,
    rating: 5,
    quote: "The quality is outstanding. Fast shipping and great customer support.",
  },
  {
    name: "James L.",
    verified: true,
    rating: 5,
    quote: "Easy to use and very reliable. Will continue to order.",
  },
]
