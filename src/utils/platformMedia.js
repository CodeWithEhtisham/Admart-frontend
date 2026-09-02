/** What each platform can post organically. Ads use the same creative rules. */
export const PLATFORM_ACCEPTS = {
  youtube: ['video'],
  tiktok: ['video'],
  instagram: ['image', 'video'],
  facebook: ['image', 'video'],
  snapchat: ['image', 'video'],
  linkedin: ['image', 'video'],
  pinterest: ['image', 'video'],
}

export const ORGANIC_PLATFORMS = ['youtube', 'tiktok', 'instagram', 'facebook']
export const ADS_PLACEMENTS = ['instagram', 'facebook', 'tiktok', 'snapchat', 'youtube']
export const PROVIDER_PLACEMENTS = {
  meta: ['facebook', 'instagram'],
  tiktok: ['tiktok'],
  snap: ['snapchat'],
  google: ['youtube'],
}

export function platformAccepts(platform, kind) {
  return (PLATFORM_ACCEPTS[platform] || []).includes(kind)
}

export function mediaBlockReason(platform, kind) {
  if (platformAccepts(platform, kind)) return ''
  const accepts = PLATFORM_ACCEPTS[platform] || []
  if (accepts.length === 1 && accepts[0] === 'video') {
    return 'Video only — images cannot be posted here'
  }
  if (accepts.length === 1 && accepts[0] === 'image') {
    return 'Image only — videos cannot be posted here'
  }
  return `Does not accept ${kind}s`
}
