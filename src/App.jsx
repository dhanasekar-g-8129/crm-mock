import { useState, useRef, useEffect } from "react";

/* ── Fonts ── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap";

/* ── Data ── */
const AGENT_CATALOG = [
  { id: "sq", name: "Sales Qualification", description: "Scores & qualifies leads based on engagement and signals.", avatar: "🎯", color: "#E05D2E", params: ["recordStatus", "leadScore", "date"] },
  { id: "de", name: "Data Enrichment", description: "Enriches records with firmographic and technographic data.", avatar: "📊", color: "#2563EB", params: ["companyName", "domain", "industry"] },
  { id: "fc", name: "Follow-up Coach", description: "Drafts timely follow-up emails and schedules reminders.", avatar: "📅", color: "#7C3AED", params: ["lastContactDate", "contactEmail", "dealStage"] },
  { id: "sc", name: "Sales Coach", description: "Gives deal-level coaching and next-best-action tips.", avatar: "🧠", color: "#059669", params: ["dealValue", "dealStage", "ownerName"] },
];

const CRM_FIELDS = [
  "Status", "Lead Score", "ClosingDate", "Company", "Website", "Industry",
  "Email", "Phone", "Lead Source", "Annual Revenue", "Deal Name", "Stage",
  "Amount", "Lead Owner", "Last Activity Time", "Created Time", "Modified Time",
];

const ACTIVITY_LOG = [
  { date: "Mar 24, 2025 · 7:00 PM", title: "Followed up", detail: "Sent a follow-up email about the Max Product pricing tier." },
  { date: "Mar 23, 2025 · 5:00 PM", title: "Emailed Lead", detail: "Sent an introductory email about the Max Product." },
  { date: "Mar 22, 2025 · 11:30 AM", title: "Lead Qualified", detail: "Lead scored 92 — flagged as Hot Lead based on engagement signals." },
];

const AGENT_SUMMARY = `Lead contacted via email on Mar 23 but has not yet responded. Recommend following up again on Mar 25 with the discount offer to move the deal forward.`;

/* ── Shared Styles ── */
const S = {
  font: { fontFamily: "'Geist', sans-serif" },
  label: { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9CA3AF" },
};

/* ─────────────────────────────────────────────
   AGENT ACTIVITY MODAL (centered overlay)
───────────────────────────────────────────── */
function ActivityModal({ agent, onClose }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 300, backdropFilter: "blur(2px)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, width: 480,
        maxHeight: "75vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.16)", ...S.font,
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px 14px", borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: `${agent.color}15`, display: "flex",
            alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0,
          }}>{agent.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: "#111827" }}>Agent Activity</div>
            <div style={{ fontSize: 11.5, color: "#9CA3AF", marginTop: 1 }}>{agent.name}</div>
          </div>
          <button onClick={onClose} style={{
            background: "#F3F4F6", border: "none", borderRadius: 8,
            width: 30, height: 30, cursor: "pointer", fontSize: 15,
            color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px" }}>
          <div style={{ ...S.label, marginBottom: 16 }}>Timeline</div>
          <div style={{ position: "relative" }}>
            <div style={{
              position: "absolute", left: 7, top: 8, bottom: 0,
              width: 1.5, background: "#E5E7EB",
            }} />
            {ACTIVITY_LOG.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 16, marginBottom: 24, position: "relative" }}>
                <div style={{
                  width: 16, height: 16, borderRadius: "50%",
                  background: i === 0 ? agent.color : "#fff",
                  border: `2px solid ${i === 0 ? agent.color : "#D1D5DB"}`,
                  flexShrink: 0, marginTop: 2, zIndex: 1,
                }} />
                <div style={{
                  flex: 1, background: "#FAFAFA", border: "1px solid #F0F0F0",
                  borderRadius: 8, padding: "10px 14px",
                }}>
                  <div style={{ fontSize: 10.5, color: "#9CA3AF", marginBottom: 4 }}>{item.date}</div>
                  <div style={{ fontWeight: 600, fontSize: 12.5, color: agent.color, marginBottom: 3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 12, color: "#4B5563", lineHeight: 1.55 }}>{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 22px", borderTop: "1px solid #F1F5F9",
          display: "flex", justifyContent: "flex-end",
        }}>
          <button onClick={onClose} style={{
            padding: "8px 20px", border: "1px solid #E5E7EB", borderRadius: 8,
            background: "#fff", fontSize: 12.5, cursor: "pointer",
            color: "#6B7280", fontFamily: "'Geist', sans-serif",
          }}>Close</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHAT SLIDEOUT
