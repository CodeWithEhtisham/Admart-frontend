import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CtaBand, PageHero, PillButton, SiteFooter, SiteHeader } from '../components/SiteChrome'
import { listPosts, postDate, usePageMeta } from '../utils/blog'

const TINTS = ['#3B82F6', '#8B5CF6', '#22C55E', '#0ea5e9'] // the landing page's feature tile colours

/** A post as a landing-style tile: cover image, colour fade, title on top. */
function PostTile({ post, index, big }) {
  const tint = TINTS[index % TINTS.length]
  return (
    <Link
      to={`/blog/${post.slug}`}
      className={`group relative flex items-end overflow-hidden rounded-lg p-5 transition-transform duration-300 hover:-translate-y-1 sm:p-6 ${
        big ? 'min-h-[360px] lg:col-span-2 lg:min-h-[420px]' : 'min-h-[300px]'
      }`}
      style={post.coverUrl ? undefined : { background: `linear-gradient(135deg, #111 0%, ${tint} 160%)` }}
    >
      {post.coverUrl ? (
        <img
          src={post.coverUrl}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      ) : null}
      <div
        className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-40"
        style={{ background: `linear-gradient(180deg, transparent 0%, ${tint} 120%)` }}
      />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/90 to-transparent" />
      <div className="relative z-10">
        <p className="text-xs font-medium uppercase tracking-widest text-white/70">{postDate(post.publishedAt)}</p>
        <h2 className={`mt-2 font-heading font-bold leading-tight text-white ${big ? 'text-2xl sm:text-3xl' : 'text-xl'}`}>
          {post.title}
        </h2>
        {post.summary ? <p className="mt-2 line-clamp-2 max-w-[48em] text-sm text-white/80">{post.summary}</p> : null}
      </div>
    </Link>
  )
}

export default function BlogPage() {
  const [posts, setPosts] = useState(null)
  const [error, setError] = useState(false)
  usePageMeta('Blog', 'Guides and ideas for creating social media videos with AI: Shorts, editing, captions and posting.')

  useEffect(() => {
    listPosts()
      .then(setPosts)
      .catch(() => setError(true))
  }, [])

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-body text-white">
      <SiteHeader active="blog" />
      <main id="main-content">
        <PageHero
          eyebrow="The Admart blog"
          title="Ideas &"
          accent="guides"
          sub="How to create, edit and post social media videos with AI, from people building it."
        />
        <div className="mx-auto max-w-[1600px] px-3 pb-8 sm:px-6 xl:px-10">
          {error ? <p className="text-center text-white/70">Could not load the posts. Please refresh the page.</p> : null}
          {posts === null && !error ? <p className="text-center text-white/50">Loading…</p> : null}
          {posts && !posts.length ? <p className="text-center text-white/70">No posts yet. Check back soon.</p> : null}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(posts || []).map((p, i) => (
              <PostTile key={p.id} post={p} index={i} big={i === 0} />
            ))}
          </div>
        </div>
        <CtaBand title="Your content." accent="Everywhere." sub="Make it with AI, then post it wherever and whenever you want.">
          <PillButton href="/auth" className="!px-8 !py-4 text-[1rem]">
            Start creating free
          </PillButton>
          <PillButton href="/#pricing" variant="ring" className="!px-8 !py-4 text-[1rem]">
            See pricing
          </PillButton>
        </CtaBand>
      </main>
      <SiteFooter />
    </div>
  )
}
