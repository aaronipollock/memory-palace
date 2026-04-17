# Diagnosing Latency and Timeout Behavior with Sentry in Low·sAI

As I started shifting toward support/production-style engineering, I wanted to move beyond “I built a feature” and actually demonstrate how I debug and reason about systems under real conditions.

So I took a core endpoint in Low·sAI—`POST /api/generate-images`—and treated it like a production system: instrument it, break it deliberately, and explain what happens.

---

## Setup

I integrated Sentry into my Node/Express backend with:

- error tracking
- request tracing
- performance monitoring

I also added structured logging with request IDs and mid-route instrumentation around the Stability API call so I could correlate:

- full request traces
- span-level timing
- structured logs

The goal wasn’t just to “see logs,” but to answer specific questions about system behavior.

---

## Test 1 — Where is the latency actually coming from?

### Baseline

A normal request looked like:

- Total request time: ~3.3s
- Stability API call: ~3.1s

From the trace, almost the entire request time was spent in the outbound API call.

> Initial assumption: the endpoint is slow because the external API is slow.

---

### Introduced delay

I added an 8-second artificial delay *before* the outbound API call:

```js
await new Promise((r) => setTimeout(r, 8000));
```


Now the same request looked like:

- Total request time: ~12.1s
- Stability API call: ~3.9s

The key observation:

> The external API timing stayed roughly the same, while total request time increased by ~8 seconds.

---

### Conclusion

The slowdown was not in the dependency—it was inside my own request path.

More specifically:

> The added latency occurred before the upstream API call, not inside it.

This seems obvious in hindsight, but the important part is how it was verified:

- Trace view showed total request expansion
- Span data showed stable dependency timing
- Logs confirmed when the upstream call actually started

Without correlating all three, it would be easy to misattribute the issue.

---

### Secondary insight

The trace made the request “look slow,” but didn’t explicitly show where the 8 seconds went.

> The delay appeared as unaccounted time inside the request handler.

This highlighted a gap:

> Observability without sufficient instrumentation can show *that* something is slow, but not *why*.

---

## Test 2 — What happens when the dependency exceeds our tolerance?

Next, I tested failure behavior instead of just latency.

I reduced the Axios timeout from 30 seconds to 2000 ms:

```js
timeout: 2000;
```


Since the Stability API normally takes ~3–5 seconds, this forces a timeout.

---

### Result

- Stability request failed with `ECONNABORTED` after ~2016 ms
- Backend returned a `504 Gateway Timeout`
- Total request duration: ~2.0 seconds

From logs:

- `stability_request_start`
- `stability_request_failed`
- `stabilityDuration: ~2000ms`

From Sentry:

- failed transaction trace
- request duration aligned with timeout threshold

---

### Conclusion

> When the dependency exceeded the configured timeout budget, the system failed fast and returned a clear 504 response.

This matters because the alternative is worse:

- hanging requests
- misleading 200 responses
- or swallowed errors

Instead, the behavior is explicit and consistent.

---

## Unexpected finding — Logging inconsistency

While adding instrumentation, I ran into something subtle but important.

Some logs looked like this:

```js
"0": "A",
"1": "p",
"2": "p",
```


Instead of a normal message string.

The issue turned out to be:

> Different logger wrappers were using different argument conventions (message-first vs. object-first).

Specifically:
- request-scoped logs (`req.log`) were fixed
- central error handler logs were still reversed

Because of that, strings were being spread into objects and serialized incorrectly.

---

### Fix

I standardized all logging calls to match Pino’s expected format:

```js
log.error('Application Error', errorContext);
```


---

### Why this matters

This wasn’t just cosmetic.

> Bad logging structure makes traces and logs much harder to correlate, which defeats the purpose of observability.

Fixing it made the debugging workflow reliable again.

---

## What I took away

Two things that sound simple but are easy to get wrong:

### 1. A slow endpoint is not the same as a slow dependency
Tracing alone can mislead you if you don’t validate where time is actually spent.

### 2. Observability tools are only as good as your instrumentation
If spans or logs aren’t structured correctly, you lose the ability to reason about the system.

---

## Final result

This exercise gave me a concrete, repeatable debugging workflow:

- introduce controlled failure or latency
- observe behavior in traces
- validate with logs
- isolate the cause
- confirm the fix

That’s the part I want to demonstrate—not just that I can build something, but that I can **debug it under pressure and explain what’s happening**.
