"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryFormDialog } from "./category-form-dialog";
import { DeleteCategoryDialog } from "./delete-category-dialog";
import { getCategoriesWithStats } from "@/actions/categories";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";

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

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getCategoriesWithStats();
    setCategories(data);
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
                <p className="mt-3 text-lg font-bold">
                  {formatCurrency(cat.totalAmount)}
                </p>
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
    </div>
  );
}