───────────────────────────────────────────── */
function ChatSlideout({ agent, onClose }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "agent", text: `Hi! I'm the ${agent.name}. Ask me anything about this record or lead.` },
  ]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(m => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);
    try {
      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: `You are ${agent.name}, a CRM AI agent embedded in Zoho CRM. You are helping a sales rep with the lead record of Sarah Johnson, VP of Operations at Omega Inc (sarah@omega.io). She is a Hot Lead, score 92, currently in Demo Scheduled stage. She hasn't replied to the last email. Keep responses brief (2-3 sentences max), practical, and sales-focused. Never break character.`,
          messages: [{ role: "user", content: userMsg }],
        }),
      });
      const data = await resp.json();
      const text = data.content?.map(b => b.text || "").join("") || "I couldn't process that.";
      setMessages(m => [...m, { role: "agent", text }]);
    } catch {
      setMessages(m => [...m, { role: "agent", text: "Something went wrong. Try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      position: "absolute", top: 0, right: 0, bottom: 0, width: 340,
      background: "#fff", borderLeft: "1px solid #E5E7EB",
      boxShadow: "-12px 0 40px rgba(0,0,0,0.08)",
      zIndex: 40, display: "flex", flexDirection: "column", ...S.font,
    }}>
      <div style={{
        padding: "14px 18px", borderBottom: "1px solid #F3F4F6",
        display: "flex", alignItems: "center", gap: 10,
        borderTop: `3px solid ${agent.color}`,
      }}>
        <div style={{ fontSize: 20 }}>{agent.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{agent.name}</div>
          <div style={{ fontSize: 11, color: "#22C55E" }}>● Online</div>
        </div>
        <button onClick={onClose} style={{
          background: "#F3F4F6", border: "none", borderRadius: 6,
          width: 28, height: 28, cursor: "pointer", fontSize: 14, color: "#6B7280",
        }}>✕</button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px 18px" }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
            marginBottom: 10,
          }}>
            <div style={{
              maxWidth: "82%", padding: "9px 13px",
              borderRadius: msg.role === "user" ? "14px 4px 14px 14px" : "4px 14px 14px 14px",
              background: msg.role === "user" ? agent.color : "#F3F4F6",
              color: msg.role === "user" ? "#fff" : "#374151",
              fontSize: 12.5, lineHeight: 1.5,
            }}>{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 4, padding: "4px 0" }}>
            {[0,1,2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: "50%",
                background: agent.color, opacity: 0.5,
                animation: `bounce 1s infinite ${i * 0.15}s`,
              }} />
            ))}
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: "12px 16px", borderTop: "1px solid #F3F4F6", display: "flex", gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
          placeholder="Ask about this lead..."
          style={{
            flex: 1, padding: "9px 12px", border: "1px solid #E5E7EB",
            borderRadius: 7, fontSize: 12.5, outline: "none", fontFamily: "'Geist', sans-serif",
          }}
        />
        <button onClick={send} style={{
          background: agent.color, color: "#fff", border: "none",
          borderRadius: 7, padding: "0 14px", cursor: "pointer",
          fontSize: 12.5, fontWeight: 600, fontFamily: "'Geist', sans-serif",
        }}>Send</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CONTEXT MENU
