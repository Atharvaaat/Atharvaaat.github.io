/* Content for the folio and the universe. All claims about Atharva's work come from his r\u00E9sum\u00E9. */
window.ATHARVA = (function () {
  'use strict';

  const CLUSTERS = {
    agents:     { name: 'Agents',          color: '#9DB287', ground: '#161C16', panel: '#1D241C', panel2: '#232B21' },
    knowledge:  { name: 'Knowledge',       color: '#D7A853', ground: '#1D1912', panel: '#251F17', panel2: '#2C261C' },
    infra:      { name: 'Infrastructure',  color: '#95AFC2', ground: '#14191D', panel: '#1A2026', panel2: '#20272E' },
    trust:      { name: 'Gateway & Trust', color: '#D58A68', ground: '#1E1612', panel: '#261C17', panel2: '#2D221C' },
    foundation: { name: 'Foundation',      color: '#E6DCC6', ground: '#191815', panel: '#21201C', panel2: '#282722' }
  };

  const DIMS = [
    {
      id: 'agentic', cluster: 'agents', shape: 'icosa',
      title: 'Agentic AI & Multi-Agent Systems',
      short: 'Agentic AI',
      kicker: 'Models that plan, use tools and hand work to one another.',
      what: 'An agent is a language model placed in a loop: it reads a goal, chooses an action, calls a tool or another agent, looks at the result and decides again. A multi-agent system gives separate agents separate roles and lets them coordinate.',
      why: 'One prompt cannot hold every skill and every tool. Splitting the work across specialised agents keeps each context small, makes behaviour easier to test, and lets parts of a job run in parallel.',
      how: [
        'An orchestrator turns the goal into subtasks.',
        'Each subtask goes to the agent whose tools and instructions fit it.',
        'Agents report back as messages; the orchestrator checks them and decides what is still missing.',
        'The loop ends when the goal is met or a budget runs out.'
      ],
      used: 'I work with Microsoft AutoGen to define agents and their conversations, and I concentrate on the layer around them: how a user-created agent is registered, versioned, deployed and run as a service.',
      built: 'The Custom Agent Management & Execution Platform: APIs for agent registration, versioning, deployment, lifecycle, execution and sessions, with management, runtime and execution kept as separate services.',
      viz: {
        type: 'flow', w: 720, h: 430, ground: 'dots', packet: 'circle',
        nodes: [
          { id: 'goal', x: 70, y: 215, w: 110, shape: 'pill', label: 'Goal', sub: 'from a user', info: 'A request in plain language. It says what is wanted, not how to do it.' },
          { id: 'orch', x: 250, y: 215, w: 108, shape: 'circle', label: 'Orchestrator', sub: 'plans \u00B7 checks', info: 'Breaks the goal into subtasks, assigns them, checks results and decides when the job is done.' },
          { id: 'researcher', x: 460, y: 70, w: 132, label: 'Researcher', sub: 'reads notes', info: 'An agent with access to documents and search.' },
          { id: 'analyst', x: 460, y: 170, w: 132, label: 'Analyst', sub: 'queries metrics', info: 'An agent that can query monitoring data and summarise numbers.' },
          { id: 'coder', x: 460, y: 270, w: 132, label: 'Coder', sub: 'reads config', info: 'An agent that can read and propose changes to code and configuration.' },
          { id: 'critic', x: 460, y: 370, w: 132, label: 'Critic', sub: 'reviews', info: 'An agent with no tools. Its only job is to find gaps in the others\u2019 work.' },
          { id: 'search', x: 640, y: 70, w: 110, shape: 'pill', label: 'Search', sub: 'tool' },
          { id: 'metrics', x: 640, y: 170, w: 110, shape: 'pill', label: 'Metrics', sub: 'tool' },
          { id: 'repo', x: 640, y: 270, w: 110, shape: 'pill', label: 'Repository', sub: 'tool' }
        ],
        links: [
          { a: 'goal', b: 'orch' }, { a: 'orch', b: 'researcher' }, { a: 'orch', b: 'analyst' }, { a: 'orch', b: 'coder' }, { a: 'orch', b: 'critic' },
          { a: 'researcher', b: 'search' }, { a: 'analyst', b: 'metrics' }, { a: 'coder', b: 'repo' }
        ],
        scenarios: [
          { name: 'Investigate a failed deployment', steps: [
            { go: ['goal', 'orch'], say: 'Goal: find out why last night\u2019s deployment failed.' },
            { at: 'orch', say: 'The orchestrator splits the goal into three subtasks.' },
            { par: [['orch', 'researcher', 'search'], ['orch', 'analyst', 'metrics']], say: 'Researcher reads the incident notes while Analyst pulls memory metrics, in parallel.' },
            { par: [['search', 'researcher', 'orch'], ['metrics', 'analyst', 'orch']], say: 'Both report back: the agent pods restarted with exit code 137.' },
            { go: ['orch', 'coder', 'repo'], say: 'Coder checks the deployment config and finds a 512Mi memory limit.' },
            { go: ['repo', 'coder', 'orch'], say: 'The model it loads needs more than that.' },
            { go: ['orch', 'critic'], say: 'Critic reviews the diagnosis for gaps.' },
            { ok: 'critic', say: 'Critic agrees, and asks for a load test before the fix ships.' },
            { go: ['orch', 'goal'], say: 'Answer: the pods were OOM-killed. A higher limit and a load test come with it.' }
          ] },
          { name: 'Draft a migration plan', steps: [
            { go: ['goal', 'orch'], say: 'Goal: plan the move of agent sessions to a new database.' },
            { at: 'orch', say: 'Three subtasks: inventory, sizing, migration script.' },
            { par: [['orch', 'researcher', 'search'], ['orch', 'coder', 'repo']], say: 'Researcher finds every service that touches sessions; Coder reads the schema.' },
            { par: [['search', 'researcher', 'orch'], ['repo', 'coder', 'orch']], say: 'Findings return to the orchestrator.' },
            { go: ['orch', 'analyst', 'metrics'], say: 'Analyst sizes the data and finds the write peak at 09:00.' },
            { go: ['metrics', 'analyst', 'orch'] },
            { go: ['orch', 'critic'], say: 'Critic tests the draft plan against what could go wrong.' },
            { fail: 'critic', say: 'Rejected: nothing handles sessions that are in flight during the switch.' },
            { go: ['orch', 'coder'], say: 'Coder adds a dual-write phase and a rollback script.' },
            { go: ['coder', 'orch', 'critic'] },
            { ok: 'critic', say: 'Approved on the second pass.' },
            { go: ['orch', 'goal'], say: 'The plan arrives with its rollback built in.' }
          ] }
        ]
      }
    },
    {
      id: 'llm', cluster: 'agents', shape: 'octa',
      title: 'LLM Engineering', short: 'LLM Engineering',
      kicker: 'Making language models dependable parts of a system.',
      what: 'LLM engineering is the work between a model and a product: prompts, structured output, tool calling, guardrails, evaluation, and the infrastructure that serves and routes model calls.',
      why: 'Models are probabilistic, rate-limited, priced per token and offered by many providers with different APIs. A production system needs a layer that makes them predictable.',
      how: [
        'A request is normalised into one internal format.',
        'A router picks a provider by model, cost or health.',
        'An adapter translates the request into that provider\u2019s API: OpenAI-style messages, or Anthropic-style messages with a separate system field and a required max_tokens.',
        'Responses, streams and errors are translated back. A failure triggers fallback to another provider.'
      ],
      used: 'LLM integrations, model serving, prompt engineering and guardrails are core to my toolkit, and my agent platform depends on a reliable model layer beneath it.',
      built: 'My Universal LLM Gateway exploration: a unified interface over different LLM API conventions, compatibility with OpenAI- and Anthropic-style APIs, provider routing and fallback, and planned support for hosted models, local inference endpoints and browser-based AI services.',
      viz: {
        type: 'flow', w: 720, h: 420, ground: 'blueprint', packet: 'capsule',
        nodes: [
          { id: 'app', x: 62, y: 210, w: 104, shape: 'pill', label: 'Your app', sub: 'one shape', info: 'Sends the same request format whichever model ends up answering.' },
          { id: 'gw', x: 200, y: 210, w: 112, label: 'Gateway', sub: 'normalise', info: 'Validates the request and converts it to one internal format: messages, tools, limits.' },
          { id: 'router', x: 348, y: 210, w: 130, label: 'Router', sub: 'model \u00B7 cost \u00B7 health', info: 'Chooses a provider for this call and keeps track of which providers are failing.' },
          { id: 'ad1', x: 512, y: 90, w: 126, label: 'OpenAI-style', sub: 'adapter', info: 'System prompt is the first message; responses come back as choices.' },
          { id: 'ad2', x: 512, y: 210, w: 126, label: 'Anthropic-style', sub: 'adapter', info: 'System prompt is a top-level field and max_tokens is required.' },
          { id: 'ad3', x: 512, y: 330, w: 126, label: 'Local inference', sub: 'adapter', info: 'A self-hosted model behind an OpenAI-compatible endpoint.' },
          { id: 'p1', x: 660, y: 90, w: 96, label: 'Provider A' },
          { id: 'p2', x: 660, y: 210, w: 96, label: 'Provider B' },
          { id: 'p3', x: 660, y: 330, w: 96, label: 'GPU host' }
        ],
        links: [
          { a: 'app', b: 'gw' }, { a: 'gw', b: 'router' }, { a: 'router', b: 'ad1' }, { a: 'router', b: 'ad2' }, { a: 'router', b: 'ad3' },
          { a: 'ad1', b: 'p1' }, { a: 'ad2', b: 'p2' }, { a: 'ad3', b: 'p3' }
        ],
        scenarios: [
          { name: 'Route a chat request', steps: [
            { go: ['app', 'gw'], say: 'The app sends one request shape, whatever the provider.' },
            { at: 'gw', say: 'Normalised: messages, tool definitions, token limits.' },
            { go: ['gw', 'router'], say: 'The router picks Provider B for this model.' },
            { go: ['router', 'ad2', 'p2'], say: 'The Anthropic-style adapter moves the system prompt into its own field and sets max_tokens.' },
            { ok: 'p2', say: 'Provider B answers.' },
            { go: ['p2', 'ad2', 'router', 'gw', 'app'], say: 'The response is translated back into the app\u2019s format.' }
          ] },
          { name: 'Provider is rate-limited', steps: [
            { go: ['app', 'gw', 'router'], say: 'Same request, same app code.' },
            { go: ['router', 'ad1', 'p1'], say: 'The router tries Provider A first.' },
            { fail: 'p1', say: 'Provider A returns 429: too many requests.' },
            { at: 'router', say: 'The router marks A as degraded and falls back.' },
            { go: ['router', 'ad2', 'p2'], say: 'Retried on Provider B through its own adapter.' },
            { ok: 'p2' },
            { go: ['p2', 'ad2', 'router', 'gw', 'app'], say: 'The app never sees the 429.' }
          ] },
          { name: 'Run on local inference', steps: [
            { go: ['app', 'gw', 'router'], say: 'A request tagged as containing sensitive data.' },
            { at: 'router', say: 'Policy: sensitive prompts stay on infrastructure we run.' },
            { go: ['router', 'ad3', 'p3'], say: 'Sent to a self-hosted model on a local GPU host.' },
            { ok: 'p3' },
            { go: ['p3', 'ad3', 'router', 'gw', 'app'], say: 'Same response format as a hosted provider.' }
          ] }
        ]
      }
    },
    {
      id: 'a2a', cluster: 'agents', shape: 'knot',
      title: 'A2A Protocol', short: 'A2A Protocol',
      kicker: 'A common language for agents that did not grow up together.',
      what: 'Agent2Agent (A2A) is an open protocol, introduced by Google in 2025 and now hosted by the Linux Foundation, that lets agents built on different frameworks discover each other and exchange work.',
      why: 'Organisations end up with agents from several vendors and frameworks. Without a shared protocol, every pair of agents needs its own integration.',
      how: [
        'Each agent publishes an Agent Card: a JSON description of its skills, endpoint and authentication requirements.',
        'A client agent reads the card and sends a message that creates a task.',
        'Messages travel as JSON-RPC over HTTP, with optional streaming of updates.',
        'Tasks move through states such as submitted, working, input-required and completed, and return their results as artifacts.'
      ],
      used: 'I worked on A2A adapters and registry integration so that external agents can interoperate with agents running on my platform.',
      built: 'A2A adapter and registry integration for the Custom Agent Management & Execution Platform.',
      viz: {
        type: 'flow', w: 740, h: 420, ground: 'dots', packet: 'diamond',
        nodes: [
          { id: 'ca', x: 74, y: 210, w: 124, label: 'Client agent', sub: 'any framework', info: 'An agent built elsewhere, on a different framework and by a different team.' },
          { id: 'reg', x: 280, y: 74, w: 134, h: 62, shape: 'cyl', label: 'Agent registry', sub: 'Agent Cards', info: 'Stores the Agent Cards of agents on the platform so others can find them.' },
          { id: 'gw', x: 290, y: 262, w: 112, label: 'Gateway', sub: 'auth \u00B7 limits', info: 'External agents get the same authentication and rate limits as any caller.' },
          { id: 'ad', x: 462, y: 262, w: 128, label: 'A2A adapter', sub: 'protocol \u2194 platform', info: 'Translates A2A messages and task states into the platform\u2019s execution and session APIs.' },
          { id: 'ag', x: 642, y: 262, w: 150, label: 'Platform agent', sub: 'AutoGen on Ray Serve', info: 'A user-created agent, running as a Ray Serve deployment.' }
        ],
        links: [
          { a: 'ca', b: 'reg' }, { a: 'ca', b: 'gw' }, { a: 'gw', b: 'ad' }, { a: 'ad', b: 'ag' },
          { a: 'ag', b: 'reg', bend: 50, dash: true, label: 'registers' }
        ],
        scenarios: [
          { name: 'Discover an agent', steps: [
            { go: ['ca', 'reg'], say: 'Looking for an agent with the skill \u201Csummarise incident reports\u201D.' },
            { at: 'reg', say: 'The registry matches on the skills listed in each Agent Card.' },
            { go: ['reg', 'ca'], say: 'It returns a card: name, skills, endpoint and the authentication it requires.' },
            { ok: 'ca' }
          ] },
          { name: 'Send a task', steps: [
            { go: ['ca', 'gw'], say: 'message/send over JSON-RPC, with an API key.' },
            { at: 'gw', say: 'Authenticated and authorised like any other caller.' },
            { go: ['gw', 'ad'], say: 'The adapter turns the A2A message into a platform execution request.' },
            { go: ['ad', 'ag'], say: 'The AutoGen agent runs as a Ray Serve deployment.' },
            { go: ['ag', 'ad'], say: 'State: submitted, then working.' },
            { go: ['ad', 'gw', 'ca'], say: 'State: completed. The summary returns as an artifact.' },
            { ok: 'ca' }
          ] },
          { name: 'Task needs more input', steps: [
            { go: ['ca', 'gw', 'ad', 'ag'], say: 'A task arrives without a time range.' },
            { go: ['ag', 'ad', 'gw', 'ca'], say: 'State: input-required. \u201CWhich time range?\u201D' },
            { go: ['ca', 'gw', 'ad', 'ag'], say: 'The client agent answers within the same task.' },
            { go: ['ag', 'ad', 'gw', 'ca'], say: 'State: completed.' },
            { ok: 'ca' }
          ] }
        ]
      }
    },
    {
      id: 'rag', cluster: 'knowledge', shape: 'dodeca',
      title: 'RAG Architecture', short: 'RAG',
      kicker: 'Give a model the right pages before it answers.',
      what: 'Retrieval-augmented generation fetches relevant passages from your own documents at question time and places them in the prompt, so the model answers from evidence rather than memory.',
      why: 'Models do not know private or recent information, and retraining them for every document change is impractical. Retrieval keeps knowledge in a store you can update, inspect and cite.',
      how: [
        'Ingestion: documents are split into chunks, embedded, and written to a vector index with their metadata.',
        'At question time, the question is embedded with the same model.',
        'The index returns the nearest chunks, and an optional reranker reorders them.',
        'The model receives the question and the chunks and writes an answer that can cite its sources.'
      ],
      used: 'RAG architectures sit in my LLM engineering toolkit, alongside embedding models and vector search.',
      fits: 'In an agent platform, retrieval is one more tool an agent can call when it needs facts it was not trained on.',
      viz: {
        type: 'flow', w: 740, h: 420, ground: 'lines', packet: 'square',
        nodes: [
          { id: 'doc', x: 74, y: 100, w: 112, shape: 'stack', label: 'Documents', sub: 'runbooks, specs', info: 'Your own material: runbooks, design docs, tickets.' },
          { id: 'chunk', x: 234, y: 100, w: 112, label: 'Chunker', sub: '~500 tokens', info: 'Splits text into overlapping pieces small enough to retrieve precisely.' },
          { id: 'emb', x: 392, y: 212, w: 134, label: 'Embedding model', sub: 'same for both', info: 'Turns text into vectors. Chunks and questions must use the same model.' },
          { id: 'vdb', x: 560, y: 100, w: 122, h: 64, shape: 'cyl', label: 'Vector index', sub: 'chunks + metadata', info: 'Stores vectors with source, page and access metadata.' },
          { id: 'q', x: 74, y: 330, shape: 'person', label: 'Question' },
          { id: 'ret', x: 560, y: 320, w: 122, label: 'Retriever', sub: 'top-k \u00B7 rerank', info: 'Finds the nearest chunks, filters by access, and orders them by relevance.' },
          { id: 'llm', x: 690, y: 212, w: 72, shape: 'circle', label: 'LLM', info: 'Writes the answer from the question and the retrieved chunks.' },
          { id: 'ans', x: 678, y: 372, w: 112, shape: 'pill', label: 'Answer', sub: 'with citations' }
        ],
        links: [
          { a: 'doc', b: 'chunk' }, { a: 'chunk', b: 'emb' }, { a: 'emb', b: 'vdb' }, { a: 'q', b: 'emb' },
          { a: 'emb', b: 'ret' }, { a: 'ret', b: 'vdb' }, { a: 'ret', b: 'llm' }, { a: 'llm', b: 'ans' }
        ],
        scenarios: [
          { name: 'Ask a question', steps: [
            { go: ['q', 'emb'], say: '\u201CHow do we roll back a Ray Serve deployment?\u201D' },
            { at: 'emb', say: 'The question is embedded with the same model used for the documents.' },
            { go: ['emb', 'ret', 'vdb'], say: 'Nearest-neighbour search over the index.' },
            { go: ['vdb', 'ret'], say: 'The top four chunks come back; a reranker puts the runbook\u2019s rollback section first.' },
            { go: ['ret', 'llm'], say: 'Question and chunks are assembled into one prompt.' },
            { go: ['llm', 'ans'], say: 'The answer cites the runbook pages it used.' },
            { ok: 'ans' }
          ] },
          { name: 'Ingest a document', steps: [
            { go: ['doc', 'chunk'], say: 'A 40-page runbook enters the pipeline.' },
            { at: 'chunk', say: 'Split into chunks of about 500 tokens, with overlap so no idea is cut in half.' },
            { go: ['chunk', 'emb'], say: 'Each chunk is embedded.' },
            { go: ['emb', 'vdb'], say: 'Vectors are stored with their source, page and access metadata.' },
            { ok: 'vdb', say: 'Indexed. The next question can find it.' }
          ] },
          { name: 'Question outside the documents', steps: [
            { go: ['q', 'emb', 'ret', 'vdb'], say: '\u201CWhat is our policy on parental leave?\u201D' },
            { go: ['vdb', 'ret'], say: 'Nothing passes the relevance threshold.' },
            { fail: 'ret', say: 'No grounding found.' },
            { go: ['ret', 'llm', 'ans'], say: 'The model is told to say it does not know rather than guess.' }
          ] }
        ]
      }
    },
    {
      id: 'embed', cluster: 'knowledge', shape: 'torus',
      title: 'Embedding Models', short: 'Embeddings',
      kicker: 'Meaning, written as coordinates.',
      what: 'An embedding model maps text to a vector of numbers so that texts with similar meaning land close together.',
      why: 'Keyword search misses paraphrase. Vectors let a system find \u201Cscale replicas when traffic spikes\u201D when someone asks about autoscaling.',
      how: [
        'Text is tokenised and passed through an encoder network.',
        'The output is pooled into one fixed-length vector, often hundreds to a few thousand dimensions.',
        'Similarity is measured with cosine similarity or a dot product.',
        'Questions and documents must be embedded by the same model to be comparable.'
      ],
      used: 'Embedding models and vector search are part of how I approach retrieval for LLM applications.',
      fits: 'Embeddings feed RAG and vector databases. Agents use them to find relevant documents, tools and earlier results.',
      viz: { type: 'embed' }
    },
    {
      id: 'vector', cluster: 'knowledge', shape: 'box',
      title: 'Vector Databases', short: 'Vector Databases',
      kicker: 'Finding the nearest neighbours among millions.',
      what: 'A vector database stores embeddings with their metadata and answers one question quickly: which stored vectors are closest to this one?',
      why: 'Comparing a query with every stored vector is exact but slow at scale. Approximate nearest-neighbour indexes give up a little accuracy for very large speed-ups.',
      how: [
        'HNSW, a common index, builds layered graphs: sparse upper layers for long jumps, a dense bottom layer for precision.',
        'Search starts at an entry point in the top layer and moves to whichever neighbour is closest to the query.',
        'When no neighbour is closer, it drops a layer and continues.',
        'Metadata filters narrow results to what the caller is allowed to see.'
      ],
      used: 'Vector search is part of my retrieval toolkit for RAG.',
      fits: 'The store behind RAG. It receives vectors from embedding models and answers retrieval calls from agents.',
      viz: { type: 'hnsw' }
    },
    {
      id: 'gateway', cluster: 'trust', shape: 'gate',
      title: 'API Gateway Architecture', short: 'API Gateway',
      kicker: 'One front door, with rules.',
      what: 'An API gateway is the single entry point in front of a set of services. It receives every request, applies shared policy and forwards the request to the right backend.',
      why: 'Without one, every service reimplements authentication, rate limits, logging and routing, and clients need to know where each service lives.',
      how: [
        'Match the request to a route by host, path and method.',
        'Run that route\u2019s policies: authentication, authorization, rate limiting, request rewriting.',
        'Pick a healthy instance of the upstream service and forward the request.',
        'Record logs and metrics on the way back.'
      ],
      used: 'I design gateway-centred architectures in which Keycloak authentication and OpenFGA resource checks happen at the gate, before agent and model services are reached.',
      built: 'The gateway layer of my Fine-Grained Authorization architecture, and the API surface of my agent platform.',
      viz: {
        type: 'flow', w: 740, h: 430, ground: 'blueprint', packet: 'circle',
        nodes: [
          { id: 'client', x: 62, y: 215, shape: 'person', label: 'Client' },
          { id: 'gw', x: 228, y: 215, w: 120, h: 118, label: 'Gateway', sub: 'one front door', info: 'Every request enters here. Policy is applied once, for every service behind it.' },
          { id: 'kc', x: 228, y: 56, w: 136, label: 'Token check', sub: 'Keycloak keys', info: 'Verifies the JWT signature with Keycloak\u2019s public keys, then expiry, issuer and audience.' },
          { id: 'fga', x: 432, y: 56, w: 128, label: 'OpenFGA', sub: 'permission check', info: 'Answers: may this user perform this action on this resource?' },
          { id: 'rl', x: 432, y: 378, w: 124, label: 'Rate limiter', sub: 'per key', info: 'Counts requests per caller and rejects bursts above the limit.' },
          { id: 'router', x: 432, y: 215, w: 116, label: 'Router', sub: 'path \u2192 service', info: 'Maps the request path to the service that owns it.' },
          { id: 'agents', x: 632, y: 96, w: 140, label: 'Agent service' },
          { id: 'models', x: 632, y: 215, w: 140, label: 'Model service' },
          { id: 'sessions', x: 632, y: 334, w: 140, label: 'Session service' }
        ],
        links: [
          { a: 'client', b: 'gw' }, { a: 'gw', b: 'kc' }, { a: 'gw', b: 'fga' }, { a: 'gw', b: 'rl' }, { a: 'gw', b: 'router' },
          { a: 'router', b: 'agents' }, { a: 'router', b: 'models' }, { a: 'router', b: 'sessions' }
        ],
        scenarios: [
          { name: 'Authorised request', steps: [
            { go: ['client', 'gw'], say: 'POST /agents/summarizer/run with a bearer token.' },
            { go: ['gw', 'kc'], say: 'Verify the token\u2019s signature against Keycloak\u2019s public keys; check expiry and audience.' },
            { go: ['kc', 'gw'], say: 'Authenticated as user:alice.' },
            { go: ['gw', 'fga'], say: 'Check: may user:alice execute agent:summarizer?' },
            { go: ['fga', 'gw'], say: 'Allowed.' },
            { go: ['gw', 'rl', 'gw'], say: 'Within this caller\u2019s rate limit.' },
            { go: ['gw', 'router', 'agents'], say: 'Routed to the agent service.' },
            { ok: 'agents' },
            { go: ['agents', 'router', 'gw', 'client'], say: '200 OK, with a run id.' }
          ] },
          { name: 'Missing token', steps: [
            { go: ['client', 'gw'], say: 'A request with no Authorization header.' },
            { fail: 'gw', say: '401 Unauthorized. The request never reaches a service.' }
          ] },
          { name: 'Not permitted', steps: [
            { go: ['client', 'gw', 'kc', 'gw'], say: 'Authenticated as user:bob.' },
            { go: ['gw', 'fga'], say: 'Check: may user:bob delete agent:summarizer?' },
            { fail: 'fga', say: 'Denied: bob is only a viewer.' },
            { go: ['fga', 'gw', 'client'], say: '403 Forbidden.' }
          ] },
          { name: 'Over the limit', steps: [
            { go: ['client', 'gw', 'kc', 'gw', 'fga', 'gw'], say: 'Authenticated and allowed.' },
            { go: ['gw', 'rl'], say: 'The 61st request from this key in one minute.' },
            { fail: 'rl', say: '429 Too Many Requests, with a Retry-After header.' }
          ] }
        ]
      }
    },
    {
      id: 'apisix', cluster: 'trust', shape: 'octa',
      title: 'Apache APISIX', short: 'Apache APISIX',
      kicker: 'A plugin pipeline in front of every route.',
      what: 'Apache APISIX is an open-source, cloud-native API gateway built on NGINX and LuaJIT. Its configuration lives in etcd and changes at runtime without reloads.',
      why: 'Dynamic routing and a large plugin ecosystem suit platforms where routes appear and disappear as users deploy new agents.',
      how: [
        'A route binds a match rule to an upstream and a list of plugins.',
        'Plugins run in phases (rewrite, access, response filters, logging), ordered by priority.',
        'Authentication plugins such as key-auth or openid-connect identify the caller.',
        'Upstreams balance traffic across service nodes, with health checks.'
      ],
      used: 'APISIX is the gateway in my agent-platform and authorization work, integrated with Keycloak-based authentication and with API-key authentication for long-running deployed agents.',
      built: 'Gateway authorization for the Fine-Grained Authorization project, and the entry point to the agent platform.',
      viz: {
        type: 'flow', w: 780, h: 420, ground: 'blueprint', packet: 'square',
        nodes: [
          { id: 'req', x: 60, y: 210, w: 96, shape: 'pill', label: 'Request' },
          { id: 'etcd', x: 192, y: 70, w: 96, h: 54, shape: 'cyl', label: 'etcd', sub: 'routes', info: 'Holds routes, upstreams and plugin config. Changes apply without a reload.' },
          { id: 'route', x: 192, y: 210, w: 124, label: 'Route match', sub: 'host \u00B7 path \u00B7 method', info: 'Finds the route for this request. The route decides which plugins run.' },
          { id: 'keyauth', x: 336, y: 120, w: 118, label: 'key-auth', sub: 'API key', info: 'Maps an API key to a consumer. Used for long-running deployed agents.' },
          { id: 'oidc', x: 336, y: 300, w: 128, label: 'openid-connect', sub: 'Keycloak token', info: 'Validates tokens issued by Keycloak.' },
          { id: 'authz', x: 476, y: 210, w: 116, label: 'forward-auth', sub: 'ask OpenFGA', info: 'Calls an authorization service before the request continues. Here it asks OpenFGA.' },
          { id: 'limit', x: 604, y: 210, w: 104, label: 'limit-count', sub: '60 / min', info: 'Counts requests per consumer in a time window.' },
          { id: 'u1', x: 722, y: 136, w: 86, label: 'node 1', sub: 'upstream' },
          { id: 'u2', x: 722, y: 284, w: 86, label: 'node 2', sub: 'upstream' }
        ],
        links: [
          { a: 'req', b: 'route' }, { a: 'etcd', b: 'route', dash: true }, { a: 'route', b: 'keyauth' }, { a: 'route', b: 'oidc' },
          { a: 'keyauth', b: 'authz' }, { a: 'oidc', b: 'authz' }, { a: 'authz', b: 'limit' }, { a: 'limit', b: 'u1' }, { a: 'limit', b: 'u2' }
        ],
        scenarios: [
          { name: 'Agent calls with an API key', steps: [
            { go: ['req', 'route'], say: 'Route /a2a/agents/* matches. Its plugin list runs in priority order.' },
            { go: ['route', 'keyauth'], say: 'key-auth finds the consumer that owns this API key.' },
            { go: ['keyauth', 'authz'], say: 'forward-auth asks OpenFGA whether this consumer may execute the agent.' },
            { go: ['authz', 'limit'], say: 'limit-count: 58 of 60 requests left this minute.' },
            { go: ['limit', 'u1'], say: 'An upstream node is picked by round robin, and the path is rewritten for the service.' },
            { ok: 'u1' }
          ] },
          { name: 'Person with a Keycloak token', steps: [
            { go: ['req', 'route'], say: 'Route /agents/* matches.' },
            { go: ['route', 'oidc'], say: 'openid-connect validates the Keycloak-issued token.' },
            { go: ['oidc', 'authz', 'limit', 'u2'], say: 'The same authorization and limits apply.' },
            { ok: 'u2' }
          ] },
          { name: 'Burst of traffic', steps: [
            { go: ['req', 'route', 'keyauth', 'authz', 'limit'], say: 'A runaway client loop sends request after request.' },
            { fail: 'limit', say: 'Limit reached: 429 at the gateway. The upstream is untouched.' }
          ] },
          { name: 'Unhealthy upstream', steps: [
            { go: ['req', 'route', 'keyauth', 'authz', 'limit', 'u1'], say: 'Node 1 stops answering.' },
            { fail: 'u1', say: 'Health checks mark node 1 as down.' },
            { go: ['limit', 'u2'], say: 'Traffic moves to node 2.' },
            { ok: 'u2' }
          ] }
        ]
      }
    },
    {
      id: 'auth', cluster: 'trust', shape: 'tetra',
      title: 'Authentication & Authorization', short: 'AuthN & AuthZ',
      kicker: 'Who are you, and what may you do?',
      what: 'Authentication proves identity. Authorization decides what that identity may do. They are separate questions and are best answered by separate systems.',
      why: 'Mixing them leads to coarse roles that cannot express rules like \u201Cmembers of this team may run this agent, but only its owner may delete it\u201D.',
      how: [
        'The client signs in with an identity provider and receives a token, usually a signed JWT issued under OAuth 2.0 and OpenID Connect.',
        'The gateway verifies the token\u2019s signature, expiry, issuer and audience.',
        'For each action on a resource, the gateway or service asks an authorization service for a decision.',
        'Long-running services that cannot sign in interactively use API keys or client credentials.'
      ],
      used: 'I integrate Keycloak for identity, OpenFGA for resource-level decisions and APISIX as the enforcement point, and I have explored API-key authentication for deployed agents.',
      built: 'Fine-Grained Authorization for AI Platforms.',
      viz: {
        type: 'flow', w: 700, h: 420, ground: 'dots', packet: 'capsule',
        nodes: [
          { id: 'client', x: 72, y: 215, shape: 'person', label: 'Client' },
          { id: 'kc', x: 270, y: 72, w: 132, label: 'Keycloak', sub: 'who are you?', info: 'The identity provider. It signs users in and issues tokens.' },
          { id: 'gw', x: 330, y: 252, w: 132, h: 66, label: 'Gateway', sub: 'enforcement point', info: 'Checks the token, asks for a permission decision, then forwards or rejects.' },
          { id: 'fga', x: 548, y: 100, w: 132, label: 'OpenFGA', sub: 'what may you do?', info: 'Decides whether this identity has this relation to this resource.' },
          { id: 'svc', x: 568, y: 330, w: 140, label: 'Agent service', info: 'Receives only requests that passed both checks.' }
        ],
        links: [
          { a: 'client', b: 'kc' }, { a: 'client', b: 'gw' }, { a: 'gw', b: 'kc', dash: true, label: 'public keys' }, { a: 'gw', b: 'fga' }, { a: 'gw', b: 'svc' }
        ],
        scenarios: [
          { name: 'Sign in, then call', steps: [
            { go: ['client', 'kc'], say: 'Authentication: Alice signs in with password and second factor.' },
            { go: ['kc', 'client'], say: 'Keycloak issues a signed access token (a JWT).' },
            { go: ['client', 'gw'], say: 'The call carries Authorization: Bearer <token>.' },
            { at: 'gw', say: 'Signature, expiry, issuer and audience all check out.' },
            { go: ['gw', 'fga'], say: 'Authorization: can user:alice execute agent:summarizer?' },
            { go: ['fga', 'gw'], say: 'Allowed, through her membership of team:research.' },
            { go: ['gw', 'svc'], say: 'The request reaches the service with a verified identity.' },
            { ok: 'svc' }
          ] },
          { name: 'Expired token', steps: [
            { go: ['client', 'gw'], say: 'A token from yesterday.' },
            { fail: 'gw', say: 'exp is in the past: 401.' },
            { go: ['client', 'kc', 'client'], say: 'The client uses its refresh token to get a new access token.' },
            { go: ['client', 'gw', 'fga', 'gw', 'svc'], say: 'Retried and accepted.' },
            { ok: 'svc' }
          ] },
          { name: 'Deployed agent with an API key', steps: [
            { go: ['client', 'gw'], say: 'A long-running agent cannot sign in interactively. It presents an API key.' },
            { at: 'gw', say: 'The key maps to a service identity, not a person.' },
            { go: ['gw', 'fga'], say: 'Checked against what this agent is allowed to call.' },
            { go: ['fga', 'gw', 'svc'], say: 'Allowed for this one resource.' },
            { ok: 'svc' }
          ] }
        ]
      }
    },
    {
      id: 'fga', cluster: 'trust', shape: 'icosa',
      title: 'OpenFGA', short: 'OpenFGA',
      kicker: 'Permissions as a graph of relationships.',
      what: 'OpenFGA is an open-source authorization engine inspired by Google\u2019s Zanzibar paper and maintained as a CNCF project. Permissions are derived from relationship tuples such as \u201Cuser:alice is a member of team:research\u201D.',
      why: 'Role-based access breaks down when permissions depend on ownership, teams and sharing. A relationship model states those rules once and evaluates them consistently everywhere.',
      how: [
        'An authorization model declares types and how relations derive from each other, for example \u201Can agent\u2019s executor is anyone who is its editor\u201D.',
        'Applications write tuples as relationships change.',
        'A Check call asks: does user U have relation R on object O? OpenFGA walks the graph to answer.',
        'ListObjects returns every object a user can reach, which is useful for filtering lists.'
      ],
      used: 'I designed permission models for agent, model and team resources, covering execution, viewing, editing, deletion and management.',
      built: 'The OpenFGA model behind Fine-Grained Authorization for AI Platforms.',
      viz: {
        type: 'flow', w: 700, h: 420, ground: 'rings', packet: 'diamond',
        nodes: [
          { id: 'alice', x: 86, y: 90, w: 116, shape: 'pill', label: 'user:alice' },
          { id: 'bob', x: 86, y: 215, w: 116, shape: 'pill', label: 'user:bob' },
          { id: 'chen', x: 86, y: 340, w: 116, shape: 'pill', label: 'user:chen' },
          { id: 'team', x: 318, y: 90, w: 144, label: 'team:research', info: 'A group. Its members inherit whatever the team is granted.' },
          { id: 'agent', x: 562, y: 215, w: 172, h: 58, label: 'agent:summarizer', sub: 'owner \u00B7 editor \u00B7 viewer', info: 'The resource. Its executor, deleter and manager relations are derived from owner, editor and viewer.' }
        ],
        links: [
          { a: 'alice', b: 'team', label: 'member' },
          { a: 'team', b: 'agent', label: 'editor' },
          { a: 'bob', b: 'agent', label: 'viewer' },
          { a: 'chen', b: 'agent', label: 'owner' }
        ],
        scenarios: [
          { name: 'Can alice execute it?', steps: [
            { at: 'agent', say: 'check(user:alice, executor, agent:summarizer). Executor is defined as editor.' },
            { go: ['alice', 'team'], say: 'alice is a member of team:research.' },
            { go: ['team', 'agent'], say: 'Members of team:research are editors of the agent.' },
            { ok: 'agent', say: 'Allowed: editor implies executor.' }
          ] },
          { name: 'Can bob execute it?', steps: [
            { at: 'agent', say: 'check(user:bob, executor, agent:summarizer).' },
            { go: ['bob', 'agent'], say: 'bob is a viewer.' },
            { fail: 'agent', say: 'Denied: viewer does not imply executor.' }
          ] },
          { name: 'Can chen delete it?', steps: [
            { at: 'agent', say: 'check(user:chen, deleter, agent:summarizer). Deleter is defined as owner.' },
            { go: ['chen', 'agent'], say: 'chen is the owner.' },
            { ok: 'agent', say: 'Allowed.' }
          ] },
          { name: 'Can alice delete it?', steps: [
            { at: 'agent', say: 'check(user:alice, deleter, agent:summarizer).' },
            { go: ['alice', 'team', 'agent'], say: 'alice reaches the agent only as an editor, through her team.' },
            { fail: 'agent', say: 'Denied: only owners may delete.' }
          ] }
        ],
        code: 'model\n  schema 1.1\n\ntype user\n\ntype team\n  relations\n    define member: [user]\n\ntype agent\n  relations\n    define owner: [user]\n    define editor: [user, team#member] or owner\n    define viewer: [user, team#member] or editor\n    define executor: editor\n    define deleter: owner\n    define manager: owner'
      }
    },
    {
      id: 'keycloak', cluster: 'trust', shape: 'torus',
      title: 'Keycloak', short: 'Keycloak',
      kicker: 'Identity, issued and signed.',
      what: 'Keycloak is an open-source identity and access management server. It handles sign-in, users, groups and client applications, and issues tokens over OpenID Connect, OAuth 2.0 and SAML.',
      why: 'Identity is hard to get right and dangerous to get wrong. A dedicated provider gives single sign-on, multi-factor authentication, federation and standard tokens that every service can verify on its own.',
      how: [
        'The app redirects the user to Keycloak\u2019s sign-in page.',
        'After sign-in, Keycloak redirects back with a short-lived authorization code.',
        'The app exchanges the code, together with its PKCE verifier, for an ID token and an access token.',
        'APIs verify the access token\u2019s signature with the realm\u2019s published public keys (JWKS).'
      ],
      used: 'Keycloak is the identity layer in my authorization architecture, integrated with gateway authorization in APISIX.',
      built: 'Fine-Grained Authorization for AI Platforms.',
      viz: {
        type: 'flow', w: 680, h: 420, ground: 'dots', packet: 'circle',
        nodes: [
          { id: 'user', x: 72, y: 212, shape: 'person', label: 'Browser' },
          { id: 'app', x: 252, y: 212, w: 124, label: 'Web app', sub: 'OIDC client', info: 'Registered in Keycloak as a client. It never sees the user\u2019s password.' },
          { id: 'kc', x: 476, y: 82, w: 152, h: 60, label: 'Keycloak', sub: 'realm: platform', info: 'Signs users in, applies MFA and issues tokens signed with the realm\u2019s keys.' },
          { id: 'api', x: 476, y: 340, w: 144, label: 'API', sub: 'behind the gateway', info: 'Trusts a token only if its signature matches Keycloak\u2019s public keys.' }
        ],
        links: [
          { a: 'user', b: 'app' }, { a: 'user', b: 'kc', bend: -60 }, { a: 'app', b: 'kc' }, { a: 'app', b: 'api' },
          { a: 'api', b: 'kc', bend: 80, dash: true, label: 'JWKS' }
        ],
        scenarios: [
          { name: 'Sign in (code + PKCE)', steps: [
            { go: ['user', 'app'], say: 'Alice opens the app.' },
            { go: ['app', 'user'], say: 'The app redirects her to Keycloak with a PKCE code challenge.' },
            { go: ['user', 'kc'], say: 'She signs in on Keycloak\u2019s page, not the app\u2019s.' },
            { go: ['kc', 'user', 'app'], say: 'Keycloak redirects back with a one-time authorization code.' },
            { go: ['app', 'kc'], say: 'The app exchanges the code and its PKCE verifier for tokens.' },
            { go: ['kc', 'app'], say: 'ID token: who she is. Access token: what the app may call for her.' },
            { ok: 'app' }
          ] },
          { name: 'Call an API with the token', steps: [
            { go: ['app', 'api'], say: 'Authorization: Bearer <access token>.' },
            { go: ['api', 'kc'], say: 'Public keys are fetched once from the JWKS endpoint and cached.' },
            { go: ['kc', 'api'], say: 'The signature matches and the token has not expired.' },
            { ok: 'api', say: 'Accepted, without a call to Keycloak on every request.' }
          ] }
        ]
      }
    },
    {
      id: 'distributed', cluster: 'infra', shape: 'dodeca',
      title: 'Distributed Systems', short: 'Distributed Systems',
      kicker: 'Many machines, behaving like one.',
      what: 'A distributed system spreads work and state across machines that communicate over a network and can fail independently.',
      why: 'One machine runs out of CPU, memory or GPUs, and it is a single point of failure. Distribution buys capacity and resilience, at the price of coordination.',
      how: [
        'Work is split into tasks that can run independently.',
        'A scheduler places tasks where resources are free.',
        'Failures are expected: tasks are retried, and state is replicated or recomputed.',
        'The system converges on a desired state instead of assuming every step succeeds.'
      ],
      used: 'Distributed workload management runs through my work: agents as distributed services, replica management, resource constraints and runtime failures.',
      built: 'Distributed AI Agent Execution Infrastructure.',
      viz: {
        type: 'flow', w: 700, h: 430, ground: 'blueprint', packet: 'square',
        nodes: [
          { id: 'job', x: 62, y: 215, w: 96, shape: 'pill', label: 'Job', sub: '4 tasks' },
          { id: 'sched', x: 220, y: 215, w: 124, label: 'Scheduler', sub: 'places tasks', info: 'Knows which workers have free CPU and memory, and tracks every running task.' },
          { id: 'w1', x: 430, y: 62, w: 124, label: 'Worker 1', sub: 'node-a' },
          { id: 'w2', x: 430, y: 166, w: 124, label: 'Worker 2', sub: 'node-a' },
          { id: 'w3', x: 430, y: 270, w: 124, label: 'Worker 3', sub: 'node-b' },
          { id: 'w4', x: 430, y: 374, w: 124, label: 'Worker 4', sub: 'node-c' },
          { id: 'store', x: 620, y: 215, w: 116, h: 72, shape: 'cyl', label: 'Object store', sub: 'shared results', info: 'Holds task outputs so any worker or caller can read them.' }
        ],
        links: [
          { a: 'job', b: 'sched' }, { a: 'sched', b: 'w1' }, { a: 'sched', b: 'w2' }, { a: 'sched', b: 'w3' }, { a: 'sched', b: 'w4' },
          { a: 'w1', b: 'store' }, { a: 'w2', b: 'store' }, { a: 'w3', b: 'store' }, { a: 'w4', b: 'store' }
        ],
        scenarios: [
          { name: 'Run a job', steps: [
            { go: ['job', 'sched'], say: 'A batch of four inference tasks arrives.' },
            { at: 'sched', say: 'The scheduler places each task where CPU and memory are free.' },
            { par: [['sched', 'w1'], ['sched', 'w2'], ['sched', 'w3'], ['sched', 'w4']], say: 'All four run at once.' },
            { par: [['w1', 'store'], ['w2', 'store'], ['w3', 'store'], ['w4', 'store']], say: 'Results land in the shared object store.' },
            { ok: 'store', say: 'Done in roughly the time of one task, not four.' }
          ] },
          { name: 'A worker fails', steps: [
            { go: ['job', 'sched'], say: 'The same batch.' },
            { par: [['sched', 'w1'], ['sched', 'w2'], ['sched', 'w3']], say: 'Three tasks start.' },
            { fail: 'w3', say: 'Worker 3\u2019s node goes away mid-task.' },
            { at: 'sched', say: 'Missed heartbeats tell the scheduler the task is lost.' },
            { go: ['sched', 'w4'], say: 'The task is retried on worker 4.' },
            { par: [['w1', 'store'], ['w2', 'store'], ['w4', 'store']] },
            { ok: 'store', say: 'The job completes. The caller never saw the failure.' }
          ] }
        ]
      }
    },
    {
      id: 'ray', cluster: 'infra', shape: 'octa',
      title: 'Ray Serve', short: 'Ray Serve',
      kicker: 'Python classes, served as scalable services.',
      what: 'Ray Serve is a model- and application-serving library built on Ray. You write a Python class, mark it as a deployment, and Ray runs it as a set of replicas across a cluster.',
      why: 'AI services need each component to scale on its own, fractional CPU and GPU allocation, and several models composed into one request. Serve provides these without writing a scheduler.',
      how: [
        'Each deployment runs as replicas, which are Ray actors placed on cluster nodes.',
        'A proxy receives HTTP requests and forwards them to replicas through deployment handles.',
        'The autoscaler compares ongoing requests per replica with a target and adds or removes replicas.',
        'Applications can run side by side under different route prefixes, so several versions can live at once.'
      ],
      used: 'I use Ray Serve to deploy and execute user-created agents, and I have investigated replica management, CPU and memory allocation, and multi-version deployment strategies.',
      built: 'The Custom Agent Management & Execution Platform, and Distributed AI Agent Execution Infrastructure.',
      viz: { type: 'ray' }
    },
    {
      id: 'k8s', cluster: 'infra', shape: 'hept',
      title: 'Kubernetes', short: 'Kubernetes',
      kicker: 'Declare the state you want. Controllers make it so.',
      what: 'Kubernetes is a container orchestration system. You describe the desired state of your workloads, and its controllers keep working to match it.',
      why: 'Containers crash, nodes are drained, traffic changes. Running services by hand cannot keep up; a control loop can.',
      how: [
        'Manifests go to the API server and are stored in etcd.',
        'Controllers compare desired and actual state, for example a Deployment that wants three Pods.',
        'The scheduler places new Pods on nodes with enough requested CPU and memory.',
        'The kubelet on each node runs the containers and enforces limits. A container over its memory limit is OOM-killed and restarted.'
      ],
      used: 'I run Ray clusters on Kubernetes with KubeRay, and I have investigated runtime failures and workload stability, including resource allocation and memory constraints.',
      built: 'Distributed AI Agent Execution Infrastructure.',
      viz: { type: 'k8s' }
    },
    {
      id: 'python', cluster: 'foundation', shape: 'box',
      title: 'Python Backend Engineering', short: 'Python Backend',
      kicker: 'Async services that spend their time waiting well.',
      what: 'Python is the language of the AI ecosystem. Backend work in it means REST APIs, background work and service integrations, increasingly written with asyncio.',
      why: 'AI backends mostly wait: on model APIs, databases and other services. Asynchronous code lets one process keep many requests in flight while each one waits.',
      how: [
        'An event loop runs coroutines.',
        'When a coroutine awaits I/O, it yields control and the loop runs another.',
        'When the I/O completes, the coroutine resumes where it left off.',
        'CPU-heavy work moves to processes or to a distributed runtime such as Ray, so it does not block the loop.'
      ],
      used: 'Python is my primary language: REST API design, asynchronous programming, the APIs of my agent platform and the LLM gateway.',
      built: 'The APIs behind my agent platform, and the LLM gateway exploration.',
      viz: { type: 'pyasync' }
    }
  ];

  const EDGES = [
    ['agentic', 'a2a', 'Agents built on different frameworks need a shared protocol to hand each other work. A2A is that protocol.'],
    ['agentic', 'llm', 'Every agent reasons through a model. The LLM layer is where agents think.'],
    ['agentic', 'ray', 'User-created agents are deployed as Ray Serve applications, so each agent scales on its own.'],
    ['agentic', 'rag', 'Retrieval is a tool agents call when they need facts they were not trained on.'],
    ['agentic', 'fga', 'Who may execute, view, edit, delete or manage an agent is written down in OpenFGA.'],
    ['agentic', 'python', 'AutoGen agents and the platform\u2019s APIs are written in Python.'],
    ['llm', 'rag', 'RAG grounds a model\u2019s answer in retrieved documents.'],
    ['llm', 'gateway', 'A universal LLM gateway is an API gateway that understands model APIs.'],
    ['rag', 'embed', 'Embedding models turn chunks and questions into vectors that can be compared.'],
    ['rag', 'vector', 'The vector database stores chunk vectors and returns the ones nearest to a question.'],
    ['embed', 'vector', 'Vectors are only useful if millions of them can be searched quickly.'],
    ['gateway', 'apisix', 'APISIX is the gateway in practice: routes, upstreams and plugins.'],
    ['gateway', 'auth', 'Every request is authenticated and authorised at the gate, before it reaches a service.'],
    ['auth', 'keycloak', 'Keycloak answers who you are, and issues the token that proves it.'],
    ['auth', 'fga', 'OpenFGA answers what you may do with one specific resource.'],
    ['apisix', 'keycloak', 'APISIX validates Keycloak-issued tokens on each route.'],
    ['apisix', 'fga', 'After authentication, the gateway asks OpenFGA whether this caller may act on this agent.'],
    ['keycloak', 'fga', 'The identity Keycloak vouches for becomes the user in OpenFGA\u2019s relationship tuples.'],
    ['a2a', 'gateway', 'External agents enter through the gateway, under the same authentication rules as everyone else.'],
    ['ray', 'k8s', 'KubeRay runs Ray clusters as Kubernetes resources.'],
    ['ray', 'distributed', 'Ray is a framework for distributed Python: tasks, actors and a shared object store.'],
    ['k8s', 'distributed', 'Kubernetes keeps distributed workloads at their desired state.'],
    ['python', 'ray', 'A Ray Serve deployment is a Python class.']
  ];

  const PLATES = [
    {
      no: 'Plate I', title: 'Custom Agent Management & Execution Platform',
      tech: ['Python', 'Ray Serve', 'Kubernetes', 'AutoGen', 'A2A', 'APISIX'],
      desc: 'An architecture I designed for deploying and managing user-created AI agents on managed Ray clusters.',
      points: [
        'Registration, versioning, deployment and lifecycle APIs for custom agents',
        'Distributed deployment and execution with Ray Serve',
        'Execution and session management APIs',
        'A2A adapter and registry integration for external agents',
        'Management, runtime and execution kept as separate services',
        'Exploration of persistent execution and cluster-state management'
      ],
      open: ['agentic', 'ray', 'a2a'],
      svg: '<svg class="ill" viewBox="0 0 360 220" role="img" aria-label="Three stacked planes: manage, runtime, execute">' +
        '<path class="draw" d="M70 34 H250 L300 70 H120 Z"/><path class="draw" d="M70 94 H250 L300 130 H120 Z"/><path class="draw" d="M70 154 H250 L300 190 H120 Z"/>' +
        '<path class="dash" d="M150 70 V94 M232 70 V94 M150 130 V154 M232 130 V154"/>' +
        '<rect class="draw soft" x="112" y="44" width="24" height="16"/><rect class="draw soft" x="150" y="44" width="24" height="16"/><rect class="draw soft" x="188" y="44" width="24" height="16"/>' +
        '<circle class="draw soft" cx="134" cy="112" r="7"/><circle class="draw soft" cx="164" cy="112" r="7"/><circle class="draw soft" cx="194" cy="112" r="7"/><circle class="draw soft" cx="224" cy="112" r="7"/>' +
        '<path class="draw soft" d="M150 164 L158 172 L150 180 L142 172 Z"/><path class="draw soft" d="M190 164 L198 172 L190 180 L182 172 Z"/><path class="draw soft" d="M230 164 L238 172 L230 180 L222 172 Z"/>' +
        '<text class="t" x="12" y="56">manage</text><text class="t" x="12" y="116">runtime</text><text class="t" x="12" y="176">execute</text></svg>'
    },
    {
      no: 'Plate II', title: 'Fine-Grained Authorization for AI Platforms',
      tech: ['OpenFGA', 'Keycloak', 'Apache APISIX'],
      desc: 'A resource-level authorization architecture I designed for enterprise AI applications.',
      points: [
        'OpenFGA for fine-grained permissions on agents, models and teams',
        'Permission models for execution, viewing, editing, deletion and management',
        'Keycloak authentication integrated with gateway authorization',
        'API-key authentication explored for long-running deployed agents'
      ],
      open: ['fga', 'keycloak', 'apisix'],
      svg: '<svg class="ill" viewBox="0 0 360 220" role="img" aria-label="A relationship graph from users through a team to an agent">' +
        '<circle class="draw soft" cx="54" cy="60" r="13"/><circle class="draw soft" cx="54" cy="164" r="13"/>' +
        '<rect class="draw soft" x="126" y="45" width="70" height="30"/>' +
        '<circle class="draw soft" cx="280" cy="110" r="24"/><circle class="draw" cx="280" cy="110" r="32" style="stroke-opacity:.35"/>' +
        '<path class="draw" d="M67 60 H126"/><path class="draw" d="M196 66 L252 98"/><path class="draw" d="M67 160 L250 118"/>' +
        '<text class="t" x="96" y="52" text-anchor="middle">member</text><text class="t" x="236" y="72" text-anchor="middle">editor</text><text class="t" x="150" y="152" text-anchor="middle">viewer</text>' +
        '<text class="t" x="54" y="90" text-anchor="middle">alice</text><text class="t" x="54" y="194" text-anchor="middle">bob</text><text class="t" x="161" y="64" text-anchor="middle">team</text><text class="t" x="280" y="114" text-anchor="middle">agent</text>' +
        '<text class="t" x="280" y="164" text-anchor="middle">execute \u00B7 view \u00B7 edit</text><text class="t" x="280" y="180" text-anchor="middle">delete \u00B7 manage</text></svg>'
    },
    {
      no: 'Plate III', title: 'Universal LLM Gateway',
      tech: ['Python', 'REST APIs', 'LLM APIs'],
      desc: 'My exploration of one gateway in front of many LLM providers and interfaces.',
      points: [
        'A unified interface over different LLM API conventions',
        'Compatibility with OpenAI- and Anthropic-style APIs',
        'Provider routing and fallback',
        'Planned support for hosted models, local inference endpoints and browser-based AI services'
      ],
      open: ['llm', 'gateway'],
      svg: '<svg class="ill" viewBox="0 0 360 220" role="img" aria-label="Many requests converge on one gate and fan out to three providers">' +
        '<path class="draw" d="M14 36 C90 36 110 96 158 104"/><path class="draw" d="M14 80 C80 80 120 100 158 108"/><path class="draw" d="M14 140 C80 140 120 118 158 112"/><path class="draw" d="M14 184 C90 184 110 124 158 116"/>' +
        '<rect class="draw soft" x="158" y="66" width="44" height="88"/><path class="draw" d="M180 78 V142"/>' +
        '<path class="draw" d="M202 110 C250 110 270 54 330 54"/><path class="draw" d="M202 110 H330"/><path class="draw" d="M202 110 C250 110 270 166 330 166"/>' +
        '<circle class="draw soft" cx="334" cy="54" r="5"/><circle class="draw soft" cx="334" cy="110" r="5"/><circle class="draw soft" cx="334" cy="166" r="5"/>' +
        '<text class="t" x="322" y="40" text-anchor="end">openai-style</text><text class="t" x="322" y="98" text-anchor="end">anthropic-style</text><text class="t" x="322" y="186" text-anchor="end">local inference</text></svg>'
    },
    {
      no: 'Plate IV', title: 'Distributed AI Agent Execution Infrastructure',
      tech: ['Ray Serve', 'Kubernetes', 'Python'],
      desc: 'How I deploy and run AI agents as distributed services.',
      points: [
        'Ray Serve deployment architecture and replica management',
        'Resource allocation under CPU and memory constraints',
        'Multi-version agent deployment strategies',
        'Investigation of runtime failures and Kubernetes workload stability'
      ],
      open: ['ray', 'k8s', 'distributed'],
      svg: '<svg class="ill" viewBox="0 0 360 220" role="img" aria-label="Three nodes holding agent replicas">' +
        '<circle class="draw soft" cx="180" cy="20" r="9"/><path class="draw" d="M180 29 L68 48 M180 29 V48 M180 29 L292 48"/>' +
        '<rect class="draw" x="20" y="48" width="96" height="152"/><rect class="draw" x="132" y="48" width="96" height="152"/><rect class="draw" x="244" y="48" width="96" height="152"/>' +
        '<path class="draw" d="M20 70 H116 M132 70 H228 M244 70 H340"/>' +
        '<text class="t" x="28" y="63">node-1</text><text class="t" x="140" y="63">node-2</text><text class="t" x="252" y="63">node-3</text>' +
        '<rect class="draw soft" x="32" y="84" width="30" height="30"/><rect class="draw soft" x="74" y="84" width="30" height="30"/><rect class="draw soft" x="32" y="126" width="30" height="30"/>' +
        '<rect class="draw soft" x="144" y="84" width="30" height="30"/><rect class="draw soft" x="186" y="84" width="30" height="30"/><rect class="dash" x="144" y="126" width="30" height="30"/>' +
        '<rect class="draw soft" x="256" y="84" width="30" height="30"/><rect class="dash" x="298" y="84" width="30" height="30"/>' +
        '<text class="t" x="68" y="186" text-anchor="middle">v1 \u00B7 v1 \u00B7 v1</text><text class="t" x="180" y="186" text-anchor="middle">v1 \u00B7 v2</text><text class="t" x="292" y="186" text-anchor="middle">v2 \u00B7 starting</text></svg>'
    }
  ];

  const INSTRUMENTS = [
    { h: 'Programming & backend', items: [['Python', 'python'], ['REST API design', 'python'], ['Asynchronous programming', 'python'], ['Distributed systems', 'distributed']] },
    { h: 'Agentic AI & LLMs', items: [['Microsoft AutoGen', 'agentic'], ['Multi-agent architectures', 'agentic'], ['Agent-to-Agent (A2A) protocol', 'a2a'], ['LLM integrations', 'llm'], ['Model serving and inference', 'llm'], ['RAG architectures', 'rag'], ['Embedding models and vector search', 'embed'], ['Prompt engineering and guardrails', 'llm']] },
    { h: 'AI infrastructure', items: [['Ray Serve', 'ray'], ['Kubernetes', 'k8s'], ['KubeRay', 'k8s'], ['Docker', 'k8s'], ['Cloud-native architectures', 'k8s'], ['Distributed workload management', 'distributed']] },
    { h: 'Gateway & security', items: [['Apache APISIX', 'apisix'], ['Keycloak', 'keycloak'], ['OpenFGA', 'fga'], ['API key authentication', 'auth'], ['Fine-grained authorization', 'fga'], ['OAuth 2.0 / JWT', 'auth'], ['Enterprise security integrations', 'auth']] },
    { h: 'Cloud & tools', items: [['AWS'], ['AWS Systems Manager (SSM)'], ['Linux / Ubuntu'], ['VS Code Remote Development'], ['Git'], ['Jupyter Notebook']] },
    { h: 'Where I\u2019m heading', items: [['Autonomous AI agents', 'agentic'], ['Multi-agent orchestration', 'agentic'], ['Agent interoperability', 'a2a'], ['LLM infrastructure and inference optimisation', 'llm'], ['Enterprise AI security', 'auth'], ['AI developer tools']] }
  ];

  return { CLUSTERS, DIMS, EDGES, PLATES, INSTRUMENTS };
})();
