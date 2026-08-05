import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/AppLayout.jsx'
import Topbar from '../components/Topbar'
import { formatCredits, quoteCredits } from '../utils/credits.js'

const MEDIA_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'image', label: 'Image' },
  { id: 'video', label: 'Video' },
]

const CATEGORY_LABELS = {
  product: 'Product Ads',
  social: 'Social Media',
  ecommerce: 'E-commerce',
  food: 'Food & Drink',
  education: 'Education',
  brand: 'Brand Campaigns',
  events: 'Events',
  fashion: 'Fashion',
  showcase: 'AI Model Showcase',
  motion: 'Motion References',
  fantasy: 'Fantasy',
  personalization: 'Personalization',
  poster: 'Poster Design',
  editorial: 'Editorial',
  character: 'Character',
}

const MODEL_LABELS = {
  all: 'All models',
  'fal-ai/nano-banana-2': 'Nano Banana 2',
  'fal-ai/gemini-25-flash-image': 'Nano Banana',
  'fal-ai/nano-banana-pro': 'Nano Banana Pro',
  'google/nano-banana-lite': 'Nano Banana Lite',
  'fal-ai/flux-2-pro': 'Flux 2 Pro',
  'fal-ai/flux-2-flex': 'Flux 2 Flex',
  'fal-ai/qwen-image-2/text-to-image': 'Qwen Image 2.0',
  'fal-ai/qwen-image-2/pro/text-to-image': 'Qwen Image 2.0 Pro',
  'bytedance/seedream/v5/pro/text-to-image': 'Seedream 5.0 Pro',
  'bytedance/seedream/v5/lite/text-to-image': 'Seedream 5.0 Lite',
  'bytedance/seedream/v5/pro/edit': 'Seedream 5.0 Pro Edit',
  'fal-ai/bytedance/seedream/v4/text-to-image': 'Seedream 4.0',
  'openai/gpt-image-2': 'GPT Image 2',
  'fal-ai/ideogram/v3': 'Ideogram V3',
  'bytedance/seedance-2.0/text-to-video': 'Seedance 2.0',
  'bytedance/seedance-2.0/image-to-video': 'Seedance 2.0 I2V',
  'fal-ai/veo2/image-to-video': 'Veo 2',
  'fal-ai/veo3': 'Veo 3',
  'fal-ai/veo3.1': 'Veo 3.1',
  'fal-ai/luma-dream-machine/image-to-video': 'Luma Dream Machine',
  'fal-ai/kling-video/v3/turbo/standard/text-to-video': 'Kling 3 Turbo',
  'fal-ai/kling-video/v2.5-turbo/standard/image-to-video': 'Kling 2.5 Turbo',
  'fal-ai/minimax/hailuo-02/standard/text-to-video': 'Hailuo 02 Standard',
  'fal-ai/pixverse/v5/text-to-video': 'PixVerse V5',
  'wan/v2.6/text-to-video': 'Wan 2.6',
}

const TEMPLATE_PACKS = [
  {
    id: 'launch-pack',
    title: 'Product Launch Pack',
    count: 4,
    description: 'Hero images, launch reels, offer posts, and countdown creatives for a new product drop.',
    templateIds: ['img-product-hero', 'vid-launch-reel', 'img-offer-poster', 'vid-countdown'],
    accent: 'from-accent-blue/30 to-accent-violet/20',
  },
  {
    id: 'restaurant-pack',
    title: 'Restaurant Deal Pack',
    count: 3,
    description: 'Burger deals, menu posters, and short food-motion videos for local food brands.',
    templateIds: ['img-burger-deal', 'vid-food-deal', 'img-menu-board'],
    accent: 'from-warning/25 to-error/15',
  },
  {
    id: 'education-pack',
    title: 'Training Program Pack',
    count: 3,
    description: 'Admission posters, instructor intros, and certificate/course promo creatives.',
    templateIds: ['img-training-admission', 'vid-course-intro', 'img-certificate-post'],
    accent: 'from-success/20 to-accent-blue/20',
  },
  {
    id: 'model-showcase-pack',
    title: 'AI Model Showcase',
    count: 22,
    description: 'Reference prompts and generated examples from top image and video model families.',
    templateIds: ['img-gpt-image-2-showcase', 'img-qwen-koala-card', 'vid-kling-lion-family'],
    accent: 'from-cyan-500/20 to-fuchsia-500/20',
  },
  {
    id: 'personalization-pack',
    title: 'Personal Content Pack',
    count: 4,
    description: 'Upload a person or product image, fill a few fields, and open the right generator ready to create.',
    templateIds: ['img-pakistani-shirt-edit', 'vid-person-dance-i2v', 'img-profile-headshot-edit'],
    accent: 'from-emerald-500/20 to-sky-500/20',
  },
]

