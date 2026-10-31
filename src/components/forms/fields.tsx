import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Field({
  id,
  label,
  error,
  required,
  hint,
  children,
  className,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
        {required ? <span className="ml-0.5 text-destructive">*</span> : <span className="ml-1 text-xs font-normal text-muted-foreground">(optional)</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function ConsentCheckbox({
  id,
  checked,
  onChange,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children?: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 rounded-lg border bg-muted/50 p-3 text-sm">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-primary)]"
          aria-invalid={!!error}
        />
        <span className="text-muted-foreground">
          {children ?? (
            <>
              I agree that Arise Ashaiman Foundation may store and use the information I have provided for the purpose
              stated, in line with its{" "}
              <Link to="/privacy" className="font-semibold text-primary underline underline-offset-2">
                privacy notice
              </Link>
              .
            </>
          )}
        </span>
      </label>
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmitButton({ loading, children }: { loading: boolean; children: ReactNode }) {
  return (
    <Button type="submit" variant="default" size="lg" disabled={loading} className="w-full sm:w-auto">
      {loading && <Loader2 className="animate-spin" />}
      {loading ? "Submitting…" : children}
    </Button>
  );
}

export function SuccessPanel({
  title,
  children,
  onReset,
}: {
  title: string;
  children?: ReactNode;
  onReset?: () => void;
}) {
  return (
    <div role="status" className="rounded-2xl border border-success/30 bg-success/10 p-8 text-center">
      <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-success" />
      <h3 className="text-xl font-bold text-primary">{title}</h3>
      {children && <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{children}</p>}
      {onReset && (
        <Button variant="outline" className="mt-5" onClick={onReset}>
          Submit another response
        </Button>
      )}
    </div>
  );
}

export const inputClass = "h-11 bg-background";
