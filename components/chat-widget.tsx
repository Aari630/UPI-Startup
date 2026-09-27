"use client";

import { useState, useRef, useEffect } from "react";
import { processChatMessage, type Message, type CheckoutCardPayload } from "@/actions/chat-agent";

export function ChatWidget({ storeName }: { storeName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: `Hi! I'm the assistant for ${storeName}. How can I help you today?` }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutCardPayload | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, checkoutData, isPaid]);

  // Polling logic to check payment status
  useEffect(() => {
    if (!checkoutData || isPaid) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment-status?qrId=${checkoutData.qrId}&merchantId=${checkoutData.merchantId}`);
        const data = await res.json();
        
        if (data.paid) {
          setIsPaid(true);
          setMessages((prev) => [
            ...prev,
            { role: "model", text: "Payment successful! 🚀 I've added 10 Candidate Unlock Credits to your account. You can now view their full profiles." }
          ]);
        }
      } catch (error) {
        console.error("Polling error:", error);
      }
    }, 2000); // Check every 2 seconds

    return () => clearInterval(interval);
  }, [checkoutData, isPaid]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setIsLoading(true);

    const response = await processChatMessage(messages, userMessage, storeName);
    setIsLoading(false);

    if (response.success) {
      setCheckoutData(response.payload);
      setIsPaid(false); // Reset payment state for new checkouts
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "I've prepared a special offer for you below with a 5% discount. Scan to pay!" }
      ]);
    } else {
      setMessages((prev) => [...prev, { role: "model", text: response.error }]);
    }
  }

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        💬 Chat with Sales
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[500px]">
      {/* Header */}
      <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold capitalize">{storeName} AI</h3>
          <p className="text-xs text-slate-400">Powered by Gemini</p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">✕</button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-slate-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`max-w-[80%] rounded-xl p-3 text-sm ${
            msg.role === "user" ? "bg-blue-600 text-white self-end" : "bg-slate-200 text-slate-800 self-start"
          }`}>
            {msg.text}
          </div>
        ))}

        {/* Dynamic Checkout Card */}
        {checkoutData && !isPaid && (
          <div className="bg-white border-2 border-emerald-500 rounded-xl p-4 self-center w-full max-w-[280px] shadow-sm animate-in fade-in zoom-in duration-300">
            <h4 className="font-semibold text-slate-800 text-center mb-1">{checkoutData.productName}</h4>
            <div className="flex justify-center items-center gap-2 mb-3">
              <span className="text-sm text-slate-400 line-through">₹{checkoutData.originalPrice}</span>
              <span className="text-lg font-bold text-emerald-600">₹{checkoutData.finalPrice}</span>
            </div>
            <img src={checkoutData.qrImageUrl} alt="Razorpay QR" className="w-full h-auto rounded-lg border border-slate-100" />
            <div className="mt-3 flex items-center justify-center gap-2 text-xs font-medium text-emerald-600">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
              Awaiting Payment...
            </div>
          </div>
        )}

        {/* Payment Success UI */}
        {checkoutData && isPaid && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 self-center w-full max-w-[280px] shadow-sm flex flex-col items-center justify-center animate-in fade-in zoom-in duration-500">
            <div className="w-12 h-12 bg-emerald-500 text-white rounded-full flex items-center justify-center text-2xl mb-3 shadow-md">✓</div>
            <h4 className="font-bold text-emerald-800 mb-1">Payment Verified</h4>
            <p className="text-xs text-emerald-600 text-center">₹{checkoutData.finalPrice} received securely via Razorpay.</p>
          </div>
        )}

        {isLoading && (
          <div className="bg-slate-200 text-slate-500 self-start rounded-xl p-3 text-sm animate-pulse">
            AI is typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-slate-100 flex gap-2">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button type="submit" disabled={isLoading || !input.trim()} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}