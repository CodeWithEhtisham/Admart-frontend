import { useEffect } from 'react'
import api from './api'

export async function listPosts() {
  const { data } = await api.get('/api/blog')
  return data
}

export async function getPost(slug) {
  const { data } = await api.get(`/api/blog/${encodeURIComponent(slug)}`)
  return data
}

export const postDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : ''

/** Page title and search description for a public page; restored when leaving it. */
export function usePageMeta(title, description) {
  useEffect(() => {
    if (!title) return undefined
    const meta = document.querySelector('meta[name="description"]') || document.head.appendChild(document.createElement('meta'))
    meta.setAttribute('name', 'description')
    const before = [document.title, meta.getAttribute('content')]
    document.title = `${title} · Admart`
    meta.setAttribute('content', description || '')
    return () => {
      document.title = before[0]
      if (before[1] == null) meta.removeAttribute('content')
      else meta.setAttribute('content', before[1])
    }
  }, [title, description])
}
