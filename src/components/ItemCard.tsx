import Link from "next/link"
import { MapPin, Sparkles } from "lucide-react"
import { Item, ItemImage, Community } from "@prisma/client"

interface ItemCardProps {
  item: Item & {
    images: ItemImage[]
    community?: Community | null
  }
}

export function getConditionLabel(cond: string) {
  switch (cond) {
    case "NEW": return "ของใหม่"
    case "LIKE_NEW": return "เหมือนใหม่"
    case "GOOD": return "สภาพดี"
    case "FAIR": return "สภาพใช้แล้ว"
    case "POOR": return "มีรอยตำหนิ"
    default: return cond
  }
}

export default function ItemCard({ item }: ItemCardProps) {
  const imageUrl = item.images?.[0]?.url || "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=500"

  // Type Badges Config
  let typeConfig = {
    label: "ขาย",
    style: "bg-blue-50 text-blue-700 border-blue-200/50",
  }

  if (item.type === "RENTAL") {
    typeConfig = {
      label: "ให้เช่า",
      style: "bg-emerald-50 text-emerald-700 border-emerald-200/50",
    }
  } else if (item.type === "BOTH") {
    typeConfig = {
      label: "เช่า/ซื้อ",
      style: "bg-purple-50 text-purple-700 border-purple-200/50",
    }
  }

  return (
    <Link href={`/items/${item.id}`} className="group block">
      <div className="flex flex-col h-full rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-gray-200/80 transition-all duration-300 overflow-hidden">
        
        {/* Item Image with hover zoom */}
        <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
          <img
            src={imageUrl}
            alt={item.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          
          {/* Type Badge */}
          <div className="absolute left-3.5 top-3.5">
            <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-bold shadow-sm backdrop-blur-sm ${typeConfig.style}`}>
              {typeConfig.label}
            </span>
          </div>

          {/* Condition Badge */}
          <div className="absolute right-3.5 top-3.5">
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-200/50 bg-amber-50/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold text-amber-700 shadow-sm">
              <Sparkles className="h-3 w-3 stroke-[2.5]" />
              {getConditionLabel(item.condition)}
            </span>
          </div>
        </div>

        {/* Content details */}
        <div className="flex flex-col flex-1 p-4">
          {/* Title */}
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-1 group-hover:text-indigo-600 transition-colors">
            {item.title}
          </h3>

          {/* Description */}
          <p className="mt-1 text-xs text-gray-400 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Price display Section */}
          <div className="mt-4 pt-3.5 border-t border-gray-50 flex items-baseline justify-between gap-1">
            <div className="flex flex-col">
              {item.type === "RENTAL" && (
                <div>
                  <span className="text-base font-extrabold text-emerald-600">฿{item.rentalPricePerDay}</span>
                  <span className="text-xxs text-gray-400 font-medium"> / วัน</span>
                </div>
              )}
              {item.type === "SALE" && (
                <span className="text-base font-extrabold text-blue-600">฿{item.price}</span>
              )}
              {item.type === "BOTH" && (
                <div className="flex flex-col text-left gap-0.5">
                  <span className="text-sm font-extrabold text-purple-600">
                    ฿{item.rentalPricePerDay}<span className="text-xxs text-gray-400 font-medium">/วัน</span>
                  </span>
                  <span className="text-xxs text-gray-400 font-medium leading-none">
                    หรือซื้อขาด ฿{item.price}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer location and community */}
          <div className="mt-auto pt-3 flex items-center justify-between text-xxs text-gray-400 border-t border-gray-50">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3 text-indigo-500 stroke-[2]" />
              <span className="truncate max-w-[120px]">
                {item.community?.name || item.pickupLocation || "ทั่วไป"}
              </span>
            </div>
            <span>
              {new Date(item.createdAt).toLocaleDateString("th-TH", {
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>

        </div>

      </div>
    </Link>
  )
}
