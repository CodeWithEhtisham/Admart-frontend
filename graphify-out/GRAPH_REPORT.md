# Graph Report - /media/koraspond/DataDrive/admart/Admart-frontend  (2026-06-20)

## Corpus Check
- Corpus is ~47,193 words - fits in a single context window. You may not need a graph.

## Summary
- 261 nodes · 367 edges · 24 communities (14 shown, 10 thin omitted)
- Extraction: 96% EXTRACTED · 4% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Authentication & User Accounts|Authentication & User Accounts]]
- [[_COMMUNITY_App Shell Layout & BillingCredits|App Shell Layout & Billing/Credits]]
- [[_COMMUNITY_Project Dependencies & Manifests|Project Dependencies & Manifests]]
- [[_COMMUNITY_Image Generation & Wizard Forms|Image Generation & Wizard Forms]]
- [[_COMMUNITY_REST API Template & User Validation|REST API Template & User Validation]]
- [[_COMMUNITY_Progress Tracking & Rendering Pipeline|Progress Tracking & Rendering Pipeline]]
- [[_COMMUNITY_Analytics Dashboard & Status Tracking|Analytics Dashboard & Status Tracking]]
- [[_COMMUNITY_App Landing & Media Library Navigation|App Landing & Media Library Navigation]]
- [[_COMMUNITY_Analytics Charts & User Engagement Data|Analytics Charts & User Engagement Data]]
- [[_COMMUNITY_Scheduler Calendar & Mock Events|Scheduler Calendar & Mock Events]]
- [[_COMMUNITY_Brand Kit Customizer & Theme Fonts|Brand Kit Customizer & Theme Fonts]]
- [[_COMMUNITY_Site Icons & Brand Assets|Site Icons & Brand Assets]]
- [[_COMMUNITY_API Design & Next.js Skills  Standards|API Design & Next.js Skills / Standards]]
- [[_COMMUNITY_Antigravity Workspace CLI Session Metadata|Antigravity Workspace CLI Session Metadata]]
- [[_COMMUNITY_Hero Section Illustration & Isometric Layers|Hero Section Illustration & Isometric Layers]]
- [[_COMMUNITY_Knowledge Graph (Graphify) Configurations|Knowledge Graph (Graphify) Configurations]]
- [[_COMMUNITY_CLI Integration Configuration|CLI Integration Configuration]]
- [[_COMMUNITY_Vite HTML Entrypoint|Vite HTML Entrypoint]]
- [[_COMMUNITY_Full-Stack Orchestration Guidance|Full-Stack Orchestration Guidance]]
- [[_COMMUNITY_TypeScript Pro Patterns Guidance|TypeScript Pro Patterns Guidance]]
- [[_COMMUNITY_Security Auditor Playbooks|Security Auditor Playbooks]]
- [[_COMMUNITY_Vite Logo Asset|Vite Logo Asset]]
- [[_COMMUNITY_React Logo Asset|React Logo Asset]]
- [[_COMMUNITY_Favicon Asset|Favicon Asset]]

