"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { Sofa, Laptop, BookOpen, Utensils, Trophy, Shirt, Camera, Sparkles, LayoutGrid } from "lucide-react"

interface CategoryFilterProps {
  categories: { id: string; name: string }[]
  activeCategory?: string | null
}

export function getCategoryIcon(name: string, className = "h-5 w-5") {
  switch (name) {
    case "เฟอร์นิเจอร์":
      return <Sofa className={className} />
    case "อิเล็กทรอนิกส์":
      return <Laptop className={className} />
    case "หนังสือ":
      return <BookOpen className={className} />
    case "เครื่องครัว":
      return <Utensils className={className} />
    case "กีฬา":
      return <Trophy className={className} />
    case "เสื้อผ้า":
      return <Shirt className={className} />
    case "กล้องและอุปกรณ์":
      return <Camera className={className} />
    default:
      return <Sparkles className={className} />
  }
}

export default function CategoryFilter({ categories, activeCategory }: CategoryFilterProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleCategorySelect = (categoryName: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categoryName) {
      params.set("category", categoryName)
    } else {
      params.delete("category")
    }
    // reset page to 1 if paging
    params.delete("page")
    
    router.push(`/items?${params.toString()}`)
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-none py-2">
      <div className="flex gap-2.5 px-1 min-w-max">
        
        {/* All Categories Button */}
        <button
          onClick={() => handleCategorySelect(null)}
          className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 shadow-sm ${
            !activeCategory
              ? "bg-indigo-600 border-indigo-600 text-white"
              : "bg-white border-gray-200/80 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
          }`}
        >
          <LayoutGrid className="h-4 w-4" />
          <span>ทั้งหมด</span>
        </button>

        {/* Dynamic Seeded Categories */}
        {categories.map((cat) => {
          const isActive = activeCategory === cat.name
          return (
            <button
              key={cat.id}
              onClick={() => handleCategorySelect(cat.name)}
              className={`flex items-center gap-2 h-10 px-4 rounded-xl text-sm font-semibold border transition-all duration-200 shadow-sm ${
                isActive
                  ? "bg-indigo-600 border-indigo-600 text-white"
                  : "bg-white border-gray-200/80 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
              }`}
            >
              {getCategoryIcon(cat.name, "h-4 w-4")}
              <span>{cat.name}</span>
            </button>
          )
        })}

      </div>
    </div>
  )
}
