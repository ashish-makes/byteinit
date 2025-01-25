"use client";

import React from "react"; // Import React
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";

export function DynamicBreadcrumbs() {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(Boolean); // Split the path and remove empty strings

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/" className="hover:underline">
              Home
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {paths.map((path, index) => {
          const href = `/${paths.slice(0, index + 1).join("/")}`;
          const isLast = index === paths.length - 1;
          const label = path.charAt(0).toUpperCase() + path.slice(1); // Capitalize the label

          return (
            <React.Fragment key={href}>
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbLink className="font-medium text-neutral-900 dark:text-white">
                    {label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href} className="hover:underline">
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}