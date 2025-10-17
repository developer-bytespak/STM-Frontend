# Socket.IO Chat Flow Diagram

## 🔄 Complete Message Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           INITIAL SETUP                                  │
└─────────────────────────────────────────────────────────────────────────┘

  ┌──────────┐                                    ┌──────────┐
  │ Customer │                                    │ Provider │
  │  Browser │                                    │  Browser │
  └────┬─────┘                                    └────┬─────┘
       │                                                │
       │ 1. Log In (JWT returned)                     │
       │─────────────────────────────────►            │
       │                                  ┌────────────▼──────────┐
       │ 2. Socket connects with JWT     │    Backend Server     │
       │─────────────────────────────────►│   (NestJS + Socket.IO)│
       │                                  │                       │
       │◄─────────────────────────────────│  3. Connection OK     │
       │     "Connected: userId=123"      │                       │
       │                                  └───────────────────────┘
       │
       │ [User authenticated & socket ready]
       │


┌─────────────────────────────────────────────────────────────────────────┐
│                       CREATING A CHAT (Job Booking)                      │
└─────────────────────────────────────────────────────────────────────────┘

  Customer                Backend                 Database
  Browser                 Server                  (PostgreSQL)
     │                       │                         │
     │ 1. POST /jobs/create  │                         │
     │──────────────────────►│                         │
     │   {providerId, ...}   │                         │
     │                       │                         │
     │                       │ 2. Create job record    │
     │                       │────────────────────────►│
     │                       │                         │
     │                       │ 3. Create chat record   │
     │                       │────────────────────────►│
     │                       │                         │
     │                       │◄────────────────────────│
     │                       │   jobId, chatId         │
     │                       │                         │
     │◄──────────────────────│ 4. Return data          │
     │  { jobId, chatId }    │                         │
     │                       │                         │
     │ 5. createConversation(chatId)                  │
     │   - Opens chat UI                               │
     │   - Emit: join_chat                             │
     │──────────────────────►│                         │
     │                       │ 6. Verify access        │
     │                       │────────────────────────►│
     │                       │◄────────────────────────│
     │                       │   User authorized       │
     │◄──────────────────────│                         │
     │   "joined_chat"       │ 7. Add to room          │
     │                       │                         │
     │ 8. Load message history (REST API)             │
     │──────────────────────►│                         │
     │                       │────────────────────────►│
     │◄──────────────────────│◄────────────────────────│
     │   [Previous messages] │                         │
     │                       │                         │


┌─────────────────────────────────────────────────────────────────────────┐
│                        SENDING A MESSAGE                                 │
└─────────────────────────────────────────────────────────────────────────┘

  Customer                Backend                 Provider
  Browser                 Server                  Browser
     │                       │                         │
     │ 1. User types msg     │                         │
     │ 2. Clicks Send        │                         │
     │                       │                         │
     │ 3. Optimistic UI      │                         │
     │    (show immediately) │                         │
     │                       │                         │
     │ 4. Emit: send_message │                         │
     │──────────────────────►│                         │
     │ {chatId, message}     │                         │
     │                       │                         │
     │                       │ 5. Verify access        │
     │                       │ 6. Save to database     │
     │                       │────────────────────┐    │
     │                       │                    │    │
     │                       │ 7. Create          │    │
     │                       │    notification    │    │
     │                       │◄───────────────────┘    │
     │                       │                         │
     │                       │ 8. Broadcast to room    │
     │◄──────────────────────┤────────────────────────►│
     │  Event: new_message   │    Event: new_message   │
     │                       │                         │
     │ 9. Message confirmed  │     9. Message appears  │
     │    (replace temp ID)  │        in UI instantly  │
     │                       │                         │


