import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
  CommandGroup,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

const CommandMenu = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="relative w-[30vw]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="What are you looking for..."
          className="pl-10 shadow-none rounded-sm"
          onFocus={() => setOpen(true)}
        />

        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 rounded border px-1.5 py-0.5 text-xs text-muted-foreground">
          Ctrl K
        </kbd>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput placeholder="Search courses..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Pages">
              <CommandItem>Course 1</CommandItem>
              <CommandItem>Course 2</CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

export default CommandMenu;
