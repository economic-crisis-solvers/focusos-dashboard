import { useState } from "react";
import { useAuth } from "../context/AuthContext";

const STEPS = ["Welcome", "Connect", "Work Hours", "Threshold"];

function StepDots({ current }) {
  return (
    <div className="flex items-center gap-2 mb-10">
      {STEPS.map((_, i) => (
        <div
          key={i}
          className="rounded-full transition-all duration-300"
          style={{
            width:      i === current ? 24 : 8,
            height:     8,
            background: i === current ? "#10b981" : i < current ? "#10b98166" : "#27272a",
          }}
        />
      ))}
    </div>
  );
}

function Step1({ onNext }) {
  return (
    <div className="flex flex-col">
      <StepDots current={0} />
      <div className="mb-2 text-xs text-emerald-500 uppercase tracking-widest font-semibold">
        Welcome to
      </div>
      <h1 className="text-4xl font-semibold text-white mb-3">FocusOS</h1>
      <p className="text-zinc-400 text-lg mb-10 leading-relaxed">
        Your phone knows when you're distracted before you do.
        <br />
        FocusOS makes that knowledge act.
      </p>

      <div className="space-y-4 mb-12">
        {[
          { icon: "⚡", title: "Zero-touch activation",    desc: "No buttons, no timers. It just works." },
          { icon: "🔄", title: "Cross-device intelligence", desc: "Browser signals protect your phone automatically." },
          { icon: "🧠", title: "Predictive, not reactive",  desc: "Acts before focus fully collapses." },
        ].map(({ icon, title, desc }) => (
          <div
            key={title}
            className="flex items-start gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl"
          >
            <span className="text-2xl mt-0.5">{icon}</span>
            <div>
              <p className="text-white font-medium text-sm">{title}</p>
              <p className="text-zinc-500 text-sm mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onNext}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-4 rounded-xl text-base transition-colors"
      >
        Get started →
      </button>
    </div>
  );
}

function Step2({ onNext }) {
  return (
    <div className="flex flex-col">
      <StepDots current={1} />
      <h2 className="text-3xl font-semibold text-white mb-3">
        Connect your browser
      </h2>
      <p className="text-zinc-400 text-base mb-8 leading-relaxed">
        Install the FocusOS Chrome Extension so your browser can send focus
        signals to this dashboard.
      </p>

      <div className="space-y-4 mb-8">
        {[
          { step: "1", text: "Install the FocusOS Chrome Extension from the Chrome Web Store" },
          { step: "2", text: "Click the FocusOS icon in your browser toolbar" },
          { step: "3", text: "Sign in with your FocusOS account in the extension" },
        ].map(({ step, text }) => (
          <div
            key={step}
            className="flex items-start gap-4 p-4 bg-zinc-900 border border-zinc-800 rounded-xl"
          >
            <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
              {step}
            </span>
            <p className="text-zinc-300 text-sm leading-relaxed">{text}</p>
          </div>
        ))}
      </div>

      <div className="p-4 bg-zinc-900 border border-emerald-500/30 rounded-xl mb-8">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">
          Extension already installed?
        </p>
        <p className="text-sm text-zinc-300">
          Your dashboard will start receiving live scores automatically once the
          extension detects this account.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-4 rounded-xl text-base transition-colors"
      >
        Continue →
      </button>
      <button
        onClick={onNext}
        className="w-full text-zinc-500 hover:text-zinc-300 text-sm py-3 transition-colors"
      >
        Skip for now
      </button>
    </div>
  );
}

function Step3({ onNext, workHoursStart, workHoursEnd, setWorkHoursStart, setWorkHoursEnd }) {
  return (
    <div className="flex flex-col">
      <StepDots current={2} />
      <h2 className="text-3xl font-semibold text-white mb-3">
        Set your work hours
      </h2>
      <p className="text-zinc-400 text-base mb-8 leading-relaxed">
        FocusOS is fully active only during your work hours. Outside this window
        it watches silently — no DND, no nudges. Set it once, forget it forever.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-3">
              Work starts
            </label>
            <input
              type="time"
              value={workHoursStart}
              onChange={(e) => setWorkHoursStart(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-3">
              Work ends
            </label>
            <input
              type="time"
              value={workHoursEnd}
              onChange={(e) => setWorkHoursEnd(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div className="mt-6 p-4 bg-zinc-800 rounded-xl">
          <p className="text-sm text-zinc-400">
            Currently set:{" "}
            <span className="text-emerald-400 font-medium">
              {workHoursStart} – {workHoursEnd}
            </span>
            {" "}· Full protection active during these hours only.
          </p>
        </div>
      </div>

      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl mb-8">
        <p className="text-sm text-zinc-400">
          <span className="text-white font-medium">You can always change this</span>{" "}
          in Settings → Work Hours. This is just your starting point.
        </p>
      </div>

      <button
        onClick={onNext}
        className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-4 rounded-xl text-base transition-colors"
      >
        Continue →
      </button>
    </div>
  );
}

function Step4({ onDone, threshold, setThreshold, saving }) {
  const stateLabel =
    threshold >= 60 ? "Engaged" : threshold >= 45 ? "Drifting" : "Distracted";
  const stateColor =
    threshold >= 60 ? "#10b981" : threshold >= 45 ? "#f59e0b" : "#ef4444";

  return (
    <div className="flex flex-col">
      <StepDots current={3} />
      <h2 className="text-3xl font-semibold text-white mb-3">
        Set your focus threshold
      </h2>
      <p className="text-zinc-400 text-base mb-8 leading-relaxed">
        When your focus score drops below this value, FocusOS activates Focus
        Shield on your phone and holds notifications.
      </p>

      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-sm text-zinc-500 uppercase tracking-wider mb-1">
              Shield activates below
            </p>
            <p
              className="text-5xl font-semibold tabular-nums"
              style={{ color: stateColor }}
            >
              {threshold}
            </p>
          </div>
          <div className="text-right">
            <span
              className="text-sm font-medium px-4 py-2 rounded-full border"
              style={{
                color:       stateColor,
                borderColor: stateColor + "44",
                background:  stateColor + "11",
              }}
            >
              {stateLabel}
            </span>
          </div>
        </div>
        <input
          type="range"
          min="20"
          max="70"
          value={threshold}
          onChange={(e) => setThreshold(Number(e.target.value))}
          className="w-full accent-emerald-500"
        />
        <div className="flex justify-between text-xs text-zinc-600 mt-2">
          <span>20 — Very sensitive</span>
          <span>70 — Less sensitive</span>
        </div>
      </div>

      <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl mb-8">
        <p className="text-sm text-zinc-400">
          <span className="text-white font-medium">Recommended: 45</span> —
          activates when you're drifting but not yet fully distracted. You can
          change this anytime in Settings.
        </p>
      </div>

      <button
        onClick={onDone}
        disabled={saving}
        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium py-4 rounded-xl text-base transition-colors"
      >
        {saving ? "Saving..." : "Start focusing →"}
      </button>
    </div>
  );
}

export default function Onboarding({ onComplete }) {
  const { user }             = useAuth();
  const [step, setStep]      = useState(0);
  const [threshold, setThreshold]         = useState(45);
  const [workHoursStart, setWorkHoursStart] = useState("09:00");
  const [workHoursEnd, setWorkHoursEnd]     = useState("18:00");
  const [saving, setSaving]  = useState(false);
  const [error, setError]    = useState("");

  const handleDone = async () => {
    if (!user?.accessToken) { onComplete(); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(
        "https://focusos-backend-production.up.railway.app/api/settings",
        {
          method:  "PUT",
          headers: {
            "Content-Type":  "application/json",
            Authorization:   `Bearer ${user.accessToken}`,
          },
          body: JSON.stringify({
            focusThreshold: threshold,
            workHours: {
              start: workHoursStart,
              end:   workHoursEnd,
            },
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to save settings");
      onComplete();
    } catch (e) {
      setError("Could not save settings — you can update them in Settings later.");
      // Still proceed after showing error briefly
      setTimeout(onComplete, 2000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <span className="text-xs text-zinc-600 uppercase tracking-widest">
            FocusOS Setup
          </span>
        </div>

        <div className="bg-[#111114] border border-zinc-800 rounded-2xl p-10">
          {error && (
            <p className="text-yellow-400 text-sm mb-4 text-center">{error}</p>
          )}
          {step === 0 && <Step1 onNext={() => setStep(1)} />}
          {step === 1 && <Step2 onNext={() => setStep(2)} />}
          {step === 2 && (
            <Step3
              onNext={() => setStep(3)}
              workHoursStart={workHoursStart}
              workHoursEnd={workHoursEnd}
              setWorkHoursStart={setWorkHoursStart}
              setWorkHoursEnd={setWorkHoursEnd}
            />
          )}
          {step === 3 && (
            <Step4
              onDone={handleDone}
              threshold={threshold}
              setThreshold={setThreshold}
              saving={saving}
            />
          )}
        </div>
      </div>
    </div>
  );
}
