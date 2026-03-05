"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { SavingsFormDialog } from "@/components/savings/savings-form-dialog";
import { AddSavingsDialog } from "@/components/savings/add-savings-dialog";
import { deleteSavingsGoal } from "@/actions/savings";
import { formatCurrency } from "@/lib/utils";
import type { SavingsProgress } from "@/lib/types";
import { Plus, Pencil, Trash2, PlusCircle, Target } from "lucide-react";
import { toast } from "sonner";

export function SavingsGoalsSection({
  goals,
  onRefresh,
}: {
  goals: SavingsProgress[];
  onRefresh: () => void;
}) {
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState<SavingsProgress | undefined>();
  const [addItem, setAddItem] = useState<SavingsProgress | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<SavingsProgress | null>(null);

  const handleDelete = async (id: string) => {
    setDeleteConfirm(null);
    await deleteSavingsGoal(id);
    toast.success("Savings goal deleted");
    onRefresh();
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Target className="h-5 w-5" />
          Savings Goals
        </h3>
        <Button size="sm" variant="outline" onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No savings goals yet. Create one to start tracking!
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {activeGoals.map((goal) => (
            <SavingsGoalCard
              key={goal.id}
              goal={goal}
              onEdit={() => setEditItem(goal)}
              onDelete={() => setDeleteConfirm(goal)}
              onAdd={() => setAddItem(goal)}
            />
          ))}
          {completedGoals.length > 0 && (
            <>
              <p className="text-sm text-muted-foreground pt-2">
                Completed
              </p>
              {completedGoals.map((goal) => (
                <SavingsGoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={() => setEditItem(goal)}
                  onDelete={() => setDeleteConfirm(goal)}
                  onAdd={() => setAddItem(goal)}
                />
              ))}
            </>
          )}
        </div>
      )}

      {showCreate && (
        <SavingsFormDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={onRefresh}
        />
      )}

      {editItem && (
        <SavingsFormDialog
          goal={editItem}
          open={!!editItem}
          onOpenChange={(open) => !open && setEditItem(undefined)}
          onSuccess={onRefresh}
        />
      )}

      {addItem && (
        <AddSavingsDialog
          goal={addItem}
          open={!!addItem}
          onOpenChange={(open) => !open && setAddItem(undefined)}
          onSuccess={onRefresh}
        />
      )}

      <ResponsiveDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Delete Savings Goal</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <p className="text-sm text-muted-foreground px-1">
            Are you sure you want to delete{" "}
            <span className="font-medium text-foreground">{deleteConfirm?.name}</span>?
            This cannot be undone.
          </p>
          <ResponsiveDialogFooter>
            <div className="flex w-full gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => deleteConfirm && handleDelete(deleteConfirm.id)}
              >
                Delete
              </Button>
            </div>
          </ResponsiveDialogFooter>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </section>
  );
}

function SavingsGoalCard({
  goal,
  onEdit,
  onDelete,
  onAdd,
}: {
  goal: SavingsProgress;
  onEdit: () => void;
  onDelete: () => void;
  onAdd: () => void;
}) {
  const isCompleted = goal.status === "completed";

  return (
    <Card className={isCompleted ? "opacity-60" : ""}>
      <CardContent className="pt-4 pb-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="h-2.5 w-2.5 rounded-full shrink-0"
            style={{ backgroundColor: goal.color }}
          />
          <h4 className="font-semibold">{goal.name}</h4>
          {isCompleted && (
            <Badge variant="secondary" className="text-xs">
              Completed
            </Badge>
          )}
          {goal.deadline && (
            <Badge variant="outline" className="text-xs">
              Due {new Date(goal.deadline).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Badge>
          )}
        </div>

        {/* Amount + progress */}
        <div>
          <p className="text-lg font-bold">
            {formatCurrency(goal.currentAmount, goal.currency)}{" "}
            <span className="text-sm font-normal text-muted-foreground">
              / {formatCurrency(goal.targetAmount, goal.currency)}
            </span>
          </p>
          <div className="space-y-1 mt-1">
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(goal.percentage, 100)}%`,
                  backgroundColor: goal.color,
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{goal.percentage}%</p>
          </div>
        </div>

        {/* Description */}
        {goal.description && (
          <p className="text-xs text-muted-foreground">{goal.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-1 border-t pt-2">
          {!isCompleted && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs mr-auto"
              onClick={onAdd}
            >
              <PlusCircle className="mr-1 h-3 w-3" />
              Add Funds
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
