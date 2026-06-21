# Graph Report - Admart-frontend  (2026-06-21)

## Corpus Check
- 45 files · ~49,117 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 560 nodes · 670 edges · 60 communities (47 shown, 13 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4182243a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

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
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]

## God Nodes (most connected - your core abstractions)
1. `DashboardPage()` - 21 edges
2. `App()` - 15 edges
3. `Pre-Implementation Review` - 15 edges
4. `REST API Best Practices` - 15 edges
5. `VidifySidebar()` - 14 edges
6. `GraphQL Schema Design Patterns` - 13 edges
7. `Capabilities` - 12 edges
8. `AGENTS.md — Frontend (Next.js + React)` - 11 edges
9. `devDependencies` - 10 edges
10. `WizardPage()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Vidify Frontend Overview` --references--> `LandingPage()`  [INFERRED]
  README.md → src/pages/LandingPage.jsx
- `AuthPage()` --conceptually_related_to--> `create_user()`  [INFERRED]
  src/pages/AuthPage.jsx → .agent/skills/api-design-principles/assets/rest-api-template.py
- `OnboardingPage()` --conceptually_related_to--> `create_user()`  [INFERRED]
  src/pages/OnboardingPage.jsx → .agent/skills/api-design-principles/assets/rest-api-template.py
- `SettingsPage()` --conceptually_related_to--> `update_user()`  [INFERRED]
  src/pages/SettingsPage.jsx → .agent/skills/api-design-principles/assets/rest-api-template.py
- `generateTextImage()` --semantically_similar_to--> `ImageGenPage()`  [INFERRED] [semantically similar]
  src/pages/WizardPage.jsx → src/pages/ImageGenPage.jsx

## Hyperedges (group relationships)
- **Vidify Sidebar Consumers** — pages_imagegenpage_imagegenpage, pages_settingspage_settingspage, pages_brandkitpage_brandkitpage, pages_notificationspage_notificationspage, pages_billingpage_billingpage [EXTRACTED 1.00]
- **AI Asset Generation Flow** — pages_wizardpage_wizardpage, pages_imagegenpage_imagegenpage, pages_brandkitpage_brandkitpage [INFERRED 0.85]
- **User Onboarding and Dashboard Flow** — pages_authpage_authpage, pages_onboardingpage_onboardingpage, pages_dashboardpage_dashboardpage [INFERRED 0.95]
- **Video Creation and Publishing Flow** — pages_progresspage_progresspage, pages_resultpage_resultpage, pages_publishingpage_publishingpage [INFERRED 0.95]
- **API Design Standards and Guidelines** — api_design_principles_skill_main, resources_implementation_playbook_apidesign, assets_api_design_checklist_main, references_rest_best_practices_main, references_graphql_schema_design_main [EXTRACTED 1.00]

## Communities (60 total, 13 thin omitted)

### Community 0 - "Authentication & User Accounts"
Cohesion: 0.17
Nodes (9): Frontend Development Agent Rules, AuthPage(), showcaseItems, strengthMeta(), LandingPage(), LogoMark(), showcaseVideos, VideoCard() (+1 more)

### Community 1 - "App Shell Layout & Billing/Credits"
Cohesion: 0.09
Nodes (21): itemCls(), AnalyticsPage(), APR_LABELS, DonutChart(), ENG_STACK, LINE_POINTS, LineChart(), MONTHS (+13 more)

### Community 2 - "Project Dependencies & Manifests"
Cohesion: 0.07
Nodes (26): dependencies, axios, react, react-dom, react-router-dom, tailwindcss, @tailwindcss/vite, devDependencies (+18 more)

### Community 3 - "Image Generation & Wizard Forms"
Cohesion: 0.13
Nodes (19): API_BASE_URL, ASPECTS, fetchWithTimeout(), generateTextImage(), getTextImageStatus(), IMAGE_MODELS, IMAGE_SUGGESTIONS, INPUT_TABS (+11 more)

### Community 4 - "REST API Template & User Validation"
Cohesion: 0.16
Nodes (21): create_user(), delete_user(), ErrorDetail, ErrorResponse, get_user(), http_exception_handler(), list_users(), PaginatedResponse (+13 more)

### Community 5 - "Progress Tracking & Rendering Pipeline"
Cohesion: 0.16
Nodes (16): activeStageIndex(), FRAME_THRESHOLDS, framesLoadedCount(), ProgressPage(), STAGES, ChevronLeftIcon(), PLATFORMS, PublishingPage() (+8 more)

### Community 6 - "Analytics Dashboard & Status Tracking"
Cohesion: 0.13
Nodes (28): VidifySidebar(), BillingPage(), AI Credit Consumption and Billing, BrandKitPage(), CalendarPage(), DashboardPage(), FILTERS, SPARKLINES (+20 more)

### Community 7 - "App Landing & Media Library Navigation"
Cohesion: 0.22
Nodes (4): MOCK_VIDEOS, navLinkClass(), PLATFORM_DOT, STATUS_STYLES

