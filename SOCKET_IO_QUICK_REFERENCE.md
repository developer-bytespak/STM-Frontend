# Socket.IO Chat - Quick Reference Card

## 🎯 Quick Start

### **1. Check Connection**
```typescript
import { useChat } from '@/contexts/ChatContext';

const { isSocketConnected } = useChat();
// Returns: true/false
```

### **2. Create Chat**
```typescript
const { createConversation } = useChat();

createConversation(
  providerId,       // number
  providerName,     // string
  formData,         // BookingFormData
  jobId,            // number (optional)
  chatId            // string - UUID from backend
);
```

### **3. Send Message**
```typescript
const { sendMessage } = useChat();

sendMessage("Hello!"); // That's it!
```

### **4. Open Existing Chat**
```typescript
const { openConversationByJobId } = useChat();

openConversationByJobId(jobId); // Opens chat for a job
```

---

## 📋 Context Values

```typescript
const {
  conversations,          // ChatConversation[] - All chats
  activeConversation,     // ChatConversation | null - Current open chat
  isSocketConnected,      // boolean - Socket status
  isPreviewMinimized,     // boolean - Minimize state
  
  // Functions
  createConversation,     // (providerId, providerName, formData, jobId?, chatId?) => void
  openConversation,       // (conversationId: string) => void
  openConversationByJobId, // (jobId: number) => boolean
  closeConversation,      // () => void
  minimizeConversation,   // () => void
  minimizeToCompact,      // () => void
  maximizeConversation,   // () => void
  sendMessage,            // (content: string, files?: File[]) => void
  addLSMToChat,           // (lsmId: string, lsmName: string) => void
} = useChat();
```

---

## 🔌 Backend Integration

### **When Creating a Job:**

```typescript
// Backend should return:
{
  jobId: 123,
  chatId: "uuid-from-chat-table", // ✅ THIS IS IMPORTANT!
  // ... other job data
}
```

### **Chat Table Structure:**
Your backend automatically creates a chat record:
```typescript
chat {
  id: UUID,              // This is what you pass to frontend
  job_id: number,
  customer_id: number,
  provider_id: number,
  lsm_id: number | null,
  is_active: boolean,
  created_at: DateTime
}
```

---

## 🌐 Socket Events

### **Emit (Frontend → Backend):**
- `join_chat` - Join a chat room
- `leave_chat` - Leave a chat room
- `send_message` - Send a message
- `typing` - Send typing indicator
- `mark_read` - Mark messages as read

### **Listen (Backend → Frontend):**
- `connected` - Connection successful
- `new_message` - New message received
- `user_typing` - Someone is typing
- `error` - Error occurred

---

## ⚙️ Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Socket connects to: `{API_URL}/chat`

---

## 🐛 Debug Checklist

**Socket not connecting?**
- [ ] Backend running?
- [ ] User logged in?
- [ ] JWT token in cookies?
- [ ] Correct API_URL in .env?
- [ ] Check browser console

**Messages not sending?**
- [ ] Socket connected? (`isSocketConnected === true`)
- [ ] Chat room joined?
- [ ] Message not empty?
- [ ] Check browser console

**Messages not receiving?**
- [ ] Other user in same room?
- [ ] Backend broadcasting?
- [ ] Check network tab

---

## 📞 Common Patterns

### **Pattern 1: Booking Flow**
```typescript
async function handleBooking(data) {
  // 1. Create job (backend creates chat)
  const result = await createJobAPI(data);
  
  // 2. Open chat with chatId from backend
  createConversation(
    result.providerId,
    result.providerName,
    formData,
    result.jobId,
    result.chatId  // ← From backend
  );
}
```

### **Pattern 2: Show Connection Status**
```typescript
<div className={isSocketConnected ? 'text-green-500' : 'text-red-500'}>
  {isSocketConnected ? '● Connected' : '○ Offline'}
</div>
```

### **Pattern 3: Open Chat from Job**
```typescript
<button onClick={() => openConversationByJobId(job.id)}>
  Open Chat
</button>
```

---

## 🚀 Files You Need to Know

| File | Purpose |
|------|---------|
| `src/lib/socketService.ts` | Socket.IO connection manager |
| `src/api/chat.ts` | REST API for chat |
| `src/contexts/ChatContext.tsx` | Chat state & socket integration |
| `src/components/chat/ChatPopup.tsx` | Chat UI (already working!) |

---

## ✅ What's Automatic

- ✓ Socket connects when user logs in
- ✓ Socket disconnects when user logs out
- ✓ Joins chat room when opening chat
- ✓ Leaves chat room when closing chat
- ✓ Loads message history when opening chat
- ✓ Saves messages to database
- ✓ Broadcasts to all users in room
- ✓ Reconnects on connection loss

---

## 🎯 Testing Steps

1. ✓ Log in as customer
2. ✓ Book a service (creates chat)
3. ✓ Send message "Hello"
4. ✓ Open new browser (incognito)
5. ✓ Log in as provider
6. ✓ See new chat
7. ✓ See "Hello" message
8. ✓ Reply "Hi!"
9. ✓ See reply instantly in customer browser
10. ✓ SUCCESS! 🎉

---

## 💡 Pro Tips

- Always pass `chatId` from backend when creating conversations
- Check `isSocketConnected` before sending messages
- Use browser console to debug socket events
- Test with two browsers simultaneously
- Backend logs show all socket events

---

## 📚 Full Documentation

See `SOCKET_IO_IMPLEMENTATION_GUIDE.md` for complete details!

---

**Need Help?** Check browser console for logs starting with:
- 🔌 (connection)
- 📨 (messages)
- ✅ (success)
- ❌ (errors)

