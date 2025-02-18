import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function BlogTableSkeleton() {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <Table>
        <TableHeader className="bg-gradient-to-b from-muted/10 to-muted/5">
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-10 w-[45%]">Article</TableHead>
            <TableHead className="h-10">Engagement</TableHead>
            <TableHead className="h-10">Created</TableHead>
            <TableHead className="h-10 w-[90px] text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...Array(5)].map((_, i) => (
            <TableRow key={i} className="hover:bg-transparent">
              <TableCell className="py-2">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-[180px]" />
                    <Skeleton className="h-3 w-[120px]" />
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-16 rounded-md" />
                  <Skeleton className="h-7 w-16 rounded-md" />
                </div>
              </TableCell>
              <TableCell className="py-2">
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell className="py-2">
                <div className="flex items-center justify-end gap-1">
                  <Skeleton className="h-7 w-7 rounded-md" />
                  <Skeleton className="h-7 w-7 rounded-md" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
} 