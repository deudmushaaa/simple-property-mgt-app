'use client'

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

const CommandContext = React.createContext<{ search: string; onSearch: (search: string) => void; } | undefined>(undefined);

const Command = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { children: React.ReactNode }>(({ className, children, ...props }, ref) => {
  const [search, setSearch] = React.useState('');
  return (
    <CommandContext.Provider value={{ search, onSearch: setSearch }}>
      <div
        ref={ref}
        className={cn(
          "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </CommandContext.Provider>
  );
});
Command.displayName = "Command"

const CommandDialog = ({ children, ...props }: DialogProps & { children: React.ReactNode }) => {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 shadow-lg">
        <Command>
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  )
}

const CommandInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error("CommandInput must be used within a Command");
  }
  return (
    <div className="flex items-center border-b px-3">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        ref={ref}
        value={context.search}
        onChange={(e) => context.onSearch(e.target.value)}
        className={cn(
          "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
});
CommandInput.displayName = "CommandInput";


const CommandList = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
))
CommandList.displayName = "CommandList"

const CommandEmpty = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => (
    <div ref={ref} className="py-6 text-center text-sm" {...props} />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "overflow-hidden p-1 text-foreground [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground",
      className
    )}
    {...props}
  />
))
CommandGroup.displayName = "CommandGroup"

const CommandSeparator = React.forwardRef<HTMLHRElement, React.HTMLAttributes<HTMLHRElement>>(({ className, ...props }, ref) => (
    <hr ref={ref} className={cn("-mx-1 h-px bg-border", className)} {...props} />
));
CommandSeparator.displayName = "CommandSeparator";

const CommandItem = React.forwardRef<
    HTMLDivElement, 
    React.HTMLAttributes<HTMLDivElement> & { onSelect?: (value: string) => void; value?: string; disabled?: boolean; }
>(({ className, onSelect, value, children, ...props }, ref) => {
  const context = React.useContext(CommandContext);
  if (!context) {
    throw new Error("CommandItem must be used within a Command");
  }

  if (context.search && !String(children).toLowerCase().includes(context.search.toLowerCase())) {
    return null;
  }

  return (
    <div
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground data-[disabled='true']:pointer-events-none data-[disabled='true']:opacity-50",
            className
        )}
        onClick={() => onSelect && value && onSelect(value)}
        {...props}
    >
        {children}
    </div>
  );
});
CommandItem.displayName = "CommandItem";


const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ml-auto text-xs tracking-widest text-muted-foreground",
        className
      )}
      {...props}
    />
  )
}
CommandShortcut.displayName = "CommandShortcut"

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  CommandShortcut,
}