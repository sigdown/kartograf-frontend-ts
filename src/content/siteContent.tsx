import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { defaultSiteContent } from './defaultContent'
import type { SiteContent, SiteContentInput } from './types'

const SiteContentContext = createContext<SiteContent>(defaultSiteContent)

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function mergeDeep<T>(base: T, override: unknown): T {
  if (!isObject(base) || !isObject(override)) {
    return override === undefined ? base : (override as T)
  }

  const result: Record<string, unknown> = {
    ...base,
  }

  for (const [key, value] of Object.entries(override)) {
    const current = result[key]

    if (Array.isArray(value)) {
      result[key] = value
      continue
    }

    if (isObject(current) && isObject(value)) {
      result[key] = mergeDeep(current, value)
      continue
    }

    if (value !== undefined) {
      result[key] = value
    }
  }

  return result as T
}

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [runtimeContent, setRuntimeContent] = useState<SiteContentInput | null>(null)

  useEffect(() => {
    let isMounted = true

    async function loadRuntimeContent() {
      try {
        const response = await fetch('/content/site-config.json', {
          cache: 'no-store',
        })

        if (!response.ok) {
          return
        }

        const data = (await response.json()) as SiteContentInput

        if (isMounted) {
          setRuntimeContent(data)
        }
      } catch {
        // ok?
      }
    }

    void loadRuntimeContent()

    return () => {
      isMounted = false
    }
  }, [])

  const value = useMemo(
    () => mergeDeep(defaultSiteContent, runtimeContent ?? {}),
    [runtimeContent],
  )

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent() {
  return useContext(SiteContentContext)
}