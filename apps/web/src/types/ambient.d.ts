// Ambient type declarations for Next.js, TanStack Query, and Tailwind utilities

declare module 'next' {
  export interface Metadata {
    title?: string | { default: string; template: string };
    description?: string;
    [key: string]: unknown;
  }
}

declare module 'next/link' {
  import React from 'react';
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string;
    replace?: boolean;
    scroll?: boolean;
    prefetch?: boolean;
    children?: React.ReactNode;
  }
  const Link: React.FC<LinkProps>;
  export default Link;
}

declare module 'next/navigation' {
  export interface AppRouterInstance {
    back(): void;
    forward(): void;
    refresh(): void;
    push(href: string): void;
    replace(href: string): void;
    prefetch(href: string): void;
  }
  export function useRouter(): AppRouterInstance;
  export function usePathname(): string;
  export function useSearchParams(): URLSearchParams;
}

declare module '@tanstack/react-query' {
  export interface QueryOptions<T> {
    queryKey: unknown[];
    queryFn: () => Promise<T>;
    initialData?: T;
  }
  export interface QueryResult<T> {
    data: T | undefined;
    isLoading: boolean;
    isError: boolean;
    error: unknown;
  }
  export function useQuery<T>(options: QueryOptions<T>): QueryResult<T>;

  export interface MutationOptions<TData, TVariables, TContext = unknown> {
    mutationFn: (variables: TVariables) => Promise<TData>;
    onMutate?: (variables: TVariables) => Promise<TContext> | TContext;
    onSuccess?: (data: TData, variables: TVariables, context: TContext) => void;
    onError?: (error: unknown, variables: TVariables, context: TContext | undefined) => void;
    onSettled?: (data: TData | undefined, error: unknown, variables: TVariables, context: TContext | undefined) => void;
  }
  export interface MutationResult<TData, TVariables> {
    mutate: (variables: TVariables) => void;
    isPending: boolean;
    isError: boolean;
  }
  export function useMutation<TData, TVariables, TContext = unknown>(options: MutationOptions<TData, TVariables, TContext>): MutationResult<TData, TVariables>;

  export interface QueryClient {
    invalidateQueries(options: { queryKey: unknown[] }): Promise<void>;
    cancelQueries(options: { queryKey: unknown[] }): Promise<void>;
    getQueryData<T>(queryKey: unknown[]): T | undefined;
    setQueryData<T>(queryKey: unknown[], updater: T | ((old: T | undefined) => T)): void;
  }
  export function useQueryClient(): QueryClient;
}

declare module 'clsx' {
  export type ClassValue = string | number | boolean | undefined | null | { [key: string]: unknown } | ClassValue[];
  export function clsx(...inputs: ClassValue[]): string;
  export default clsx;
}

declare module 'tailwind-merge' {
  export function twMerge(...inputs: unknown[]): string;
}
