import { courseApi } from "@/api/courseApi";
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
import { useEffect } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import Spinner from "../spinner";

const pages = [
  { id: "all-courses", title: "All Courses", path: "/all-courses" },
  { id: "account", title: "My Account", path: "/my-account" },
  { id: "my-courses", title: "My Courses", path: "/my-courses" },
  { id: "dashboard", title: "Student Dashboard", path: "/dashboard" },
  { id: "quizzes", title: "Quizzes", path: "/quizzes" },
  { id: "sandbox", title: "Playground Sandbox", path: "/sandbox" },
  { id: "leaderboard", title: "Leaderboard", path: "/leaderboard" },
  { id: "forums", title: "Community Forums", path: "/forums" },
  { id: "study-groups", title: "Study Groups", path: "/study-groups" },
  { id: "peer-reviews", title: "Peer Reviews", path: "/peer-reviews" },
  { id: "announcements", title: "Announcements & Updates", path: "/announcements" },
  { id: "calendar", title: "Planner & Deadlines Calendar", path: "/productivity/calendar" },
  { id: "resources", title: "Downloadable Handouts & PDF Resources", path: "/productivity/resources" },
  { id: "watch-later", title: "Watch Later Queue", path: "/productivity/watch-later" },
  { id: "search", title: "Global Knowledge Search", path: "/search" },
];

const CommandMenu = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { isPending, data = [], mutate } = courseApi.useSearchCourses();

  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(query.toLowerCase()),
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = query.trim();
      if (trimmed) {
        mutate(trimmed);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, mutate]);

  useEffect(() => {
    const down = (event) => {
      if (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", down);

    return () => {
      window.removeEventListener("keydown", down);
    };
  }, []);

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
          <CommandInput
            placeholder="Search pages,courses..."
            value={query}
            onValueChange={(value) => setQuery(value)}
          />
          <CommandList>
            {isPending && (
              <div className="flex items-center justify-center">
                <Spinner /> Searching...
              </div>
            )}

            {!isPending && filteredPages.length === 0 && data.length === 0 && (
              <CommandEmpty>No results found.</CommandEmpty>
            )}

            {data?.length > 0 && (
              <CommandGroup heading="Courses" className="p-4 ">
                {data.map((course) => (
                  <CommandItem
                    key={course.id}
                    value={course.title}
                    onSelect={() => {
                      navigate(`/all-courses/${course._id}`);
                      setOpen(false);
                    }}
                  >
                    {course.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {filteredPages.length > 0 && (
              <CommandGroup heading="Pages" className="p-4 ">
                {filteredPages.map((p) => (
                  <CommandItem
                    onSelect={() => {
                      navigate(p.path);
                      setOpen(false);
                    }}
                    value={p.title}
                    key={p.id}
                    className="cursor-pointer p-2"
                  >
                    {p.title}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
};

export default CommandMenu;