───────────────────────────────────────────── */
function ContextMenu({ onHide, onDelete, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  const items = [
    { label: "Hide", icon: "👁", action: onHide },
    { label: "Reorder", icon: "↕", action: onClose },
    { label: "Delete", icon: "🗑", action: onDelete, danger: true },
  ];
  return (
    <div ref={ref} style={{
      position: "absolute", right: 0, top: "100%", marginTop: 4,
      background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8,
      boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100,
      minWidth: 140, padding: "4px 0",
    }}>
      {items.map(item => (
        <button key={item.label} onClick={item.action} style={{
          display: "flex", alignItems: "center", gap: 8,
          width: "100%", padding: "8px 14px", background: "none",
          border: "none", cursor: "pointer", fontSize: 12.5,
          color: item.danger ? "#EF4444" : "#374151",
          fontFamily: "'Geist', sans-serif", textAlign: "left",
          transition: "background 0.1s",
        }}
          onMouseEnter={e => e.currentTarget.style.background = item.danger ? "#FEF2F2" : "#F9FAFB"}
          onMouseLeave={e => e.currentTarget.style.background = "none"}
        >
          <span style={{ fontSize: 13 }}>{item.icon}</span> {item.label}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────
   AGENT WIDGET CARD
───────────────────────────────────────────── */
function AgentWidget({ agent, onDelete, onViewActivity, onChat }) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <div style={{
      background: "#fff", overflow: "visible",
      position: "relative",
    }}>
      {/* Widget Body */}
      <div style={{ padding: "12px 14px" }}>
        <div style={{
          fontSize: 11.5, color: "#1F2937", fontWeight: 600, marginBottom: 6, ...S.font,
        }}>Lead Contacted via email</div>
        <div style={{
          fontSize: 11.5, color: "#6B7280", lineHeight: 1.55, ...S.font,
        }}>{AGENT_SUMMARY}</div>
        <button onClick={onViewActivity} style={{
          marginTop: 12, display: "flex", alignItems: "center", gap: 5,
          background: "none", border: "none", cursor: "pointer",
          color: agent.color, fontSize: 11.5, fontWeight: 600,
          fontFamily: "'Geist', sans-serif", padding: 0,
        }}>
          <span style={{ fontSize: 13 }}>⟳</span> View Agent Activity
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STEP 2b — NAME THE RELATED LIST
───────────────────────────────────────────── */
function NameRelatedListModal({ agent, onSave, onBack }) {
  const defaultName = agent.name.replace(/\s*Agent\s*$/i, "").trim();
  const [name, setName] = useState(defaultName);
  const [mappings, setMappings] = useState(
    () => (agent.params || []).map(p => ({ param: p, crmField: "" }))
  );
  const updateMapping = (idx, value) => {
    setMappings(m => m.map((row, i) => i === idx ? { ...row, crmField: value } : row));
  };

  const zohoBlue = "#1B74E4";
  const zohoBorder = "#DDE6ED";
  const zohoLightBg = "#F7F9FC";
  const zohoText = "#333";
  const zohoSecondary = "#888";

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200,
    }}>
      <div style={{
        background: "#fff", borderRadius: 8, width: 620,
        maxHeight: "88vh", display: "flex", flexDirection: "column",
        boxShadow: "0 8px 30px rgba(0,0,0,0.18)", ...S.font,
      }}>
        {/* Header */}
        <div style={{
          padding: "16px 20px", borderBottom: `1px solid ${zohoBorder}`,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: zohoLightBg, borderRadius: "8px 8px 0 0",
        }}>
          <span style={{ fontWeight: 600, fontSize: 15, color: zohoText }}>Add Related List</span>
          <button onClick={onBack} style={{
            background: "none", border: "none", cursor: "pointer",
            color: "#999", fontSize: 18, lineHeight: 1, padding: "2px 6px",
          }}>✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 24px 24px" }}>

          {/* Related List Name */}
          <div style={{ marginBottom: 24 }}>
            <label style={{
              display: "block", fontSize: 12, fontWeight: 600, color: zohoText,
              marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.03em",
            }}>Related List Name <span style={{ color: "#E03C31" }}>*</span></label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter list name"
              style={{
                width: "100%", padding: "9px 12px",
                border: `1px solid ${zohoBorder}`, borderRadius: 4,
                fontSize: 13, outline: "none", color: zohoText,
                fontFamily: "'Geist', sans-serif",
                boxSizing: "border-box",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onFocus={e => { e.target.style.borderColor = zohoBlue; e.target.style.boxShadow = `0 0 0 2px ${zohoBlue}22`; }}
              onBlur={e => { e.target.style.borderColor = zohoBorder; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Agent Param Mapping */}
          {mappings.length > 0 && (
          <div style={{
            background: zohoLightBg, border: `1px solid ${zohoBorder}`,
            borderRadius: 6, padding: "16px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 5h5v6H2zM9 5h5v6H9z" stroke={zohoBlue} strokeWidth="1.3" rx="1"/>
                <path d="M7 8h2" stroke={zohoBlue} strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              <span style={{ fontWeight: 600, fontSize: 13.5, color: zohoText }}>Agent Param Mapping</span>
            </div>
            <div style={{ fontSize: 11.5, color: zohoSecondary, marginBottom: 16, lineHeight: 1.5 }}>
              Map CRM record fields to agent input parameters. These values will be passed to the agent.
            </div>

            {/* Column headers */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 32px 1fr",
              alignItems: "center", padding: "8px 0", marginBottom: 2,
              borderBottom: `2px solid ${zohoBorder}`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: zohoBlue, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Agent Parameter
              </span>
              <span />
              <span style={{ fontSize: 11, fontWeight: 700, color: zohoBlue, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                CRM Field
              </span>
            </div>

            {/* Mapping rows */}
            {mappings.map((row, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "1fr 32px 1fr",
                alignItems: "center", padding: "10px 0",
                borderBottom: i < mappings.length - 1 ? `1px solid #EDF0F5` : "none",
              }}>
                {/* Agent param — read-only pill */}
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 6,
                  background: "#fff", border: `1px solid ${zohoBorder}`,
                  borderRadius: 4, padding: "7px 12px", maxWidth: "fit-content",
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: agent.color, flexShrink: 0,
                  }} />
                  <span style={{
                    fontSize: 12.5, color: zohoText, fontFamily: "'Geist Mono', monospace",
                    fontWeight: 500,
                  }}>{row.param}</span>
                </div>

                {/* Arrow connector */}
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <svg width="20" height="12" viewBox="0 0 20 12" fill="none">
                    <path d="M0 6h16M13 2l4 4-4 4" stroke="#B0BEC5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>

                {/* CRM field dropdown */}
                <select
                  value={row.crmField}
                  onChange={e => updateMapping(i, e.target.value)}
                  style={{
                    padding: "7px 10px",
                    border: `1px solid ${zohoBorder}`, borderRadius: 4,
                    fontSize: 12.5, color: row.crmField ? zohoText : "#AAA",
                    background: "#fff", outline: "none", cursor: "pointer",
                    fontFamily: "'Geist', sans-serif",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                    appearance: "auto",
                  }}
                  onFocus={e => { e.target.style.borderColor = zohoBlue; e.target.style.boxShadow = `0 0 0 2px ${zohoBlue}22`; }}
                  onBlur={e => { e.target.style.borderColor = zohoBorder; e.target.style.boxShadow = "none"; }}
                >
                  <option value="" disabled>Select CRM field</option>
                  {CRM_FIELDS.map(f => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={{
          padding: "14px 20px", borderTop: `1px solid ${zohoBorder}`,
          display: "flex", justifyContent: "flex-end", gap: 10,
          background: zohoLightBg, borderRadius: "0 0 8px 8px",
        }}>
          <button onClick={onBack} style={{
            padding: "8px 22px", border: `1px solid ${zohoBorder}`, borderRadius: 4,
            background: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
            color: "#555", fontFamily: "'Geist', sans-serif",
          }}
            onMouseEnter={e => e.currentTarget.style.background = "#F5F5F5"}
            onMouseLeave={e => e.currentTarget.style.background = "#fff"}
          >Cancel</button>
          <button
            onClick={() => onSave(name.trim() || agent.name)}
            disabled={!name.trim()}
            style={{
              padding: "8px 22px", border: "none", borderRadius: 4,
              background: name.trim() ? zohoBlue : "#CCC",
              color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: name.trim() ? "pointer" : "default",
              fontFamily: "'Geist', sans-serif",
              transition: "background 0.15s",
            }}
            onMouseEnter={e => { if (name.trim()) e.currentTarget.style.background = "#1565C0"; }}
            onMouseLeave={e => { if (name.trim()) e.currentTarget.style.background = zohoBlue; }}
          >Save</button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   CHOOSE AGENTS MODAL
───────────────────────────────────────────── */
function ChooseAgentsModal({ onClose, onAdd, existing }) {
  const [search, setSearch] = useState("");
  const [pendingAgent, setPendingAgent] = useState(null);

  const filtered = AGENT_CATALOG.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );
  // Sort: available first, already-added last
  const sorted = [...filtered].sort((a, b) => {
    const aAdded = existing.includes(a.id) ? 1 : 0;
    const bAdded = existing.includes(b.id) ? 1 : 0;
    return aAdded - bAdded;
  });

  if (pendingAgent) {
    return (
      <NameRelatedListModal
        agent={pendingAgent}
        onSave={(listName) => onAdd(pendingAgent, listName)}
        onBack={() => setPendingAgent(null)}
      />
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, backdropFilter: "blur(2px)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 12, width: 520,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)", ...S.font,
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 22px 14px", borderBottom: "1px solid #F3F4F6",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>Choose Agents</div>
          <button onClick={onClose} style={{
            background: "#F3F4F6", border: "none", borderRadius: 7,
            width: 30, height: 30, cursor: "pointer", fontSize: 15, color: "#6B7280",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>

        {/* Search */}
        <div style={{ padding: "12px 22px 0" }}>
          <div style={{ position: "relative" }}>
            <svg style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }}
              width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="#9CA3AF" strokeWidth="1.5"/>
              <path d="M11 11L14 14" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search agents..."
              style={{
                width: "100%", padding: "8px 12px 8px 30px",
                border: "1px solid #E5E7EB", borderRadius: 7,
                fontSize: 12.5, outline: "none", boxSizing: "border-box",
                fontFamily: "'Geist', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div style={{ padding: "12px 22px 20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9FAFB" }}>
                <th style={{ ...S.label, padding: "8px 12px", textAlign: "left", borderRadius: "6px 0 0 6px" }}>Name</th>
                <th style={{ ...S.label, padding: "8px 12px", textAlign: "left", borderRadius: "0 6px 6px 0" }}>Description</th>
                <th style={{ padding: "8px 12px" }}></th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr><td colSpan={3} style={{ textAlign: "center", padding: 20, color: "#9CA3AF", fontSize: 13 }}>No agents found</td></tr>
              ) : sorted.map(agent => {
                const isAdded = existing.includes(agent.id);
                return (
                <tr key={agent.id} style={{ borderBottom: "1px solid #F3F4F6", opacity: isAdded ? 0.6 : 1 }}
                  onMouseEnter={e => { if (!isAdded) e.currentTarget.style.background = "#F8FAFC"; }}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "11px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 7,
                        background: `${agent.color}12`, display: "flex",
                        alignItems: "center", justifyContent: "center", fontSize: 14,
                      }}>{agent.avatar}</div>
                      <span style={{ fontWeight: 600, fontSize: 12.5, color: "#111827" }}>{agent.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "11px 12px", fontSize: 12, color: "#6B7280", lineHeight: 1.4 }}>{agent.description}</td>
                  <td style={{ padding: "11px 12px", textAlign: "right" }}>
                    {isAdded ? (
                      <span style={{
                        fontSize: 11.5, fontWeight: 600, color: "#9CA3AF",
                        background: "#F3F4F6", border: "1px solid #E5E7EB",
                        borderRadius: 6, padding: "5px 12px", display: "inline-block",
                      }}>✓ Added</span>
                    ) : (
                      <button onClick={() => setPendingAgent(agent)} style={{
                        fontSize: 11.5, fontWeight: 600, color: agent.color,
                        background: `${agent.color}10`, border: `1px solid ${agent.color}30`,
                        borderRadius: 6, padding: "5px 12px", cursor: "pointer",
                        fontFamily: "'Geist', sans-serif",
                      }}>+ Add</button>
                    )}
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   RELATED LIST TYPE ICONS (SVG inline)
───────────────────────────────────────────── */
const AgentIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#FFF3EC"/>
    <circle cx="18" cy="14" r="5" stroke="#E05D2E" strokeWidth="1.8"/>
    <path d="M10 28c0-4.418 3.582-8 8-8s8 3.582 8 8" stroke="#E05D2E" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="24" cy="13" r="2.5" fill="#E05D2E" opacity="0.3"/>
    <path d="M24 11v4M22 13h4" stroke="#E05D2E" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const LookupIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F0F4FF"/>
    <rect x="9" y="10" width="12" height="3" rx="1.5" fill="#6B7280" opacity="0.4"/>
    <rect x="9" y="15" width="18" height="2" rx="1" fill="#6B7280" opacity="0.3"/>
    <rect x="9" y="19" width="14" height="2" rx="1" fill="#6B7280" opacity="0.2"/>
    <circle cx="23" cy="23" r="4" stroke="#4B6FBF" strokeWidth="1.5"/>
    <path d="M26 26L28 28" stroke="#4B6FBF" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const WidgetIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#FFF8E7"/>
    <rect x="8" y="10" width="20" height="14" rx="2" stroke="#C68A00" strokeWidth="1.5"/>
    <rect x="11" y="13" width="6" height="5" rx="1" fill="#C68A00" opacity="0.4"/>
    <rect x="19" y="13" width="6" height="2" rx="1" fill="#C68A00" opacity="0.3"/>
    <rect x="19" y="17" width="4" height="1.5" rx="0.75" fill="#C68A00" opacity="0.2"/>
  </svg>
);

const FunctionIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F0FDF4"/>
    <text x="10" y="24" fontSize="16" fill="#15803D" fontStyle="italic" fontFamily="serif">f</text>
    <path d="M20 14l4 4-4 4" stroke="#15803D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const QueryIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F5F3FF"/>
    <rect x="9" y="12" width="18" height="2" rx="1" fill="#7C3AED" opacity="0.5"/>
    <rect x="9" y="17" width="14" height="2" rx="1" fill="#7C3AED" opacity="0.35"/>
    <rect x="9" y="22" width="10" height="2" rx="1" fill="#7C3AED" opacity="0.2"/>
  </svg>
);

const UnselectedIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#F9FAFB"/>
    <rect x="9" y="10" width="18" height="14" rx="2" stroke="#9CA3AF" strokeWidth="1.5" strokeDasharray="3 2"/>
    <path d="M14 18l3 3 5-5" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SlyteIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
    <rect width="36" height="36" rx="8" fill="#FFF0F9"/>
    <rect x="9" y="10" width="18" height="14" rx="2" fill="#EC4899" opacity="0.12"/>
    <rect x="9" y="10" width="18" height="14" rx="2" stroke="#EC4899" strokeWidth="1.5"/>
    <path d="M13 17h10M13 20h6" stroke="#EC4899" strokeWidth="1.2" strokeLinecap="round"/>
  </svg>
);

const RELATED_LIST_TYPES = [
  {
    id: "agents",
    icon: <AgentIcon />,
    title: "Agents",
    description: "Embed AI Agents directly on the record to automate actions and surface real-time insights.",
    isNew: true,
    action: "agents",
  },
  {
    id: "lookup",
    icon: <LookupIcon />,
    title: "Multi-Select Lookup Related list",
    description: "Create relationship between A and B modules such that module A can have many records in module B and vice versa.",
    action: null,
  },
  {
    id: "widgets",
    icon: <WidgetIcon />,
    title: "Widgets",
    description: "Embeddable UI components configured for your organization can be shown in the related list.",
    action: null,
  },
  {
    id: "functions",
    icon: <FunctionIcon />,
    title: "Functions",
    description: "Information from third-party applications can be shown in related lists using functions.",
    action: null,
  },
  {
    id: "queries",
    icon: <QueryIcon />,
    title: "Queries",
    description: "Data from your Zoho CRM and third-party services can be shown in related lists using queries.",
    action: null,
  },
  {
    id: "unselected",
    icon: <UnselectedIcon />,
    title: "Unselected Related Lists",
    description: "Re-add hidden related records to the Record Details page for this module.",
    action: null,
  },
  {
    id: "slyte",
    icon: <SlyteIcon />,
    title: "SlyteUI Component",
    description: "Embeddable UI components built with Slyte framework can be shown in the related list.",
    action: null,
  },
];

/* ─────────────────────────────────────────────
   STEP 1 — ADD RELATED LIST TYPE PICKER
───────────────────────────────────────────── */
function AddRelatedListTypePicker({ onSelectAgents, onCancel }) {
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, backdropFilter: "blur(2px)",
    }}>
      <div style={{
        background: "#fff", borderRadius: 14, width: 560,
        maxHeight: "86vh", display: "flex", flexDirection: "column",
        boxShadow: "0 24px 64px rgba(0,0,0,0.18)", ...S.font,
      }}>
        {/* Header */}
        <div style={{
          padding: "22px 26px 16px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#111827", letterSpacing: "-0.02em" }}>
              Add Related List
            </div>
            <div style={{ fontSize: 13, color: "#6B7280", marginTop: 5, lineHeight: 1.45 }}>
              Add contextual information about an entity inside the record's details page.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 2 }}>
            <button style={{
              display: "flex", alignItems: "center", gap: 5,
              background: "none", border: "none", cursor: "pointer",
              color: "#6B7280", fontSize: 13, fontFamily: "'Geist', sans-serif",
            }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="6.5" stroke="#9CA3AF" strokeWidth="1.4"/>
                <path d="M8 7v4M8 5.5v.5" stroke="#9CA3AF" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Help
            </button>
            <button onClick={onCancel} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#9CA3AF", fontSize: 20, lineHeight: 1, padding: "2px 4px",
            }}>×</button>
          </div>
        </div>

        {/* "Add from" label */}
        <div style={{ padding: "14px 26px 6px" }}>
          <div style={{ fontSize: 12.5, color: "#374151", fontWeight: 500 }}>Add from</div>
        </div>

        {/* Type List */}
        <div style={{ overflowY: "auto", padding: "0 12px 16px" }}>
          {RELATED_LIST_TYPES.map((type, i) => (
            <div key={type.id}>
              <div
                onClick={() => type.action === "agents" ? onSelectAgents() : null}
                onMouseEnter={() => setHovered(type.id)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  display: "flex", alignItems: "flex-start", gap: 16,
                  padding: "15px 14px", borderRadius: 8, cursor: type.action ? "pointer" : "default",
                  background: hovered === type.id && type.action ? "#F8FAFC" : "transparent",
                  transition: "background 0.12s",
                  position: "relative",
                }}
              >
                <div style={{ flexShrink: 0, marginTop: 2 }}>{type.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    fontWeight: 600, fontSize: 14,
                    color: type.isNew ? "#111827" : "#1F2937",
                  }}>
                    {type.title}
                    {type.isNew && (
                      <span style={{
                        fontSize: 9.5, fontWeight: 700, letterSpacing: "0.06em",
                        background: "#E05D2E", color: "#fff",
                        padding: "2px 7px", borderRadius: 10,
                        textTransform: "uppercase",
                      }}>NEW</span>
                    )}
                  </div>
                  <div style={{
                    fontSize: 12.5, color: "#6B7280", marginTop: 4, lineHeight: 1.5,
                  }}>{type.description}</div>
                </div>
                {type.action && hovered === type.id && (
                  <div style={{
                    position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                    color: "#9CA3AF",
                  }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 12l4-4-4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </div>
              {i < RELATED_LIST_TYPES.length - 1 && (
                <div style={{ height: 1, background: "#F1F5F9", margin: "0 14px" }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   AGENT SECTION (related list header with refresh + ellipsis menu)
───────────────────────────────────────────── */
function AgentSection({ listName, listAgents, onRemoveAgent, onViewActivity, onChat, onRemoveList }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuOpen]);

  const handleRefresh = () => {
    if (refreshing) return;
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  };

  if (hidden) return null;

  const menuItems = [
    { label: "Hide", icon: "👁", action: () => { setHidden(true); setMenuOpen(false); } },
    { label: "Reorder", icon: "↕", action: () => setMenuOpen(false) },
    { label: "Delete", icon: "🗑", danger: true, action: () => { onRemoveList(listName); setMenuOpen(false); } },
  ];

  return (
    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E5E9F0", marginBottom: 8, overflow: "visible", position: "relative" }}>
      <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9", borderLeft: "3px solid #E05D2E", borderRadius: "8px 8px 0 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ fontSize: 13 }}>🤖</span>
          <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>{listName}</span>
          {/* Refresh button */}
          <button
            onClick={handleRefresh}
            title="Refresh"
            style={{
              background: "none", border: "none", cursor: refreshing ? "default" : "pointer",
              padding: "3px", display: "flex", alignItems: "center", justifyContent: "center",
              borderRadius: 5, color: refreshing ? "#E05D2E" : "#9CA3AF",
              transition: "color 0.15s", marginLeft: 2,
            }}
            onMouseEnter={e => { if (!refreshing) e.currentTarget.style.color = "#E05D2E"; }}
            onMouseLeave={e => { if (!refreshing) e.currentTarget.style.color = "#9CA3AF"; }}
          >
            <svg
              width="13" height="13" viewBox="0 0 16 16" fill="none"
              style={{ animation: refreshing ? "spin 0.8s linear infinite" : "none" }}
            >
              <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5c1.8 0 3.4.87 4.4 2.2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M12 2l.8 2.8-2.8.8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {listAgents.map(agent => (
            <button key={agent.id} onClick={() => onChat(agent)} style={{
              fontSize: 11, fontWeight: 600, color: "#fff",
              background: agent.color, border: "none", borderRadius: 5,
              padding: "4px 10px", cursor: "pointer", display: "flex",
              alignItems: "center", gap: 4, fontFamily: "'Geist', sans-serif",
            }}>
              <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                <path d="M12 1H2C1.45 1 1 1.45 1 2V9.5C1 10.05 1.45 10.5 2 10.5H4L7 13.5L10 10.5H12C12.55 10.5 13 10.05 13 9.5V2C13 1.45 12.55 1 12 1Z" stroke="#fff" strokeWidth="1.2" strokeLinejoin="round"/>
              </svg>
              Chat with agent
            </button>
          ))}
          {/* Ellipsis menu */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setMenuOpen(v => !v)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#9CA3AF", fontSize: 15, lineHeight: 1, padding: "2px 4px",
            }}>⋯</button>
            {menuOpen && (
              <div ref={menuRef} style={{
                position: "absolute", right: 0, top: "100%", marginTop: 4,
                background: "#fff", border: "1px solid #E5E7EB", borderRadius: 8,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 100,
                minWidth: 140, padding: "4px 0",
              }}>
                {menuItems.map(item => (
                  <button key={item.label} onClick={item.action} style={{
                    display: "flex", alignItems: "center", gap: 8,
                    width: "100%", padding: "8px 14px", background: "none",
                    border: "none", cursor: "pointer", fontSize: 12.5,
                    color: item.danger ? "#EF4444" : "#374151",
                    fontFamily: "'Geist', sans-serif", textAlign: "left",
                    transition: "background 0.1s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = item.danger ? "#FEF2F2" : "#F9FAFB"}
                    onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    <span style={{ fontSize: 13 }}>{item.icon}</span> {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: listAgents.length ? "12px 16px" : "14px 16px" }}>
        {listAgents.length === 0 ? (
          <div style={{ color: "#9CA3AF", fontSize: 12, textAlign: "center" }}>No agents added.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {listAgents.map(agent => (
              <AgentWidget key={agent.id} agent={agent}
                onDelete={() => onRemoveAgent(agent.id)}
                onViewActivity={() => onViewActivity(agent)}
                onChat={() => onChat(agent)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN LAYOUT
───────────────────────────────────────────── */
function ContentSection({ title, empty }) {
  return (
    <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E5E9F0", marginBottom: 10, overflow: "hidden" }}>
      <div style={{ padding: "12px 18px", borderBottom: "1px solid #F1F5F9" }}>
        <span style={{ fontWeight: 600, fontSize: 13.5, color: "#111827" }}>{title}</span>
      </div>
      <div style={{ padding: "14px 18px", color: "#9CA3AF", fontSize: 12.5, textAlign: "center" }}>{empty}</div>
    </div>
  );
}

const NAV_ITEMS = [
  { label: "Home", icon: "⌂" }, { label: "Reports", icon: "📊" },
  { label: "Analytics", icon: "📈" }, { label: "My Requests", icon: "📋" },
  { label: "Workqueue", icon: "⚡", badge: true }, { label: "Leads", icon: "👤", active: true },
  { label: "Contacts", icon: "👥" }, { label: "Accounts", icon: "🏢" },
  { label: "Deals", icon: "💼" }, { label: "Meetings", icon: "📅" },
  { label: "Calls", icon: "📞" }, { label: "Products", icon: "📦" },
  { label: "SalesInbox", icon: "📨" }, { label: "Feeds", icon: "🔔" },
  { label: "Campaigns", icon: "📣" }, { label: "Cases", icon: "🗂" },
  { label: "Solutions", icon: "💡" }, { label: "Documents", icon: "📄" },
  { label: "Forecasts", icon: "🎯" }, { label: "Visits", icon: "🚶" },
  { label: "Social", icon: "💬" },
];

const STATIC_LISTS = ["Notes", "Connected Records", "Attachments", "Open Activities", "Closed Activities", "Emails"];

export default function ZohoAgentWidgetMockup() {
  const [relatedLists, setRelatedLists] = useState([...STATIC_LISTS]);
  const [activeRelated, setActiveRelated] = useState("Emails");

  const [agents, setAgents] = useState([]);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [showChooseAgents, setShowChooseAgents] = useState(false);
  const [activityAgent, setActivityAgent] = useState(null);
  const [chatAgent, setChatAgent] = useState(null);

  const agentLists = relatedLists.filter(l => !STATIC_LISTS.includes(l));

  const handleSelectAgentsType = () => {
    setShowTypePicker(false);
    setShowChooseAgents(true);
  };

  const handleAddAgent = (agent, listName) => {
    const entryName = listName || agent.name;
    if (!agents.find(a => a.id === agent.id)) {
      setAgents(a => [...a, { ...agent, listName: entryName }]);
    }
    if (!relatedLists.includes(entryName)) {
      setRelatedLists(l => [...l, entryName]);
    }
    setShowChooseAgents(false);
  };

  const removeAgent = (id) => setAgents(a => a.filter(x => x.id !== id));

  return (
    <div style={{ fontFamily: "'Geist', sans-serif", display: "flex", height: "100vh", overflow: "hidden", background: "#F4F6FA" }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-4px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
      `}</style>

      {/* ══ LEFT NAV ══ */}
      <div style={{
        width: 210, flexShrink: 0, background: "#1A2540",
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        <div style={{ padding: "13px 14px 10px", display: "flex", alignItems: "center", gap: 9, borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: "linear-gradient(135deg,#E05D2E,#f5813b)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "#fff" }}>Z</div>
          <span style={{ fontWeight: 700, fontSize: 13, color: "#fff" }}>Zoho CRM</span>
          <div style={{ flex: 1 }} />
          <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, cursor: "pointer" }}>⬜</span>
        </div>
        <div style={{ padding: "8px 10px 6px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.07)", borderRadius: 6, padding: "5px 9px" }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3"/><path d="M10 10L13 13" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Search</span>
          </div>
        </div>
        <div style={{ margin: "3px 8px 5px", padding: "6px 8px", background: "rgba(255,255,255,0.06)", borderRadius: 6, display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
          <div style={{ width: 18, height: 18, borderRadius: 4, background: "linear-gradient(135deg,#06b6d4,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, fontWeight: 700, color: "#fff" }}>CT</div>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>CRM Teamspace</span>
          <span style={{ marginLeft: "auto", color: "rgba(255,255,255,0.3)", fontSize: 9 }}>▾</span>
        </div>
        <div style={{ flex: 1, padding: "0 6px 12px" }}>
          {NAV_ITEMS.map(item => (
            <div key={item.label} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "6px 9px",
              borderRadius: 6, cursor: "pointer", marginBottom: 1,
              background: item.active ? "rgba(224,93,46,0.16)" : "transparent",
            }}
              onMouseEnter={e => { if (!item.active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!item.active) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 12, width: 15, textAlign: "center", flexShrink: 0 }}>{item.icon}</span>
              <span style={{ fontSize: 12, color: item.active ? "#f97316" : "rgba(255,255,255,0.68)", fontWeight: item.active ? 600 : 400 }}>{item.label}</span>
              {item.badge && <span style={{ marginLeft: "auto", fontSize: 9, background: "#E05D2E", color: "#fff", padding: "1px 5px", borderRadius: 8, fontWeight: 700 }}>✨</span>}
            </div>
          ))}
        </div>
      </div>

      {/* ══ MAIN RIGHT PANEL ══ */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ background: "#fff", height: 44, flexShrink: 0, display: "flex", alignItems: "center", padding: "0 18px", borderBottom: "1px solid #E5E9F0", gap: 10 }}>
          <span style={{ fontWeight: 600, fontSize: 13.5, color: "#1A2540" }}>Leads</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#F4F6FA", border: "1px solid #E5E9F0", borderRadius: 6, padding: "5px 11px", width: 190 }}>
            <svg width="11" height="11" viewBox="0 0 14 14" fill="none"><circle cx="6" cy="6" r="4.5" stroke="#9CA3AF" strokeWidth="1.3"/><path d="M10 10L13 13" stroke="#9CA3AF" strokeWidth="1.3" strokeLinecap="round"/></svg>
            <span style={{ fontSize: 11.5, color: "#9CA3AF" }}>Search records</span>
          </div>
          {["＋","ZA","🔔","📅","💬","⚙️"].map((ic,i) => (
            <div key={i} style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 12, color: "#6B7280" }}
              onMouseEnter={e => e.currentTarget.style.background = "#F4F6FA"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >{ic}</div>
          ))}
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: "linear-gradient(135deg,#3B82F6,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff", cursor: "pointer" }}>SJ</div>
          <span style={{ fontSize: 13, color: "#9CA3AF", cursor: "pointer" }}>⠿</span>
        </div>

        {/* Record header */}
        <div style={{ background: "#fff", padding: "11px 20px 0", borderBottom: "1px solid #E5E9F0", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
            <span style={{ color: "#6B7280", fontSize: 15, cursor: "pointer" }}>←</span>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>Sarah Johnson</span>
                <span style={{ fontSize: 13, color: "#E05D2E", fontWeight: 600 }}>- Hot Lead</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ fontSize: 11, color: "#6B7280" }}>🏷</span>
                <span style={{ fontSize: 11, color: "#3B82F6", cursor: "pointer" }}>Add Tags</span>
              </div>
            </div>
            <div style={{ flex: 1 }} />
            <div style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #E5E9F0", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 11, color: "#6B7280" }}>ZA</div>
            <button style={{ background: "#2563EB", color: "#fff", border: "none", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Geist',sans-serif" }}>Send Email</button>
            <button style={{ background: "#fff", color: "#374151", border: "1px solid #E5E9F0", borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "'Geist',sans-serif" }}>Edit</button>
            <div style={{ width: 30, height: 30, border: "1px solid #E5E9F0", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: "#6B7280" }}>···</div>
            {["‹","›"].map((a,i) => (
              <div key={i} style={{ width: 26, height: 26, border: "1px solid #E5E9F0", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 13, color: "#6B7280" }}>{a}</div>
            ))}
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <div style={{ width: 28, height: 26, border: "1px solid #E5E9F0", borderRadius: 5, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", marginRight: 6 }}>
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="5" height="5" rx="1" stroke="#6B7280" strokeWidth="1.2"/><rect x="8" y="1" width="5" height="5" rx="1" stroke="#6B7280" strokeWidth="1.2"/><rect x="1" y="8" width="5" height="5" rx="1" stroke="#6B7280" strokeWidth="1.2"/><rect x="8" y="8" width="5" height="5" rx="1" stroke="#6B7280" strokeWidth="1.2"/></svg>
            </div>
            {["Overview","Timeline"].map((tab,i) => (
              <div key={tab} style={{ padding: "5px 14px 7px", borderBottom: i===0 ? "2px solid #2563EB" : "2px solid transparent", cursor: "pointer", fontSize: 12.5, fontWeight: i===0?600:400, color: i===0?"#2563EB":"#6B7280" }}>{tab}</div>
            ))}
            <div style={{ flex: 1 }} />
            <span style={{ fontSize: 11, color: "#9CA3AF", marginBottom: 5 }}>🕐 Last Update : Yesterday</span>
          </div>
        </div>

        {/* ── Body: Related List sidebar + content ── */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

          {/* Related List sidebar */}
          <div style={{ width: 185, flexShrink: 0, background: "#fff", borderRight: "1px solid #E5E9F0", overflowY: "auto", padding: "14px 0 16px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", padding: "0 14px 8px" }}>Related List</div>
            {relatedLists.map(item => {
              const isAgent = !STATIC_LISTS.includes(item);
              return (
                <div key={item} style={{
                  padding: "7px 14px", cursor: "pointer", fontSize: 12.5,
                  color: isAgent ? "#C2410C" : "#374151",
                  display: "flex", alignItems: "center", gap: 5,
                  borderLeft: "2px solid transparent",
                  transition: "background 0.1s",
                }}
                  onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  {isAgent && <span style={{ fontSize: 10 }}>🤖</span>}
                  {item}
                </div>
              );
            })}
            <div style={{ height: 1, background: "#F1F5F9", margin: "8px 14px" }} />
            <button onClick={() => setShowTypePicker(true)} style={{
              display: "flex", alignItems: "center", gap: 4, padding: "7px 14px",
              background: "none", border: "none", cursor: "pointer", fontSize: 12.5,
              color: "#2563EB", fontFamily: "'Geist',sans-serif", width: "100%", textAlign: "left",
            }}>+ Add Related List</button>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", padding: "12px 14px 6px" }}>Links</div>
          </div>

          {/* Scrollable content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", position: "relative" }}>

            {/* Notes */}
            <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E5E9F0", marginBottom: 8, overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #F1F5F9" }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>Notes</span>
                <div style={{ display: "flex", alignItems: "center", gap: 5, border: "1px solid #E5E9F0", borderRadius: 5, padding: "3px 9px", cursor: "pointer", fontSize: 11.5, color: "#374151" }}>Recent Last <span style={{ fontSize: 9 }}>▾</span></div>
              </div>
              <div style={{ padding: "10px 16px" }}>
                <div style={{ border: "1px solid #E5E9F0", borderRadius: 6, padding: "8px 12px", fontSize: 12, color: "#9CA3AF" }}>Add a note</div>
                <div style={{ marginTop: 8, padding: "9px 12px", background: "#FFFBEB", borderRadius: 6, border: "1px solid #FDE68A", fontSize: 12, color: "#92400E", lineHeight: 1.55 }}>
                  Sarah mentioned budget approval expected by end of Q1. Decision maker is their CTO.
                  <div style={{ fontSize: 10.5, color: "#D97706", marginTop: 4 }}>Added by you · Mar 20</div>
                </div>
              </div>
            </div>

            <ContentSection title="Connected Records" empty="No records found" />

            {/* Attachments */}
            <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E5E9F0", marginBottom: 8, overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>Attachments</span>
                <button style={{ display: "flex", alignItems: "center", gap: 4, border: "1px solid #2563EB", borderRadius: 5, padding: "3px 10px", background: "#fff", color: "#2563EB", fontSize: 11.5, cursor: "pointer", fontFamily: "'Geist',sans-serif" }}>Attach <span style={{ fontSize: 9 }}>▾</span></button>
              </div>
              <div style={{ padding: "12px 16px", color: "#9CA3AF", fontSize: 12, textAlign: "center" }}>No Attachment</div>
            </div>

            {/* Open Activities */}
            <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E5E9F0", marginBottom: 8, overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>Open Activities</span>
                <button style={{ display: "flex", alignItems: "center", gap: 4, border: "1px solid #2563EB", borderRadius: 5, padding: "3px 10px", background: "#fff", color: "#2563EB", fontSize: 11.5, cursor: "pointer", fontFamily: "'Geist',sans-serif" }}>Add New <span style={{ fontSize: 9 }}>▾</span></button>
              </div>
              <div style={{ padding: "12px 16px", color: "#9CA3AF", fontSize: 12 }}>No records found</div>
            </div>

            <ContentSection title="Closed Activities" empty="No records found" />

            {/* Emails */}
            <div style={{ background: "#fff", borderRadius: 8, border: "1px solid #E5E9F0", marginBottom: 8, overflow: "hidden" }}>
              <div style={{ padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: 600, fontSize: 13, color: "#111827" }}>Emails</span>
                <button style={{ border: "1px solid #2563EB", borderRadius: 5, padding: "3px 10px", background: "#fff", color: "#2563EB", fontSize: 11.5, cursor: "pointer", fontFamily: "'Geist',sans-serif" }}>Compose Email</button>
              </div>
              <div style={{ padding: "0 16px 4px" }}>
                {[
                  { subject: "Re: Partnership Proposal", date: "Mar 22", preview: "Thanks for the detailed breakdown..." },
                  { subject: "Demo Follow-up", date: "Mar 18", preview: "Great session today! As discussed..." },
                  { subject: "Introduction — Omega x YourCo", date: "Mar 12", preview: "Hi team, I'd love to explore..." },
                ].map((email, i, arr) => (
                  <div key={i} style={{ padding: "9px 0", borderBottom: i < arr.length - 1 ? "1px solid #F1F5F9" : "none", cursor: "pointer" }}>
                    <div style={{ fontWeight: 500, fontSize: 12.5, color: "#111827" }}>{email.subject}</div>
                    <div style={{ fontSize: 11.5, color: "#6B7280", marginTop: 2 }}>{email.date} — {email.preview}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Agent sections */}
            {agentLists.map(listName => {
              const listAgents = agents.filter(a => a.listName === listName);
              return (
                <AgentSection
                  key={listName}
                  listName={listName}
                  listAgents={listAgents}
                  onRemoveAgent={removeAgent}
                  onViewActivity={(agent) => { setActivityAgent(agent); setChatAgent(null); }}
                  onChat={(agent) => { setChatAgent(agent); setActivityAgent(null); }}
                  onRemoveList={(name) => {
                    setRelatedLists(l => l.filter(x => x !== name));
                    setAgents(a => a.filter(x => x.listName !== name));
                  }}
                />
              );
            })}

            {/* Chat slideout anchored in record */}
            {chatAgent && <ChatSlideout agent={chatAgent} onClose={() => setChatAgent(null)} />}
          </div>
        </div>
      </div>

      {/* Page-level overlays */}
      {activityAgent && <ActivityModal agent={activityAgent} onClose={() => setActivityAgent(null)} />}
      {showTypePicker && <AddRelatedListTypePicker onSelectAgents={handleSelectAgentsType} onCancel={() => setShowTypePicker(false)} />}
      {showChooseAgents && <ChooseAgentsModal onClose={() => setShowChooseAgents(false)} onAdd={handleAddAgent} existing={agents.map(a => a.id)} />}
    </div>
  );
}
