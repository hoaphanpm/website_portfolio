"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { createCase } from "./actions";
import { createCaseInitialState } from "./types";

export function NewCaseForm() {
  const [state, formAction, isPending] = useActionState(
    createCase,
    createCaseInitialState,
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <div className="flex-1 space-y-2">
        <Label htmlFor="case_name">New case name</Label>
        <Input
          id="case_name"
          name="case_name"
          required
          placeholder="e.g. VPBank Debt Management"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Creating…" : "Create case"}
      </Button>
      {state.error ? (
        <p className="text-sm text-destructive sm:self-center" role="alert">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