┌─────────────────────────────────────────────────────────────────────────┐
│                   RECEIVING A MESSAGE (OTHER USER)                       │
└─────────────────────────────────────────────────────────────────────────┘

  Provider                Backend                 Customer
  Browser                 Server                  Browser
     │                       │                         │
     │ Provider sends msg    │                         │
     │──────────────────────►│                         │
     │                       │                         │
     │                       │ Backend processes       │
     │                       │────────────────────┐    │
     │                       │                    │    │
     │                       │ Saves & Broadcasts │    │
     │                       │◄───────────────────┘    │
     │                       │                         │
     │                       │ Event: new_message      │
     │                       │────────────────────────►│
     │                       │                         │
     │                       │      Customer socket    │
     │                       │      receives event     │
     │                       │                         │
     │                       │      handleIncoming     │
     │                       │      Message()          │
     │                       │                         │
     │                       │      Message appears    │
     │                       │      in UI instantly!   │
     │                       │                         │


┌─────────────────────────────────────────────────────────────────────────┐
│                        LOADING MESSAGE HISTORY                           │
└─────────────────────────────────────────────────────────────────────────┘

  User                    Backend                 Database
  Browser                 Server
     │                       │                         │
     │ 1. Opens chat         │                         │
     │                       │                         │
     │ 2. Join room (socket) │                         │
     │──────────────────────►│                         │
     │                       │                         │
     │ 3. GET /chat/:id/messages (REST)               │
     │──────────────────────►│                         │
     │                       │                         │
     │                       │ 4. Query database       │
     │                       │────────────────────────►│
     │                       │                         │
     │                       │◄────────────────────────│
     │                       │   All messages          │
     │                       │                         │
     │◄──────────────────────│ 5. Return messages      │
     │  {messages: [...]}    │                         │
     │                       │                         │
     │ 6. Display in UI      │                         │
     │                       │                         │
     │ 7. Now listening for new messages (socket)     │
     │                       │                         │


┌─────────────────────────────────────────────────────────────────────────┐
│                         LSM JOINING DISPUTE                              │
└─────────────────────────────────────────────────────────────────────────┘

  Customer                Backend                 LSM
  Browser                 Server                  Browser
     │                       │                         │
     │ 1. Click "Add LSM"    │                         │
     │──────────────────────►│                         │
     │                       │                         │
     │                       │ 2. Create dispute       │
     │                       │ 3. Update chat:         │
     │                       │    lsm_invited=true     │
     │                       │ 4. Create notification  │
     │                       │                         │
     │◄──────────────────────│ 5. Confirm LSM added    │
     │                       │                         │
     │                       │ 6. Send notification    │
     │                       │────────────────────────►│
     │                       │                         │
     │                       │         LSM opens chat  │
     │                       │◄────────────────────────│
     │                       │                         │
     │                       │ 7. LSM joins room       │
     │                       │         (socket)        │
     │                       │                         │
     │◄──────────────────────┤────────────────────────►│
     │   user_joined event   │    user_joined event    │
     │                       │                         │
     │ Now 3 users in room:  │                         │
     │ - Customer            │                         │
     │ - Provider            │                         │
     │ - LSM                 │                         │
     │                       │                         │


┌─────────────────────────────────────────────────────────────────────────┐
│                      CONNECTION RECOVERY                                 │
└─────────────────────────────────────────────────────────────────────────┘

  User                    Backend
  Browser                 Server
     │                       │
     │ Connected             │
     │◄─────────────────────►│
     │                       │
     │                       │  Backend crashes/restarts
     │                       X
     │                       │
     │ Disconnect event      │
     │◄──────────────────────│
     │                       │
     │ Status: Reconnecting  │
     │                       │
     │ Auto-retry 1...       │
     │──────────────────────►X (fails)
     │                       │
     │ Auto-retry 2...       │
     │──────────────────────►X (fails)
     │                       │
     │ ...                   │
     │                       │  Backend back online
     │ Auto-retry 5...       │
     │──────────────────────►│
     │                       │
     │◄──────────────────────│ Connected!
     │                       │
     │ Re-join chat rooms    │
     │──────────────────────►│
     │                       │
     │ Status: Connected     │
     │                       │


