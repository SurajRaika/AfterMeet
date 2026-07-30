import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';

const SparklesIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

const CodeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
  </svg>
);

const RefreshIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const CopyIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 002-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const CheckIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const XIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const DatabaseIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
  </svg>
);

const BrainIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

const CRM_FIELDS_MASTER = [
  { id: 'contact_name', label: 'Contact Name', tag: '{{contact_name}}', fillRate: '100% full', tier: 'Standard', activeDefault: true },
  { id: 'company_name', label: 'Company Name', tag: '{{company_name}}', fillRate: '100% full', tier: 'Standard', activeDefault: true },
  { id: 'event_name', label: 'Event Name', tag: '{{event_name}}', fillRate: '98% full', tier: 'Standard', activeDefault: true },
  { id: 'product_interest', label: 'Product Interest', tag: '{{product_interest}}', fillRate: '85% full', tier: '✨ High-Impact Feed', activeDefault: true },
  { id: 'industry', label: 'Industry Sector', tag: '{{industry}}', fillRate: '92% full', tier: 'Standard', activeDefault: false },
  { id: 'meeting_notes', label: 'Meeting Notes', tag: '{{meeting_notes}}', fillRate: '78% full', tier: '✨ High-Impact Feed', activeDefault: false },
  { id: 'recent_news', label: 'Recent News', tag: '{{recent_news}}', fillRate: '64% full', tier: '✨ High-Impact Feed', activeDefault: false },
  { id: 'your_company', label: 'Your Company', tag: '{{your_company}}', fillRate: '100% full', tier: 'Standard', activeDefault: true },
  { id: 'job_title', label: 'Job Title', tag: '{{job_title}}', fillRate: '95% full', tier: 'Standard', activeDefault: false },
];

const MOCK_PROSPECTS = [
  {
    id: 1,
    contact_name: 'John Doe',
    company_name: 'ABC Manufacturing',
    event_name: 'Dubai Industrial Expo 2026',
    product_interest: 'High-Speed Bottling Automation',
    industry: 'Beverage & Packaging',
    meeting_notes: 'Mentioned 15% bottleneck in Line #3 speed and interested in automated predictive maintenance.',
    recent_news: 'Recently expanded new production plant in Abu Dhabi.',
    your_company: 'Apex Automation',
    job_title: 'VP of Manufacturing Operations'
  },
  {
    id: 2,
    contact_name: 'Sarah Jenkins',
    company_name: 'LogiGlobal Logistics',
    event_name: 'TechForward Summit',
    product_interest: 'AI Supply Chain Routing',
    industry: 'Logistics & Distribution',
    meeting_notes: 'Urgent need to streamline multi-warehouse SAP integration and lower fuel consumption.',
    recent_news: 'Acquired regional European courier fleet last quarter.',
    your_company: 'Apex Automation',
    job_title: 'Head of Supply Chain Technology'
  },
  {
    id: 3,
    contact_name: 'Michael Vance',
    company_name: 'BioPharma Health',
    event_name: 'Global Health Innovations Conference',
    product_interest: 'Sterile Cleanroom Monitoring',
    industry: 'Pharmaceuticals',
    meeting_notes: 'Requires real-time compliance logging and zero-downtime sensor calibration.',
    recent_news: 'Obtained FDA clearance for next-gen formulation.',
    your_company: 'Apex Automation',
    job_title: 'Director of Operations Compliance'
  }
];

