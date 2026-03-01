"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { getCategoriesWithStats } from "@/actions/categories";
import { getBudgets } from "@/actions/budgets";
import { BudgetFormDialog } from "@/components/budgets/budget-form-dialog";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Wallet } from "lucide-react";

type CategoryWithStats = {
  id: string;
  name: string;
  color: string;
  icon: string | null;
  transactionCount: number;
  totalAmount: number;
};

export function CategoriesContent() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editCat, setEditCat] = useState<CategoryWithStats | null>(null);
  const [deleteCat, setDeleteCat] = useState<CategoryWithStats | null>(null);
  const [budgetCat, setBudgetCat] = useState<CategoryWithStats | null>(null);
  const [budgetMap, setBudgetMap] = useState<Map<string, { monthlyLimit: number; alertThreshold: number }>>(new Map());

  const loadData = useCallback(async () => {
    setLoading(true);
    const [data, budgets] = await Promise.all([
      getCategoriesWithStats(),
      getBudgets(),
    ]);
    setCategories(data);
    const bMap = new Map<string, { monthlyLimit: number; alertThreshold: number }>();
    for (const b of budgets) {
      bMap.set(b.categoryId, {
        monthlyLimit: Number(b.monthlyLimit),
        alertThreshold: b.alertThreshold,
      });
    }
    setBudgetMap(bMap);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Categories</h2>
          <p className="text-muted-foreground">
            {categories.length} categories
          </p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Card key={cat.id} className="group relative">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: cat.color }}
                    />
                    <div>
                      <h3 className="font-semibold capitalize">{cat.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {cat.transactionCount} transactions
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditCat(cat)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeleteCat(cat)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <p className="text-lg font-bold">
                    {formatCurrency(cat.totalAmount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 gap-1 text-xs text-muted-foreground"
                    onClick={() => setBudgetCat(cat)}
                  >
                    <Wallet className="h-3 w-3" />
                    {budgetMap.has(cat.id)
                      ? `${formatCurrency(budgetMap.get(cat.id)!.monthlyLimit)}/mo`
                      : "Set Budget"}
                  </Button>
                </div>
                {budgetMap.has(cat.id) && (
                  <div className="mt-2 h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cat.totalAmount / budgetMap.get(cat.id)!.monthlyLimit >= 1
                          ? "bg-red-500"
                          : cat.totalAmount / budgetMap.get(cat.id)!.monthlyLimit >= 0.8
                            ? "bg-orange-500"
                            : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(
                          (cat.totalAmount / budgetMap.get(cat.id)!.monthlyLimit) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <CategoryFormDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={loadData}
        />
      )}

      {editCat && (
        <CategoryFormDialog
          category={editCat}
          open={!!editCat}
          onOpenChange={(open) => !open && setEditCat(null)}
          onSuccess={loadData}
        />
      )}

      {deleteCat && (
        <DeleteCategoryDialog
          category={deleteCat}
          allCategories={categories}
          open={!!deleteCat}
          onOpenChange={(open) => !open && setDeleteCat(null)}
          onSuccess={loadData}
        />
      )}

      {budgetCat && (
        <BudgetFormDialog
          categoryId={budgetCat.id}
          categoryName={budgetCat.name}
          existingLimit={budgetMap.get(budgetCat.id)?.monthlyLimit}
          existingThreshold={budgetMap.get(budgetCat.id)?.alertThreshold}
          open={!!budgetCat}
          onOpenChange={(open) => !open && setBudgetCat(null)}
          onSuccess={loadData}
        />
      )}
    </div>
  );
}
