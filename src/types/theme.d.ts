declare module 'next-themes' {
  export function useTheme(): {
    theme: string | undefined;
    setTheme: (theme: string) => void;
    resolvedTheme: string | undefined;
  };
}
