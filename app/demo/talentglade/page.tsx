import { ChatWidget } from "@/components/chat-widget";
import { StorefrontChat } from "@/components/storefront-chat";

export default function TalentgladeDemoPage() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 px-6 py-5 sm:px-10 lg:px-16">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-emerald-300">Talentglade</p>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">Talentglade Employer Hub</h1>
          </div>
          <p className="hidden text-sm text-zinc-500 sm:block">Employer portal</p>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-10 lg:px-16">
        <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-zinc-100 sm:text-5xl">
          Purchase unlock credits to contact Indian candidates
        </h2>
        <p className="mt-5 max-w-xl text-base leading-7 text-zinc-400">
          Buy credit packs through the checkout assistant. Scan the UPI QR to top up your employer account instantly.
        </p>
      </section>

      <StorefrontChat storeName="talentglade" />
      <ChatWidget storeName="talentglade"/>
    </main>
  );
}