const PRESETS = [
  {
    id: 'post-event',
    name: 'Post Event',
    title: 'Post-Event Follow-up',
    description: 'Follow up warmly after meeting a prospective client at an industry trade show or conference.',
    badge: 'Popular',
    subject: 'Great meeting you at {{event_name}}',
    body: `Hi {{contact_name}},\n\nIt was great connecting at {{event_name}}! I really enjoyed our conversation regarding {{product_interest}}.\n\nI wanted to follow up and see how {{your_company}} can help {{company_name}} streamline operations and hit your growth targets this quarter.\n\nWould you be open to a quick 10-minute touchpoint next Tuesday?\n\nBest regards,\nAlex Vance`
  },
  {
    id: 'cold-outreach',
    name: 'Cold Outreach',
    title: 'Executive Outreach',
    description: 'Punchy cold email to engage senior leaders around specific industry opportunities.',
    badge: 'High Conversion',
    subject: 'Quick question regarding {{company_name}} & {{product_interest}}',
    body: `Hi {{contact_name}},\n\nI noticed your leadership at {{company_name}} and thought I'd reach out. Many peers in {{industry}} are currently focusing on {{product_interest}} to boost throughput.\n\nAt {{your_company}}, we help operational leaders resolve key workflow friction points seamlessly.\n\nAre you open to reviewing a 2-minute overview video?\n\nBest,\nAlex Vance`
  },
  {
    id: 'demo-invite',
    name: 'Demo Invitation',
    title: 'Tailored Solution Briefing',
    description: 'Invite engaged prospects to a short interactive solution demo or product walkthrough.',
    badge: 'Product Led',
    subject: 'Tailored demo for {{contact_name}} @ {{company_name}}',
    body: `Hi {{contact_name}},\n\nFollowing up on our discussions around {{product_interest}}, I put together a quick outline tailored specifically for {{company_name}}.\n\nWe'd love to walk you through a live demonstration of how {{your_company}} accelerates implementation.\n\nDo you have 15 minutes available later this week?\n\nCheers,\nAlex Vance`
  },
  {
    id: 're-engagement',
    name: 'Re-engagement',
    title: 'Strategic Account Re-engagement',
    description: 'Re-ignite stalled deals or conversations with fresh news and context.',
    badge: 'Nurture',
    subject: 'Re-connecting with {{company_name}} re: {{product_interest}}',
    body: `Hi {{contact_name}},\n\nI know timing wasn't right when we last spoke regarding {{product_interest}}.\n\nSince then, {{your_company}} has released new capabilities that specifically address industry friction at companies like {{company_name}}.\n\nWould it make sense to touch base for 5 minutes this month?\n\nBest,\nAlex Vance`
  }
];

