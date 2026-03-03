"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { SavingsProgress } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";
import { PiggyBank, Plus, Pencil, PlusCircle } from "lucide-react";
import { SavingsFormDialog } from "@/components/savings/savings-form-dialog";
import { AddSavingsDialog } from "@/components/savings/add-savings-dialog";

export function SavingsCard({
  data,
  onRefresh,
}: {
  data: SavingsProgress[];
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingsProgress | undefined>();
  const [addGoal, setAddGoal] = useState<SavingsProgress | undefined>();

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <PiggyBank className="h-4 w-4" />
              Savings Goals
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => setShowCreate(true)}
            >
              <Plus className="h-3.5 w-3.5" />
              New Goal
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              🎯 No savings goals yet. Create one to start tracking!
            </p>
          ) : (
            data.map((goal) => (
              <div key={goal.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: goal.color }}
                    />
                    <span className="font-medium">{goal.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground text-xs">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      title="Add to goal"
                      onClick={() => setAddGoal(goal)}
                    >
                      <PlusCircle className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      title="Edit goal"
                      onClick={() => setEditGoal(goal)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(goal.percentage, 100)}%`,
                      backgroundColor: goal.color,
                    }}
                  />
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-muted-foreground">
                    {goal.deadline
                      ? `Due ${new Date(goal.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
                      : "No deadline"}
                  </span>
                  <span className="text-xs text-muted-foreground">{goal.percentage}%</span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {showCreate && (
        <SavingsFormDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={onRefresh}
        />
      )}

      {editGoal && (
        <SavingsFormDialog
          goal={editGoal}
          open={!!editGoal}
          onOpenChange={(open) => !open && setEditGoal(undefined)}
          onSuccess={onRefresh}
        />
      )}

      {addGoal && (
        <AddSavingsDialog
          goal={addGoal}
          open={!!addGoal}
          onOpenChange={(open) => !open && setAddGoal(undefined)}
          onSuccess={onRefresh}
        />
      )}
    </>
  );
}