### Community 8 - "Analytics Charts & User Engagement Data"
Cohesion: 0.22
Nodes (8): ASPECT_OPTIONS, BODY_FONTS, HEADING_FONTS, INITIAL_COLORS, STYLE_OPTIONS, TONE_PRESETS, VOICE_OPTIONS, WATERMARK_OPTIONS

### Community 9 - "Scheduler Calendar & Mock Events"
Cohesion: 0.17
Nodes (5): MOCK_EVENTS, MONTH_NAMES, PLATFORMS, STATUS_STYLES, TODAY

### Community 10 - "Brand Kit Customizer & Theme Fonts"
Cohesion: 0.05
Nodes (49): 1. Rendering Modes, 1. RESTful Design Principles, 2. File Conventions, 2. GraphQL Design Principles, 3. API Versioning Strategies, API Design Principles Implementation Playbook, Best Practices, Caching Strategies (+41 more)

### Community 11 - "Site Icons & Brand Assets"
Cohesion: 0.29
Nodes (7): Icons Sheet, Bluesky Icon, Discord Icon, Documentation Icon, Github Icon, Social Icon, X Icon

### Community 12 - "API Design & Next.js Skills / Standards"
Cohesion: 0.29
Nodes (7): API Design Principles Skill, API Design Checklist, Next.js App Router Patterns Skill, GraphQL Schema Design Patterns, REST API Best Practices, API Design Implementation Playbook, Next.js App Router Patterns Playbook

### Community 13 - "Antigravity Workspace CLI Session Metadata"
Cohesion: 0.4
Nodes (4): id, name, projectResources, resources

