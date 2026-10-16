import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { PROSE } from '../components/LegalLayout'
import Markdown from '../components/Markdown'
import { CtaBand, PageHero, PillButton, SiteFooter, SiteHeader } from '../components/SiteChrome'
import { getPost, postDate, usePageMeta } from '../utils/blog'

export default function BlogPostPage() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [missing, setMissing] = useState(false)
  usePageMeta(post?.title, post?.summary)

  useEffect(() => {
    let live = true
    getPost(slug)
      .then((p) => live && setPost(p))
      .catch(() => live && setMissing(true))
    return () => {
      live = false
    }
  }, [slug])

  return (
    <div className="min-h-screen overflow-x-hidden bg-black font-body text-white">
      <SiteHeader active="blog" />
      <main id="main-content">
        {missing ? (
          <PageHero eyebrow="Blog" title="Post not" accent="found" sub="This post doesn't exist or is no longer published.">
            <div className="mt-8">
              <PillButton href="/blog">See all posts</PillButton>
            </div>
          </PageHero>
        ) : !post ? (
          <p className="pt-40 text-center text-white/50">Loading…</p>
        ) : (
          <article>
            <PageHero
              eyebrow={[postDate(post.publishedAt), post.author].filter(Boolean).join(' · ')}
              title={post.title}
              sub={post.summary}
            />
            <div className="mx-auto max-w-3xl px-3 sm:px-6">
              {post.coverUrl ? <img src={post.coverUrl} alt="" className="mb-12 w-full rounded-lg" /> : null}
              <div className={`space-y-6 ${PROSE} sm:text-lg [&_h2]:pt-6`}>
                <Markdown text={post.body} />
              </div>
              <p className="mt-12 border-t border-white/20 pt-6">
                <Link to="/blog" className="text-sm text-white/70 transition hover:text-white">
                  ← All posts
                </Link>
              </p>
            </div>
          </article>
        )}
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
