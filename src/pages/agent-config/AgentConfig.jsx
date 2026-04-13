import { useState, useRef, useEffect } from "react";

/* ── Fonts ── */
const FONT_LINK = "https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap";

/* ── Agent catalog with response fields the agent produces ── */
const AGENTS = [
  {
    id: "sq",
    name: "Sales Qualification",
    avatar: "🎯",
    color: "#E05D2E",
    description: "Scores & qualifies leads based on engagement and signals.",
    responseFields: [
      { key: "qualificationScore", label: "Qualification Score", type: "number", description: "Numeric score (0-100) based on engagement signals" },
      { key: "qualificationStatus", label: "Qualification Status", type: "text", description: "Hot / Warm / Cold classification" },
      { key: "qualificationReason", label: "Qualification Reason", type: "text", description: "Brief explanation of the score" },
      { key: "nextBestAction", label: "Next Best Action", type: "text", description: "Recommended follow-up action" },
    ],
  },
  {
    id: "de",
    name: "Data Enrichment",
    avatar: "📊",
    color: "#2563EB",
    description: "Enriches records with firmographic and technographic data.",
    responseFields: [
      { key: "companySize", label: "Company Size", type: "text", description: "Estimated employee count range" },
      { key: "industry", label: "Industry", type: "text", description: "Primary industry classification" },
      { key: "techStack", label: "Tech Stack", type: "text", description: "Detected technologies in use" },
      { key: "fundingStage", label: "Funding Stage", type: "text", description: "Latest funding round info" },
      { key: "linkedinUrl", label: "LinkedIn URL", type: "url", description: "Company LinkedIn profile" },
    ],
  },
  {
    id: "fc",
    name: "Follow-up Coach",
    avatar: "📅",
    color: "#7C3AED",
    description: "Drafts timely follow-up emails and schedules reminders.",
    responseFields: [
      { key: "followUpDate", label: "Follow-up Date", type: "date", description: "Recommended date for next follow-up" },
      { key: "emailDraft", label: "Email Draft", type: "text", description: "AI-generated follow-up email body" },
      { key: "urgencyLevel", label: "Urgency Level", type: "text", description: "High / Medium / Low priority" },
    ],
  },
  {
    id: "sc",
    name: "Sales Coach",
    avatar: "🧠",
    color: "#059669",
    description: "Gives deal-level coaching and next-best-action tips.",
    responseFields: [
      { key: "dealHealth", label: "Deal Health", type: "text", description: "Overall health assessment of the deal" },
      { key: "riskFactors", label: "Risk Factors", type: "text", description: "Identified risks that could stall the deal" },
      { key: "coachingTip", label: "Coaching Tip", type: "text", description: "Actionable advice for the sales rep" },
      { key: "winProbability", label: "Win Probability", type: "number", description: "Estimated win percentage" },
    ],
  },
];

/* ── CRM modules and their existing fields ── */
const CRM_MODULES = {
  Leads: ["Status", "Lead Score", "Company", "Website", "Industry", "Email", "Phone", "Lead Source", "Lead Owner", "Annual Revenue", "Last Activity Time", "Created Time", "Modified Time"],
  Contacts: ["First Name", "Last Name", "Email", "Phone", "Mailing City", "Account Name", "Department", "Title", "Created Time"],
  Accounts: ["Account Name", "Website", "Industry", "Annual Revenue", "Phone", "Billing City", "Employees", "Account Owner"],
  Deals: ["Deal Name", "Stage", "Amount", "Closing Date", "Probability", "Deal Owner", "Account Name", "Contact Name", "Created Time"],
  Campaigns: ["Campaign Name", "Type", "Status", "Start Date", "End Date", "Expected Revenue", "Budgeted Cost"],
  Products: ["Product Name", "Product Code", "Unit Price", "Qty In Stock", "Description", "Manufacturer"],
};

const MODULE_NAMES = Object.keys(CRM_MODULES);

/* ── Colors ── */
const C = {
  blue: "#1B74E4",
  border: "#DDE6ED",
  lightBg: "#F7F9FC",
  text: "#333",
  secondary: "#888",
  white: "#fff",
  danger: "#EF4444",
  green: "#059669",
  orange: "#E05D2E",
};

