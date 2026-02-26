import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownRight, DollarSign, Activity, CreditCard, Users } from "lucide-react"

interface StatsCardProps {
    title: string
    value: string
    trend: string
    trendDirection: "up" | "down"
    subtext: string
    icon?: React.ElementType
}

export function StatsCard({ title, value, trend, trendDirection, subtext, icon: Icon }: StatsCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <span className={`flex items-center ${trendDirection === 'up' ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} px-1.5 py-0.5 rounded mr-2`}>
                        {trendDirection === 'up' ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                        {trend}
                    </span>
                    <span>{subtext}</span>
                </div>
            </CardContent>
        </Card>
    )
}
