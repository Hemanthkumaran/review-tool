import React, { useState } from "react";

/**
 * Exact pricing layout from your screenshot
 * - Dark rounded canvas
 * - Title + subtitle
 * - Segmented Monthly/Yearly switch
 * - Two glossy pricing cards (Team, Agency)
 * - Checklist (enabled/disabled)
 * - Pill "Choose plan" buttons
 * - Footer note with yellow link
 */

export default function ChoosePlan() {
  const [billing, setBilling] = useState("monthly"); // 'monthly' | 'yearly'

  // You can tweak yearly prices if needed; UI mirrors the screenshot (25/50 monthly)
  const priceTeam = billing === "monthly" ? 25 : 250;   // example: $250/yr
  const priceAgency = billing === "monthly" ? 50 : 500; // example: $500/yr

  return (
    <div className="min-h-screen w-full bg-[#0d0e0f] flex items-center justify-center p-4">
      {/* Outer rounded canvas */}
      <div className="w-full max-w-6xl rounded-[28px] border border-[#1e1f22] bg-[#121315] shadow-[0_0_0_1px_rgba(255,255,255,0.02)] px-4 sm:px-8 py-8 sm:py-10 relative overflow-hidden">
        {/* subtle corner softness */}
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-black/10" />

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-white">
            Lorem ipsum dolor sit amet consectetur.
          </h1>
          <p className="mt-3 text-sm sm:text-base text-[#bfbfbf]">
            Lorem ipsum dolor sit amet consectetur. Sed non at imperdiet non ornare sollicitudin vel.
          </p>
        </div>

        {/* Segmented control */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex items-center rounded-full border border-[#2a2b2f] bg-[#141518] p-1">
            <button
              onClick={() => setBilling("monthly")}
              className={`px-6 py-2 rounded-full text-sm transition
                ${billing === "monthly" ? "bg-[#222329] text-white shadow-inner" : "text-[#bfbfbf] hover:text-white"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling("yearly")}
              className={`px-6 py-2 rounded-full text-sm transition
                ${billing === "yearly" ? "bg-[#222329] text-white shadow-inner" : "text-[#bfbfbf] hover:text-white"}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {/* TEAM CARD */}
          <PricingCard
            title="Team"
            price={priceTeam}
            period={billing === "monthly" ? "monthly" : "yearly"}
            features={[
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: false },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: false },
            ]}
            buttonLabel="Choose plan"
            highlight={false}
          />

          {/* AGENCY CARD */}
          <PricingCard
            title="Agency"
            price={priceAgency}
            period={billing === "monthly" ? "monthly" : "yearly"}
            features={[
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
              { text: "Lorem ipsum dolor sit amet consectetur.", enabled: true },
            ]}
            buttonLabel="Choose plan"
            highlight={true}
          />
        </div>

        {/* Footer line */}
        <div className="mt-8 sm:mt-10 text-center text-sm text-[#bfbfbf]">
          Explore Team plan 7 days for free.
          <button className="ml-2 text-[#F9EF38] hover:opacity-90 underline-offset-2 hover:underline">
            Start free trial
          </button>
        </div>
      </div>
    </div>
  );
}

function PricingCard({ title, price, period, features, buttonLabel, highlight }) {
  return (
    <div className="relative">
      {/* Card */}
      <div className="relative overflow-hidden rounded-[24px] border border-[#2a2b2f] bg-[#17181c] px-6 sm:px-8 py-7 sm:py-8">
        {/* Gloss / soft spotlight */}
        <div className="pointer-events-none absolute inset-0 rounded-[24px]
            bg-[radial-gradient(120%_60%_at_30%_0%,rgba(255,255,255,0.08),rgba(0,0,0,0)_50%)]" />
        <div className="relative">
          {/* Title */}
          <div className="text-white/95 text-lg font-medium">{title}</div>

          {/* Price */}
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-[#F9EF38] text-4xl font-semibold">${price}</span>
            <span className="text-sm text-[#bfbfbf]">{period}</span>
          </div>

          {/* Divider */}
          <div className="mt-5 h-px w-full bg-gradient-to-r from-transparent via-[#2a2b2f] to-transparent" />

          {/* Included */}
          <div className="mt-4 text-white/90 text-sm">What’s included :</div>

          <ul className="mt-3 space-y-3">
            {features.map((f, idx) => (
              <li key={idx} className="flex items-start gap-3">
                {f.enabled ? <IconCheck /> : <IconCross />}
                <span className={`text-sm ${f.enabled ? "text-[#bfbfbf]" : "text-[#6b6b6b]"}`}>
                  {f.text}
                </span>
              </li>
            ))}
          </ul>

          {/* Button */}
          <div className="mt-7">
            <button
              className={`w-full sm:w-auto px-8 py-3 rounded-full font-medium transition
                ${highlight
                  ? "bg-[#F9EF38] text-black hover:opacity-90"
                  : "bg-[#F9EF38] text-black hover:opacity-90"}`}
            >
              {buttonLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Icons */
function IconCheck() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#F9EF38]">
      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
        <path d="M5 10l3 3 7-7" stroke="#111" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function IconCross() {
  return (
    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#2b2c31]">
      <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5">
        <path d="M6 6l8 8M14 6l-8 8" stroke="#6b6b6b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