const TEMPLATES = [
  {
    id: 'img-product-hero',
    title: 'Premium Product Hero Shot',
    media: 'image',
    category: 'product',
    capability: 'textToImage',
    model: 'fal-ai/nano-banana-2',
    modelName: 'Nano Banana 2',
    badge: 'Hot',
    score: 98,
    saves: 1240,
    views: 18400,
    fallbackCredits: '0.08',
    settings: { aspectRatio: '1:1', resolution: '1K', numImages: 1 },
    tags: ['launch', 'clean studio', 'ecommerce'],
    preview: {
      image: '/template-media/product-hero.png',
      heading: 'AURA',
      subheading: 'New Arrival',
      swatch: 'bg-accent-blue',
      tone: 'from-slate-950 via-slate-800 to-accent-blue/70',
    },
    prompt:
      'Create a premium studio product advertising image for [PRODUCT NAME]. Place the product in the center on a clean reflective surface with soft rim lighting, subtle shadows, high-end commercial photography, crisp details, realistic materials, balanced composition, minimal luxury background, space for headline text, 1:1 square format.',
    negativePrompt:
      'blurry, low quality, distorted product, messy background, extra objects, unreadable text, watermark, oversaturated colors',
  },
  {
    id: 'vid-launch-reel',
    title: 'Cinematic Product Launch Reel',
    media: 'video',
    category: 'product',
    capability: 'textToVideo',
    model: 'bytedance/seedance-2.0/text-to-video',
    modelName: 'Seedance 2.0',
    badge: 'Featured',
    score: 96,
    saves: 910,
    views: 15620,
    fallbackCredits: '0.112',
    settings: { duration: '8', aspectRatio: '9:16', resolution: '1080p', generateAudio: true },
    tags: ['reel', 'motion', 'launch'],
    preview: {
      image: '/template-media/launch-reel.png',
      heading: 'DROP',
      subheading: 'Motion Reveal',
      swatch: 'bg-accent-violet',
      tone: 'from-black via-indigo-950 to-accent-violet/70',
    },
    prompt:
      'A cinematic vertical product launch video for [PRODUCT NAME]. Start with a dark silhouette, then a smooth dolly-in reveal with dramatic light sweeps, floating particles, premium reflections, close-up material details, fast elegant cuts, final hero frame with space for offer text and call to action. High-end brand commercial, polished, sharp, social media ready.',
    negativePrompt:
      'flicker, warped product, shaky camera, low resolution, unreadable text, distorted logo, cheap look',
  },
  {
    id: 'img-burger-deal',
    title: 'Burger Deal Poster',
    media: 'image',
    category: 'food',
    capability: 'textToImage',
    model: 'openai/gpt-image-2',
    modelName: 'GPT Image 2',
    badge: 'Local Ads',
    score: 94,
    saves: 780,
    views: 11200,
    fallbackCredits: '1',
    settings: { aspectRatio: '4:3', resolution: '1K', numImages: 1 },
    tags: ['restaurant', 'offer', 'poster'],
    preview: {
      image: '/template-media/burger-deal.png',
      heading: '999 RS',
      subheading: 'Burger + Fries + Drink',
      swatch: 'bg-error',
      tone: 'from-zinc-950 via-red-950 to-warning/70',
    },
    prompt:
      'Design a professional fast-food deal poster for [RESTAURANT NAME]. Show a juicy burger, crispy fries, and one cold drink arranged as a delicious combo meal. Add bold readable offer text: "Burger + Fries + Cold Drink - Rs 999". Use appetizing studio lighting, steam, condensation on the drink, rich food colors, clean composition, modern restaurant branding, social media ad style.',
    negativePrompt:
      'blurry food, unappetizing, distorted packaging, unreadable text, incorrect price, messy layout, extra drinks, low quality',
  },
  {
    id: 'vid-food-deal',
    title: 'Food Deal Motion Ad',
    media: 'video',
    category: 'food',
    capability: 'textToVideo',
    model: 'wan/v2.6/text-to-video',
    modelName: 'Wan 2.6',
    badge: 'New',
    score: 91,
    saves: 530,
    views: 8640,
    fallbackCredits: '0.8',
    settings: { duration: '8', aspectRatio: '9:16', resolution: '1080p', generateAudio: false },
    tags: ['food', 'deal', 'short video'],
    preview: {
      image: '/template-media/food-deal-motion.png',
      heading: 'DEAL',
      subheading: 'Hot and fresh',
      swatch: 'bg-warning',
      tone: 'from-black via-orange-950 to-red-700/80',
    },
    prompt:
      'Create an 8 second vertical fast-food offer video. A burger lands on a tray, fries slide in, a cold drink appears with condensation and ice, camera pushes in, warm appetizing lighting, quick energetic cuts, final frame shows clear space for text: "Deal just Rs 999". Professional restaurant advertisement, high detail, mouth-watering, social media ready.',
    negativePrompt:
      'bad food, wrong text, extra items, deformed cup, shaky footage, low quality, messy background',
  },
  {
    id: 'img-training-admission',
    title: 'AI Training Admissions Poster',
    media: 'image',
    category: 'education',
    capability: 'textToImage',
    model: 'fal-ai/ideogram/v3',
    modelName: 'Ideogram V3',
    badge: 'Poster',
    score: 93,
    saves: 620,
    views: 9400,
    fallbackCredits: '0.03',
    settings: { aspectRatio: '9:16', resolution: '1K', numImages: 1 },
    tags: ['admissions', 'poster', 'education'],
    preview: {
      image: '/template-media/training-admissions.png',
      heading: 'ADMISSIONS',
      subheading: 'AI Training Program',
      swatch: 'bg-success',
      tone: 'from-slate-950 via-emerald-950 to-accent-blue/70',
    },
    prompt:
      'Create a modern vertical admissions poster for an AI training program. Headline: "AI Training Program". Add clear text: "Admissions open till 30 Aug" and "Venue: BUITEMS CARL LAB". Use a professional tech education look with students, laptops, AI interface elements, clean typography, blue and green accents, high trust, premium institute feel, readable text, social media poster layout.',
    negativePrompt:
      'misspelled text, unreadable text, cluttered layout, low quality, distorted faces, fake logos, too much text',
  },
  {
    id: 'vid-course-intro',
    title: 'Course Intro Video',
    media: 'video',
    category: 'education',
    capability: 'textToVideo',
    model: 'fal-ai/veo3.1',
    modelName: 'Veo 3.1',
    badge: 'Pro',
    score: 89,
    saves: 410,
    views: 7300,
    fallbackCredits: '3.2',
    settings: { duration: '8s', aspectRatio: '16:9', resolution: '1080p', generateAudio: true },
    tags: ['course', 'intro', 'professional'],
    preview: {
      image: '/template-media/course-intro.png',
      heading: 'LEARN AI',
      subheading: 'Classroom opener',
      swatch: 'bg-accent-blue',
      tone: 'from-slate-950 via-blue-950 to-cyan-700/70',
    },
    prompt:
      'A professional course introduction video for an AI training program. Show a modern computer lab, students learning with laptops, instructor explaining AI concepts on a screen, animated interface overlays, smooth camera movement, inspiring education tone, clean cinematic lighting, final frame with empty space for course title and enrollment call to action.',
    negativePrompt:
      'low quality, distorted faces, unreadable screens, chaotic classroom, flicker, shaky camera',
  },
  {
    id: 'img-offer-poster',
    title: 'High-Converting Offer Poster',
    media: 'image',
    category: 'brand',
    capability: 'textToImage',
    model: 'openai/gpt-image-2',
    modelName: 'GPT Image 2',
    badge: 'Hot',
    score: 90,
    saves: 690,
    views: 10150,
    fallbackCredits: '1',
    settings: { aspectRatio: '9:16', resolution: '1K', numImages: 1 },
    tags: ['offer', 'sale', 'social'],
    preview: {
      image: '/template-media/offer-poster.png',
      heading: 'SALE',
      subheading: 'Limited time',
      swatch: 'bg-accent-violet',
      tone: 'from-zinc-950 via-purple-950 to-pink-700/70',
    },
    prompt:
      'Create a bold social media offer poster for [BRAND NAME]. Main offer: [OFFER DETAILS]. Use strong hierarchy, large readable headline, premium product/service visual, clean brand colors, modern advertising layout, urgency without looking cheap, clear call to action button area, high contrast, professional marketing design.',
    negativePrompt:
      'unreadable typography, cluttered layout, wrong spelling, watermark, low quality, distorted elements',
  },
  {
    id: 'vid-countdown',
    title: 'Flash Sale Countdown Video',
    media: 'video',
    category: 'social',
    capability: 'textToVideo',
    model: 'bytedance/seedance-2.0/text-to-video',
    modelName: 'Seedance 2.0',
    badge: 'Trending',
    score: 87,
    saves: 450,
    views: 6880,
    fallbackCredits: '0.084',
    settings: { duration: '6', aspectRatio: '9:16', resolution: '1080p', generateAudio: true },
    tags: ['countdown', 'sale', 'reel'],
    preview: {
      image: '/template-media/countdown-video.png',
      heading: '3...2...1',
      subheading: 'Flash sale',
      swatch: 'bg-warning',
      tone: 'from-black via-zinc-900 to-yellow-600/70',
    },
    prompt:
      'A fast 6 second vertical flash sale countdown video for [BRAND NAME]. Animated countdown numbers, quick product cuts, bold offer energy, glowing timer elements, smooth transitions, premium social ad style, final frame leaves space for the offer and call to action.',
    negativePrompt:
      'cheap design, unreadable numbers, flicker, low quality, warped product, excessive motion blur',
  },
  {
    id: 'img-menu-board',
    title: 'Restaurant Menu Board',
    media: 'image',
    category: 'food',
    capability: 'textToImage',
    model: 'fal-ai/ideogram/v3',
    modelName: 'Ideogram V3',
    badge: 'Menu',
    score: 84,
    saves: 360,
    views: 5100,
    fallbackCredits: '0.03',
    settings: { aspectRatio: '16:9', resolution: '1K', numImages: 1 },
    tags: ['menu', 'restaurant', 'pricing'],
    preview: {
      image: '/template-media/menu-board.png',
      heading: 'MENU',
      subheading: 'Chef specials',
      swatch: 'bg-error',
      tone: 'from-stone-950 via-red-950 to-orange-700/70',
    },
    prompt:
      'Design a clean restaurant digital menu board for [RESTAURANT NAME]. Include sections for burgers, fries, drinks, and deals with readable placeholder prices. Use appetizing food photography style, warm lighting, clear typography, modern layout, high contrast, professional fast-food branding, 16:9 screen format.',
    negativePrompt:
      'unreadable menu text, wrong spelling, clutter, low quality food, distorted layout, watermark',
  },
  {
    id: 'img-certificate-post',
    title: 'Certificate Achievement Post',
    media: 'image',
    category: 'education',
    capability: 'textToImage',
    model: 'openai/gpt-image-2',
    modelName: 'GPT Image 2',
    badge: 'Social',
    score: 82,
    saves: 340,
    views: 4700,
    fallbackCredits: '1',
    settings: { aspectRatio: '1:1', resolution: '1K', numImages: 1 },
    tags: ['certificate', 'student', 'achievement'],
    preview: {
      image: '/template-media/certificate-post.png',
      heading: 'CERTIFIED',
      subheading: 'Student success',
      swatch: 'bg-success',
      tone: 'from-slate-950 via-green-950 to-emerald-600/70',
    },
    prompt:
      'Create a polished social media achievement post for [PROGRAM NAME]. Show a certificate, confident student, subtle technology background, professional institute branding, congratulatory layout, readable text area for student name and course title, square format, premium education marketing design.',
    negativePrompt:
      'unreadable certificate, fake logos, distorted hands, low quality, cluttered layout, bad typography',
  },
  {
    id: 'img-gpt-image-2-showcase',
    title: 'GPT Image 2 Hero Infographic',
    media: 'image',
    category: 'showcase',
    capability: 'textToImage',
    model: 'openai/gpt-image-2',
    modelName: 'GPT Image 2',
    badge: 'Typography',
    score: 99,
    saves: 2210,
    views: 28400,
    fallbackCredits: '1',
    settings: { aspectRatio: '16:9', resolution: '1K', numImages: 1 },
    tags: ['infographic', 'typography', 'model demo'],
    sourceUrl: 'https://fal.ai/models/openai/gpt-image-2',
    exampleUrl: 'https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg',
    preview: {
      image: 'https://v3b.fal.media/files/b/0a981c3d/hdg8iaY8yShEwChTPjFah_OZUgg7Z4.jpg',
      heading: 'GPT IMAGE 2',
      subheading: 'Hero infographic',
      swatch: 'bg-accent-blue',
      tone: 'from-slate-950 via-blue-950 to-cyan-700/70',
    },
    prompt:
      'Create a high-end hero infographic announcing "GPT Image 2 is here". Design it like a futuristic AI product launch visual with a precise grid of 16 to 24 mini panels, each showing a different image style: oil painting, anime, blueprint, isometric 3D, photorealism, watercolor, pixel art, clay render, cinematic lighting, product photography, fashion editorial, UI mockup, technical diagram, and surreal concept art. Use sharp typography, clean spacing, glowing accents, thin technical lines, premium colors, and a strong visual hierarchy. The final image should feel polished, futuristic, colorful, and suitable for a professional AI product announcement. No watermark, no random text, no date.',
    negativePrompt:
      'low quality, broken grid, unreadable typography, misspelled text, cluttered layout, watermark, random captions',
  },
  {
    id: 'img-nano-banana-pool',
    title: 'Nano Banana Split-Water Dog',
    media: 'image',
    category: 'showcase',
    capability: 'textToImage',
    model: 'fal-ai/gemini-25-flash-image',
    modelName: 'Nano Banana',
    generatorModel: 'fal-ai/nano-banana-2',
    generatorModelName: 'Nano Banana 2',
    badge: 'Reference',
    score: 97,
    saves: 1680,
    views: 21600,
    fallbackCredits: '0.08',
    settings: { aspectRatio: '1:1', resolution: '1K', numImages: 1 },
    tags: ['animal', 'waterline', 'photoreal'],
    sourceUrl: 'https://fal.ai/models/fal-ai/gemini-25-flash-image',
    exampleUrl: 'https://storage.googleapis.com/falserverless/example_outputs/nano-banana-t2i-output.png',
    preview: {
      image: 'https://storage.googleapis.com/falserverless/example_outputs/nano-banana-t2i-output.png',
      heading: 'DOG SWIM',
      subheading: 'Split-water action',
      swatch: 'bg-cyan-500',
      tone: 'from-slate-950 via-cyan-950 to-blue-700/70',
    },
    prompt:
      'Create an action photo of a black Labrador swimming in a clean suburban swimming pool. Place the camera exactly at the waterline so the image is split between above-water and underwater views. Above the water, show the dog head holding a yellow tennis ball in its mouth with water splashing around. Underwater, show the dog front paws paddling clearly through blue pool water. Use realistic sunlight, crisp details, natural water distortion, and a dynamic sports photography style.',
    negativePrompt:
      'blurry water, distorted dog anatomy, missing tennis ball, muddy water, low detail, duplicate paws, unrealistic reflections',
  },
  {
    id: 'img-nano-banana-2-pool',
    title: 'Nano Banana 2 Pool Action',
    media: 'image',
    category: 'showcase',
    capability: 'textToImage',
    model: 'fal-ai/nano-banana-2',
    modelName: 'Nano Banana 2',
    badge: 'Fast',
    score: 98,
    saves: 1810,
    views: 23800,
    fallbackCredits: '0.08',
    settings: { aspectRatio: 'auto', resolution: '1K', numImages: 1 },
    tags: ['dog', 'photography', 'water physics'],
    sourceUrl: 'https://fal.ai/models/fal-ai/nano-banana-2',
    exampleUrl: 'https://storage.googleapis.com/falserverless/example_outputs/nano-banana-2-t2i-output.png',
    preview: {
      image: 'https://storage.googleapis.com/falserverless/example_outputs/nano-banana-2-t2i-output.png',
      heading: 'WATERLINE',
      subheading: 'Realistic pool action',
      swatch: 'bg-accent-blue',
      tone: 'from-blue-950 via-sky-950 to-cyan-600/70',
    },
    prompt:
      'Generate a highly realistic split-level action shot of a black Labrador retriever swimming in an inground backyard pool. The camera should sit half above and half below the water surface. The top half shows the dog face, wet fur, and a tennis ball held in its mouth. The bottom half shows its paws actively paddling underwater with bubbles, ripples, and natural refraction. Make it vibrant, sharp, realistic, and full of motion.',
    negativePrompt:
      'motion artifacts, unrealistic waterline, distorted snout, missing paws, extra legs, blurry face, bad refraction',
  },
  {
    id: 'img-nano-banana-pro-pool',
    title: 'Nano Banana Pro Waterline Photo',
    media: 'image',
    category: 'showcase',
    capability: 'textToImage',
    model: 'fal-ai/nano-banana-pro',
    modelName: 'Nano Banana Pro',
    badge: 'Pro',
    score: 96,
    saves: 1540,
    views: 19200,
    fallbackCredits: '0.15',
    settings: { aspectRatio: '1:1', resolution: '1K', numImages: 1 },
    tags: ['premium', 'photoreal', 'action'],
    sourceUrl: 'https://fal.ai/models/fal-ai/nano-banana-pro',
    exampleUrl: 'https://v3b.fal.media/files/b/0a95c094/qGn_Uhoer-pmZ280bBLIl_uT30LWIl.png',
    preview: {
      image: 'https://v3b.fal.media/files/b/0a95c094/qGn_Uhoer-pmZ280bBLIl_uT30LWIl.png',
      heading: 'PRO PHOTO',
      subheading: 'Studio-quality action',
      swatch: 'bg-violet-500',
      tone: 'from-slate-950 via-indigo-950 to-violet-700/70',
    },
    prompt:
      'Create a studio-quality, ultra-detailed split-water photograph of a black Labrador swimming in a suburban pool. The composition should be divided by the waterline: above water, the dog wet face is visible with a tennis ball in its mouth; below water, its paws are actively paddling with bubbles and refracted light. Emphasize realistic fur texture, accurate water physics, sunlight reflections, and a professional action-camera perspective.',
    negativePrompt:
      'low detail fur, warped waterline, extra tennis balls, duplicate dog, flat lighting, blurry underwater view, bad anatomy',
  },
  {
    id: 'img-nano-banana-lite-vaporwave',
    title: 'Nano Banana Lite Vaporwave Poster',
    media: 'image',
    category: 'showcase',
    capability: 'textToImage',
    model: 'google/nano-banana-lite',
    modelName: 'Nano Banana Lite',
    generatorModel: 'fal-ai/nano-banana-2',
    generatorModelName: 'Nano Banana 2',
    badge: 'Style',
    score: 92,
    saves: 1210,
    views: 14900,
    fallbackCredits: '0.08',
    settings: { aspectRatio: '4:3', resolution: '1K', numImages: 1 },
    tags: ['vaporwave', 'poster', 'retro'],
    sourceUrl: 'https://fal.ai/models/google/nano-banana-lite',
    exampleUrl: 'https://v3b.fal.media/files/b/0aa06665/W6vHj94aABG8gpv08Qy8U_Cu591Uqm.png',
    preview: {
      image: 'https://v3b.fal.media/files/b/0aa06665/W6vHj94aABG8gpv08Qy8U_Cu591Uqm.png',
      heading: 'AESTHETIC',
      subheading: 'Vaporwave poster',
      swatch: 'bg-fuchsia-500',
      tone: 'from-fuchsia-950 via-purple-950 to-cyan-700/70',
    },
    prompt:
      'Design a vaporwave poster with the word "AESTHETIC" in large full-width glitch-style characters. Include a Roman bust statue, a pink and cyan neon grid, palm trees, a retro Windows 95-style computer window, and dreamy nostalgic lighting. Use pastel pink, cyan, purple, glossy digital print texture, surreal melancholy, old internet aesthetics, and a polished poster composition.',
    negativePrompt:
      'muddy colors, unreadable title, low quality statue, cluttered retro elements, wrong typography, watermark',
  },
  {
    id: 'img-flux-2-pro-knight',
    title: 'Flux 2 Pro Knight Close-Up',
    media: 'image',
    category: 'showcase',
    capability: 'textToImage',
    model: 'fal-ai/flux-2-pro',
    modelName: 'Flux 2 Pro',
    generatorModel: 'fal-ai/flux/dev',
    generatorModelName: 'Flux Dev',
    badge: 'Cinematic',
    score: 94,
    saves: 1380,
    views: 17300,
    fallbackCredits: '0.025',
    settings: { aspectRatio: '16:9', resolution: '1K', numImages: 1 },
    tags: ['fantasy', 'cinematic', 'armor'],
    sourceUrl: 'https://fal.ai/models/fal-ai/flux-2-pro/api',
    exampleUrl: 'https://storage.googleapis.com/falserverless/example_outputs/flux2_pro_t2i_output.png',
    preview: {
      image: 'https://storage.googleapis.com/falserverless/example_outputs/flux2_pro_t2i_output.png',
      heading: 'KNIGHT',
      subheading: 'Battle reflection',
      swatch: 'bg-orange-500',
      tone: 'from-zinc-950 via-stone-950 to-orange-700/70',
    },
    prompt:
      'Create a cinematic close-up of a medieval knight wearing a detailed steel helmet and engraved armor. The knight visor reflects a chaotic battlefield with flames, smoke, sparks, and silhouettes of soldiers. Use dramatic orange and blue lighting, shallow depth of field, highly detailed metal texture, realistic scratches, intense atmosphere, and a premium fantasy film still look.',
    negativePrompt:
      'plastic armor, low detail metal, bad reflections, modern objects, blurry faceplate, cartoon style, watermark',
  },
  {
    id: 'img-flux-2-flex-monster',
    title: 'Flux 2 Flex Fluffy Monster',
    media: 'image',
    category: 'showcase',
    capability: 'textToImage',
    model: 'fal-ai/flux-2-flex',
    modelName: 'Flux 2 Flex',
    generatorModel: 'fal-ai/flux/dev',
    generatorModelName: 'Flux Dev',
    badge: '3D',
    score: 91,
    saves: 1180,
    views: 13200,
    fallbackCredits: '0.025',
    settings: { aspectRatio: '1:1', resolution: '1K', numImages: 1 },
    tags: ['3d render', 'character', 'commercial'],
    sourceUrl: 'https://fal.ai/models/fal-ai/flux-2-flex/api',
    exampleUrl: 'https://storage.googleapis.com/falserverless/example_outputs/flux2_flex_t2i_output.png',
    preview: {
      image: 'https://storage.googleapis.com/falserverless/example_outputs/flux2_flex_t2i_output.png',
      heading: 'FLUFFY',
      subheading: 'Donut character render',
      swatch: 'bg-pink-500',
      tone: 'from-slate-950 via-pink-950 to-yellow-600/70',
    },
    prompt:
      'Create a high-quality 3D render of a cute fluffy monster eating a giant donut. The monster should have extremely detailed soft fur, big expressive eyes, tiny hands, and a playful expression. The donut glaze should look sticky, glossy, and reflective with colorful sprinkles. Use bright daylight, shallow depth of field, soft shadows, and a charming commercial toy-render style.',
    negativePrompt:
      'scary monster, greasy texture, flat lighting, low detail fur, distorted eyes, bad donut shape, noisy render',
  },
  {
    id: 'vid-seedance-beach',
    title: 'Seedance 2.0 Beach Dog Run',
    media: 'video',
    category: 'motion',
    capability: 'textToVideo',
    model: 'bytedance/seedance-2.0/text-to-video',
    modelName: 'Seedance 2.0',
    badge: 'Motion',
    score: 97,
    saves: 1760,
    views: 22400,
    fallbackCredits: '0.112',
    settings: { duration: '8', aspectRatio: '16:9', resolution: '1080p', generateAudio: true },
    tags: ['beach', 'dog', 'tracking shot'],
    sourceUrl: 'https://fal.ai/models/bytedance/seedance-2.0/text-to-video?share=b0711ce4-d2df-473e-a19b-32bf6ec4b487',
    exampleUrl: 'https://v3b.fal.media/files/b/0a95a7e6/cqBqHjORg1WDcgDHiueKh_video.mp4',
    preview: {
      videoUrl: 'https://v3b.fal.media/files/b/0a95a7e6/cqBqHjORg1WDcgDHiueKh_video.mp4',
      heading: 'BEACH RUN',
      subheading: 'Low tracking camera',
      swatch: 'bg-yellow-500',
      tone: 'from-slate-950 via-amber-950 to-blue-700/70',
    },
    prompt:
      'Create an 8-second cinematic video of a golden retriever running along a beach at sunset. The camera tracks low beside the dog as wet sand kicks up under its paws. Ocean waves move in the background, warm golden light reflects on the water, and the dog fur moves naturally in the wind. Use smooth motion, realistic camera movement, energetic pacing, and a joyful social media commercial style.',
    negativePrompt:
      'jitter, warped legs, bad fur motion, low resolution, unnatural waves, flicker, shaky camera',
  },
  {
    id: 'vid-seedance-cafe',
    title: 'Seedance 2.0 Cafe Sequence',
    media: 'video',
    category: 'motion',
    capability: 'textToVideo',
    model: 'bytedance/seedance-2.0/text-to-video',
    modelName: 'Seedance 2.0',
    badge: 'Cafe',
    score: 95,
    saves: 1420,
    views: 18100,
    fallbackCredits: '0.112',
    settings: { duration: '8', aspectRatio: '16:9', resolution: '1080p', generateAudio: true },
    tags: ['coffee', 'commercial', 'multi-shot'],
    sourceUrl: 'https://fal.ai/models/bytedance/seedance-2.0/text-to-video?share=d91a43f0-6846-4091-840b-f4005d9eda3d',
    exampleUrl: 'https://v3b.fal.media/files/b/0a95a800/MxUleZBe-QIc9fmamdssd_video.mp4',
    preview: {
      videoUrl: 'https://v3b.fal.media/files/b/0a95a800/MxUleZBe-QIc9fmamdssd_video.mp4',
      heading: 'ESPRESSO',
      subheading: 'Warm cafe sequence',
      swatch: 'bg-amber-500',
      tone: 'from-stone-950 via-amber-950 to-orange-700/70',
    },
    prompt:
      'Create an 8-second cinematic cafe sequence. Start with a close-up of a barista locking a portafilter into an espresso machine, then show rich espresso pouring into a small cup, steam rising, and warm light hitting the counter. End with a smooth pull-back revealing a cozy modern cafe environment. Use shallow depth of field, realistic coffee texture, soft warm lighting, and elegant commercial pacing.',
    negativePrompt:
      'watery coffee, warped cup, messy counter, flicker, low detail steam, shaky camera, bad hands',
  },
  {
    id: 'vid-veo-2-talking-head',
    title: 'Veo 2 Talking Head Reference',
    media: 'video',
    category: 'motion',
    capability: 'textToVideo',
    model: 'fal-ai/veo2/image-to-video',
    modelName: 'Veo 2',
    generatorModel: 'fal-ai/veo3.1',
    generatorModelName: 'Veo 3.1',
    badge: 'Reference',
    score: 90,
    saves: 980,
    views: 12600,
    fallbackCredits: '3.2',
    settings: { duration: '8s', aspectRatio: '16:9', resolution: '1080p', generateAudio: true },
    tags: ['talking head', 'portrait', 'camera'],
    sourceUrl: 'https://fal.ai/models/fal-ai/veo2/image-to-video/api',
    exampleUrl: 'https://storage.googleapis.com/falserverless/example_outputs/veo3-i2v-output.mp4',
    preview: {
      videoUrl: 'https://storage.googleapis.com/falserverless/example_outputs/veo3-i2v-output.mp4',
      heading: 'ON CAMERA',
      subheading: 'Talking head motion',
      swatch: 'bg-accent-blue',
      tone: 'from-slate-950 via-blue-950 to-indigo-700/70',
    },
    prompt:
      'Create a realistic video shot of a woman looking directly into the camera. She takes a calm breath, her expression becomes confident, and then she begins speaking with energy and enthusiasm. Use subtle head movement, natural facial motion, realistic lighting, shallow depth of field, and a clean professional talking-head style.',
    negativePrompt:
      'uncanny face, lip-sync artifacts, distorted eyes, flicker, shaky camera, low resolution, unnatural skin texture',
  },
  {
    id: 'vid-veo-3-police',
    title: 'Veo 3 Police Car Tracking Shot',
    media: 'video',
    category: 'motion',
    capability: 'textToVideo',
    model: 'fal-ai/veo3',
    modelName: 'Veo 3',
    generatorModel: 'fal-ai/veo3.1',
    generatorModelName: 'Veo 3.1',
    badge: 'Cinematic',
    score: 93,
    saves: 1330,
    views: 17400,
    fallbackCredits: '3.2',
    settings: { duration: '8s', aspectRatio: '16:9', resolution: '1080p', generateAudio: true },
    tags: ['urban', 'tracking', 'night'],
    sourceUrl: 'https://fal.ai/models/fal-ai/veo3?share=950e002d-e95c-42ec-8f4e-3e25341b76c4',
    exampleUrl: 'https://v3.fal.media/files/penguin/OHd4AcqqpxXCXCc7JZ8rl_output.mp4',
    preview: {
      videoUrl: 'https://v3.fal.media/files/penguin/OHd4AcqqpxXCXCc7JZ8rl_output.mp4',
      heading: 'NIGHT RUN',
      subheading: 'Rear tracking shot',
      swatch: 'bg-blue-500',
      tone: 'from-slate-950 via-zinc-950 to-blue-800/70',
    },
    prompt:
      'Create a cinematic video where a police car enters the frame on a city street at night. The camera slowly rises above the road, then transitions into a smooth rear tracking shot following the car as its lights reflect on wet pavement. Use realistic motion, dramatic lighting, urban atmosphere, lens reflections, and a polished film trailer style.',
    negativePrompt:
      'unsafe crash, unreadable vehicle shape, warped road, flicker, low quality, excessive blur, bad reflections',
  },
  {
    id: 'vid-veo-3-cyberpunk',
    title: 'Veo 3 Cyberpunk Hoverboard',
    media: 'video',
    category: 'motion',
    capability: 'textToVideo',
    model: 'fal-ai/veo3',
    modelName: 'Veo 3',
    generatorModel: 'fal-ai/veo3.1',
    generatorModelName: 'Veo 3.1',
    badge: 'Cyberpunk',
    score: 92,
    saves: 1270,
    views: 16100,
    fallbackCredits: '3.2',
    settings: { duration: '8s', aspectRatio: '16:9', resolution: '1080p', generateAudio: true },
    tags: ['cyberpunk', 'action', 'rain'],
    sourceUrl: 'https://fal.ai/models/fal-ai/veo3?share=95d6c4a3-f4f4-4d5c-ac8c-4493f56e8d42',
    exampleUrl: 'https://v3.fal.media/files/panda/476McAVlSQMqM7lXptiMc_output.mp4',
    preview: {
      videoUrl: 'https://v3.fal.media/files/panda/476McAVlSQMqM7lXptiMc_output.mp4',
      heading: 'NEON RIDE',
      subheading: 'Cyberpunk action',
      swatch: 'bg-fuchsia-500',
      tone: 'from-black via-fuchsia-950 to-cyan-800/70',
    },
    prompt:
      'Create a cyberpunk action video of a futuristic woman riding a hover skateboard through a neon rainy city. She moves fast between glowing signs, holographic billboards, reflections on wet streets, and electric-blue visual effects around the board. Use dynamic camera movement, cinematic lighting, rain particles, detailed sci-fi fashion, and high-energy commercial pacing.',
    negativePrompt:
      'unsafe crash, distorted body, bad board physics, unreadable neon, flicker, low detail rain, shaky camera',
  },
  {
    id: 'vid-luma-dragon',
    title: 'Luma Dream Machine Dragon Flight',
    media: 'video',
    category: 'fantasy',
    capability: 'textToVideo',
    model: 'fal-ai/luma-dream-machine/image-to-video',
    modelName: 'Luma Dream Machine',
    generatorModel: 'fal-ai/veo3.1',
    generatorModelName: 'Veo 3.1',
    badge: 'Fantasy',
    score: 89,
    saves: 910,
    views: 11800,
    fallbackCredits: '3.2',
    settings: { duration: '8s', aspectRatio: '16:9', resolution: '1080p', generateAudio: true },
    tags: ['dragon', 'clouds', 'fantasy'],
    sourceUrl: 'https://fal.ai/models/fal-ai/luma-dream-machine/image-to-video?share=ffd54b30-d4e5-42cb-96ea-64a367ec6e88',
    exampleUrl: 'https://v2.fal.media/files/22ea80296fa44d59a737530d466d0353_output.mp4',
    preview: {
      videoUrl: 'https://v2.fal.media/files/22ea80296fa44d59a737530d466d0353_output.mp4',
      heading: 'DRAGON',
      subheading: 'Cloud flight scene',
      swatch: 'bg-red-500',
      tone: 'from-slate-950 via-red-950 to-orange-700/70',
    },
    prompt:
      'Create a cinematic fantasy video of a large dragon flying through thick clouds in the sky. The camera follows from behind and then moves beside the dragon as it spreads its wings. The dragon breathes fire through the clouds, lighting them orange from within. Use epic scale, realistic wing motion, atmospheric fog, dramatic sunlight, and a fantasy movie trailer look.',
    negativePrompt:
      'bad wing anatomy, low detail dragon, fake fire, flicker, shaky camera, flat clouds, cartoon style',
  },
  {
    id: 'img-qwen-koala-card',
    title: 'Qwen Image 2 Card Character',
    media: 'image',
    category: 'character',
    capability: 'textToImage',
    model: 'fal-ai/qwen-image-2/text-to-image',
    modelName: 'Qwen Image 2.0',
    generatorModel: 'openai/gpt-image-2',
    generatorModelName: 'GPT Image 2',
    badge: 'Text',
    score: 88,
    saves: 760,
    views: 9900,
    fallbackCredits: '1',
    settings: { aspectRatio: '1:1', resolution: '1K', numImages: 1 },
    tags: ['character', 'text card', 'social'],
    sourceUrl: 'https://fal.ai/models/fal-ai/qwen-image-2/text-to-image',
    exampleUrl: 'https://v3b.fal.media/files/b/0a90b32f/SuH1rqlI4Us26LffsOWyV_4HJ5a5RO.png',
    preview: {
      image: 'https://v3b.fal.media/files/b/0a90b32f/SuH1rqlI4Us26LffsOWyV_4HJ5a5RO.png',
      heading: 'CARD',
      subheading: 'Cute mascot announcement',
      swatch: 'bg-sky-500',
      tone: 'from-slate-950 via-sky-950 to-teal-600/70',
    },
    prompt:
      'Create a cute baby koala mascot riding a colorful water slide while holding a clean white card that clearly says "[ANNOUNCEMENT TEXT]". The scene should feel bright, playful, social-media friendly, and polished, with clear readable text, soft daylight, expressive character design, clean composition, and no extra random words.',
    negativePrompt:
      'misspelled card text, unreadable text, distorted mascot, extra signs, watermark, blurry image, cluttered background',
  },
  {
    id: 'img-qwen-auto-infographic',
    title: 'Qwen Pro Manufacturing Infographic',
    media: 'image',
    category: 'poster',
    capability: 'textToImage',
    model: 'fal-ai/qwen-image-2/pro/text-to-image',
    modelName: 'Qwen Image 2.0 Pro',
    generatorModel: 'openai/gpt-image-2',
    generatorModelName: 'GPT Image 2',
    badge: 'Infographic',
    score: 90,
    saves: 880,
    views: 11200,
    fallbackCredits: '1',
    settings: { aspectRatio: '16:9', resolution: '1K', numImages: 1 },
    tags: ['infographic', 'automotive', 'process'],
    sourceUrl: 'https://fal.ai/models/fal-ai/qwen-image-2/pro/text-to-image',
    exampleUrl: 'https://v3b.fal.media/files/b/0a90b238/SBKPCfmygQb1BivJjt6Ck_zvpXi8Qy.png',
    preview: {
      image: 'https://v3b.fal.media/files/b/0a90b238/SBKPCfmygQb1BivJjt6Ck_zvpXi8Qy.png',
      heading: 'PROCESS',
      subheading: 'Multi-stage infographic',
      swatch: 'bg-amber-500',
      tone: 'from-stone-950 via-amber-950 to-red-700/70',
    },
    prompt:
      'Design a detailed 11-stage infographic for "[PROCESS TITLE]". Use three clean rows with arrows moving left to right and curving down between rows. Each stage should have a small illustrated scene, a bold uppercase stage title, short readable labels, and consistent spacing. Use an ink-and-watercolor style, professional poster composition, period-correct details where relevant, and a polished educational layout suitable for a social media carousel cover.',
    negativePrompt:
      'unreadable labels, broken arrows, messy rows, wrong stage numbers, clutter, low quality, watermark, random text',
  },
  {
    id: 'img-seedream-editorial-fashion',
    title: 'Seedream Editorial Fashion Portrait',
    media: 'image',
    category: 'editorial',
    capability: 'textToImage',
    model: 'bytedance/seedream/v5/pro/text-to-image',
    modelName: 'Seedream 5.0 Pro',
    generatorModel: 'fal-ai/nano-banana-pro',
    generatorModelName: 'Nano Banana Pro',
    badge: 'Editorial',
    score: 91,
    saves: 960,
    views: 12100,
    fallbackCredits: '0.15',
    settings: { aspectRatio: '3:4', resolution: '1K', numImages: 1 },
    tags: ['fashion', 'portrait', 'culture'],
    sourceUrl: 'https://fal.ai/models/bytedance/seedream/v5/pro/text-to-image',
    exampleUrl: 'https://v3b.fal.media/files/b/0aa16df4/ktjX_-2KKAw7bCTQgopGV_5b49dc459dfe484fbb1218fce0e24bc7.png',
    preview: {
      image: 'https://v3b.fal.media/files/b/0aa16df4/ktjX_-2KKAw7bCTQgopGV_5b49dc459dfe484fbb1218fce0e24bc7.png',
      heading: 'EDITORIAL',
      subheading: 'Fashion portrait',
      swatch: 'bg-fuchsia-500',
      tone: 'from-zinc-950 via-fuchsia-950 to-yellow-700/70',
    },
    prompt:
      'Create a vibrant editorial portrait of [PERSON DESCRIPTION] wearing contemporary fashion fused with [CULTURAL TEXTILE STYLE] patterns and beadwork. Use a saturated color palette, dramatic studio lighting, confident pose, celebratory cultural richness, crisp skin detail, premium fashion magazine styling, and striking contemporary portrait composition.',
    negativePrompt:
      'distorted face, bad hands, cultural stereotypes, dull lighting, low detail fabric, watermark, cluttered background',
  },
  {
    id: 'img-seedream-restaurant-menu',
    title: 'Seedream Restaurant Menu Scene',
    media: 'image',
    category: 'food',
    capability: 'textToImage',
    model: 'fal-ai/bytedance/seedream/v4/text-to-image',
    modelName: 'Seedream 4.0',
    generatorModel: 'openai/gpt-image-2',
    generatorModelName: 'GPT Image 2',
    badge: 'Food',
    score: 87,
    saves: 740,
    views: 9400,
    fallbackCredits: '1',
    settings: { aspectRatio: '16:9', resolution: '1K', numImages: 1 },
    tags: ['restaurant', 'menu board', 'text'],
    sourceUrl: 'https://fal.ai/models/fal-ai/bytedance/seedream/v4/text-to-image',
    exampleUrl: 'https://storage.googleapis.com/falserverless/example_outputs/seedream4_t2i_output.png',
    preview: {
      image: 'https://storage.googleapis.com/falserverless/example_outputs/seedream4_t2i_output.png',
      heading: 'MENU',
      subheading: 'Restaurant interior',
      swatch: 'bg-orange-500',
      tone: 'from-stone-950 via-orange-950 to-red-700/70',
    },
    prompt:
      'Create a trendy modern restaurant interior with diners enjoying their meals and a digital menu board clearly displaying "[MENU BOARD TEXT]" in elegant readable typography. Use warm ambient lighting, appetizing food presentation, polished hospitality photography, clean depth of field, premium restaurant branding, and a welcoming social media ad composition.',
    negativePrompt:
      'unreadable menu text, misspelled words, messy tables, distorted people, low quality food, watermark, harsh lighting',
  },
  {
    id: 'img-seedream-edit-objects',
    title: 'Seedream Object Edit Reference',
    media: 'image',
    category: 'showcase',
    capability: 'edit',
    model: 'bytedance/seedream/v5/pro/edit',
    modelName: 'Seedream 5.0 Pro Edit',
    generatorModel: 'fal-ai/nano-banana-pro/edit',
    generatorModelName: 'Nano Banana Pro Edit',
    badge: 'Edit',
    score: 86,
    saves: 690,
    views: 8700,
    fallbackCredits: '0.15',
    settings: { aspectRatio: '1:1', resolution: '1K', numImages: 1 },
    tags: ['image edit', 'object control', 'layout'],
    requiresSourceImage: true,
    sourceUrl: 'https://fal.ai/models/bytedance/seedream/v5/pro/edit',
    exampleUrl: 'https://v3b.fal.media/files/b/0aa1951d/dEbTv8GWzG9EVsxnjIHdv_e6dae32f4eb44a21b4eb8c6421096b4f.jpg',
    preview: {
      image: 'https://v3b.fal.media/files/b/0aa1951d/dEbTv8GWzG9EVsxnjIHdv_e6dae32f4eb44a21b4eb8c6421096b4f.jpg',
      heading: 'EDIT',
      subheading: 'Object-level control',
      swatch: 'bg-violet-500',
      tone: 'from-slate-950 via-violet-950 to-sky-700/70',
    },
    prompt:
      'Edit the uploaded image while preserving the original layout and lighting. Change only the requested objects: [EDIT INSTRUCTIONS]. Keep all other objects, camera angle, background, proportions, and material style exactly the same. Make the edit realistic, clean, and production-ready.',
    negativePrompt:
      'changed background, warped objects, missing source details, low quality, mismatched lighting, broken perspective, watermark',
  },
  {
    id: 'vid-kling-lion-family',
    title: 'Kling 3 Tender Wildlife Shot',
    media: 'video',
    category: 'motion',
    capability: 'textToVideo',
    model: 'fal-ai/kling-video/v3/turbo/standard/text-to-video',
    modelName: 'Kling 3 Turbo',
    generatorModel: 'fal-ai/kling-video/v2.5-turbo/pro/text-to-video',
    generatorModelName: 'Kling 2.5 Turbo Pro',
    badge: 'Wildlife',
    score: 89,
    saves: 820,
    views: 10600,
    fallbackCredits: '0.35',
    settings: { duration: '5', aspectRatio: '16:9' },
    tags: ['wildlife', 'tender', 'camera drift'],
    sourceUrl: 'https://fal.ai/models/fal-ai/kling-video/v3/turbo/standard/text-to-video',
    exampleUrl: 'https://v3b.fal.media/files/b/0a9ea5e6/Z1gmj2xGCP-wyxUr7WheI_output.mp4',
    preview: {
      videoUrl: 'https://v3b.fal.media/files/b/0a9ea5e6/Z1gmj2xGCP-wyxUr7WheI_output.mp4',
      heading: 'WILDLIFE',
      subheading: 'Tender family motion',
      swatch: 'bg-yellow-500',
      tone: 'from-stone-950 via-yellow-950 to-green-700/70',
    },
    prompt:
      'Create a tender wildlife video of [ANIMAL FAMILY] resting in tall grass at golden hour. The young animals paw and tumble gently against the parent, the parent lifts its head and nuzzles one of them, grass sways in a soft breeze, and the camera drifts in slowly. Photorealistic, warm, emotional, cinematic, natural motion.',
    negativePrompt:
      'aggressive behavior, distorted animals, jitter, low detail fur, flicker, bad anatomy, unnatural grass motion',
  },
  {
    id: 'vid-kling-jellyfish-i2v',
    title: 'Kling Neon Jellyfish Motion',
    media: 'video',
    category: 'motion',
    capability: 'imageToVideo',
    model: 'fal-ai/kling-video/v2.5-turbo/standard/image-to-video',
    modelName: 'Kling 2.5 Turbo',
    generatorModel: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
    generatorModelName: 'Kling 2.5 Turbo Pro',
    badge: 'I2V',
    score: 88,
    saves: 770,
    views: 9800,
    fallbackCredits: '0.35',
    settings: { duration: '5' },
    tags: ['image to video', 'underwater', 'neon'],
    requiresSourceImage: true,
    sourceUrl: 'https://fal.ai/models/fal-ai/kling-video/v2.5-turbo/standard/image-to-video',
    exampleUrl: 'https://v3b.fal.media/files/b/0a9753e6/l8hY3e6r_SfM7vv1rtCmw_output.mp4',
    preview: {
      videoUrl: 'https://v3b.fal.media/files/b/0a9753e6/l8hY3e6r_SfM7vv1rtCmw_output.mp4',
      heading: 'JELLYFISH',
      subheading: 'Neon underwater motion',
      swatch: 'bg-cyan-500',
      tone: 'from-black via-cyan-950 to-violet-700/70',
    },
    prompt:
      'Animate the uploaded image as a hypnotic underwater scene. The main subject pulses slowly, neon violet and cyan tendrils or light trails ripple outward like waves, tiny crystal bubbles drift upward, deep dark water moves with soft currents, and god-rays sway gently. Smooth, cinematic, dreamlike, premium motion.',
    negativePrompt:
      'fast chaotic motion, broken subject shape, flicker, muddy water, noisy bubbles, low resolution, warped frame',
  },
  {
    id: 'vid-minimax-galactic-smuggler',
    title: 'Hailuo Galactic Smuggler Trailer',
    media: 'video',
    category: 'fantasy',
    capability: 'textToVideo',
    model: 'fal-ai/minimax/hailuo-02/standard/text-to-video',
    modelName: 'Hailuo 02 Standard',
    badge: 'Sci-fi',
    score: 87,
    saves: 710,
    views: 9000,
    fallbackCredits: '0.27',
    settings: { duration: '6' },
    tags: ['sci-fi', 'character', 'trailer'],
    sourceUrl: 'https://fal.ai/models/fal-ai/minimax/hailuo-02/standard/text-to-video',
    exampleUrl: 'https://v3.fal.media/files/kangaroo/_qEOfY3iKHsc86kqHUUh2_output.mp4',
    preview: {
      videoUrl: 'https://v3.fal.media/files/kangaroo/_qEOfY3iKHsc86kqHUUh2_output.mp4',
      heading: 'SMUGGLER',
      subheading: 'Sci-fi character trailer',
      swatch: 'bg-indigo-500',
      tone: 'from-slate-950 via-indigo-950 to-orange-700/70',
    },
    prompt:
      'Create a cinematic sci-fi trailer shot of [CHARACTER TYPE], a rogue figure with a cybernetic arm and a worn coat that hints at dangerous adventures across the galaxy. Their ship is filled with rare treasures from distant planets. Show hidden compartments, glowing alien artifacts, energy weapons, and a tense atmosphere as the character prepares for the next escape. Dramatic lighting, slow camera movement, high detail, film trailer mood.',
    negativePrompt:
      'cartoon spaceship, weak lighting, low detail props, jitter, distorted hands, cluttered scene, random text',
  },
  {
    id: 'vid-pixverse-sports-car',
    title: 'PixVerse Sports Car Drift',
    media: 'video',
    category: 'motion',
    capability: 'textToVideo',
    model: 'fal-ai/pixverse/v5/text-to-video',
    modelName: 'PixVerse V5',
    badge: 'Speed',
    score: 86,
    saves: 680,
    views: 8600,
    fallbackCredits: '0.2',
    settings: { duration: '5', aspectRatio: '16:9' },
    tags: ['car', 'drift', 'sports'],
    sourceUrl: 'https://fal.ai/models/fal-ai/pixverse/v5/text-to-video',
    exampleUrl: 'https://storage.googleapis.com/falserverless/model_tests/video_models/output-4.mp4',
    preview: {
      videoUrl: 'https://storage.googleapis.com/falserverless/model_tests/video_models/output-4.mp4',
      heading: 'DRIFT',
      subheading: 'Sports car action',
      swatch: 'bg-red-500',
      tone: 'from-zinc-950 via-red-950 to-slate-700/70',
    },
    prompt:
      'Create a high-energy video of a sleek [CAR COLOR] sports car aggressively drifting through a tight asphalt racetrack curve at extreme speed. Rear tires spin and billow dense white smoke across the track, headlights glow, the metallic body catches light, and red-white rumble strips streak past with heavy motion blur. Cinematic motorsport camera, speed, polish, and premium ad energy.',
    negativePrompt:
      'car crash, deformed vehicle, bad wheel rotation, unreadable track, low quality smoke, flicker, shaky camera',
  },
  {
    id: 'img-pakistani-shirt-edit',
    title: 'Your Photo in Pakistani T-Shirt',
    media: 'image',
    category: 'personalization',
    capability: 'edit',
    model: 'fal-ai/nano-banana-2/edit',
    modelName: 'Nano Banana 2 Edit',
    badge: 'Personal',
    score: 95,
    saves: 1500,
    views: 18400,
    fallbackCredits: '0.08',
    settings: { aspectRatio: '1:1', resolution: '1K', numImages: 1 },
    tags: ['upload photo', 't-shirt', 'pakistan'],
    requiresSourceImage: true,
    preview: {
      image: '/template-media/pakistani-shirt-edit.png',
      heading: 'PAKISTAN',
      subheading: 'Name T-shirt edit',
      swatch: 'bg-success',
      tone: 'from-emerald-950 via-green-950 to-sky-700/70',
    },
    prompt:
      'Using the uploaded photo, keep the same person identity, face, pose, and natural expression. Change the outfit into a clean premium Pakistani green T-shirt with a small white crescent-and-star inspired graphic and readable text "[YOUR NAME]" on the shirt. Keep the image realistic, respectful, well-lit, and professional. Background style: [BACKGROUND STYLE].',
    negativePrompt:
      'changed face identity, distorted face, wrong name text, unreadable shirt text, bad hands, low quality, extra logos, political symbol misuse',
  },
  {
    id: 'vid-person-dance-i2v',
    title: 'Turn Your Photo Into Dance Video',
    media: 'video',
    category: 'personalization',
    capability: 'imageToVideo',
    model: 'bytedance/seedance-2.0/image-to-video',
    modelName: 'Seedance 2.0 I2V',
    badge: 'Upload',
    score: 94,
    saves: 1460,
    views: 17600,
    fallbackCredits: '0.112',
    settings: { duration: '8', aspectRatio: '9:16', resolution: '1080p', generateAudio: true },
    tags: ['upload image', 'dance', 'reel'],
    requiresSourceImage: true,
    preview: {
      image: '/template-media/dance-video-template.png',
      heading: 'DANCE',
      subheading: 'Animate a source photo',
      swatch: 'bg-accent-violet',
      tone: 'from-black via-violet-950 to-fuchsia-700/70',
    },
    prompt:
      'Animate the uploaded person photo into an energetic [DANCE STYLE] dance video. Keep the person identity, outfit, and face consistent. The person dances confidently in [LOCATION], with natural full-body movement, smooth camera motion, upbeat social media reel energy, clean lighting, and realistic motion. Do not change the person face.',
    negativePrompt:
      'changed identity, distorted face, broken limbs, unnatural dancing, flicker, bad hands, low resolution, shaky camera',
  },
  {
    id: 'img-profile-headshot-edit',
    title: 'Professional Profile Headshot',
    media: 'image',
    category: 'personalization',
    capability: 'edit',
    model: 'openai/gpt-image-2/edit',
    modelName: 'GPT Image 2 Edit',
    badge: 'LinkedIn',
    score: 93,
    saves: 1320,
    views: 15800,
    fallbackCredits: '1',
    settings: { aspectRatio: '1:1', resolution: '1K', numImages: 1 },
    tags: ['upload selfie', 'headshot', 'profile'],
    requiresSourceImage: true,
    preview: {
      image: '/template-media/profile-headshot-edit.png',
      heading: 'HEADSHOT',
      subheading: 'Clean business profile',
      swatch: 'bg-accent-blue',
      tone: 'from-blue-950 via-slate-950 to-teal-700/70',
    },
    prompt:
      'Using the uploaded selfie, create a professional profile headshot for [PLATFORM OR USE]. Preserve the same person identity and facial features. Improve lighting, posture, framing, clothing polish, and background. Use [BACKGROUND STYLE] background, natural skin texture, sharp eyes, clean composition, and a trustworthy professional look.',
    negativePrompt:
      'changed identity, plastic skin, over-retouched, distorted eyes, bad teeth, messy hair artifacts, watermark, low quality',
  },
  {
    id: 'vid-product-hand-demo',
    title: 'Product Hand Demo Video',
    media: 'video',
    category: 'product',
    capability: 'textToVideo',
    model: 'bytedance/seedance-2.0/text-to-video',
    modelName: 'Seedance 2.0',
    badge: 'Product',
    score: 90,
    saves: 980,
    views: 12200,
    fallbackCredits: '0.112',
    settings: { duration: '8', aspectRatio: '9:16', resolution: '1080p', generateAudio: true },
    tags: ['product demo', 'hands', 'reel'],
    preview: {
      image: '/template-media/product-hand-demo.png',
      heading: 'DEMO',
      subheading: 'Hands-on product motion',
      swatch: 'bg-warning',
      tone: 'from-stone-950 via-orange-950 to-yellow-700/70',
    },
    prompt:
      'Create an 8-second vertical product demo video for [PRODUCT NAME]. Show clean hands picking up the product, rotating it toward the camera, highlighting the key detail "[FEATURE]", then placing it on a premium surface. Use soft studio lighting, smooth camera push-in, realistic product texture, clean background, and final space for brand text.',
    negativePrompt:
      'distorted hands, warped product, unreadable labels, messy table, low quality, shaky camera, extra products',
  },
]