## God Nodes (most connected - your core abstractions)
1. `DashboardPage()` - 21 edges
2. `App()` - 15 edges
3. `VidifySidebar()` - 14 edges
4. `devDependencies` - 10 edges
5. `WizardPage()` - 9 edges
6. `LandingPage()` - 9 edges
7. `ResultPage()` - 8 edges
8. `downloadFilename()` - 7 edges
9. `AnalyticsPage()` - 7 edges
10. `dependencies` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Vidify Frontend Overview` --references--> `LandingPage()`  [INFERRED]
  README.md → src/pages/LandingPage.jsx
- `AuthPage()` --conceptually_related_to--> `create_user()`  [INFERRED]
  src/pages/AuthPage.jsx → .agent/skills/api-design-principles/assets/rest-api-template.py
- `OnboardingPage()` --conceptually_related_to--> `create_user()`  [INFERRED]
  src/pages/OnboardingPage.jsx → .agent/skills/api-design-principles/assets/rest-api-template.py
- `SettingsPage()` --conceptually_related_to--> `update_user()`  [INFERRED]
  src/pages/SettingsPage.jsx → .agent/skills/api-design-principles/assets/rest-api-template.py
- `Frontend Development Agent Rules` --conceptually_related_to--> `Vidify Frontend Overview`  [INFERRED]
  AGENT.md → README.md

## Hyperedges (group relationships)
- **Vidify Sidebar Consumers** — pages_imagegenpage_imagegenpage, pages_settingspage_settingspage, pages_brandkitpage_brandkitpage, pages_notificationspage_notificationspage, pages_billingpage_billingpage [EXTRACTED 1.00]
- **AI Asset Generation Flow** — pages_wizardpage_wizardpage, pages_imagegenpage_imagegenpage, pages_brandkitpage_brandkitpage [INFERRED 0.85]
- **User Onboarding and Dashboard Flow** — pages_authpage_authpage, pages_onboardingpage_onboardingpage, pages_dashboardpage_dashboardpage [INFERRED 0.95]
- **Video Creation and Publishing Flow** — pages_progresspage_progresspage, pages_resultpage_resultpage, pages_publishingpage_publishingpage [INFERRED 0.95]
- **API Design Standards and Guidelines** — api_design_principles_skill_main, resources_implementation_playbook_apidesign, assets_api_design_checklist_main, references_rest_best_practices_main, references_graphql_schema_design_main [EXTRACTED 1.00]

## Communities (24 total, 10 thin omitted)

### Community 0 - "Authentication & User Accounts"
Cohesion: 0.07
Nodes (23): create_user(), AuthPage(), showcaseItems, strengthMeta(), ACCENT_MAP, EMPTY_STATES, NotFoundPage(), QUICK_LINKS (+15 more)

### Community 1 - "App Shell Layout & Billing/Credits"
Cohesion: 0.07
Nodes (21): itemCls(), VidifySidebar(), BillingPage(), COST_REF, AI Credit Consumption and Billing, PACKS, TXNS, CalendarPage() (+13 more)

### Community 2 - "Project Dependencies & Manifests"
Cohesion: 0.07
Nodes (25): dependencies, react, react-dom, react-router-dom, tailwindcss, @tailwindcss/vite, devDependencies, eslint (+17 more)

### Community 3 - "Image Generation & Wizard Forms"
Cohesion: 0.12
Nodes (20): ImageGenPage(), API_BASE_URL, ASPECTS, fetchWithTimeout(), generateTextImage(), getTextImageStatus(), IMAGE_MODELS, IMAGE_SUGGESTIONS (+12 more)

### Community 4 - "REST API Template & User Validation"
Cohesion: 0.16
Nodes (21): delete_user(), ErrorDetail, ErrorResponse, get_user(), http_exception_handler(), list_users(), PaginatedResponse, PaginationParams (+13 more)

### Community 5 - "Progress Tracking & Rendering Pipeline"
Cohesion: 0.16
Nodes (16): activeStageIndex(), FRAME_THRESHOLDS, framesLoadedCount(), ProgressPage(), STAGES, ChevronLeftIcon(), PLATFORMS, PublishingPage() (+8 more)

### Community 6 - "Analytics Dashboard & Status Tracking"
Cohesion: 0.2
Nodes (14): DashboardPage(), FILTERS, SPARKLINES, VIDEOS, Multi-Step Wizard Pattern, WizardPage(), downloadAsset(), downloadFilename() (+6 more)

### Community 7 - "App Landing & Media Library Navigation"
Cohesion: 0.15
Nodes (11): Frontend Development Agent Rules, LandingPage(), LogoMark(), showcaseVideos, VideoCard(), LibraryPage(), MOCK_VIDEOS, navLinkClass() (+3 more)

### Community 8 - "Analytics Charts & User Engagement Data"
Cohesion: 0.23
Nodes (11): AnalyticsPage(), APR_LABELS, DonutChart(), ENG_STACK, LINE_POINTS, LineChart(), MONTHS, PLATFORM_DOT (+3 more)

### Community 9 - "Scheduler Calendar & Mock Events"
Cohesion: 0.17
Nodes (5): MOCK_EVENTS, MONTH_NAMES, PLATFORMS, STATUS_STYLES, TODAY

### Community 10 - "Brand Kit Customizer & Theme Fonts"
Cohesion: 0.2
Nodes (9): ASPECT_OPTIONS, BODY_FONTS, BrandKitPage(), HEADING_FONTS, INITIAL_COLORS, STYLE_OPTIONS, TONE_PRESETS, VOICE_OPTIONS (+1 more)

### Community 11 - "Site Icons & Brand Assets"
Cohesion: 0.29
Nodes (7): Icons Sheet, Bluesky Icon, Discord Icon, Documentation Icon, Github Icon, Social Icon, X Icon

### Community 12 - "API Design & Next.js Skills / Standards"
Cohesion: 0.29
Nodes (7): API Design Principles Skill, API Design Checklist, Next.js App Router Patterns Skill, GraphQL Schema Design Patterns, REST API Best Practices, API Design Implementation Playbook, Next.js App Router Patterns Playbook

### Community 13 - "Antigravity Workspace CLI Session Metadata"
Cohesion: 0.4
Nodes (4): id, name, projectResources, resources

## Knowledge Gaps
- **122 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+117 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DashboardPage()` connect `Analytics Dashboard & Status Tracking` to `Authentication & User Accounts`, `App Shell Layout & Billing/Credits`, `REST API Template & User Validation`, `Progress Tracking & Rendering Pipeline`, `App Landing & Media Library Navigation`, `Analytics Charts & User Engagement Data`?**
  _High betweenness centrality (0.081) - this node is a cross-community bridge._
- **Why does `App()` connect `Authentication & User Accounts` to `App Shell Layout & Billing/Credits`, `Image Generation & Wizard Forms`, `REST API Template & User Validation`, `Analytics Dashboard & Status Tracking`, `App Landing & Media Library Navigation`, `Brand Kit Customizer & Theme Fonts`?**
  _High betweenness centrality (0.063) - this node is a cross-community bridge._
- **Why does `create_user()` connect `Authentication & User Accounts` to `REST API Template & User Validation`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _122 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Authentication & User Accounts` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `App Shell Layout & Billing/Credits` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Project Dependencies & Manifests` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._