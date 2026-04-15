# Mappd – WebSocket Specification

## Context

This document defines the WebSocket communication layer for Mappd's real-time Collaboration Mode. It complements the REST interface specification from M2 and should be read alongside it.

---

## Architecture Decisions

### REST in, WebSocket out
All client submissions go via REST. WebSocket is used exclusively for server → client broadcasts. The backend receives an action via REST, persists it if needed, and then broadcasts the updated state to all connected clients via WebSocket.

```
Client submits via REST → backend saves → backend broadcasts via WebSocket
```

This keeps error handling simple (standard HTTP status codes), stays consistent with the M2 REST spec, and avoids complexity in the WebSocket layer.

### Full state, not deltas
Every broadcast message contains the full current state of the relevant entity, not just what changed. This means clients can simply replace their local state with whatever arrives — no calculation needed. It also makes the system resilient to missed messages (e.g. brief disconnects).

### No authentication on WebSocket
The WebSocket connection itself is not authenticated. All sensitive operations go through REST, which is already protected by token-based auth. The broadcast data (session state, ratings, questions) is not considered sensitive enough to warrant WebSocket-level auth for our project scope.

### One global connection per client
The frontend opens a single WebSocket connection when the user logs in. This connection stays open for the entire session. The frontend manages topic subscriptions as the user navigates between pages.

---

## Connection

### Endpoint
```
ws://localhost:8080/ws
```
(Replace with production URL on deployment)

### Protocol
STOMP over SockJS

### Required frontend libraries
```bash
npm install @stomp/stompjs sockjs-client
```

### Example setup
```javascript
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const stompClient = new Client({
  webSocketFactory: () => new SockJS("http://localhost:8080/ws"),
  onConnect: () => {
    // connection ready, manage subscriptions here
  },
});

stompClient.activate(); // on login
stompClient.deactivate(); // on logout
```

---

## Topic

All Collaboration Mode broadcasts are sent to a single topic per skill map:

```
/topic/skillmaps/{skillMapId}/live
```

The frontend subscribes to this topic when a user opens a skill map page, and unsubscribes when they navigate away.

### Why one topic?
A single topic simplifies frontend subscription management. All message types are distinguished by the `type` field in the payload. Since only one session can be active per skill map at a time, the skillMapId is sufficient to identify the channel.

### Example subscription
```javascript
stompClient.subscribe(`/topic/skillmaps/${skillMapId}/live`, (message) => {
  const data = JSON.parse(message.body);
  switch (data.type) {
    case "SESSION_STARTED": ...
    case "SESSION_ENDED": ...
    case "RATING_UPDATED": ...
    case "QUESTION_ADDED": ...
    case "QUESTION_UPVOTED": ...
    case "QUESTION_ADDRESSED": ...
    case "SPEED_UPDATED": ...
  }
});
```

---

## Page Load Behavior

When a user opens a skill map page, the frontend must:

1. Call `GET /skillmaps/{skillMapId}/sessions/active` via REST to get the current session state
   - `200 OK` → a session is active, activate collaboration UI immediately using the response body
   - `404 Not Found` → no active session, show normal skill map view
2. Subscribe to `/topic/skillmaps/{skillMapId}/live` to receive future broadcasts

This ensures the UI always reflects the correct state, even if the user opens the page mid-session or after missing a broadcast.

### After reconnect
If the WebSocket connection drops and reconnects (handled automatically by SockJS), the frontend should re-call `GET /skillmaps/{skillMapId}/sessions/active` to resync state, as broadcasts may have been missed during the disconnect.

---

## Message Specification

All messages follow this structure:
```json
{
  "type": "<MESSAGE_TYPE>",
  ... additional fields
}
```

### SESSION_STARTED
Broadcast when the lecturer starts a collaboration session via `POST /skillmaps/{skillMapId}/sessions`.

```json
{
  "type": "SESSION_STARTED",
  "sessionId": 42,
  "startedAt": "2026-04-05T10:00:00"
}
```

| Field | Type | Description |
|---|---|---|
| sessionId | long | ID of the newly created session |
| startedAt | DateTime | Timestamp when the session started |

### SESSION_ENDED
Broadcast when the lecturer ends a session via `POST /skillmaps/{skillMapId}/sessions/active/end`.

