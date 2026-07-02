"use client";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TopSupplierItem {
  supplier: string;
  lots: number;
  weight: number;
  percentage: number;
}

interface ProductionTopSuppliersProps {
  topSuppliers: TopSupplierItem[];
}

export function ProductionTopSuppliers({
  topSuppliers,
}: ProductionTopSuppliersProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Proveedores Principales</CardTitle>
        <CardDescription>
          Top 5 proveedores por volumen entregado
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topSuppliers.map((supplier, index) => (
            <motion.div
              key={supplier.supplier}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="font-bold text-primary">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {supplier.supplier}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.lots} lotes
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-foreground">
                  {supplier.weight.toLocaleString()} kg
                </p>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-32 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${supplier.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {supplier.percentage}%
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