function modelOptions() {
  const ids = [...new Set(TEMPLATES.map((template) => template.model))]
  return [{ id: 'all', label: MODEL_LABELS.all }, ...ids.map((id) => ({ id, label: MODEL_LABELS[id] || id }))]
}

function categoryOptions() {
  const ids = [...new Set(TEMPLATES.map((template) => template.category))]
  return [{ id: 'all', label: 'All categories' }, ...ids.map((id) => ({ id, label: CATEGORY_LABELS[id] || id }))]
}

function metric(value) {
  if (value >= 1000) return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}k`
  return String(value)
}

function extractPlaceholders(prompt) {
  const found = new Map()
  const pattern = /\[([A-Z0-9][A-Z0-9 /&._-]{1,60})\]/g
  let match = pattern.exec(prompt || '')
  while (match) {
    const key = match[1].trim()
    if (!found.has(key)) {
      found.set(key, {
        key,
        token: `[${key}]`,
        label: key
          .toLowerCase()
          .split(/[\s/_-]+/)
          .filter(Boolean)
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join(' '),
      })
    }
    match = pattern.exec(prompt || '')
  }
  return [...found.values()]
}

function defaultCustomizationFields(template) {
  if (!template) return []
  if (extractPlaceholders(template.prompt).length) return []

  if (template.category === 'food') {
    return ['RESTAURANT OR BRAND NAME', 'DEAL OR PRODUCT NAME', 'PRICE OR OFFER TEXT', 'COLOR STYLE']
  }

  if (template.category === 'education') {
    return ['PROGRAM NAME', 'VENUE OR LOCATION', 'DATE OR DEADLINE', 'COLOR STYLE']
  }

  if (template.category === 'personalization') {
    return ['YOUR NAME', 'SHIRT OR OUTFIT COLOR', 'BACKGROUND STYLE', 'EXTRA DETAILS']
  }

  if (template.media === 'video') {
    return ['MAIN SUBJECT OR PERSON', 'LOCATION OR BACKGROUND', 'MOTION STYLE', 'BRAND OR TEXT']
  }

  return ['PRODUCT OR PERSON NAME', 'MAIN TEXT OR NAME', 'COLOR OR STYLE', 'EXTRA DETAILS']
}

function promptTemplateText(template) {
  const prompt = template?.prompt || ''
  const fields = defaultCustomizationFields(template)
  if (!fields.length) return prompt

  return `${prompt}

