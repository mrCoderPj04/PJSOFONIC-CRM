import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  PlusCircle,
  FileText,
  Upload,
  Link,
  Bold,
  Italic,
  Underline,
  List,
  Heading,
  Code,
  Image,
  Sparkles,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';

export default function CustomerNewProjectRequest() {
  const { user, setActiveTab, setSelectedProjectId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    project_type: 'Full Stack',
    company_name: user?.company || '',
    overview: '',
    requirements_html: `<h2>1. Functional Requirements</h2>
<p>Write detailed specification for your project here...</p>
<ul>
  <li>User Authentication via PJSOFONIC EMS SSO.</li>
  <li>Custom Dashboard & Data Visualization.</li>
  <li>Automated Audit Trail and Reporting.</li>
</ul>`,
    expected_features: '',
    priority: 'HIGH',
    expected_start_date: '15 Aug 2026',
    expected_end_date: '30 Sep 2026',
    figma_link: ''
  });

  const insertRichText = (tag) => {
    let addText = '';
    if (tag === 'b') addText = '<strong>Bold Text</strong>';
    if (tag === 'i') addText = '<em>Italic Text</em>';
    if (tag === 'h2') addText = '<h2>New Section Heading</h2>';
    if (tag === 'ul') addText = '<ul>\n  <li>Feature Item 1</li>\n  <li>Feature Item 2</li>\n</ul>';
    if (tag === 'code') addText = '<pre><code>// Sample Code Snippet</code></pre>';
    
    setFormData(prev => ({
      ...prev,
      requirements_html: prev.requirements_html + '\n' + addText
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const created = await api.createProject(formData);
      setSubmitted(true);
      setTimeout(() => {
        setSelectedProjectId(created.id);
        setActiveTab('project_detail');
      }, 1500);
    } catch (err) {
      alert('Failed to submit project request: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="glass-panel p-12 text-center rounded-3xl border border-emerald-500/30 max-w-xl mx-auto space-y-4 my-10">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto ring-4 ring-emerald-500/30 animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Project Request Submitted!</h2>
        <p className="text-xs text-slate-300">
          Your project request has been transmitted to PJSOFONIC Admin for review. Redirecting to your Project Workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs text-emerald-400 font-bold mb-1">
          <Sparkles className="w-4 h-4" />
          <span>CUSTOMER PROJECT SUBMISSION</span>
        </div>
        <h1 className="text-2xl font-black text-white">New Project Request Form</h1>
        <p className="text-xs text-slate-400 mt-1">
          Provide complete project specifications, rich text requirements, Figma designs, and target completion dates.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-3">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>1. Basic Information</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Project Name *</label>
              <input
                type="text"
                required
                placeholder="e.g. Next-Gen Mobile Banking Platform"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full glass-input p-3 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Project Type *</label>
              <select
                value={formData.project_type}
                onChange={(e) => setFormData({ ...formData, project_type: e.target.value })}
                className="w-full glass-input p-3 rounded-xl text-xs bg-slate-900"
              >
                <option value="Full Stack">Full Stack</option>
                <option value="AI/ML">AI/ML</option>
                <option value="DevOps">DevOps</option>
                <option value="Coding Project">Coding Project</option>
                <option value="Kubernetes">Kubernetes</option>
                <option value="Web3">Web3</option>
                <option value="E-Commerce Web Application">E-Commerce Web Application</option>
                <option value="Mobile Application (iOS & Android)">Mobile Application (iOS & Android)</option>
                <option value="Enterprise SaaS Platform">Enterprise SaaS Platform</option>
                <option value="Custom ERP / CRM System">Custom ERP / CRM System</option>
                <option value="UI/UX Redesign & Branding">UI/UX Redesign & Branding</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Organization Name</label>
              <input
                type="text"
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full glass-input p-3 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full glass-input p-3 rounded-xl text-xs bg-slate-900"
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-slate-300 font-semibold block mb-1.5">Project Overview *</label>
            <textarea
              required
              rows={3}
              placeholder="Brief summary of what this project aims to accomplish..."
              value={formData.overview}
              onChange={(e) => setFormData({ ...formData, overview: e.target.value })}
              className="w-full glass-input p-3 rounded-xl text-xs"
            />
          </div>
        </div>

        {/* Section 2: Rich Text Requirement Specification */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>2. Detailed Requirements (Rich Text Editor)</span>
            </h2>

            {/* Rich Text Editor Toolbar */}
            <div className="flex items-center space-x-1 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
              <button type="button" onClick={() => insertRichText('b')} className="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="Bold">
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => insertRichText('i')} className="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="Italic">
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => insertRichText('h2')} className="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="Heading">
                <Heading className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => insertRichText('ul')} className="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="List">
                <List className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => insertRichText('code')} className="p-1.5 hover:bg-slate-800 rounded text-slate-300" title="Code">
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div>
            <textarea
              rows={8}
              value={formData.requirements_html}
              onChange={(e) => setFormData({ ...formData, requirements_html: e.target.value })}
              className="w-full glass-input p-3.5 rounded-xl font-mono text-xs text-emerald-300 leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">Supports HTML & formatted Markdown text.</p>
          </div>
        </div>

        {/* Section 3: Design Upload & External Links */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Upload className="w-4 h-4 text-purple-400" />
            <span>3. Design Files & Reference Links</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5 flex items-center space-x-1.5">
                <Link className="w-3.5 h-3.5 text-purple-400" />
                <span>Figma Prototype / UI Reference Link</span>
              </label>
              <input
                type="url"
                placeholder="https://figma.com/@project-spec-ui"
                value={formData.figma_link}
                onChange={(e) => setFormData({ ...formData, figma_link: e.target.value })}
                className="w-full glass-input p-3 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Target Dates */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center space-x-2 border-b border-slate-800 pb-3">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>4. Target Timeline</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Expected Start Date</label>
              <input
                type="text"
                value={formData.expected_start_date}
                onChange={(e) => setFormData({ ...formData, expected_start_date: e.target.value })}
                className="w-full glass-input p-3 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-slate-300 font-semibold block mb-1.5">Expected Completion Date</label>
              <input
                type="text"
                value={formData.expected_end_date}
                onChange={(e) => setFormData({ ...formData, expected_end_date: e.target.value })}
                className="w-full glass-input p-3 rounded-xl text-xs"
              />
            </div>
          </div>
        </div>

        {/* Form Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 text-sm font-extrabold rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-110 text-white shadow-xl shadow-emerald-500/25 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {loading ? (
              <span>Submitting to CRM Database...</span>
            ) : (
              <>
                <span>Submit Project Request</span>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
