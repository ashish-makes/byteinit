'use client'

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface DeleteResourceButtonProps {
  resourceId: string
  deleteResource: (id: string) => Promise<{ success: boolean; error?: string }>
}

export function DeleteResourceButton({ resourceId, deleteResource }: DeleteResourceButtonProps) {
  const [isPending, setIsPending] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    try {
      setIsPending(true)
      const result = await deleteResource(resourceId)
      
      if (result.success) {
        toast.success("Resource deleted successfully", {
          description: "The resource has been permanently removed.",
          duration: 3000,
        })
        router.refresh()
      } else {
        toast.error("Failed to delete resource", {
          description: result.error || "Something went wrong. Please try again.",
        })
      }
    } catch {
      toast.error("An unexpected error occurred", {
        description: "Please try again later.",
      })
    } finally {
      setIsPending(false)
      setIsOpen(false)
    }
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 hover:bg-muted hover:text-destructive"
          disabled={isPending}
        >
          <Trash2 className={`h-4 w-4 ${isPending ? 'animate-pulse' : ''}`} />
          <span className="sr-only">Delete resource</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            resource and remove it from our servers.
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
  )
} 