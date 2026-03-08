"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useAgentActions } from "../hooks/use-agent-actions"
import { ShoppingCart } from "lucide-react"

export interface Product {
    id: string
    name: string
    description?: string
    price: number
    imageUrl?: string
    category?: string
    inStock?: boolean
}

export interface ProductCatalogGridProps {
    title: string
    description?: string
    products: Product[]
    currency?: string
    className?: string
}

export function ProductCatalogGrid({
    title,
    description,
    products,
    currency = "USD",
    className,
}: ProductCatalogGridProps) {
    const { callTool } = useAgentActions()

    const handleAddToCart = (product: Product) => {
        callTool("selectProduct", { product })
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(price)
    }

    return (
        <div className={cn("space-y-6", className)}>
            <div className="flex flex-col gap-1">
                <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                {description && <p className="text-muted-foreground">{description}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.map((product) => (
                    <Card key={product.id} className="flex flex-col overflow-hidden h-full">
                        <div className="aspect-square bg-muted relative">
                            {product.imageUrl ? (
                                <img
                                    src={product.imageUrl}
                                    alt={product.name}
                                    className="object-cover w-full h-full transition-transform hover:scale-105"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                    No Image
                                </div>
                            )}
                            {product.category && (
                                <Badge className="absolute top-2 left-2" variant="secondary">
                                    {product.category}
                                </Badge>
                            )}
                        </div>
                        <CardHeader className="p-4">
                            <CardTitle className="text-lg">{product.name}</CardTitle>
                            {product.description && (
                                <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="p-4 pt-0 mt-auto">
                            <div className="text-xl font-bold">{formatPrice(product.price)}</div>
                        </CardContent>
                        <CardFooter className="p-4 pt-0">
                            <Button
                                className="w-full"
                                disabled={product.inStock === false}
                                onClick={() => handleAddToCart(product)}
                            >
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                {product.inStock === false ? "Out of Stock" : "Add to Cart"}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    )
}
