// Trend Finder helpers (no imports, so they can be tested on their own).

export const MAX_TOPICS = 3
export const CUSTOM_MAX = 60
export const DEFAULT_REGION = 'world'
export const DEFAULT_WINDOW = 'week'

/** How many of the topic limit are used: chosen chips plus the custom topic, if it has text. */
export const topicCount = (topics = [], custom = '') => topics.length + (custom.trim() ? 1 : 0)

/** An unpicked chip is locked once the limit is reached. A picked chip can always be undone. */
export const topicLocked = (topics, custom, id, max = MAX_TOPICS) =>
  !topics.includes(id) && topicCount(topics, custom) >= max

/** Add the topic, or remove it if it is already picked. Does nothing past the limit. */
export function toggleTopic(topics, custom, id, max = MAX_TOPICS) {
  if (topics.includes(id)) return topics.filter((t) => t !== id)
  return topicLocked(topics, custom, id, max) ? topics : [...topics, id]
}

/** The saved config as the setup form shows it. An old deployment's niche becomes the custom topic. */
export function trendChoices(config = {}) {
  const custom = typeof config.customTopic === 'string' ? config.customTopic : config.niche || ''
  return {
    topics: Array.isArray(config.trendTopics) ? config.trendTopics : [],
    custom: custom.slice(0, CUSTOM_MAX),
    region: config.region || DEFAULT_REGION,
  }
}

const part = (n, one, many) => (Number(n) > 0 ? `${n} ${n === 1 ? one : many}` : '')

/** "This week · World · from 12 news stories, 3 Reddit posts, 2 YouTube videos" (empty parts are left out). */
export function trendSummary(output = {}) {
  const counts = output.signalCounts || {}
  const found = [
    part(counts['Google News'], 'news story', 'news stories'),
    part(counts.Reddit, 'Reddit post', 'Reddit posts'),
    part(counts.YouTube, 'YouTube video', 'YouTube videos'),
  ].filter(Boolean)
  const head = [output.windowLabel, output.region].filter(Boolean).join(' · ')
  const from = found.length ? `from ${found.join(', ')}` : ''
  return [head, from].filter(Boolean).join(' · ')
}