export default function App() {
  const prospectList = useMemo(() => {
    const real = (window as any).realProspects || [];
    const mappedReal = real.map((p: any) => ({
      id: `real_${p.id}`,
      contact_name: p.contact_name || 'N/A',
      company_name: p.company_name || 'N/A',
      event_name: 'N/A',
      product_interest: 'N/A',
      industry: 'N/A',
      meeting_notes: p.notes || 'N/A',
      recent_news: 'N/A',
      your_company: 'Our Company',
      job_title: p.contact_role || 'N/A',
      is_real: true,
    }));

    const mappedMocks = MOCK_PROSPECTS.map(p => ({
      ...p,
      id: `mock_${p.id}`
    }));

    return [...mappedReal, ...mappedMocks];
  }, []);

  const [templateTitle, setTemplateTitle] = useState(PRESETS[0].title);
  const [subject, setSubject] = useState(PRESETS[0].subject);
  const [body, setBody] = useState(PRESETS[0].body);

  // Active CRM fields selected in modal mapping
  const [activeFieldIds, setActiveFieldIds] = useState(
    CRM_FIELDS_MASTER.filter(f => f.activeDefault).map(f => f.id)
  );

  // UI state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(true); // Welcome modal active on initial load
  const [selectedProspectId, setSelectedProspectId] = useState(
    prospectList.length > 0 ? prospectList[0].id : 'mock_1'
  );
  const [generationMode, setGenerationMode] = useState('dynamic'); // 'dynamic' | 'direct'
  const [creativity, setCreativity] = useState('balanced'); // 'strict' | 'balanced' | 'creative'
  
  // AI generation loading & output
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saveNotification, setSaveNotification] = useState('');

  // Cached dynamic AI generations per prospect
  const [dynamicCache, setDynamicCache] = useState<Record<string, any>>({});

  const currentProspect = useMemo(
    () => prospectList.find(p => String(p.id) === String(selectedProspectId)) || prospectList[0],
    [selectedProspectId, prospectList]
  );

  const directSubject = useMemo(() => {
    let result = subject;
    CRM_FIELDS_MASTER.forEach(field => {
      const val = currentProspect[field.id] || `[${field.label}]`;
      const regex = new RegExp(`{{\\s*${field.id}\\s*}}`, 'g');
      result = result.replace(regex, val);
    });
    return result;
  }, [subject, currentProspect]);

  const directBody = useMemo(() => {
    let result = body;
    CRM_FIELDS_MASTER.forEach(field => {
      const val = currentProspect[field.id] || `[${field.label}]`;
      const regex = new RegExp(`{{\\s*${field.id}\\s*}}`, 'g');
      result = result.replace(regex, val);
    });
    return result;
  }, [body, currentProspect]);

  const generateAIDynamicVariation = async (prospect: any, customCreativity = creativity) => {
    setIsGenerating(true);
    
    const mappedContext = activeFieldIds
      .map(id => {
        const f = CRM_FIELDS_MASTER.find(item => item.id === id);
        return f ? `${f.label} (${f.tag}): ${prospect[id] || 'N/A'}` : null;
      })
      .filter(Boolean)
      .join('\n');

    const systemPrompt = `You are a world-class B2B AI Agent Email Strategist.
Your goal is to re-synthesize a reference email into a bespoke, high-converting personalized variation for a specific prospect.

CRITICAL INSTRUCTIONS:
1. Do NOT write boilerplate AI fluff or generic sales talk.
2. Maintain the intent, CTA, and overall core message of the Reference Email, but write with natural human tone.
3. Fluidly integrate relevant details from the CRM Prospect Context (such as meeting notes, news, or product interest).
4. Match creativity level:
   - "strict": Minimal modifications, exact intent, strictly natural phrasing adjustments.
   - "balanced": Smart rewrites, natural phrasing, subtle context inclusion.
   - "creative": Engaging hook adaptation, tailored executive angle, high personalization.
5. Return ONLY a valid JSON object matching this exact structure:
{
  "subject": "The personalized subject line",
  "message": "The personalized body email body text",
  "strategyInsight": "A 1-2 sentence breakdown explaining your copywriting strategy (e.g. 'Used meeting context re: bottleneck speeds to create an executive hook.')"
}`;

    const userPrompt = `CREATIVITY LEVEL: ${customCreativity.toUpperCase()}

REFERENCE SUBJECT:
${subject}

REFERENCE BODY:
${body}

CRM PROSPECT CONTEXT DATA:
${mappedContext}`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) {
        throw new Error("No VITE_GEMINI_API_KEY set. Falling back to client-side templates.");
      }
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              subject: { type: "STRING" },
              message: { type: "STRING" },
              strategyInsight: { type: "STRING" }
            },
            propertyOrdering: ["subject", "message", "strategyInsight"]
          }
        }
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const rawJson = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (rawJson) {
        const parsed = JSON.parse(rawJson);
        setDynamicCache(prev => ({
          ...prev,
          [`${prospect.id}_${customCreativity}`]: parsed
        }));
      } else {
        throw new Error("Empty response structure");
      }
    } catch (err) {
      console.warn("Gemini API call fallback to intelligent client template engine:", err);
      const fallbackSubject = `${directSubject} — Tailored for ${prospect.company_name}`;
      const fallbackBody = `Hi ${prospect.contact_name},\n\nIt was great catching up during ${prospect.event_name}. Following our notes regarding ${prospect.product_interest} (${prospect.meeting_notes || 'operational goals'}), I wanted to reconnect.\n\nAt ${prospect.your_company}, we've helped similar leaders in ${prospect.industry || 'your industry'} eliminate workflow friction.\n\nWould you be open to a brief 10-minute call this coming week to discuss our approach for ${prospect.company_name}?\n\nBest regards,\nAlex Vance`;
      const fallbackInsight = `Incorporated meeting context re: ${prospect.product_interest}. Formulated tailored executive hook for ${prospect.company_name}.`;

      setDynamicCache(prev => ({
        ...prev,
        [`${prospect.id}_${customCreativity}`]: {
          subject: fallbackSubject,
          message: fallbackBody,
          strategyInsight: fallbackInsight
        }
      }));
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePolishEmail = async () => {
    setIsPolishing(true);
    const systemPrompt = "You are a professional B2B email editor. Polish the user's reference email text to make it conciser, punchier, and highly engaging while keeping all template tags intact (like {{contact_name}}). Return a JSON object with keys 'subject' and 'body'.";
    const userPrompt = `Subject: ${subject}\n\nBody:\n${body}`;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      if (!apiKey) {
        throw new Error("No VITE_GEMINI_API_KEY set. Falling back to client-side polish.");
      }
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: userPrompt }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] },
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              subject: { type: "STRING" },
              body: { type: "STRING" }
            },
            propertyOrdering: ["subject", "body"]
          }
        }
      };

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const resultText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (resultText) {
        const parsed = JSON.parse(resultText);
        if (parsed.subject) setSubject(parsed.subject);
        if (parsed.body) setBody(parsed.body);
      }
    } catch (e) {
      console.warn("Polish fallback:", e);
      setSubject(prev => prev.trim());
      setBody(prev => prev.replace(/\n\n+/g, '\n\n').trim());
    } finally {
      setIsPolishing(false);
    }
  };

  useEffect(() => {
    if (generationMode === 'dynamic') {
      const cacheKey = `${currentProspect.id}_${creativity}`;
      if (!dynamicCache[cacheKey]) {
        generateAIDynamicVariation(currentProspect, creativity);
      }
    }
  }, [selectedProspectId, creativity, generationMode]);

  const activeOutput = useMemo(() => {
    if (generationMode === 'direct') {
      return {
        subject: directSubject,
        message: directBody,
        strategyInsight: "Direct Tag Merge Mode: Standard mail-merge parameter substitution without natural language phrasing alterations."
      };
    }
    const cacheKey = `${currentProspect.id}_${creativity}`;
    return dynamicCache[cacheKey] || {
      subject: directSubject,
      message: directBody,
      strategyInsight: "Synthesizing AI variation based on active CRM tags & reference intent..."
    };
  }, [generationMode, directSubject, directBody, dynamicCache, currentProspect.id, creativity]);

  const handleCopyOutput = () => {
    const textToCopy = `Subject: ${activeOutput.subject}\n\n${activeOutput.message}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyPreset = (preset: any) => {
    setTemplateTitle(preset.title);
    setSubject(preset.subject);
    setBody(preset.body);
    setDynamicCache({}); // Reset cache for fresh generation
    setIsWelcomeModalOpen(false); // Close welcome popup
  };

  const insertTagAtCursor = (tag: string) => {
    setBody(prev => prev + ` ${tag} `);
  };

  const toggleFieldActive = (fieldId: string) => {
    setActiveFieldIds(prev => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleClearAll = () => {
    setTemplateTitle('Untitled Email Template');
    setSubject('');
    setBody('');
    setDynamicCache({});
  };

  const handleSaveTemplate = async () => {
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';

      const response = await fetch('/dashboard/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'X-CSRF-TOKEN': csrfToken,
        },
        body: JSON.stringify({
          name: templateTitle || 'Untitled Email Template',
          subject: subject,
          body: body,
        }),
      });

      if (response.ok) {
        setSaveNotification('Template saved successfully! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard/templates';
        }, 1500);
      } else {
        const errorData = await response.json();
        console.error('Error details:', errorData);
        alert('Failed to save template: ' + (errorData.message || 'Unknown error'));
      }
    } catch (error: any) {
      console.error('Error saving template:', error);
      alert('Error saving template: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 font-sans antialiased selection:bg-indigo-500 selection:text-white flex flex-col transition-colors duration-300">
      
      {/* Toast Notification */}
      {saveNotification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl text-sm font-medium flex items-center space-x-2 transition-all transform animate-in fade-in slide-in-from-top-4">
          <CheckIcon className="w-4 h-4" />
          <span>{saveNotification}</span>
        </div>
      )}

      {/* LIGHT THEME HEADER BAR */}
      <header className="border-b border-slate-200/80 bg-white/90 sticky top-0 z-30 backdrop-blur-md shadow-xs">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm tracking-wide text-slate-900">
                  AI EMAIL TEMPLATE STUDIO
                </span>
                <span className="text-[10px] font-semibold uppercase bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-200/60">
                  Light Edition
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block font-medium">
                Reference-Based AI Email Personalization Engine
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={handleClearAll}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Clear
            </button>

            <a
              href="/dashboard/templates"
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
            >
              Cancel
            </a>

            <button
              onClick={handleSaveTemplate}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow transition flex items-center space-x-1.5"
            >
              <CheckIcon className="w-3.5 h-3.5" />
              <span>Save Template</span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN TWO-PANEL LAYOUT */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ========================================== */}
        {/* LEFT PANEL: TEMPLATE EDITOR & CRM MAPPING   */}
        {/* ========================================== */}
        <div className="lg:col-span-6 space-y-6 flex flex-col">
          
          {/* SECTION 1: TEMPLATE INFORMATION (Presets Removed) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  1. Template Information
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Template Title
              </label>
              <input
                type="text"
                value={templateTitle}
                onChange={(e) => setTemplateTitle(e.target.value)}
                placeholder="e.g. Post-Event Follow-up"
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition font-medium"
              />
            </div>
          </div>

          {/* SECTION 2: CRM PROSPECT TABLE & DATA MAPPING */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  2. CRM Prospect Table & Data Mapping
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center space-x-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>CRM Connected</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div className="flex items-center space-x-2 text-xs text-slate-700 font-medium">
                <DatabaseIcon className="w-4 h-4 text-indigo-600" />
                <span>{CRM_FIELDS_MASTER.length} Native CRM Fields Available</span>
              </div>

              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-indigo-700 border border-indigo-200 shadow-2xs hover:bg-indigo-50 transition flex items-center space-x-1.5"
              >
                <span>📊 Manage CRM Fields Modal</span>
              </button>
            </div>

            <div>
              <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Active Mapped Variable Chips ({activeFieldIds.length} Active):
              </span>
              <div className="flex flex-wrap gap-2">
                {CRM_FIELDS_MASTER.map((field) => {
                  const isActive = activeFieldIds.includes(field.id);
                  return (
                    <button
                      key={field.id}
                      onClick={() => toggleFieldActive(field.id)}
                      className={`text-xs font-mono px-2.5 py-1 rounded-lg border transition flex items-center space-x-1.5 ${
                        isActive
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold shadow-2xs'
                          : 'bg-slate-50 text-slate-400 border-slate-200 line-through opacity-70 hover:opacity-100'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-600' : 'bg-slate-400'}`}></span>
                      <span>{field.id}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SECTION 3: REFERENCE SUBJECT & BODY INPUT */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 flex-1 flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                3. Reference Subject & Body Input
              </span>
              <button
                onClick={handlePolishEmail}
                disabled={isPolishing}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition flex items-center space-x-1.5 disabled:opacity-50"
              >
                <SparklesIcon className="w-3.5 h-3.5 text-indigo-600" />
                <span>{isPolishing ? 'Polishing...' : 'Polish Text ✨'}</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject with tags e.g. Great meeting you at {{event_name}}"
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition font-mono font-medium"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Body Reference Text
                </label>
                <span className="text-[11px] font-medium text-slate-400">
                  Dynamic tags extracted automatically
                </span>
              </div>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={8}
                placeholder="Paste reference email body here..."
                className="w-full flex-1 bg-slate-50/80 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 transition font-mono leading-relaxed resize-none font-normal"
              />
            </div>

            {/* Quick Tag Insert Buttons */}
            <div>
              <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                Quick Insert Active Tags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {activeFieldIds.map(id => {
                  const field = CRM_FIELDS_MASTER.find(f => f.id === id);
                  if (!field) return null;
                  return (
                    <button
                      key={id}
                      onClick={() => insertTagAtCursor(field.tag)}
                      className="text-xs font-mono bg-slate-100 hover:bg-indigo-50 text-indigo-700 border border-slate-200 hover:border-indigo-300 font-medium px-2.5 py-1 rounded-lg transition shadow-2xs"
                      title="Click to insert tag"
                    >
                      + {field.tag}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* ========================================== */}
        {/* RIGHT PANEL: LIVE DYNAMIC PREVIEW          */}
        {/* ========================================== */}
        <div className="lg:col-span-6 space-y-6 flex flex-col">
          
          {/* SECTION 5: LIVE PREVIEW HEADER & PROSPECT SWITCHER */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-ping"></span>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Live Personalization Preview
                </span>
              </div>

              {/* Prospect Selector Dropdown */}
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                  Prospect Context:
                </label>
                <select
                  value={selectedProspectId}
                  onChange={(e) => setSelectedProspectId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white w-full sm:w-auto cursor-pointer shadow-2xs"
                >
                  {prospectList.map((p) => (
                    <option key={String(p.id)} value={String(p.id)}>
                      {p.is_real ? `👤 [Real] ${p.contact_name} (${p.company_name})` : `✨ [Demo] ${p.contact_name} (${p.company_name})`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SECTION 6: DUAL-MODE GENERATION SWITCHER */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Generation Engine Mode
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100/80 p-1.5 rounded-xl border border-slate-200/60">
                <button
                  onClick={() => setGenerationMode('dynamic')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    generationMode === 'dynamic'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>✨ AI Agent Dynamic</span>
                </button>

                <button
                  onClick={() => setGenerationMode('direct')}
                  className={`py-2 px-3 rounded-lg text-xs font-bold transition flex items-center justify-center space-x-2 ${
                    generationMode === 'direct'
                      ? 'bg-white text-slate-800 border border-slate-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 font-semibold'
                  }`}
                >
                  <CodeIcon className="w-3.5 h-3.5" />
                  <span>&lt;/&gt; Direct Tag Merge</span>
                </button>
              </div>
            </div>

            {/* SECTION 7: AI AGENT CONTROLS (DYNAMIC MODE ONLY) */}
            {generationMode === 'dynamic' ? (
              <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    AI Personalization Intensity
                  </span>
                  <span className="text-[11px] font-mono font-semibold text-indigo-600 uppercase">
                    [{creativity}]
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {['strict', 'balanced', 'creative'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setCreativity(level)}
                      className={`flex-1 py-1.5 text-xs font-semibold rounded-lg border capitalize transition ${
                        creativity === level
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-bold shadow-2xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => generateAIDynamicVariation(currentProspect, creativity)}
                  disabled={isGenerating}
                  className="w-full py-2.5 rounded-xl text-xs font-bold bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 shadow-2xs transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <RefreshIcon className={`w-3.5 h-3.5 text-indigo-600 ${isGenerating ? 'animate-spin' : ''}`} />
                  <span>{isGenerating ? 'Synthesizing AI Variation...' : '🔄 Regenerate Dynamic Email'}</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-500 italic text-center font-medium">
                Direct Tag Merge mode active. Mail-merge variable substitution active.
              </div>
            )}
          </div>

          {/* SECTION 8: RENDERED OUTPUT CARD */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs space-y-4 flex-1 flex flex-col relative">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Generated Output Preview
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  generationMode === 'dynamic'
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}>
                  {generationMode === 'dynamic' ? '✨ AI Bespoke' : '</> Direct Merge'}
                </span>
              </div>

              <button
                onClick={handleCopyOutput}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition flex items-center space-x-1.5"
              >
                {copied ? (
                  <>
                    <CheckIcon className="w-3.5 h-3.5 text-white" />
                    <span className="text-white">Copied!</span>
                  </>
                ) : (
                  <>
                    <CopyIcon className="w-3.5 h-3.5 text-indigo-100" />
                    <span>Copy Output</span>
                  </>
                )}
              </button>
            </div>

            {/* Output Subject & Body Preview Container */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3 flex-1 shadow-2xs">
              
              {/* Rendered Subject Line */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  SUBJECT LINE
                </span>
                <div className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-lg border border-slate-200/80 font-mono">
                  {isGenerating ? (
                    <span className="text-slate-400 animate-pulse font-normal">Generating bespoke subject line...</span>
                  ) : (
                    activeOutput.subject
                  )}
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Rendered Message Body */}
              <div className="flex-1 flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  EMAIL MESSAGE BODY
                </span>
                <div className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans bg-slate-50/50 p-4 rounded-lg border border-slate-200/80 flex-1 min-h-[180px]">
                  {isGenerating ? (
                    <div className="space-y-2 py-4 animate-pulse">
                      <div className="h-3 bg-slate-200 rounded w-1/3"></div>
                      <div className="h-3 bg-slate-200 rounded w-full"></div>
                      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
                      <div className="h-3 bg-slate-200 rounded w-4/5"></div>
                    </div>
                  ) : (
                    activeOutput.message
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 9: AI STRATEGY BREAKDOWN INSIGHTS */}
            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-4 space-y-1.5">
              <div className="flex items-center space-x-2 text-indigo-900">
                <BrainIcon className="w-4 h-4 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  AI Personalization Strategy
                </span>
              </div>
              <p className="text-xs text-indigo-900/80 leading-relaxed font-medium">
                {isGenerating
                  ? "Analyzing prospect context and synthesizing strategic angles..."
                  : activeOutput.strategyInsight}
              </p>
            </div>

          </div>

        </div>

      </main>

      {/* ========================================================================= */}
      {/* ONBOARDING / STARTER TEMPLATE SELECTION MODAL (LOADS ONLY ON FIRST OPEN) */}
      {/* ========================================================================= */}
      {isWelcomeModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Top Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
                  <SparklesIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-wide">
                    Select a Starter Email Template
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Choose a high-converting reference template to initialize your workspace.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsWelcomeModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Template Gallery Grid */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[65vh] overflow-y-auto bg-slate-50/50">
              {PRESETS.map((preset) => (
                <div
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset)}
                  className="group bg-white hover:bg-indigo-50/30 border border-slate-200 hover:border-indigo-300 rounded-xl p-4 cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-md flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-indigo-700 transition">
                        {preset.title}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {preset.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      {preset.description}
                    </p>
                  </div>

                  <div className="bg-slate-50 group-hover:bg-white p-2.5 rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-600 truncate">
                    <span className="text-slate-400 font-semibold">Subject: </span>
                    {preset.subject}
                  </div>

                  <div className="pt-1 flex items-center justify-between text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                    <span>Use Template &rarr;</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-white border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">
                You can customize template variables and body text anytime.
              </span>
              <button
                onClick={() => setIsWelcomeModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 border border-slate-200 transition"
              >
                Start from Blank Template
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🗄️ CRM FIELD PICKER MODAL                                                 */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <div className="flex items-center space-x-2">
                <DatabaseIcon className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  CRM Prospect Table Fields Mapping
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <XIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Table Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase">
                    <th className="pb-3 font-semibold">Active</th>
                    <th className="pb-3 font-semibold">Field Name</th>
                    <th className="pb-3 font-semibold">Merge Tag</th>
                    <th className="pb-3 font-semibold">Fill Rate</th>
                    <th className="pb-3 font-semibold">Feed Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CRM_FIELDS_MASTER.map((f) => {
                    const isChecked = activeFieldIds.includes(f.id);
                    return (
                      <tr
                        key={f.id}
                        onClick={() => toggleFieldActive(f.id)}
                        className={`hover:bg-slate-50 cursor-pointer transition ${
                          isChecked ? 'text-slate-900 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        <td className="py-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}} // handled by row click
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 bg-white cursor-pointer"
                          />
                        </td>
                        <td className="py-3 font-sans font-medium text-slate-800">{f.label}</td>
                        <td className="py-3 text-indigo-600 font-mono">{f.tag}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            parseInt(f.fillRate) > 90
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}>
                            {f.fillRate}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`text-[11px] ${
                            f.tier.includes('High-Impact') ? 'text-indigo-600 font-bold' : 'text-slate-500'
                          }`}>
                            {f.tier}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500 font-medium">
                {activeFieldIds.length} of {CRM_FIELDS_MASTER.length} fields active
              </span>
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-2xs"
              >
                Done Mapping
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

// Mount React component to DOM
if (typeof document !== 'undefined') {
  const container = document.getElementById('ai-email-template-builder-root');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  }
}
