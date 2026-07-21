import { Filter, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

interface FilterDrawerProps {
  title?: string;
  children: ReactNode;
  activeCount?: number;
  onApply?: () => void;
  onReset?: () => void;
  triggerLabel?: string;
}

export function FilterDrawer({
  title = "Filters",
  children,
  activeCount = 0,
  onApply,
  onReset,
  triggerLabel = "Filters",
}: FilterDrawerProps) {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1.5">
          <Filter className="h-3.5 w-3.5" />
          {triggerLabel}
          {activeCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-4 px-1.5 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[380px] overflow-y-auto sm:w-[420px]">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            {title}
            {activeCount > 0 && (
              <span className="text-xs font-normal text-muted-foreground">
                {activeCount} active
              </span>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-6">{children}</div>
        <SheetFooter className="mt-8 flex flex-row gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="flex-1"
            onClick={() => {
              onReset?.();
            }}
          >
            <X className="mr-1.5 h-3.5 w-3.5" />
            Reset
          </Button>
          <Button
            size="sm"
            className="flex-1"
            onClick={() => {
              onApply?.();
              setOpen(false);
            }}
          >
            Apply filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
