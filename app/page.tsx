"use client"

import { useState, useMemo, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightIcon, ArrowLeftIcon, ClockIcon } from "lucide-react"

// Define the original food item interface without ID
interface OriginalFoodItem {
  name: string
  type: string
}

// Define the internal food item interface with generated ID
interface FoodItem extends OriginalFoodItem {
  id: string
  returnTime?: number // Track when item will return
}

export default function FoodCategorizer() {
  // Original food items without IDs
  const originalFoodItems: OriginalFoodItem[] = [
    { type: "Fruit", name: "Apple" },
    { type: "Vegetable", name: "Broccoli" },
    { type: "Vegetable", name: "Mushroom" },
    { type: "Fruit", name: "Banana" },
    { type: "Vegetable", name: "Tomato" },
    { type: "Fruit", name: "Orange" },
    { type: "Fruit", name: "Mango" },
    { type: "Fruit", name: "Pineapple" },
    { type: "Vegetable", name: "Cucumber" },
    { type: "Fruit", name: "Watermelon" },
    { type: "Vegetable", name: "Carrot" },
  ]

  // Generate IDs for food items
  const initialFoodItems: FoodItem[] = useMemo(() => {
    return originalFoodItems.map((item) => ({
      ...item,
      id: `${item.type}-${item.name}`.toLowerCase().replace(/\s+/g, "-"),
    }))
  }, [])

  // Extract unique types from the data
  const foodTypes = useMemo(() => {
    return Array.from(new Set(initialFoodItems.map((item) => item.type)))
  }, [initialFoodItems])

  // State for uncategorized items
  const [uncategorizedItems, setUncategorizedItems] = useState<FoodItem[]>(initialFoodItems)

  // State for categorized items
  const [categorizedItems, setCategorizedItems] = useState<Map<string, FoodItem[]>>(
    new Map(foodTypes.map((type) => [type, []])),
  )

  // Ref to store timers for each item
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      // Clear all timers when component unmounts
      timersRef.current.forEach((timer) => clearTimeout(timer))
    }
  }, [])

  // Handle moving item to a category
  const handleCategorize = (item: FoodItem) => {
    // Remove from uncategorized items
    setUncategorizedItems((prev) => prev.filter((i) => i.id !== item.id))

    // Add to categorized items with return time
    const returnTime = Date.now() + 5000 // 5 seconds from now
    const itemWithTimer = { ...item, returnTime }

    setCategorizedItems((prev) => {
      const newMap = new Map(prev)
      const currentItems = newMap.get(item.type) || []
      newMap.set(item.type, [...currentItems, itemWithTimer])
      return newMap
    })

    // Set timer to return item to first column
    const timerId = setTimeout(() => {
      returnItemToUncategorized(item)
    }, 5000)

    // Store timer reference
    timersRef.current.set(item.id, timerId)
  }

  // Handle returning item to uncategorized
  const returnItemToUncategorized = (item: FoodItem) => {
    // Clear the timer
    if (timersRef.current.has(item.id)) {
      clearTimeout(timersRef.current.get(item.id))
      timersRef.current.delete(item.id)
    }

    // Remove from categorized items
    setCategorizedItems((prev) => {
      const newMap = new Map(prev)
      const currentItems = newMap.get(item.type) || []
      newMap.set(
        item.type,
        currentItems.filter((i) => i.id !== item.id),
      )
      return newMap
    })

    // Add back to uncategorized items
    setUncategorizedItems((prev) => {
      // Check if item is already in uncategorized to prevent duplicates
      if (prev.some((i) => i.id === item.id)) return prev
      return [...prev, item]
    })
  }

  // Reset all categories
  const resetCategories = () => {
    // Clear all timers
    timersRef.current.forEach((timer) => clearTimeout(timer))
    timersRef.current.clear()

    setUncategorizedItems(initialFoodItems)
    setCategorizedItems(new Map(foodTypes.map((type) => [type, []])))
  }

  // Calculate remaining time for an item
  const getRemainingSeconds = (returnTime?: number) => {
    if (!returnTime) return 0
    const remaining = Math.max(0, Math.ceil((returnTime - Date.now()) / 1000))
    return remaining
  }

  // Force component to update every second to show countdown
  const [, setForceUpdate] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setForceUpdate((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold text-center">Food Categorizer</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Uncategorized Items Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Food Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {uncategorizedItems.length > 0 ? (
              uncategorizedItems.map((item) => (
                <Button
                  key={item.id}
                  variant="outline"
                  className="w-full justify-between"
                  onClick={() => handleCategorize(item)}
                >
                  <span>{item.name}</span>
                  <ArrowRightIcon className="h-4 w-4 ml-2" />
                </Button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">All items categorized</p>
            )}
          </CardContent>
        </Card>

        {/* Fruit Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Fruits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {(categorizedItems.get("Fruit") || []).length > 0 ? (
              (categorizedItems.get("Fruit") || []).map((item) => (
                <Button
                  key={item.id}
                  variant="secondary"
                  className="w-full justify-between hover:bg-secondary/80"
                  onClick={() => returnItemToUncategorized(item)}
                >
                  <span>{item.name}</span>
                  <div className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    <span>{getRemainingSeconds(item.returnTime)}s</span>
                    <ArrowLeftIcon className="h-4 w-4 ml-2" />
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No fruits yet</p>
            )}
          </CardContent>
        </Card>

        {/* Vegetable Column */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Vegetables</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-[500px] overflow-y-auto">
            {(categorizedItems.get("Vegetable") || []).length > 0 ? (
              (categorizedItems.get("Vegetable") || []).map((item) => (
                <Button
                  key={item.id}
                  variant="secondary"
                  className="w-full justify-between hover:bg-secondary/80"
                  onClick={() => returnItemToUncategorized(item)}
                >
                  <span>{item.name}</span>
                  <div className="flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    <span>{getRemainingSeconds(item.returnTime)}s</span>
                    <ArrowLeftIcon className="h-4 w-4 ml-2" />
                  </div>
                </Button>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">No vegetables yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center mt-8">
        <Button onClick={resetCategories}>Reset All</Button>
      </div>
    </div>
  )
}
