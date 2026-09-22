"use client"

import React from "react"
import { ProductBuyBox } from "./ProductBuyBox"
import { CatalogProduct } from "@/data/catalog"

interface RefillBuyBoxProps {
  product: CatalogProduct
}

export function RefillBuyBox({ product }: RefillBuyBoxProps) {
  return (
    <ProductBuyBox
      product={product}
      title={product.name}
      subtitle="Pre-filled 1.5 mL Cartridge • Fits PEPTECH® Precision Pen"
      description={product.description}
      price={product.price}
      subscribePrice={product.subscribePrice}
      tag="REFILL CARTRIDGE"
    />
  )
}
