import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { messagesStore, userProfileStore, type Conversation, type Message } from '../lib/localStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Send, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MessageInbox() {
  const { identity } = useInternetIdentity();
  const qc = useQueryClient();
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ['conversations', principalId],
    queryFn: () => messagesStore.getConversations().filter(c => c.participantIds.includes(principalId)),
    refetchInterval: 5000,
    enabled: !!principalId,
  });

  const { data: messages = [] } = useQuery<Message[]>({
    queryKey: ['messages', selectedConvId],
    queryFn: () => selectedConvId ? messagesStore.getMessages(selectedConvId) : [],
    refetchInterval: 3000,
    enabled: !!selectedConvId,
  });

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      if (!selectedConvId || !principalId) return;
      const conv = conversations.find(c => c.id === selectedConvId);
      if (!conv) return;
      const recipientId = conv.participantIds.find(id => id !== principalId) || '';
      const msg: Message = {
        id: `msg_${Date.now()}`,
        conversationId: selectedConvId,
        senderId: principalId,
        senderName: profile?.name || 'You',
        recipientId,
        text,
        createdAt: new Date().toISOString(),
      };
      messagesStore.sendMessage(msg);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['messages', selectedConvId] });
      qc.invalidateQueries({ queryKey: ['conversations', principalId] });
      setNewMessage('');
    },
  });

  const selectedConv = conversations.find(c => c.id === selectedConvId);
  const otherName = selectedConv
    ? selectedConv.participantNames.find((_, i) => selectedConv.participantIds[i] !== principalId) || 'Unknown'
    : '';

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <MessageSquare className="w-12 h-12 text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground">No conversations yet.</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Visit a teacher's profile to start a conversation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-[500px] border border-border rounded-xl overflow-hidden">
      {/* Conversation list */}
      <div className="w-64 border-r border-border bg-muted/20 flex flex-col shrink-0">
        <div className="p-3 border-b border-border">
          <p className="font-semibold text-sm">Messages</p>
        </div>
        <ScrollArea className="flex-1">
          {conversations.map(conv => {
            const otherN = conv.participantNames.find((_, i) => conv.participantIds[i] !== principalId) || 'Unknown';
            return (
              <button
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`w-full text-left px-3 py-3 border-b border-border/50 hover:bg-muted/50 transition-colors ${
                  selectedConvId === conv.id ? 'bg-primary/5 border-l-2 border-l-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                    {otherN.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{otherN}</p>
                    <p className="text-xs text-muted-foreground truncate">{conv.lastMessage || 'No messages yet'}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </ScrollArea>
      </div>

      {/* Message view */}
      <div className="flex-1 flex flex-col">
        {selectedConvId ? (
          <>
            <div className="p-3 border-b border-border bg-white">
              <p className="font-semibold text-sm">{otherName}</p>
            </div>
            <ScrollArea className="flex-1 p-3">
              <div className="space-y-3">
                {messages.map(msg => {
                  const isMe = msg.senderId === principalId;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        isMe ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-muted rounded-bl-sm'
                      }`}>
                        <p>{msg.text}</p>
                        <p className={`text-[10px] mt-0.5 ${isMe ? 'text-primary-foreground/60' : 'text-muted-foreground'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="p-3 border-t border-border flex gap-2">
              <Input
                placeholder="Type a message…"
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && newMessage.trim()) sendMutation.mutate(newMessage.trim()); }}
                className="flex-1"
              />
              <Button
                size="icon"
                onClick={() => newMessage.trim() && sendMutation.mutate(newMessage.trim())}
                disabled={!newMessage.trim() || sendMutation.isPending}
                className="btn-primary"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
