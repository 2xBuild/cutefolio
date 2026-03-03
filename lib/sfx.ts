type SfxKind = "click" | "switch"

const STORAGE_KEY = "sfx"

let ctx: AudioContext | null = null
let lastPlayAt = 0

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (ctx) return ctx
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  ctx = new Ctx()
  return ctx
}

function isSfxEnabled(): boolean {
  if (typeof window === "undefined") return false
  const v = localStorage.getItem(STORAGE_KEY)
  if (v === "0" || v === "false") return false
  return true
}

function play(kind: SfxKind) {
  if (typeof window === "undefined") return
  if (!isSfxEnabled()) return
  if (document.visibilityState === "hidden") return

  const now = performance.now()
  if (now - lastPlayAt < 60) return
  lastPlayAt = now

  const ac = getAudioContext()
  if (!ac) return

  if (ac.state === "suspended") {
    void ac.resume().catch(() => {})
  }

  const t0 = ac.currentTime
  const peak = 0.12

  if (kind === "click") {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    const osc2 = ac.createOscillator()
    const gain2 = ac.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(3200, t0)
    osc.frequency.exponentialRampToValueAtTime(1200, t0 + 0.015)

    gain.gain.setValueAtTime(peak * 0.8, t0)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.03)

    osc2.type = "sine"
    osc2.frequency.setValueAtTime(800, t0)
    osc2.frequency.exponentialRampToValueAtTime(400, t0 + 0.025)

    gain2.gain.setValueAtTime(peak, t0)
    gain2.gain.exponentialRampToValueAtTime(0.001, t0 + 0.04)

    osc.connect(gain)
    gain.connect(ac.destination)
    osc2.connect(gain2)
    gain2.connect(ac.destination)

    osc.start(t0)
    osc.stop(t0 + 0.035)
    osc2.start(t0)
    osc2.stop(t0 + 0.045)
  } else {
    const osc = ac.createOscillator()
    const gain = ac.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(1200, t0)
    osc.frequency.exponentialRampToValueAtTime(1800, t0 + 0.05)

    gain.gain.setValueAtTime(0.001, t0)
    gain.gain.linearRampToValueAtTime(peak * 0.7, t0 + 0.015)
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06)

    osc.connect(gain)
    gain.connect(ac.destination)

    osc.start(t0)
    osc.stop(t0 + 0.07)
  }
}

export function playClickSfx() {
  play("click")
}

export function playSwitchSfx() {
  play("switch")
}
