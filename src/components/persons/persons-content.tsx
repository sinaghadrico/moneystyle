"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { PersonFormDialog } from "./person-form-dialog";
import { getPersonsWithDebt, deletePerson } from "@/actions/persons";
import { formatCurrency } from "@/lib/utils";
import { Plus, Pencil, Trash2, Phone } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type PersonWithDebt = {
  id: string;
  name: string;
  phone: string | null;
  color: string;
  balance: number;
};

export function PersonsContent() {
  const [persons, setPersons] = useState<PersonWithDebt[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [editPerson, setEditPerson] = useState<PersonWithDebt | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<PersonWithDebt | null>(
    null,
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await getPersonsWithDebt();
    setPersons(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!deletingPerson) return;
    const result = await deletePerson(deletingPerson.id);
    if ("error" in result && result.error) {
      toast.error(String(result.error));
    } else {
      toast.success("Person deleted");
      loadData();
    }
    setDeletingPerson(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Persons</h2>
          <p className="text-muted-foreground">{persons.length} persons</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>
          <Plus className="mr-1 h-4 w-4" />
          Add Person
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {persons.map((p) => (
            <Card key={p.id} className="group relative">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    <div>
                      <Link
                        href={`/persons/${p.id}/summary`}
                        className="font-semibold hover:underline"
                      >
                        {p.name}
                      </Link>
                      {p.phone && (
                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Phone className="h-3 w-3" />
                          {p.phone}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 opacity-100 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => setEditPerson(p)}
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => setDeletingPerson(p)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {p.balance !== 0 && (
                  <p
                    className={`mt-3 text-lg font-bold ${
                      p.balance > 0 ? "text-destructive" : "text-green-600"
                    }`}
                  >
                    {p.balance > 0 ? "Owes " : "Overpaid "}
                    {formatCurrency(Math.abs(p.balance))}
                  </p>
                )}
                {p.balance === 0 && (
                  <p className="mt-3 text-sm text-muted-foreground">
                    Settled up
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <PersonFormDialog
          open={showCreate}
          onOpenChange={setShowCreate}
          onSuccess={() => loadData()}
        />
      )}

      {editPerson && (
        <PersonFormDialog
          person={editPerson}
          open={!!editPerson}
          onOpenChange={(open) => !open && setEditPerson(null)}
          onSuccess={() => loadData()}
        />
      )}

      {deletingPerson && (
        <AlertDialog
          open={!!deletingPerson}
          onOpenChange={(open) => !open && setDeletingPerson(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete {deletingPerson.name}?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove the person. Existing transaction splits will
                keep their amounts but lose the person reference.
                {deletingPerson.balance !== 0 && (
                  <>
                    {" "}
                    This person has an outstanding balance of{" "}
                    {formatCurrency(Math.abs(deletingPerson.balance))}.
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
