'use client'

import { useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Check, Loader2 } from 'lucide-react'
import { PlanType } from '@/types'
import { formatPrice } from '@/lib/utils'
import { useToast } from '@/hooks/use-toast'

interface PricingCardProps {
  planType: PlanType
  name: string
  price: number
  period?: string
  features: string[]
  popular?: boolean
}

export function PricingCard({ 
  planType, 
  name, 
  price, 
  period,
  features, 
  popular 
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleSubscribe = async () => {
    setLoading(true)

    try {
      const response = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '创建支付失败')
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      toast({
        title: '创建支付失败',
        description: error.message,
        variant: 'destructive',
      })
      setLoading(false)
    }
  }

  return (
    <Card className={popular ? 'border-2 border-blue-500 shadow-lg' : ''}>
      {popular && (
        <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium rounded-t-lg">
          最受欢迎
        </div>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{name}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(price)}
          </span>
          {period && (
            <span className="text-gray-600 ml-2">
              / {period}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full"
          variant={popular ? 'default' : 'outline'}
        >
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {loading ? '处理中...' : '立即订阅'}
        </Button>
      </CardFooter>
    </Card>
  )
}


