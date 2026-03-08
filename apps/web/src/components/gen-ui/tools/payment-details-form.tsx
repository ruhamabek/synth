"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { useAgentActions } from "../hooks/use-agent-actions"
import { CreditCard, Lock } from "lucide-react"

export interface PaymentDetailsFormProps {
    title?: string
    description?: string
    amount?: number
    currency?: string
    className?: string
}

export function PaymentDetailsForm({
    title = "Payment Details",
    description = "Enter your card information to complete the purchase.",
    amount,
    currency = "USD",
    className,
}: PaymentDetailsFormProps) {
    const { callTool } = useAgentActions()
    const [formData, setFormData] = useState({
        cardName: "",
        cardNumber: "",
        expiry: "",
        cvv: "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target
        setFormData((prev) => ({ ...prev, [id]: value }))
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        callTool("processPayment", {
            ...formData,
            amount,
            currency,
        })
    }

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency,
        }).format(val)
    }

    return (
        <Card className={cn("w-full max-w-md mx-auto", className)}>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        {title}
                    </CardTitle>
                    {description && <CardDescription>{description}</CardDescription>}
                </CardHeader>
                <CardContent className="space-y-4">
                    {amount !== undefined && (
                        <div className="bg-muted p-3 rounded-md flex justify-between items-center mb-4">
                            <span className="text-sm font-medium">Total Amount</span>
                            <span className="text-lg font-bold">{formatCurrency(amount)}</span>
                        </div>
                    )}
                    <div className="space-y-2">
                        <Label htmlFor="cardName">Name on Card</Label>
                        <Input
                            id="cardName"
                            placeholder="John Doe"
                            required
                            value={formData.cardName}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                            id="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            required
                            value={formData.cardNumber}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                                id="expiry"
                                placeholder="MM/YY"
                                required
                                value={formData.expiry}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                                id="cvv"
                                placeholder="123"
                                required
                                value={formData.cvv}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <Button type="submit" className="w-full">
                        Pay {amount !== undefined ? formatCurrency(amount) : "Now"}
                    </Button>
                    <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                        <Lock className="h-3 w-3" />
                        Secure encrypted payment
                    </div>
                </CardFooter>
            </form>
        </Card>
    )
}