Customize this template:
${fields.map((field) => `- ${field}: [${field}]`).join('\n')}`
}

function initialTemplateValues(template) {
  return Object.fromEntries(extractPlaceholders(promptTemplateText(template)).map((field) => [field.key, '']))
}

function applyTemplateValues(prompt, values) {
  let next = prompt || ''
  for (const field of extractPlaceholders(prompt)) {
    const value = String(values?.[field.key] || '').trim()
    if (value) next = next.split(field.token).join(value)
  }
  return next
}

function generatorModelId(template) {
  return template?.generatorModel || template?.model
}

function generatorModelName(template) {
  return template?.generatorModelName || template?.modelName
}

function TemplatePreview({ template, compact = false }) {
  const imageUrl = template.preview.image
  const videoUrl = template.preview.videoUrl
  const hasMedia = Boolean(imageUrl || videoUrl)

  return (
    <div
      className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${template.preview.tone} ${
        compact ? 'aspect-[16/10]' : 'aspect-[16/10] min-h-[280px]'
      }`}
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          poster={imageUrl}
          muted
          loop
          autoPlay={!compact}
          controls={!compact}
          playsInline
          preload={compact ? 'metadata' : 'auto'}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : imageUrl ? (
        <img src={imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
      ) : (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(255,255,255,.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,.08),transparent_45%)]" />
      )}

      {!hasMedia && (
        <>
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            <span className={`h-2 w-2 rounded-full ${template.preview.swatch}`} />
            {template.media.toUpperCase()}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className={`${compact ? 'text-2xl' : 'text-4xl'} font-heading font-bold tracking-normal text-white`}>
              {template.preview.heading}
            </p>
            <p className="mt-1 text-sm font-medium text-white/75">{template.preview.subheading}</p>
          </div>
        </>
      )}

      {hasMedia && template.media === 'video' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/10">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border border-white/35 bg-black/35 text-white shadow-xl backdrop-blur">
            <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-white" />
          </span>
          <span className="absolute bottom-3 left-3 rounded-full border border-white/20 bg-black/45 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur">
            Video preview
          </span>
        </div>
      )}

      <div className="absolute right-4 top-4 rounded-full bg-white/15 px-2 py-1 text-[10px] font-bold uppercase text-white backdrop-blur">
        {template.badge}
      </div>
    </div>
  )
}

