"use client"

import React from "react"

const badges = [
  {
    icon: "/images/figma/f4da166c1fb9f9ef9a1afb3b3c95c5b5f13207a0.svg",
    title: "Discreet Delivery",
    desc: "Plain packaging worldwide",
    size: "size-[22px]",
  },
  {
    icon: "/images/figma/4390b9070d822ecd5eca4fa40b80170724518a5e.svg",
    title: "Track Your Order",
    desc: "Real-time shipping updates",
    size: "size-[20px]",
  },
  {
    icon: "/images/figma/ffad591ddd00ae2fdf8e1bd65ece13fd2d43fc35.svg",
    title: "Manage Your Account",
    desc: "Subscriptions & orders",
    size: "size-[20px]",
  },
  {
    icon: "/images/figma/62bff5b65f283bcf5397c72f82c6a2b3ed8693c2.svg",
    title: "Expert Support",
    desc: "Chat, email or phone",
    size: "size-[20px]",
  },
  {
    icon: "/images/figma/416aaa518d7e3b2366ccb720558673a93ab6bde4.svg",
    title: "Secure Checkout",
    desc: "Your data is protected",
    size: "size-[20px]",
  },
]

export function TrustBadgesStrip() {
  return (
    <div className="bg-white border-y border-[#e2e8f0] flex items-center justify-center py-[30px] w-full" data-node-id="8:41646" data-name="Trust Guarantees Strip">
      <div className="flex flex-wrap lg:flex-nowrap items-center justify-between max-w-[1240px] w-full px-4 sm:px-6 gap-6" data-node-id="8:41647" data-name="Trust Inner">
        {badges.map((b) => (
          <div key={b.title} className="flex gap-[12px] items-center shrink-0" data-name="Trust Item">
            <div className={`relative shrink-0 ${b.size} flex items-center justify-center`} data-name="Icon">
              <img alt="" className="size-full object-contain" src={b.icon} />
            </div>
            <div className="flex flex-col gap-[2px] items-start leading-tight whitespace-nowrap" data-name="Text">
              <p className="font-bold text-[#0b1f3a] text-[12px]">
                {b.title}
              </p>
              <p className="font-normal text-[#64748b] text-[11px]">
                {b.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

