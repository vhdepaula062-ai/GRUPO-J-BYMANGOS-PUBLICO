"use client";

import React, { useCallback, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FilterBar } from "@grupo-j/ui-web";

interface Props {
  defaultValue: string;
}

export function ClienteSearchBar({ defaultValue }: Props) {
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
      searchPlaceholder="Buscar por nome, e-mail ou CPF mascarado..."
      searchValue={defaultValue}
      onSearchChange={handleSearch}
      onClearSearch={() => handleSearch("")}
    />
  );
}