function useTemplateQuote(template, prompt, negativePrompt) {
  const [quote, setQuote] = useState(null)

  useEffect(() => {
    if (!template) {
      return
    }
    let cancelled = false
    ;(async () => {
      try {
        const data = await quoteCredits({
          kind: template.media,
          capability: template.capability,
          model: generatorModelId(template),
          settings: {
            ...template.settings,
            prompt,
            negativePrompt,
          },
        })
        if (!cancelled) setQuote(data)
      } catch {
        if (!cancelled) setQuote(null)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [negativePrompt, prompt, template])

  return quote
}

export default function TemplatesPage() {
  const navigate = useNavigate()
  const [media, setMedia] = useState('all')
  const [model, setModel] = useState('all')
  const [category, setCategory] = useState('all')
  const [sortBy, setSortBy] = useState('hot')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [draftPrompt, setDraftPrompt] = useState('')
  const [draftNegativePrompt, setDraftNegativePrompt] = useState('')
  const [templateValues, setTemplateValues] = useState({})

  const openTemplate = (template) => {
    const promptText = promptTemplateText(template)
    const values = initialTemplateValues(template)
    setSelectedTemplate(template)
    setTemplateValues(values)
    setDraftPrompt(applyTemplateValues(promptText, values))
    setDraftNegativePrompt(template.negativePrompt || '')
  }

  const liveQuote = useTemplateQuote(selectedTemplate, draftPrompt, draftNegativePrompt)

  const filteredTemplates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    let list = [...TEMPLATES]
    if (media !== 'all') list = list.filter((template) => template.media === media)
    if (model !== 'all') list = list.filter((template) => template.model === model)
    if (category !== 'all') list = list.filter((template) => template.category === category)
    if (q) {
      list = list.filter((template) =>
        [
          template.title,
          template.modelName,
          CATEGORY_LABELS[template.category],
          template.prompt,
          ...template.tags,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q)),
      )
    }
    if (sortBy === 'hot') list.sort((a, b) => b.score - a.score)
    if (sortBy === 'saved') list.sort((a, b) => b.saves - a.saves)
    if (sortBy === 'new') list.sort((a, b) => b.id.localeCompare(a.id))
    return list
  }, [category, media, model, searchQuery, sortBy])

  const hotTemplates = useMemo(
    () => [...TEMPLATES].sort((a, b) => b.score - a.score).slice(0, 5),
    [],
  )

  const displayedCredits = liveQuote?.credits || selectedTemplate?.fallbackCredits
  const selectedPromptText = selectedTemplate ? promptTemplateText(selectedTemplate) : ''
  const selectedFields = selectedTemplate ? extractPlaceholders(selectedPromptText) : []

  const updateTemplateValue = (key, value) => {
    if (!selectedTemplate) return
    const nextValues = { ...templateValues, [key]: value }
    setTemplateValues(nextValues)
    setDraftPrompt(applyTemplateValues(selectedPromptText, nextValues))
  }

  const useTemplate = () => {
    if (!selectedTemplate) return
    const path = selectedTemplate.media === 'video' ? '/video-gen' : '/image-gen'
    const nextModel = generatorModelId(selectedTemplate)
    navigate(path, {
      state: {
        template: {
          id: selectedTemplate.id,
          title: selectedTemplate.title,
          kind: selectedTemplate.media,
          capability: selectedTemplate.capability,
          model: nextModel,
          sourceModel: selectedTemplate.model,
          sourceModelName: selectedTemplate.modelName,
          prompt: draftPrompt,
          negativePrompt: draftNegativePrompt,
          settings: selectedTemplate.settings,
          creditEstimate: displayedCredits,
        },
      },
    })
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-base">
        <Topbar title="Prompt Templates" />

        <main className="space-y-8 p-7">
          <section className="grid gap-5 lg:grid-cols-[1.4fr_.9fr]">
            <div className="rounded-2xl border border-border-default bg-panel p-6">
              <p className="text-xs font-semibold uppercase text-accent-blue">
                Admart Prompt Library
              </p>
              <h1 className="mt-3 max-w-3xl font-heading text-3xl font-bold text-text-primary">
                Ready-to-edit prompts for image and video campaigns
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary">
                Browse professional prompt templates by media, model, and category. Open a template to see
                the model, editable prompt, settings, and estimated Admart credits before generating.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  ['Templates', TEMPLATES.length],
                  ['Models', modelOptions().length - 1],
                  ['Media types', 2],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-border bg-surface px-4 py-3">
                    <p className="font-heading text-2xl font-bold text-text-primary">{value}</p>
                    <p className="text-xs text-text-tertiary">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border-default bg-panel p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-lg font-semibold text-text-primary">Hottest This Week</h2>
                <span className="rounded-full border border-accent-blue/30 bg-accent-blue/10 px-2 py-1 text-xs font-semibold text-accent-blue">
                  Live style
                </span>
              </div>
              <div className="mt-4 space-y-2">
                {hotTemplates.map((template, index) => (
                  <button
                    key={template.id}
                    type="button"
                    onClick={() => openTemplate(template)}
                    className="flex w-full items-center gap-3 rounded-xl border border-transparent px-2 py-2 text-left transition hover:border-border-default hover:bg-surface"
                  >
                    <span className="font-mono text-xs text-text-muted">{String(index + 1).padStart(2, '0')}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-text-primary">{template.title}</span>
                      <span className="text-xs text-text-tertiary">{template.modelName}</span>
                    </span>
                    <span className="font-mono text-xs text-accent-blue">{template.score}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-heading text-xl font-bold text-text-primary">Curated Prompt Packs</h2>
                <p className="mt-1 text-sm text-text-tertiary">Campaign-ready groups for common Admart workflows.</p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {TEMPLATE_PACKS.map((pack) => (
                <button
                  key={pack.id}
                  type="button"
                  onClick={() => {
                    const first = TEMPLATES.find((template) => template.id === pack.templateIds[0])
                    if (first) openTemplate(first)
                  }}
                  className={`rounded-2xl border border-border-default bg-gradient-to-br ${pack.accent} p-5 text-left transition hover:border-accent-blue/40`}
                >
                  <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-xs font-semibold text-text-secondary">
                    {pack.count} prompts
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-text-primary">{pack.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-text-secondary">{pack.description}</p>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex rounded-xl border border-border-default bg-panel p-1">
                {MEDIA_FILTERS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMedia(item.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      media === item.id ? 'bg-accent-blue text-white' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                aria-label="Filter by model"
              >
                {modelOptions().map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                aria-label="Filter by category"
              >
                {categoryOptions().map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.label}
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-border-default bg-input px-3 py-2.5 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                aria-label="Sort templates"
              >
                <option value="hot">Hot</option>
                <option value="saved">Most saved</option>
                <option value="new">Newest</option>
              </select>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search prompt, model, tag..."
                className="min-w-[220px] flex-1 rounded-xl border border-border-default bg-input px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-text-secondary">
                {filteredTemplates.length} prompt template{filteredTemplates.length === 1 ? '' : 's'} shown
              </p>
              <p className="text-xs text-text-tertiary">Prompts are editable before generation.</p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredTemplates.map((template) => (
                <article
                  key={template.id}
                  className="group overflow-hidden rounded-2xl border border-border-default bg-panel transition hover:border-accent-blue/40"
                >
                  <button
                    type="button"
                    onClick={() => openTemplate(template)}
                    className="block w-full text-left"
                  >
                    <TemplatePreview template={template} compact />
                    <div className="space-y-4 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="font-heading font-semibold leading-tight text-text-primary">{template.title}</h3>
                          <p className="mt-1 text-xs text-text-tertiary">
                            {CATEGORY_LABELS[template.category]} / {template.modelName}
                          </p>
                        </div>
                        <span className="rounded-full border border-border bg-surface px-2 py-1 text-[10px] font-bold uppercase text-text-secondary">
                          {template.media}
                        </span>
                      </div>
                      <p className="line-clamp-2 text-sm leading-6 text-text-secondary">{template.prompt}</p>
                      <div className="flex flex-wrap items-center gap-2">
                        {template.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="rounded-full bg-surface px-2 py-1 text-xs text-text-tertiary">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-text-tertiary">
                        <span>{metric(template.views)} views</span>
                        <span>{metric(template.saves)} saves</span>
                        <span className="font-mono text-accent-blue">{formatCredits(template.fallbackCredits)} cr</span>
                      </div>
                    </div>
                  </button>
                </article>
              ))}
            </div>
          </section>
        </main>
      </div>

      {selectedTemplate && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="template-modal-title"
        >
          <div className="grid h-[calc(100vh-2rem)] max-h-[920px] w-full max-w-6xl overflow-hidden rounded-2xl border border-border-default bg-panel shadow-2xl lg:grid-cols-[1fr_420px]">
            <div className="min-h-0 overflow-y-auto border-b border-border-default p-5 lg:border-b-0 lg:border-r">
              <TemplatePreview template={selectedTemplate} />
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="text-xs text-text-tertiary">Reference Model</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{selectedTemplate.modelName}</p>
                  {generatorModelId(selectedTemplate) !== selectedTemplate.model && (
                    <p className="mt-1 text-xs text-text-tertiary">Generates with {generatorModelName(selectedTemplate)}</p>
                  )}
                </div>
                <div className="rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="text-xs text-text-tertiary">Capability</p>
                  <p className="mt-1 text-sm font-semibold text-text-primary">{selectedTemplate.capability}</p>
                </div>
                <div className="rounded-xl border border-border bg-surface px-4 py-3">
                  <p className="text-xs text-text-tertiary">Estimated Credits</p>
                  <p className="mt-1 font-mono text-sm font-semibold text-accent-blue">
                    {formatCredits(displayedCredits)} cr
                  </p>
                </div>
              </div>
            </div>

            <div className="flex min-h-0 flex-col">
              <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase text-accent-blue">
                      {CATEGORY_LABELS[selectedTemplate.category]}
                    </p>
                    <h2 id="template-modal-title" className="mt-1 font-heading text-2xl font-bold text-text-primary">
                      {selectedTemplate.title}
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedTemplate(null)}
                    className="rounded-lg border border-border-default bg-surface px-2 py-1 text-sm text-text-secondary hover:text-text-primary"
                    aria-label="Close template"
                  >
                    Close
                  </button>
                </div>

                <div className="rounded-xl border border-border-default bg-surface p-4">
                  <p className="text-xs font-semibold uppercase text-text-muted">Reference Model ID</p>
                  <p className="mt-1 break-all font-mono text-xs text-text-secondary">{selectedTemplate.model}</p>
                  {generatorModelId(selectedTemplate) !== selectedTemplate.model && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-xs font-semibold uppercase text-text-muted">Admart Generator Model</p>
                      <p className="mt-1 break-all font-mono text-xs text-text-secondary">
                        {generatorModelId(selectedTemplate)}
                      </p>
                    </div>
                  )}
                </div>

                {selectedFields.length > 0 && (
                  <div className="rounded-xl border border-border-default bg-surface p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-text-primary">Quick Fields</p>
                      <span className="text-xs text-text-tertiary">Auto-fills the prompt</span>
                    </div>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {selectedFields.map((field) => (
                        <label key={field.key} className="block">
                          <span className="text-xs font-medium text-text-tertiary">{field.label}</span>
                          <input
                            type="text"
                            value={templateValues[field.key] || ''}
                            onChange={(e) => updateTemplateValue(field.key, e.target.value)}
                            placeholder={`Enter ${field.label.toLowerCase()}`}
                            className="mt-1 w-full rounded-lg border border-border-default bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                {selectedTemplate.requiresSourceImage && (
                  <div className="rounded-xl border border-warning/30 bg-warning/10 p-4 text-sm">
                    <p className="font-semibold text-warning">Source image required</p>
                    <p className="mt-1 text-text-secondary">
                      This template opens the correct generator with the prompt ready. Upload your own image there,
                      then hit Generate.
                    </p>
                  </div>
                )}

                <label className="block">
                  <span className="text-sm font-semibold text-text-primary">Editable Prompt</span>
                  <textarea
                    value={draftPrompt}
                    onChange={(e) => setDraftPrompt(e.target.value)}
                    rows={9}
                    className="mt-2 w-full resize-y rounded-xl border border-border-default bg-input px-4 py-3 text-sm leading-6 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-text-primary">Negative Prompt</span>
                  <textarea
                    value={draftNegativePrompt}
                    onChange={(e) => setDraftNegativePrompt(e.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-y rounded-xl border border-border-default bg-input px-4 py-3 text-sm leading-6 text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue"
                  />
                </label>

                <div className="rounded-xl border border-border-default bg-surface p-4">
                  <p className="text-sm font-semibold text-text-primary">Settings</p>
                  <div className="mt-3 grid gap-2 text-sm">
                    {Object.entries(selectedTemplate.settings).map(([key, value]) => (
                      <div key={key} className="flex justify-between gap-3 border-b border-border/70 py-2 last:border-0">
                        <span className="text-text-tertiary">{key}</span>
                        <span className="font-medium text-text-primary">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {liveQuote?.creditsAfter != null && (
                  <div className="rounded-xl border border-accent-blue/30 bg-accent-blue/10 p-4 text-sm">
                    <p className="font-semibold text-accent-blue">Live quote from your current model settings</p>
                    <p className="mt-1 text-text-secondary">
                      Cost {formatCredits(liveQuote.credits)} cr. After generation you would have{' '}
                      {formatCredits(liveQuote.creditsAfter)} cr.
                    </p>
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-border-default p-6">
                <button
                  type="button"
                  onClick={useTemplate}
                  disabled={!draftPrompt.trim()}
                  className="flex w-full items-center justify-center rounded-xl bg-accent-blue py-3 text-sm font-semibold text-white shadow-lg shadow-accent-blue/25 transition hover:bg-accent-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Use in {selectedTemplate.media === 'video' ? 'Video Generator' : 'Image Generator'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const values = initialTemplateValues(selectedTemplate)
                    setTemplateValues(values)
                    setDraftPrompt(applyTemplateValues(selectedPromptText, values))
                    setDraftNegativePrompt(selectedTemplate.negativePrompt || '')
                  }}
                  className="w-full rounded-xl border border-border-default bg-surface py-3 text-sm font-semibold text-text-primary transition hover:border-accent-blue/40"
                >
                  Reset Prompt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