### Community 24 - "Community 24"
Cohesion: 0.2
Nodes (9): Best Practices Summary, code:graphql (# user.graphql), code:graphql (type Subscription {), code:graphql (scalar DateTime), Custom Scalars, GraphQL Schema Design Patterns, Modular Schema Structure, Schema Organization (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.09
Nodes (22): API Design Checklist, Authentication & Authorization, Documentation, Documentation, Error Handling, Filtering & Sorting, GraphQL-Specific Checks, HTTP Methods (+14 more)

### Community 26 - "Community 26"
Cohesion: 0.09
Nodes (22): 10. Infrastructure & CI/CD Setup, 11. Observability & Monitoring, 12. Performance Optimization, 1. Database Architecture Design, 2. Backend Service Architecture, 3. Frontend Component Architecture, 4. Backend Service Implementation, 5. Frontend Implementation (+14 more)

### Community 27 - "Community 27"
Cohesion: 0.09
Nodes (21): Application Security Testing, Behavioral Traits, Capabilities, Cloud Security, Compliance & Governance, DevSecOps & Security Automation, Do not use this skill when, Emerging Security Technologies (+13 more)

### Community 28 - "Community 28"
Cohesion: 0.14
Nodes (13): Batch Endpoints, Bulk Operations, code:python (POST /api/users/batch), code:block22 (POST /api/orders), code:python (from fastapi.middleware.cors import CORSMiddleware), code:python (from fastapi import FastAPI), code:python (@app.get("/health")), CORS Configuration (+5 more)

### Community 29 - "Community 29"
Cohesion: 0.17
Nodes (11): Accessibility & UX (since design is largely done), Agent Behavior & Guardrails, AGENTS.md — Frontend (Next.js + React), API Integration (stay in sync with the backend), Code Documentation, Code Quality, Commands, Git Conventions (+3 more)

### Community 30 - "Community 30"
Cohesion: 0.17
Nodes (11): Admart Frontend (Vidify), code:bash (# Install dependencies), code:block2 (src/), Design system, Getting started, License, Notes, Prerequisites (+3 more)

### Community 31 - "Community 31"
Cohesion: 0.18
Nodes (11): code:block3 (GET /api/users              → 200 OK (with list)), code:block4 (POST /api/users), code:block5 (PUT /api/users/{id}), code:block6 (PATCH /api/users/{id}), code:block7 (DELETE /api/users/{id}), DELETE - Remove Resources, GET - Retrieve Resources, HTTP Methods and Status Codes (+3 more)

### Community 32 - "Community 32"
Cohesion: 0.22
Nodes (9): 1. Non-Null Types, 2. Interfaces for Polymorphism, 3. Unions for Heterogeneous Results, 4. Input Types, code:graphql (type User {), code:graphql (interface Node {), code:graphql (union SearchResult = User | Post | Comment), code:graphql (input CreateUserInput {) (+1 more)

### Community 33 - "Community 33"
Cohesion: 0.29
Nodes (6): Approach, Do not use this skill when, Focus Areas, Instructions, Output, Use this skill when

### Community 34 - "Community 34"
Cohesion: 0.29
Nodes (7): code:python (GET /api/users?limit=20&cursor=eyJpZCI6MTIzfQ), code:block11 (GET /api/users?page=2), code:python (GET /api/users?page=2&page_size=20), Cursor-Based Pagination (for large datasets), Link Header Pagination (RESTful), Offset-Based Pagination, Pagination Patterns

### Community 35 - "Community 35"
Cohesion: 0.29
Nodes (7): code:block12 (/api/v1/users), code:block13 (GET /api/users), code:block14 (GET /api/users?version=2), Header Versioning, Query Parameter, URL Versioning (Recommended), Versioning Strategies

### Community 36 - "Community 36"
Cohesion: 0.33
Nodes (5): API Design Principles, Do not use this skill when, Instructions, Resources, Use this skill when

### Community 37 - "Community 37"
Cohesion: 0.33
Nodes (5): Do not use this skill when, Instructions, Next.js App Router Patterns, Resources, Use this skill when

### Community 38 - "Community 38"
Cohesion: 0.4
Nodes (5): API Keys, Authentication and Authorization, Bearer Token, code:block17 (Authorization: Bearer eyJhbGciOiJIUzI1NiIs...), code:block18 (X-API-Key: your-api-key-here)

### Community 39 - "Community 39"
Cohesion: 0.4
Nodes (5): code:block1 (# Good - Plural nouns), code:block2 (# Shallow nesting (preferred)), Nested Resources, Resource Naming, URL Structure

### Community 40 - "Community 40"
Cohesion: 0.4
Nodes (5): code:block15 (X-RateLimit-Limit: 1000), code:python (from fastapi import HTTPException, Request), Headers, Implementation Pattern, Rate Limiting

### Community 41 - "Community 41"
Cohesion: 0.5
Nodes (4): code:json ({), Consistent Structure, Error Response Format, Status Code Guidelines

### Community 42 - "Community 42"
Cohesion: 0.67
Nodes (3): Cache Headers, Caching, code:block20 (# Client caching)

### Community 43 - "Community 43"
Cohesion: 0.67
Nodes (3): code:block8 (# Filtering), Filtering, Sorting, and Searching, Query Parameters

### Community 46 - "Community 46"
Cohesion: 0.29
Nodes (7): 1. Input/Payload Pattern, 2. Optimistic Response Support, 3. Batch Mutations, code:graphql (input BatchCreateUserInput {), code:graphql (input CreatePostInput {), code:graphql (type UpdateUserPayload {), Mutation Design Patterns

### Community 47 - "Community 47"
Cohesion: 0.29
Nodes (7): code:python (from aiodataloader import DataLoader), code:python (from graphql import GraphQLError), code:python (def complexity_limit_validator(max_complexity: int):), DataLoader Pattern, N+1 Query Problem Solutions, Query Complexity Analysis, Query Depth Limiting

### Community 48 - "Community 48"
Cohesion: 0.4
Nodes (5): Arguments and Filtering, code:graphql (type Query {), code:graphql (type User {), Computed Fields, Field Design

### Community 49 - "Community 49"
Cohesion: 0.4
Nodes (5): Built-in Directives, code:graphql (type User {), code:graphql (directive @auth(requires: Role = USER) on FIELD_DEFINITION), Custom Directives, Directives

### Community 50 - "Community 50"
Cohesion: 0.4
Nodes (5): code:graphql (type User {), code:graphql (type CreateUserPayload {), Error Handling, Errors in Payload, Union Error Pattern

### Community 51 - "Community 51"
Cohesion: 0.4
Nodes (5): code:graphql (type User {), code:graphql (# v1 - Initial), Field Deprecation, Schema Evolution, Schema Versioning

### Community 52 - "Community 52"
Cohesion: 0.4
Nodes (5): code:graphql (type UserConnection {), code:graphql (type UserList {), Offset Pagination (Simpler), Pagination Patterns, Relay Cursor Pagination (Recommended)

### Community 53 - "Community 53"
Cohesion: 0.29
Nodes (5): ResetPasswordPage(), strengthMeta(), api, refreshToken, token

### Community 54 - "Community 54"
Cohesion: 0.25
Nodes (5): Sidebar(), CATEGORIES, CATEGORY_LABELS, Sidebar(), TEMPLATES

### Community 56 - "Community 56"
Cohesion: 0.33
Nodes (4): INDUSTRIES, PLATFORMS, PRESET_COLORS, TEMPLATES

### Community 57 - "Community 57"
Cohesion: 0.4
Nodes (3): COST_REF, PACKS, TXNS

### Community 58 - "Community 58"
Cohesion: 0.4
Nodes (4): ACCENT_MAP, EMPTY_STATES, NotFoundPage(), QUICK_LINKS

### Community 59 - "Community 59"
Cohesion: 0.4
Nodes (3): INITIAL, TABS, TEAM

## Knowledge Gaps
- **278 isolated node(s):** `name`, `private`, `version`, `type`, `dev` (+273 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `DashboardPage()` connect `Analytics Dashboard & Status Tracking` to `Authentication & User Accounts`, `App Shell Layout & Billing/Credits`, `Progress Tracking & Rendering Pipeline`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `App()` connect `Analytics Dashboard & Status Tracking` to `Authentication & User Accounts`, `Community 58`, `Community 55`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **Why does `create_user()` connect `REST API Template & User Validation` to `Authentication & User Accounts`, `Analytics Dashboard & Status Tracking`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **What connects `name`, `private`, `version` to the rest of the system?**
  _278 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `App Shell Layout & Billing/Credits` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Project Dependencies & Manifests` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Image Generation & Wizard Forms` be split into smaller, more focused modules?**
  _Cohesion score 0.13 - nodes in this community are weakly interconnected._