const S = {
  font: { fontFamily: "'Geist', sans-serif" },
  label: { fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9CA3AF" },
};

/* ─────────────────────────────────────────────
   UPDATE STRATEGY PANEL
───────────────────────────────────────────── */
function UpdateStrategyPanel({ strategy, onChange }) {
  const strategies = [
    { id: "realtime", label: "Real-time", icon: "⚡", desc: "Agent updates fields immediately when new data is available" },
    { id: "schedule", label: "Scheduled", icon: "🕐", desc: "Agent runs on a fixed schedule and updates fields periodically" },
    { id: "condition", label: "Condition-based", icon: "🔀", desc: "Agent updates fields only when specific conditions are met" },
  ];

  const scheduleOptions = ["Every 15 minutes", "Every 30 minutes", "Hourly", "Every 6 hours", "Daily", "Weekly"];

  const conditionFields = ["Lead Score", "Stage", "Status", "Last Activity Time", "Amount"];
  const conditionOps = ["changes", "is greater than", "is less than", "equals", "is not empty"];

  return (
    <div style={{
      background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: 8,
      padding: "20px 24px", marginTop: 20,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 1v6l4 2" stroke={C.blue} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="8" cy="8" r="6.5" stroke={C.blue} strokeWidth="1.4"/>
        </svg>
        <span style={{ fontWeight: 600, fontSize: 13.5, color: C.text }}>Update Strategy</span>
      </div>
      <div style={{ fontSize: 11.5, color: C.secondary, marginBottom: 16, lineHeight: 1.5 }}>
        Define how and when the agent should update the mapped CRM fields.
      </div>

      {/* Strategy selector */}
      <div style={{ display: "flex", gap: 10, marginBottom: 18 }}>
        {strategies.map(s => (
          <button key={s.id} onClick={() => onChange({ ...strategy, type: s.id })} style={{
            flex: 1, padding: "12px 14px", border: `1.5px solid ${strategy.type === s.id ? C.blue : C.border}`,
            borderRadius: 8, background: strategy.type === s.id ? `${C.blue}08` : C.white,
            cursor: "pointer", textAlign: "left", transition: "all 0.15s",
            ...S.font,
          }}>
            <div style={{ fontSize: 18, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontWeight: 600, fontSize: 12.5, color: strategy.type === s.id ? C.blue : C.text, marginBottom: 3 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 11, color: C.secondary, lineHeight: 1.4 }}>{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Schedule config */}
      {strategy.type === "schedule" && (
        <div style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 6,
          padding: "14px 18px",
        }}>
          <div style={{ ...S.label, marginBottom: 8 }}>Run Frequency</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {scheduleOptions.map(opt => (
              <button key={opt} onClick={() => onChange({ ...strategy, schedule: opt })} style={{
                padding: "6px 14px", borderRadius: 20,
                border: `1px solid ${strategy.schedule === opt ? C.blue : C.border}`,
                background: strategy.schedule === opt ? `${C.blue}12` : C.white,
                color: strategy.schedule === opt ? C.blue : C.text,
                fontSize: 12, fontWeight: 500, cursor: "pointer",
                ...S.font, transition: "all 0.12s",
              }}>{opt}</button>
            ))}
          </div>
        </div>
      )}

      {/* Condition config */}
      {strategy.type === "condition" && (
        <div style={{
          background: C.white, border: `1px solid ${C.border}`, borderRadius: 6,
          padding: "14px 18px",
        }}>
          <div style={{ ...S.label, marginBottom: 10 }}>Trigger Condition</div>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <span style={{ fontSize: 12, color: C.secondary, fontWeight: 500 }}>When</span>
            <select
              value={strategy.conditionField || ""}
              onChange={e => onChange({ ...strategy, conditionField: e.target.value })}
              style={{
                padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: 5,
                fontSize: 12.5, color: C.text, background: C.white, outline: "none",
                cursor: "pointer", ...S.font,
              }}
            >
              <option value="" disabled>Select field</option>
              {conditionFields.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
            <select
              value={strategy.conditionOp || ""}
              onChange={e => onChange({ ...strategy, conditionOp: e.target.value })}
              style={{
                padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: 5,
                fontSize: 12.5, color: C.text, background: C.white, outline: "none",
                cursor: "pointer", ...S.font,
              }}
            >
              <option value="" disabled>Condition</option>
              {conditionOps.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            {strategy.conditionOp && strategy.conditionOp !== "changes" && strategy.conditionOp !== "is not empty" && (
              <input
                value={strategy.conditionValue || ""}
                onChange={e => onChange({ ...strategy, conditionValue: e.target.value })}
                placeholder="Value"
                style={{
                  padding: "7px 10px", border: `1px solid ${C.border}`, borderRadius: 5,
                  fontSize: 12.5, color: C.text, outline: "none", width: 100,
                  ...S.font,
                }}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   FIELD MAPPING ROW
───────────────────────────────────────────── */
function FieldMappingRow({ responseField, mapping, module, agentColor, onUpdate }) {
  const existingFields = module ? (CRM_MODULES[module] || []) : [];
  const isNew = mapping.target === "new";
  const isExisting = mapping.target === "existing";

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1.2fr 100px 1.4fr",
      alignItems: "start", gap: 14, padding: "14px 0",
      borderBottom: `1px solid #EDF0F5`,
    }}>
      {/* Agent response field (read-only) */}
      <div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 7,
          background: C.white, border: `1px solid ${C.border}`,
          borderRadius: 5, padding: "8px 12px",
        }}>
          <span style={{
            width: 7, height: 7, borderRadius: "50%",
            background: agentColor, flexShrink: 0,
          }} />
          <div>
            <div style={{
              fontSize: 12.5, color: C.text, fontFamily: "'Geist Mono', monospace",
              fontWeight: 500,
            }}>{responseField.label}</div>
            <div style={{ fontSize: 10.5, color: C.secondary, marginTop: 2 }}>
              {responseField.description}
            </div>
          </div>
        </div>
      </div>

      {/* New / Existing toggle */}
      <div style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 4 }}>
        {["existing", "new"].map(opt => (
          <label key={opt} style={{
            display: "flex", alignItems: "center", gap: 6, cursor: "pointer",
            fontSize: 12, color: mapping.target === opt ? C.blue : C.text,
            fontWeight: mapping.target === opt ? 600 : 400,
          }}>
            <input
              type="radio"
              name={`target-${responseField.key}`}
              checked={mapping.target === opt}
              onChange={() => onUpdate({ ...mapping, target: opt, fieldName: "", customPrompt: mapping.customPrompt || "" })}
              style={{ accentColor: C.blue }}
            />
            {opt === "existing" ? "Existing Field" : "New Field"}
          </label>
        ))}
      </div>

      {/* Field config */}
      <div>
        {isExisting && (
          <select
            value={mapping.fieldName}
            onChange={e => onUpdate({ ...mapping, fieldName: e.target.value })}
            style={{
              width: "100%", padding: "8px 10px",
              border: `1px solid ${C.border}`, borderRadius: 5,
              fontSize: 12.5, color: mapping.fieldName ? C.text : "#AAA",
              background: C.white, outline: "none", cursor: "pointer",
              fontFamily: "'Geist', sans-serif",
            }}
          >
            <option value="" disabled>Select existing field</option>
            {existingFields.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        )}
        {isNew && (
          <input
            value={mapping.fieldName}
            onChange={e => onUpdate({ ...mapping, fieldName: e.target.value })}
            placeholder={`e.g. ${responseField.label}`}
            style={{
              width: "100%", padding: "8px 10px",
              border: `1px solid ${C.border}`, borderRadius: 5,
              fontSize: 12.5, color: C.text, outline: "none",
              fontFamily: "'Geist', sans-serif", boxSizing: "border-box",
            }}
          />
        )}

        {/* Custom prompt override */}
        {(isNew || isExisting) && mapping.fieldName && (
          <div style={{ marginTop: 8 }}>
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              marginBottom: 4,
            }}>
              <span style={{ fontSize: 10.5, color: C.secondary, fontWeight: 500 }}>
                Agent default: <em>auto-mapped from {responseField.label}</em>
              </span>
              <button
                onClick={() => onUpdate({ ...mapping, showCustom: !mapping.showCustom })}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 10.5, color: C.blue, fontWeight: 600,
                  fontFamily: "'Geist', sans-serif", padding: 0,
                }}
              >
                {mapping.showCustom ? "Use default" : "Customize"}
              </button>
            </div>
            {mapping.showCustom && (
              <textarea
                value={mapping.customPrompt}
                onChange={e => onUpdate({ ...mapping, customPrompt: e.target.value })}
                placeholder={`Describe how the agent should populate this field...\ne.g. "Summarize the qualification reason in under 50 words"`}
                rows={2}
                style={{
                  width: "100%", padding: "8px 10px",
                  border: `1px solid ${C.border}`, borderRadius: 5,
                  fontSize: 12, color: C.text, outline: "none", resize: "vertical",
                  fontFamily: "'Geist', sans-serif", lineHeight: 1.5,
                  boxSizing: "border-box",
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   SAVED CONFIG CARD
───────────────────────────────────────────── */
function SavedConfigCard({ config, onEdit, onDelete }) {
  const agent = AGENTS.find(a => a.id === config.agentId);
  if (!agent) return null;

  const strategyLabels = { realtime: "⚡ Real-time", schedule: "🕐 Scheduled", condition: "🔀 Condition-based" };
  const mappedCount = config.mappings.filter(m => m.fieldName).length;

  return (
    <div style={{
      background: C.white, border: `1px solid ${C.border}`, borderRadius: 10,
      padding: "18px 22px", display: "flex", alignItems: "flex-start", gap: 14,
      transition: "box-shadow 0.15s",
    }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)"}
      onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={{
        width: 42, height: 42, borderRadius: 10,
        background: `${agent.color}12`, display: "flex",
        alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0,
      }}>{agent.avatar}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, fontSize: 14, color: C.text, marginBottom: 3 }}>{agent.name}</div>
        <div style={{ fontSize: 12, color: C.secondary, marginBottom: 8, lineHeight: 1.45 }}>
          Module: <strong style={{ color: C.text }}>{config.module}</strong> · {mappedCount} field{mappedCount !== 1 ? "s" : ""} mapped
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span style={{
            fontSize: 11, padding: "3px 10px", borderRadius: 12,
            background: `${agent.color}12`, color: agent.color, fontWeight: 600,
          }}>{strategyLabels[config.strategy.type] || config.strategy.type}</span>
          {config.strategy.type === "schedule" && config.strategy.schedule && (
            <span style={{
              fontSize: 11, padding: "3px 10px", borderRadius: 12,
              background: "#F3F4F6", color: C.secondary, fontWeight: 500,
            }}>{config.strategy.schedule}</span>
          )}
        </div>
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onEdit} style={{
          padding: "6px 14px", border: `1px solid ${C.border}`, borderRadius: 6,
          background: C.white, fontSize: 12, fontWeight: 500, cursor: "pointer",
          color: C.text, fontFamily: "'Geist', sans-serif",
        }}>Edit</button>
        <button onClick={onDelete} style={{
          padding: "6px 14px", border: `1px solid #FECACA`, borderRadius: 6,
          background: "#FEF2F2", fontSize: 12, fontWeight: 500, cursor: "pointer",
          color: C.danger, fontFamily: "'Geist', sans-serif",
        }}>Delete</button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN CONFIG PAGE
───────────────────────────────────────────── */
export default function AgentConfig({ agentId }) {
  const agent = AGENTS.find(a => a.id === agentId);

  const [savedConfigs, setSavedConfigs] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // Config form state
  const [selectedModule, setSelectedModule] = useState("");
  const [mappings, setMappings] = useState([]);
  const [strategy, setStrategy] = useState({ type: "realtime" });

  const initMappings = (ag) => ag.responseFields.map(rf => ({
    key: rf.key,
    target: "existing",
    fieldName: "",
    customPrompt: "",
    showCustom: false,
  }));

  const resetForm = () => {
    setSelectedModule("");
    setMappings(agent ? initMappings(agent) : []);
    setStrategy({ type: "realtime" });
    setEditing(false);
    setEditIndex(null);
  };

  const startNew = () => {
    resetForm();
    setMappings(agent ? initMappings(agent) : []);
    setEditing(true);
  };

  const startEdit = (index) => {
    const cfg = savedConfigs[index];
    setSelectedModule(cfg.module);
    setMappings(cfg.mappings);
    setStrategy(cfg.strategy);
    setEditIndex(index);
    setEditing(true);
  };

  const handleSelectModule = (mod) => {
    setSelectedModule(mod);
    // Reset field selections when module changes
    setMappings(m => m.map(row => ({ ...row, fieldName: row.target === "new" ? row.fieldName : "" })));
  };

  const updateMapping = (idx, newMapping) => {
    setMappings(m => m.map((row, i) => i === idx ? newMapping : row));
  };

  const handleSave = () => {
    const config = {
      agentId: agent.id,
      module: selectedModule,
      mappings: [...mappings],
      strategy: { ...strategy },
    };
    if (editIndex !== null) {
      setSavedConfigs(c => c.map((item, i) => i === editIndex ? config : item));
    } else {
      setSavedConfigs(c => [...c, config]);
    }
    resetForm();
  };

  const handleDelete = (index) => {
    setSavedConfigs(c => c.filter((_, i) => i !== index));
  };

  const canSave = selectedModule && mappings.some(m => m.fieldName);

  if (!agent) {
    return (
      <div style={{ fontFamily: "'Geist', sans-serif", minHeight: "100vh", background: "#F4F6FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <link href={FONT_LINK} rel="stylesheet" />
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 42, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 8 }}>Agent not found</div>
          <a href="#/" style={{ fontSize: 13, color: C.blue }}>← Back to CRM</a>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'Geist', sans-serif", minHeight: "100vh", background: "#F4F6FA" }}>
      <link href={FONT_LINK} rel="stylesheet" />
      <style>{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #D1D5DB; border-radius: 4px; }
      `}</style>

      {/* Top bar */}
      <div style={{
        background: "#1A2540", padding: "0 28px", height: 50, display: "flex",
        alignItems: "center", gap: 14, position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{
          width: 30, height: 30, borderRadius: 7,
          background: "linear-gradient(135deg,#E05D2E,#f5813b)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, fontWeight: 800, color: "#fff",
        }}>Z</div>
        <span style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>Zoho CRM</span>
        <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 4px" }}>/</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>Settings</span>
        <span style={{ color: "rgba(255,255,255,0.3)", margin: "0 4px" }}>/</span>
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", fontWeight: 600 }}>{agent.name} — Response Mapping</span>
        <div style={{ flex: 1 }} />
        <a href="#/" style={{
          fontSize: 12, color: "rgba(255,255,255,0.6)", textDecoration: "none",
          padding: "5px 12px", border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 6, transition: "all 0.15s",
        }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
        >← Back to CRM</a>
      </div>

      {/* Main content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 20px 60px" }}>

        {/* Page header */}
        <div style={{
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          marginBottom: 28,
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10,
                background: `${agent.color}12`, display: "flex",
                alignItems: "center", justifyContent: "center", fontSize: 22,
              }}>{agent.avatar}</div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
                  {agent.name}
                </h1>
                <p style={{ fontSize: 13, color: C.secondary, marginTop: 2, margin: 0 }}>
                  {agent.description}
                </p>
              </div>
            </div>
            <p style={{ fontSize: 13.5, color: C.secondary, marginTop: 10, lineHeight: 1.5 }}>
              Configure how this agent's responses are stored in your CRM fields. Choose the module,
              map response fields, and set the update strategy.
            </p>
          </div>
          {!editing && (
            <button onClick={startNew} style={{
              padding: "9px 20px", border: "none", borderRadius: 7,
              background: C.blue, color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Geist', sans-serif",
              display: "flex", alignItems: "center", gap: 6,
              transition: "background 0.15s",
            }}
              onMouseEnter={e => e.currentTarget.style.background = "#1565C0"}
              onMouseLeave={e => e.currentTarget.style.background = C.blue}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>+</span> New Configuration
            </button>
          )}
        </div>

        {/* ── Saved configs list ── */}
        {!editing && savedConfigs.length === 0 && (
          <div style={{
            background: C.white, border: `2px dashed ${C.border}`, borderRadius: 12,
            padding: "60px 20px", textAlign: "center",
          }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>{agent.avatar}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>
              No configurations for {agent.name} yet
            </div>
            <div style={{ fontSize: 13, color: C.secondary, marginBottom: 20, lineHeight: 1.5 }}>
              Set up how this agent's responses flow into your CRM fields.<br />
              Pick a module, map the fields, and choose an update strategy.
            </div>
            <button onClick={startNew} style={{
              padding: "10px 24px", border: "none", borderRadius: 7,
              background: C.blue, color: "#fff", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "'Geist', sans-serif",
            }}>+ Create First Configuration</button>
          </div>
        )}

        {!editing && savedConfigs.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {savedConfigs.map((cfg, i) => (
              <SavedConfigCard
                key={i}
                config={cfg}
                onEdit={() => startEdit(i)}
                onDelete={() => handleDelete(i)}
              />
            ))}
          </div>
        )}

        {/* ── Config form ── */}
        {editing && (
          <div style={{
            background: C.white, border: `1px solid ${C.border}`, borderRadius: 12,
            overflow: "hidden",
          }}>
            {/* Form header */}
            <div style={{
              padding: "18px 24px", borderBottom: `1px solid ${C.border}`,
              background: C.lightBg, display: "flex", alignItems: "center", justifyContent: "space-between",
            }}>
              <span style={{ fontWeight: 600, fontSize: 15, color: C.text }}>
                {editIndex !== null ? "Edit Configuration" : "New Configuration"}
              </span>
              <button onClick={resetForm} style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#999", fontSize: 20, lineHeight: 1,
              }}>×</button>
            </div>

            <div style={{ padding: "24px" }}>

              {/* ── Step 1: Choose Module ── */}
              <div style={{ marginBottom: 28 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%", background: selectedModule ? C.green : C.blue,
                      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                  }}>{selectedModule ? "✓" : "1"}</div>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: C.text }}>Choose Module</span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {MODULE_NAMES.map(mod => (
                      <button key={mod} onClick={() => handleSelectModule(mod)} style={{
                        padding: "8px 18px", borderRadius: 20,
                        border: `1.5px solid ${selectedModule === mod ? C.blue : C.border}`,
                        background: selectedModule === mod ? `${C.blue}10` : C.white,
                        color: selectedModule === mod ? C.blue : C.text,
                        fontSize: 12.5, fontWeight: selectedModule === mod ? 600 : 400,
                        cursor: "pointer", ...S.font, transition: "all 0.12s",
                      }}>{mod}</button>
                    ))}
                  </div>
                </div>

              {/* ── Step 2: Map Response Fields ── */}
              {selectedModule && (
                <div style={{ marginBottom: 4 }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8, marginBottom: 14,
                  }}>
                    <div style={{
                      width: 22, height: 22, borderRadius: "50%",
                      background: mappings.some(m => m.fieldName) ? C.green : C.blue,
                      color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: 700,
                    }}>{mappings.some(m => m.fieldName) ? "✓" : "2"}</div>
                    <span style={{ fontWeight: 600, fontSize: 13.5, color: C.text }}>Map Response Fields</span>
                    <span style={{ fontSize: 11.5, color: C.secondary }}>
                      — Map agent outputs to <strong>{selectedModule}</strong> fields
                    </span>
                  </div>

                  <div style={{
                    background: C.lightBg, border: `1px solid ${C.border}`, borderRadius: 8,
                    padding: "16px 20px",
                  }}>
                    {/* Column header */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "1.2fr 100px 1.4fr",
                      gap: 14, padding: "0 0 10px",
                      borderBottom: `2px solid ${C.border}`,
                    }}>
                      <span style={{ ...S.label, color: C.blue }}>Agent Response</span>
                      <span style={{ ...S.label, color: C.blue }}>Target</span>
                      <span style={{ ...S.label, color: C.blue }}>CRM Field</span>
                    </div>

                    {agent.responseFields.map((rf, i) => (
                      <FieldMappingRow
                        key={rf.key}
                        responseField={rf}
                        mapping={mappings[i]}
                        module={selectedModule}
                        agentColor={agent.color}
                        onUpdate={(m) => updateMapping(i, m)}
                      />
                    ))}
                  </div>

                  {/* ── Step 3: Update Strategy ── */}
                  <div style={{ marginTop: 24 }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 8, marginBottom: 2,
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: C.blue,
                        color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 700,
                      }}>3</div>
                      <span style={{ fontWeight: 600, fontSize: 13.5, color: C.text }}>Update Strategy</span>
                    </div>
                  </div>
                  <UpdateStrategyPanel strategy={strategy} onChange={setStrategy} />
                </div>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: "16px 24px", borderTop: `1px solid ${C.border}`,
              background: C.lightBg, display: "flex", justifyContent: "flex-end", gap: 10,
            }}>
              <button onClick={resetForm} style={{
                padding: "9px 22px", border: `1px solid ${C.border}`, borderRadius: 6,
                background: C.white, fontSize: 13, fontWeight: 500, cursor: "pointer",
                color: "#555", fontFamily: "'Geist', sans-serif",
              }}>Cancel</button>
              <button onClick={handleSave} disabled={!canSave} style={{
                padding: "9px 22px", border: "none", borderRadius: 6,
                background: canSave ? C.blue : "#CCC",
                color: "#fff", fontSize: 13, fontWeight: 600,
                cursor: canSave ? "pointer" : "default",
                fontFamily: "'Geist', sans-serif",
              }}>
                {editIndex !== null ? "Update Configuration" : "Save Configuration"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
