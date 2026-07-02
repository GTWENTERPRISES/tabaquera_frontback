"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface ReportCardItem {
  href: string
  title: string
  description: string
  icon: LucideIcon
}

interface ReportCardsProps {
  items: ReportCardItem[]
}

export function ReportCards({ items }: ReportCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {items.map((item, index) => {
        const Icon = item.icon

        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link href={item.href}>
              <Card className="h-full border-0 shadow-sm transition-transform hover:-translate-y-0.5">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <CardTitle>{item.title}</CardTitle>
                  <CardDescription>{item.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