┌─────────────────────────────────────────────────────────────────────────┐
│                          ROOM STRUCTURE                                  │
└─────────────────────────────────────────────────────────────────────────┘

  Backend Socket.IO Rooms:

  ┌────────────────────────────────────────────┐
  │  Room: "chat:abc-123-xyz"                  │
  │  (Customer + Provider chat)                │
  │                                            │
  │  ┌──────────┐          ┌──────────┐      │
  │  │ Customer │          │ Provider │      │
  │  │ Socket 1 │          │ Socket 2 │      │
  │  └──────────┘          └──────────┘      │
  │                                            │
  │  Messages broadcasted to both              │
  └────────────────────────────────────────────┘

  ┌────────────────────────────────────────────┐
  │  Room: "chat:def-456-uvw"                  │
  │  (Dispute with LSM)                        │
  │                                            │
  │  ┌──────────┐  ┌──────────┐  ┌──────────┐│
  │  │ Customer │  │ Provider │  │   LSM    ││
  │  │ Socket 1 │  │ Socket 2 │  │ Socket 3 ││
  │  └──────────┘  └──────────┘  └──────────┘│
  │                                            │
  │  Messages broadcasted to all three         │
  └────────────────────────────────────────────┘

  Each room is ISOLATED - messages only go to users in that room


┌─────────────────────────────────────────────────────────────────────────┐
│                        KEY TECHNOLOGIES                                  │
└─────────────────────────────────────────────────────────────────────────┘

  Frontend                 Transport Layer          Backend
  ┌─────────────┐         ┌──────────────┐        ┌─────────────┐
  │   React     │         │  Socket.IO   │        │   NestJS    │
  │             │         │              │        │             │
  │ ChatContext │◄───────►│  WebSocket   │◄──────►│  Gateway    │
  │             │         │     or       │        │             │
  │ useChat()   │         │   Polling    │        │   Rooms     │
  │             │         │              │        │             │
  │ ChatPopup   │         │              │        │   Events    │
  └─────────────┘         └──────────────┘        └─────────────┘
        │                                                 │
        │                                                 │
        ▼                                                 ▼
  localStorage                                    PostgreSQL
  (backup)                                        (persistence)


┌─────────────────────────────────────────────────────────────────────────┐
│                        DATA FLOW SUMMARY                                 │
└─────────────────────────────────────────────────────────────────────────┘

  ╔══════════════════════════════════════════════════════════════╗
  ║  HTTP REST API (One-time operations)                         ║
  ╚══════════════════════════════════════════════════════════════╝
     • Create job (includes chat creation)
     • Load message history
     • Get all chats
     • User authentication

  ╔══════════════════════════════════════════════════════════════╗
  ║  Socket.IO (Real-time operations)                            ║
  ╚══════════════════════════════════════════════════════════════╝
     • Send messages
     • Receive messages
     • Join/leave rooms
     • Typing indicators
     • Presence updates

  ╔══════════════════════════════════════════════════════════════╗
  ║  Database (Persistence)                                      ║
  ╚══════════════════════════════════════════════════════════════╝
     • Store all messages
     • Store chat metadata
     • Store notifications
     • Enable message history


┌─────────────────────────────────────────────────────────────────────────┐
│                            LEGEND                                        │
└─────────────────────────────────────────────────────────────────────────┘

  ──────►  HTTP Request (REST API)
  ═════►  WebSocket Connection (Socket.IO)
  ◄─────  Response
  ────┐
      │  Internal Process
  ◄───┘
  X      Connection Failed
  ▼      Data Flow Direction
```

---

## 🔑 Key Takeaways

1. **Hybrid Approach**: REST for setup, WebSocket for real-time
2. **Persistence**: Every message saved to database
3. **Rooms**: Isolate chats for privacy and performance
4. **Optimistic UI**: Show messages immediately, confirm later
5. **Recovery**: Auto-reconnect on connection loss
6. **Security**: JWT auth required for all operations

---

**This flow ensures reliable, real-time messaging with full persistence!** 🚀

