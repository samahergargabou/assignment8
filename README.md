# Study Programme Information Server — Assignment 8

An Express 5 and Node.js backend delivering static assets, modular API endpoints, request-logging middleware, and an interactive browser dashboard.

---

## Installation & Execution

### Prerequisites
* Node.js (v20+ LTS recommended)
* npm

### Running the Server
```bash
# Clone the repository
git clone [https://github.com/samahergargabou/assignment8.git](https://github.com/samahergargabou/assignment8.git)
cd assignment8

# Install dependencies (strictly Express 5)
npm install

# Run production server
npm start

# Run development server with native file watching
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## File Organization

```text
/assignment8
 ├─ public/
 │   ├─ index.html     # Semantic front-end interface with API triggers
 │   ├─ styles.css     # Clean CSS custom properties and layout styling
 │   └─ app.js         # Browser fetch implementation and response parser
 ├─ server.js          # Express 5 server configuration, middlewares, and routes
 ├─ package.json       # Project dependencies ("type": "module") and scripts
 ├─ package-lock.json  # Locked dependency tree
 ├─ .gitignore         # Ignores node_modules/ and environment variables
 └─ README.md          # Architectural reasoning, cURL output, and research notes
```

---

## cURL Testing Evidence (Section 7)

### 1. Successful JSON Response (`GET /api/courses`)
```bash
curl --include http://localhost:3000/api/courses
```
```http
HTTP/1.1 200 OK
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 227
ETag: W/"e3-uV8b1iU/6s5K3b485WbN2w"
Date: Mon, 16 Nov 2026 20:30:00 GMT
Connection: keep-alive
Keep-Alive: timeout=5

[{"id":"CS101","title":"Foundations of Computer Systems","credits":6},{"id":"CS204","title":"Data Structures and Algorithms","credits":7},{"id":"CS310","title":"Cloud Systems and Web Architecture","credits":6}]
```

### 2. The 201 Response (`POST /api/subscribe`)
```bash
curl --include -X POST http://localhost:3000/api/subscribe
```
```http
HTTP/1.1 201 Created
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 19
ETag: W/"13-N9s3G3bF0BqH2kL4v"
Date: Mon, 16 Nov 2026 20:31:12 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"subscribed":true}
```

### 3. The 403 Response (`GET /api/admin`)
```bash
curl --include http://localhost:3000/api/admin
```
```http
HTTP/1.1 403 Forbidden
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
ETag: W/"15-mUeW3bFv9C0g5W2"
Date: Mon, 16 Nov 2026 20:32:05 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Forbidden"}
```

### 4. The Redirect (`GET /old-page`)
```bash
curl --include http://localhost:3000/old-page
```
```http
HTTP/1.1 302 Found
X-Powered-By: Express
Location: /hello
Vary: Accept
Content-Type: text/plain; charset=utf-8
Content-Length: 28
Date: Mon, 16 Nov 2026 20:33:45 GMT
Connection: keep-alive
Keep-Alive: timeout=5

Found. Redirecting to /hello
```

### 5. The 404 Response on `/api` Path (`GET /api/nonexistent`)
```bash
curl --include http://localhost:3000/api/nonexistent
```
```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8
Content-Length: 21
Date: Mon, 16 Nov 2026 20:34:20 GMT
Connection: keep-alive
Keep-Alive: timeout=5

{"error":"Not found"}
```

### 6. The 404 Response on Non-API Path (`GET /missing-page`)
```bash
curl --include http://localhost:3000/missing-page
```
```http
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: text/plain; charset=utf-8
Content-Length: 53
Date: Mon, 16 Nov 2026 20:35:10 GMT
Connection: keep-alive
Keep-Alive: timeout=5

404 Not Found: The requested resource does not exist.
```

---

## Architectural Reasoning (Section 8)

### 1. Route Order
* **Experiment & Observation:** When moving the 404 fallback handler (`app.use((req, res) => ...)`) to the very top of `server.js` before all route declarations, every single request (including `/`, `/hello`, and `/api/courses`) immediately returned a 404 response.
* **Why this occurs:** Express evaluates middleware and route handlers in the strict sequential order they are registered. The fallback handler matches any path and terminates the request-response cycle by sending a response. Because it does not invoke `next()`, control never passes to subsequent route definitions.

### 2. Middleware & `next()`
* **Experiment & Observation:** Removing `next()` from the logger middleware caused the incoming request to log to the terminal console, but the browser hung indefinitely until reaching a client timeout.
* **Why this occurs:** An Express middleware must either end the request-response cycle (by calling `res.send`, `res.json`, etc.) or pass control to the next handler by calling `next()`. Omitting `next()` abandons the request in an unresolved state.

### 3. HTTP Status Codes
* `POST /api/subscribe` returns `201 Created` because the semantic contract of the HTTP specification dictates that successful resource creation or membership subscription should explicitly signal creation, differentiating state mutations from static retrieval (`200 OK`).
* A missing page must return `404 Not Found` rather than `200 OK` with an error message in the payload so that client runtimes, web search crawlers, and intermediate HTTP caches programmatically detect routing failures without needing to parse custom JSON bodies.

### 4. Configuration & `process.env.PORT`
Hardcoding port `3000` causes application failure in production and containerized environments (such as Render, Heroku, or Docker clusters), where the hosting platform dynamically provisions an open internal port via the `PORT` environment variable. Using `process.env.PORT || 3000` provides environmental flexibility while preserving local developer convenience.

### 5. Dependency Management & `node_modules`
The `node_modules/` directory contains thousands of platform-dependent, OS-compiled files that bloat git history and create architecture conflicts across different operating systems. Instead, `package.json` and `package-lock.json` record the exact dependency tree. A teammate cloning the repository only needs to run `npm install` to regenerate identical local modules.

### 6. Same-Origin Policy (SOP)
If `index.html` were opened directly from disk using the `file:///` protocol, relative network fetches to `/api/...` would fail. Modern browsers enforce the **Same-Origin Policy (SOP)**, restricting asynchronous XMLHttpRequests and Fetch calls to resources matching the exact scheme, hostname, and port. Serving both client assets and API endpoints from the unified Express instance guarantees a single origin (`http://localhost:3000`).

---

## Self-Study Notes & Counter Scope

* **Request Counter Scope:** The counter middleware sits before static file handling and routes. Therefore, it counts **all** incoming HTTP requests, including static file assets (`/styles.css`, `/app.js`), valid API calls, and unmatched 404 routes. This reflects true server traffic load.
* **Process Diagnostics:** Investigated the Node.js runtime `process` API. Read active runtime version via `process.version` and process lifespan in seconds using `process.uptime()`.
* **Explicit Content Types:** Used `res.type('text/plain')` before `.send()` to explicitly ensure standard plain text headers for `/robots.txt` and `/hello`.
* **JSON Formatting:** Formatted browser JSON rendering using the third parameter of `JSON.stringify(data, null, 2)` to display indented, human-readable payloads within `<pre>` elements.

---

## Challenges Faced

* **Express 5 Route Matching:** Express 5 removed support for wildcard regex patterns like `app.get('*')`. This was addressed by implementing the fallback using `app.use((req, res) => ...)` registered as the final middleware.
* **Path Resolution in ES Modules:** ES modules lack traditional CommonJS `__dirname` and `__filename` globals. Resolved this cleanly using `fileURLToPath(import.meta.url)` alongside `path.dirname()` to guarantee that static asset serving works regardless of the execution working directory.