"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  BarChart2,
  Edit3,
  ExternalLink,
  Globe2,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { Loader } from "@/components/ui/loader";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppActionsMenuProps {
  appId: string;
  slug: string;
}

export function AppActionsMenu({ appId, slug }: AppActionsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const shouldDelete = window.confirm(`Delete "${slug}"? This action cannot be undone.`);
    if (!shouldDelete) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/apps/${appId}`, { method: "DELETE" });
      const payload = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to delete app.");
      }

      setOpen(false);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to delete app.";
      window.alert(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="icon-sm" variant="outline" className="h-8 w-8 p-0" aria-label={`Actions for ${slug}`}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem asChild>
          <Link
            href={`/dashboard/manage-apps/${appId}/edit`}
            className="flex w-full items-center gap-2"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/analytics?appId=${appId}`} className="flex w-full items-center gap-2">
            <BarChart2 className="h-3.5 w-3.5" />
            Analytics
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <a
            href={`/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            View
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/manage-apps/${appId}`} className="flex w-full items-center gap-2">
            <Globe2 className="h-3.5 w-3.5" />
            Domains
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(event) => {
            event.preventDefault();
            if (!isDeleting) {
              void handleDelete();
            }
          }}
          className="text-destructive focus:bg-destructive/10 focus:text-destructive"
          disabled={isDeleting}
        >
          {isDeleting ? (
            <Loader size="sm" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
