import { useState, useRef } from "react";

const NAVY = "#1A3A7A";
const BLUE = "#1A52C2";

function today() {
  return new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}
function refCode(name) {
  const d = new Date();
  const initials = (name || "XX").split(" ").map(w => w[0]).join("").slice(0, 3).toUpperCase();
  return `CAM-${initials}-${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

async function extractCV(base64, mediaType) {
  const res = await fetch("/api/extract-cv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: [
          { type: "document", source: { type: "base64", media_type: mediaType, data: base64 } },
          {
            type: "text",
            text: `Extract this CV into structured JSON. CRITICAL: strip ALL contact details — no email, phone, address, LinkedIn URL, WhatsApp. Return ONLY valid JSON with no markdown fences.

{
  "fullName": "FULL NAME IN CAPS",
  "currentTitle": "current job title",
  "currentEmployer": "current employer",
  "location": "City, Country only",
  "nationality": "nationality if stated",
  "yearsExperience": "number only",
  "summary": "professional summary verbatim but with all contact info removed",
  "coreCompetencies": ["competency 1", "competency 2"],
  "experience": [
    {
      "employer": "Company Name",
      "title": "Job Title",
      "period": "Mon YYYY – Mon YYYY",
      "bullets": ["achievement 1", "achievement 2"]
    }
  ],
  "projectExperience": ["vessel or project name 1"],
  "education": [
    { "degree": "Degree title", "institution": "School name", "year": "YYYY" }
  ],
  "certifications": ["Cert 1"],
  "technicalSkills": ["Skill 1"],
  "languages": [{ "language": "English", "level": "Fluent" }],
  "highlights": [
    { "label": "Current Role", "value": "one sentence" },
    { "label": "Key Experience", "value": "one sentence" },
    { "label": "Industry Background", "value": "one sentence" },
    { "label": "Qualifications", "value": "key quals concisely" }
  ],
  "suggestedIntro": "2 professional sentences for a candidate submission cover letter"
}`
          }
        ]
      }]
    })
  });
  const data = await res.json();
  const text = data.content?.find(b => b.type === "text")?.text || "{}";
  try { return JSON.parse(text.replace(/```json|```/g, "").trim()); }
  catch { return {}; }
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2.5, color: BLUE, textTransform: "uppercase", borderBottom: `1.5px solid ${NAVY}`, paddingBottom: 3, marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function CoverPage({ fields, cv }) {
  const name = cv?.fullName || fields.candidateName || "—";
  return (
    <div className="page" style={{ fontFamily: "Arial, sans-serif", background: "#fff", padding: "28px 40px 36px", color: "#1a1a1a", fontSize: 13 }}>
      {/* Header */}
      <div style={{ borderBottom: `2px solid ${NAVY}`, paddingBottom: 10, marginBottom: 10 }}>
        <div style={{ fontSize: 23, fontWeight: 700, lineHeight: 1.1, marginBottom: 6 }}>
          <span style={{ color: BLUE }}>CAMARINE</span>
          <span style={{ fontWeight: 400, fontSize: 19 }}> Supervision Far East Co., Ltd.</span>
        </div>
        <div style={{ fontSize: 11, color: "#333", marginBottom: 5, display: "flex", gap: 14, flexWrap: "wrap" }}>
          {["Newbuilding Supervision","Project Management","Repairing Supervision","Marine Surveyor"].map(s => (
            <span key={s}><span style={{ color: BLUE }}>★</span> {s}</span>
          ))}
        </div>
        <div style={{ fontSize: 10, color: "#666", display: "flex", gap: 16, flexWrap: "wrap" }}>
          <span>Phone: +86-21-3363 2519</span><span>Fax: +86-21-3363 2523</span>
          <span style={{ color: BLUE }}>info@camarine.cn</span><span>www.camarine.cn</span>
        </div>
      </div>

      {/* Attn bar */}
      <div style={{ background: "#f5f5f5", padding: "7px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22, borderTop: "0.5px solid #ccc", borderBottom: "0.5px solid #ccc", fontSize: 11 }}>
        <span>Attn: <strong>Benedict</strong> &nbsp;|&nbsp; <span style={{ color: "#666" }}>Camarine Supervision Far East Co., Ltd.</span></span>
        <span style={{ color: "#999" }}>{today()} · Ref: {refCode(name)}</span>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: BLUE, marginBottom: 4 }}>CANDIDATE SUBMISSION</div>
        <div style={{ fontSize: 27, fontFamily: "Georgia, serif", fontWeight: 400, marginBottom: 8 }}>{fields.position || "Position"}</div>
        <div style={{ display: "inline-block", background: NAVY, color: "#fff", fontSize: 9, fontWeight: 700, letterSpacing: 1.5, padding: "3px 10px" }}>{fields.location || "LOCATION"}</div>
      </div>

      <p style={{ fontSize: 12.5, lineHeight: 1.75, color: "#333", marginBottom: 18 }}>
        {fields.intro || cv?.suggestedIntro || "Please find below our candidate submission for your consideration."}
      </p>

      {/* Candidate block */}
      <div style={{ border: "0.5px solid #d0d8e8", borderLeft: `3px solid ${BLUE}`, background: "#f0f4fa", padding: "14px 18px", marginBottom: 18 }}>
        <div style={{ fontSize: 20, fontFamily: "Georgia, serif", marginBottom: 2 }}>{name}</div>
        <div style={{ fontSize: 10, color: "#666", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>{cv?.currentTitle || "—"}</div>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11, color: "#444" }}>
          {[cv?.location, cv?.nationality ? `${cv.nationality} National` : null, "Visa Sponsorship Required"].filter(Boolean).map((m, i) => (
            <span key={i}><span style={{ color: BLUE, marginRight: 4 }}>●</span>{m}</span>
          ))}
        </div>
      </div>

      {/* Details table */}
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: BLUE, marginBottom: 8 }}>CANDIDATE DETAILS</div>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 18, fontSize: 12 }}>
        {[["Candidate Name", name],["Position Applied For", fields.position],["Available to Start", fields.availability],["Salary Expectations", fields.salary]].map(([l, v]) => (
          <tr key={l}>
            <td style={{ background: "#eef3fb", border: "0.5px solid #d0d8e8", padding: "7px 12px", fontWeight: 700, color: NAVY, width: "38%" }}>{l}</td>
            <td style={{ background: "#fff", border: "0.5px solid #d0d8e8", padding: "7px 12px", color: "#333" }}>{v || "—"}</td>
          </tr>
        ))}
      </table>

      {/* Highlights */}
      {cv?.highlights?.length > 0 && (
        <>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 2, color: BLUE, marginBottom: 8 }}>KEY HIGHLIGHTS</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, marginBottom: 20 }}>
            <tbody>
              {[0,1].map(row => (
                <tr key={row}>
                  {[0,1].map(col => {
                    const h = cv.highlights[row*2+col];
                    if (!h) return <td key={col} style={{ border: "0.5px solid #dde4f0" }} />;
                    return (
                      <td key={col} style={{ border: "0.5px solid #dde4f0", padding: "10px 14px", verticalAlign: "top", width: "50%" }}>
                        <div style={{ fontSize: 9, fontWeight: 700, color: BLUE, letterSpacing: 1, textTransform: "uppercase", marginBottom: 3 }}>{h.label}</div>
                        <div style={{ color: "#333", lineHeight: 1.5 }}>{h.value}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      <div style={{ borderTop: "0.5px solid #e0e0e0", paddingTop: 10, display: "flex", justifyContent: "flex-end" }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 2, color: "#aaa", border: "0.5px solid #ccc", padding: "3px 8px" }}>CONFIDENTIAL</span>
      </div>
    </div>
  );
}

function CVPage({ cv, fields }) {
  if (!cv) return null;
  const name = cv.fullName || fields.candidateName || "—";
  return (
    <div className="page" style={{ fontFamily: "Arial, sans-serif", background: "#fff", padding: "32px 40px 40px", color: "#1a1a1a", fontSize: 12 }}>
      <div style={{ borderBottom: `2px solid ${NAVY}`, paddingBottom: 14, marginBottom: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ fontSize: 26, fontFamily: "Georgia, serif", fontWeight: 400, marginBottom: 3 }}>{name}</div>
            <div style={{ fontSize: 11, color: "#555", letterSpacing: 0.5, textTransform: "uppercase" }}>{cv.currentTitle}</div>
          </div>
          <div style={{ textAlign: "right", fontSize: 11, color: "#777", lineHeight: 1.8 }}>
            {cv.location && <div>{cv.location}</div>}
            {cv.nationality && <div>{cv.nationality} National</div>}
            {cv.yearsExperience && <div>{cv.yearsExperience}+ Years Experience</div>}
          </div>
        </div>
      </div>

      {cv.summary && <Section title="Professional Summary"><p style={{ lineHeight: 1.75, color: "#333", margin: 0 }}>{cv.summary}</p></Section>}

      {cv.coreCompetencies?.length > 0 && (
        <Section title="Core Competencies">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "5px 8px" }}>
            {cv.coreCompetencies.map((c, i) => (
              <span key={i} style={{ background: "#eef3fb", border: "0.5px solid #d0d8e8", color: NAVY, padding: "3px 9px", fontSize: 11, borderRadius: 2 }}>{c}</span>
            ))}
          </div>
        </Section>
      )}

      {cv.experience?.length > 0 && (
        <Section title="Professional Experience">
          {cv.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: i < cv.experience.length - 1 ? "0.5px solid #eee" : "none" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13 }}>{exp.employer}</div>
                <div style={{ fontSize: 11, color: "#888", whiteSpace: "nowrap", marginLeft: 12 }}>{exp.period}</div>
              </div>
              <div style={{ fontSize: 11, color: BLUE, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: 0.5 }}>{exp.title}</div>
              {exp.bullets?.length > 0 && (
                <ul style={{ margin: 0, paddingLeft: 16, color: "#444", lineHeight: 1.7 }}>
                  {exp.bullets.map((b, j) => <li key={j} style={{ marginBottom: 2 }}>{b}</li>)}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {cv.projectExperience?.length > 0 && (
        <Section title="Project Experience">
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
            {cv.projectExperience.map((p, i) => (
              <span key={i} style={{ fontSize: 12, color: "#333", paddingLeft: 10, position: "relative" }}>
                <span style={{ position: "absolute", left: 0, color: BLUE }}>·</span>{p}
              </span>
            ))}
          </div>
        </Section>
      )}

      {cv.education?.length > 0 && (
        <Section title="Education">
          {cv.education.map((e, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{e.degree}</div>
                <div style={{ fontSize: 11, color: "#666" }}>{e.institution}</div>
              </div>
              {e.year && <div style={{ fontSize: 11, color: "#999", whiteSpace: "nowrap", marginLeft: 12 }}>{e.year}</div>}
            </div>
          ))}
        </Section>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {cv.certifications?.length > 0 && (
          <Section title="Certifications">
            {cv.certifications.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4, color: "#333" }}>
                <span style={{ color: BLUE, fontSize: 10, flexShrink: 0 }}>✓</span>{c}
              </div>
            ))}
          </Section>
        )}
        <div>
          {cv.technicalSkills?.length > 0 && (
            <Section title="Technical Skills">
              <div style={{ lineHeight: 1.9, color: "#444" }}>{cv.technicalSkills.join(" · ")}</div>
            </Section>
          )}
          {cv.languages?.length > 0 && (
            <Section title="Languages">
              {cv.languages.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, color: "#333" }}>
                  <span>{l.language}</span><span style={{ color: "#888" }}>{l.level}</span>
                </div>
              ))}
            </Section>
          )}
        </div>
      </div>

      <div style={{ borderTop: "0.5px solid #e0e0e0", marginTop: 16, paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#aaa" }}>
        <span>Prepared by Camarine Supervision Far East Co., Ltd.</span>
        <span style={{ fontWeight: 700, letterSpacing: 1 }}>CONFIDENTIAL</span>
      </div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("upload");
  const [loading, setLoading] = useState(false);
  const [loadMsg, setLoadMsg] = useState("");
  const [cv, setCV] = useState(null);
  const [fileName, setFileName] = useState("");
  const [fields, setFields] = useState({
    candidateName: "", position: "Mechanical Supervisor",
    location: "Dalian, China  →  Brazil Offshore",
    availability: "1 month notice (possibly sooner)",
    salary: "Inline with approved rates", intro: "",
  });
  const fileRef = useRef();
  const set = (k, v) => setFields(f => ({ ...f, [k]: v }));

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);
    setLoading(true);
    setLoadMsg("Reading CV...");
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });
      setLoadMsg("Extracting candidate profile with AI...");
      const data = await extractCV(base64, file.type || "application/pdf");
      setCV(data);
      setFields(f => ({ ...f, candidateName: data.fullName || f.candidateName, intro: data.suggestedIntro || "" }));
      setStep("details");
    } catch (err) {
      alert("Could not process CV. Check that ANTHROPIC_API_KEY is set in Netlify environment variables.");
    } finally { setLoading(false); }
  }

  function resetAll() {
    setStep("upload"); setCV(null); setFileName("");
    setFields({ candidateName: "", position: "Mechanical Supervisor", location: "Dalian, China  →  Brazil Offshore", availability: "1 month notice (possibly sooner)", salary: "Inline with approved rates", intro: "" });
    if (fileRef.current) fileRef.current.value = "";
  }

  // ── Upload ──
  if (step === "upload") return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem 1rem", background: "#f0f2f5" }}>
      <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: BLUE, marginBottom: 6, textTransform: "uppercase" }}>Camarine Supervision</div>
      <div style={{ fontSize: 26, fontFamily: "Georgia, serif", color: "#1a1a1a", marginBottom: 8 }}>CV Submission Generator</div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 36, textAlign: "center" }}>Upload a candidate CV · Auto-generates cover page + formatted CV · Contact details removed</div>

      <div
        onClick={() => !loading && fileRef.current.click()}
        onDragOver={e => e.preventDefault()}
        onDrop={e => { e.preventDefault(); if (!loading) { const dt = e.dataTransfer; if (dt.files[0]) { fileRef.current.files = dt.files; handleFile({ target: { files: dt.files } }); } } }}
        style={{ border: `1.5px dashed ${BLUE}`, borderRadius: 10, padding: "44px 64px", textAlign: "center", cursor: loading ? "default" : "pointer", background: "#fff", transition: "all 0.15s", opacity: loading ? 0.7 : 1, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
        onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#eef3fb"; e.currentTarget.style.borderColor = NAVY; } }}
        onMouseLeave={e => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.borderColor = BLUE; }}
      >
        <div style={{ fontSize: 40, marginBottom: 10 }}>📄</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: NAVY, marginBottom: 4 }}>Drop CV here or click to browse</div>
        <div style={{ fontSize: 12, color: "#999" }}>PDF or Word (.docx)</div>
        <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{ display: "none" }} onChange={handleFile} />
      </div>

      {loading && (
        <div style={{ marginTop: 32, textAlign: "center" }}>
          <div style={{ width: 34, height: 34, border: "3px solid #dde4f0", borderTop: `3px solid ${BLUE}`, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <div style={{ fontSize: 13, color: "#666" }}>{loadMsg}</div>
        </div>
      )}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Details ──
  const lbl = { fontSize: 11, fontWeight: 700, color: NAVY, letterSpacing: 0.5, marginBottom: 5, display: "block" };
  const inp = { width: "100%", padding: "9px 11px", border: "0.5px solid #c8d4e8", borderRadius: 4, fontSize: 13, fontFamily: "Arial, sans-serif", color: "#1a1a1a", outline: "none" };

  if (step === "details") return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: "2rem 1rem" }}>
      <div style={{ maxWidth: 680, margin: "0 auto", background: "#fff", borderRadius: 8, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: "uppercase" }}>Camarine</div>
          <div style={{ fontSize: 13, color: "#999" }}>/ Review & Edit Details</div>
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#bbb", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fileName}</div>
        </div>

        {cv && (
          <div style={{ background: "#f0f4fa", border: "0.5px solid #d0d8e8", borderLeft: `3px solid ${BLUE}`, padding: "12px 16px", marginBottom: 24, borderRadius: 2 }}>
            <div style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 2 }}>{cv.fullName}</div>
            <div style={{ fontSize: 12, color: "#666" }}>{cv.currentTitle}{cv.currentEmployer ? ` · ${cv.currentEmployer}` : ""}</div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          {[["candidateName","Candidate Name","1 / -1"],["position","Position Applied For","1 / -1"],["location","Location / Deployment",null],["availability","Available to Start",null],["salary","Salary Expectations",null]].map(([k, label, span]) => (
            <div key={k} style={span ? { gridColumn: span } : {}}>
              <label style={lbl}>{label}</label>
              <input style={inp} value={fields[k]} onChange={e => set(k, e.target.value)} />
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={lbl}>Introduction Paragraph</label>
            <textarea rows={3} style={{ ...inp, resize: "vertical" }} value={fields.intro || cv?.suggestedIntro || ""} onChange={e => set("intro", e.target.value)} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "0.5px solid #eee" }}>
          <button onClick={resetAll} style={{ padding: "10px 20px", border: "0.5px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 13, color: "#555" }}>← New CV</button>
          <button onClick={() => setStep("preview")} style={{ padding: "10px 24px", border: "none", borderRadius: 4, background: NAVY, color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Preview Document →</button>
        </div>
      </div>
    </div>
  );

  // ── Preview ──
  return (
    <div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media print{.toolbar{display:none!important} body{background:#fff!important} .page-wrap{background:#fff!important;padding:0!important} .page{box-shadow:none!important;margin:0!important;page-break-after:always;break-after:page} .page:last-child{page-break-after:avoid;break-after:avoid}}`}</style>

      <div className="toolbar" style={{ position: "sticky", top: 0, zIndex: 100, background: "#fff", borderBottom: "0.5px solid #e0e0e0", padding: "11px 20px", display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: BLUE, textTransform: "uppercase" }}>Camarine</div>
        <div style={{ fontSize: 13, color: "#999" }}>/ {cv?.fullName || fields.candidateName} — {fields.position}</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button onClick={() => setStep("details")} style={{ padding: "8px 16px", border: "0.5px solid #ccc", borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 12, color: "#555" }}>← Edit</button>
          <button onClick={() => window.print()} style={{ padding: "8px 20px", border: "none", borderRadius: 4, background: NAVY, color: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>🖨 Print / Save PDF</button>
          <button onClick={resetAll} style={{ padding: "8px 16px", border: `0.5px solid ${BLUE}`, borderRadius: 4, background: "#fff", cursor: "pointer", fontSize: 12, color: BLUE, fontWeight: 600 }}>+ New Candidate</button>
        </div>
      </div>

      <div className="page-wrap" style={{ background: "#e8ecf0", padding: "28px 20px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.10)", borderRadius: 2 }}>
            <CoverPage fields={fields} cv={cv} />
          </div>
          <div style={{ background: "#fff", boxShadow: "0 2px 16px rgba(0,0,0,0.10)", borderRadius: 2 }}>
            <CVPage cv={cv} fields={fields} />
          </div>
        </div>
      </div>
    </div>
  );
}
