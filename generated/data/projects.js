/*
 * Gallery content source.
 * Add a screenshot by placing it under assets/screenshots/<project-id>/ and adding
 * { src, alt, caption } to that project's screenshots array.
 * Example:
 * screenshots: [{
 *   src: "assets/screenshots/projectsyard/product-insights.png",
 *   alt: "ProjectsYard product-insights dashboard",
 *   caption: "A concise explanation of what this screen proves."
 * }]
 */
window.PROJECTS = [
  {
    id: "projectsyard",
    title: "ProjectsYard",
    topic: "0-to-1 AI product & growth",
    proof: "Product Hunt Top 10 · 10,000 accounts acquired in six months · 2,000+ AI assessments",
    repoUrl: "https://github.com/a-bhimava/projectsyard",
    liveUrl: "https://www.projectsyard.com/",
    screenshots: [
      {
        src: "assets/screenshots/ProjectsYard.png",
        alt: "ProjectsYard dashboard showing project publishing and portfolio management workflows",
        caption: "The founder dashboard: publish work from links or documents, manage a portfolio, and view profile analytics."
      }
    ]
  },
  {
    id: "business-360",
    title: "Business 360 with PNC Bank",
    topic: "AI agents & fintech product",
    proof: "90+ surveys · 10 interviews · 16-competitor benchmark · multi-agent LangGraph workflow",
    repoUrl: "https://github.com/a-bhimava/PNC-Business-360",
    liveUrl: "https://a-bhimava.github.io/PNC-Business-360/",
    screenshots: []
  },
  {
    id: "credit-decision-audit",
    title: "LLM Credit Decision Audit",
    topic: "AI evaluation & credit risk",
    proof: "5,630 reproducible scripted episodes for causal adverse-action testing",
    repoUrl: "https://github.com/a-bhimava/llm-credit-decision-audit",
    screenshots: [
      {
        src: "assets/screenshots/Credit Decision Audit.png",
        alt: "LLM Credit Decision Audit landing page showing a structured loan data to evidence trace workflow",
        caption: "A causal-audit workflow that turns a credit explanation into an inspectable, testable evidence trace."
      }
    ]
  },
  {
    id: "rag-citation-guardrail",
    title: "RAG Citation Guardrail",
    topic: "RAG reliability & guardrails",
    proof: "55-test policy harness for citation grounding and refusal correctness",
    repoUrl: "https://github.com/a-bhimava/rag-citation-guardrail",
    screenshots: []
  },
  {
    id: "agent-trace-to-evals",
    title: "Agent Trace to Evals",
    topic: "Agent observability & quality gates",
    proof: "68-test pipeline from OpenTelemetry traces to human-approved pytest checks",
    repoUrl: "https://github.com/a-bhimava/agent-trace-to-evals",
    screenshots: []
  },
  {
    id: "chronos-market-intelligence",
    title: "Chronos Market Intelligence",
    topic: "Agentic market intelligence",
    proof: "A graph explorer for examining entities, relationships, and evidence from a public-record case study.",
    screenshots: [
      {
        src: "assets/screenshots/Chronos Agentic Market Intelligence.png",
        alt: "Chronos Market Intelligence graph explorer showing entity relationships extracted from a public-record corpus",
        caption: "An evidence graph for exploring entities, relationships, sources, and a timeline within a public-record case study."
      }
    ]
  }
];
