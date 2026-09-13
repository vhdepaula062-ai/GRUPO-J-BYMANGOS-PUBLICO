"use client";

import React, { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterBar } from "@grupo-j/ui-web";

interface Props {
  defaultValue: string;
}

export function OficinaSearchBar({ defaultValue }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const handleSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set("q", value);
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    },
    [router, pathname, searchParams]
  );

  return (
    <FilterBar
      searchPlaceholder="Buscar por nome fantasia, razão social ou e-mail..."
      searchValue={defaultValue}
      onSearchChange={handleSearch}
      onClearSearch={() => handleSearch("")}
    />
  );
}