```json
{
  "type": "SESSION_ENDED",
  "sessionId": 42,
  "endedAt": "2026-04-05T11:00:00"
}
```

| Field | Type | Description |
|---|---|---|
| sessionId | long | ID of the ended session |
| endedAt | DateTime | Timestamp when the session ended |

### RATING_UPDATED
Broadcast when a student submits or updates a skill understanding rating via `PUT /sessions/{sessionId}/skills/{skillId}/rating`.

```json
{
  "type": "RATING_UPDATED",
  "skillId": 5,
  "averageRating": 72.5,
  "totalResponses": 14
}
```

| Field | Type | Description |
|---|---|---|
| skillId | long | ID of the rated skill |
| averageRating | float | Current average rating across all students (0–100) |
| totalResponses | int | Number of students who have submitted a rating for this skill |

### QUESTION_ADDED
Broadcast when a student posts a new question via `POST /sessions/{sessionId}/questions`.

```json
{
  "type": "QUESTION_ADDED",
  "questionId": 17,
  "skillId": 5,
  "text": "Can you explain this concept more?",
  "upvotes": 0,
  "isAddressed": false
}
```

| Field | Type | Description |
|---|---|---|
| questionId | long | ID of the new question |
| skillId | long | ID of the skill the question is associated with |
| text | string | The question text |
| upvotes | int | Current upvote count (always 0 on creation) |
| isAddressed | boolean | Whether the question has been addressed (always false on creation) |

### QUESTION_VOTE_UPDATED
Broadcast when a student upvotes a question via `POST /questions/{questionId}/upvotes` or removes an upvote via `DELETE /questions/{questionId}/upvotes/me`.

```json
{
  "type": "QUESTION_UPVOTED",
  "questionId": 17,
  "upvotes": 3
}
```

| Field | Type | Description |
|---|---|---|
| questionId | long | ID of the upvoted question |
| upvotes | int | Current upvote count after the update |

### QUESTION_ADDRESSED
Broadcast when the lecturer marks a question as addressed via `POST /questions/{questionId}/mark-addressed`.

```json
{
  "type": "QUESTION_ADDRESSED",
  "questionId": 17
}
```

| Field | Type | Description |
|---|---|---|
| questionId | long | ID of the addressed question |

Frontend should remove this question from the live view on receipt.

### SPEED_UPDATED
Broadcast when a student submits speed feedback via `PUT /sessions/{sessionId}/speed`. Speed feedback is not persisted — the backend broadcasts and discards.

```json
{
  "type": "SPEED_UPDATED",
  "tooFast": 5,
  "tooSlow": 12,
  "totalResponses": 17
}
```

| Field | Type | Description |
|---|---|---|
| tooFast | int | Number of students who indicated too fast |
| tooSlow | int | Number of students who indicated too slow |
| totalResponses | int | Total number of students who submitted speed feedback |

---

## REST Additions

The following REST endpoint is not in the M2 spec but is required to support speed feedback:

| Method | Mapping | Body | Protected | Response |
|---|---|---|---|---|
| PUT | `/sessions/{sessionId}/speed` | `{ "feedback": "TOO_FAST" \| "TOO_SLOW" }` | TRUE | 204 No Content |

---

## Summary Table

| Message Type | Triggered by REST call | Topic |
|---|---|---|
| SESSION_STARTED | POST /skillmaps/{skillMapId}/sessions | /topic/skillmaps/{skillMapId}/live |
| SESSION_ENDED | POST /skillmaps/{skillMapId}/sessions/active/end | /topic/skillmaps/{skillMapId}/live |
| RATING_UPDATED | PUT /sessions/{sessionId}/skills/{skillId}/rating | /topic/skillmaps/{skillMapId}/live |
| QUESTION_ADDED | POST /sessions/{sessionId}/questions | /topic/skillmaps/{skillMapId}/live |
| QUESTION_VOTE_UPDATED | POST or DELETE /questions/{questionId}/upvotes | /topic/skillmaps/{skillMapId}/live |
| QUESTION_ADDRESSED | POST /questions/{questionId}/mark-addressed | /topic/skillmaps/{skillMapId}/live |
| SPEED_UPDATED | PUT /sessions/{sessionId}/speed | /topic/skillmaps/{skillMapId}/live |
