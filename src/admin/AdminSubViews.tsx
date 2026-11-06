import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  Star,
  ArrowUp,
  ArrowDown,
  Upload,
  Download,
  Search,
  Mail,
  Check,
  RotateCcw,
  FileText,
  Save,
  ChevronDown,
} from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import {
  INDIAN_STATES,
  INDIAN_UNION_TERRITORIES,
  ProjectItem,
  DEFAULT_EMBLEM_URL,
} from '../data/seed';
import { triggerResumeDownload } from '../utils/resumeDownload';

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/* ============================================================================
   1. ADMIN PROJECTS (/admin/projects & /admin/projects/new)
   ============================================================================ */
export const AdminProjectsView: React.FC<{
  mode: 'list' | 'new' | 'edit';
  editProjectId?: string;
  onNavigate: (path: string) => void;
}> = ({ mode, editProjectId, onNavigate }) => {
  const {
    db,
    saveProject,
    deleteProject,
    toggleProjectPublish,
    toggleProjectFeatured,
  } = useCMS();

  const existing = editProjectId ? db.projects.find((p) => p.id === editProjectId) : undefined;

  const [title, setTitle] = useState(existing?.title || '');
  const [slug, setSlug] = useState(existing?.slug || '');
  const [category, setCategory] = useState(existing?.category || 'Web & Technology');
  const [summary, setSummary] = useState(existing?.summary || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [coverImage, setCoverImage] = useState(existing?.coverImage || DEFAULT_EMBLEM_URL);
  const [tagsInput, setTagsInput] = useState(existing?.tags.join(', ') || 'React, TypeScript');
  const [liveUrl, setLiveUrl] = useState(existing?.liveUrl || '');
  const [githubUrl, setGithubUrl] = useState(existing?.githubUrl || '');
  const [published, setPublished] = useState(existing ? existing.published : true);
  const [featured, setFeatured] = useState(existing ? existing.featured : false);
  const [challenge, setChallenge] = useState(existing?.challenge || '');
  const [approach, setApproach] = useState(existing?.approach || '');
  const [development, setDevelopment] = useState(existing?.development || '');
  const [result, setResult] = useState(existing?.result || '');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleEditClick = (project: ProjectItem) => {
    setTitle(project.title);
    setSlug(project.slug);
    setCategory(project.category);
    setSummary(project.summary);
    setDescription(project.description);
    setCoverImage(project.coverImage);
    setTagsInput(project.tags.join(', '));
    setLiveUrl(project.liveUrl || '');
    setGithubUrl(project.githubUrl || '');
    setPublished(project.published);
    setFeatured(project.featured);
    setChallenge(project.challenge);
    setApproach(project.approach);
    setDevelopment(project.development);
    setResult(project.result);
    onNavigate(`/admin/projects/edit/${project.id}`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setCoverImage(dataUrl);
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    saveProject({
      id: existing?.id,
      title: title.trim(),
      slug: slug.trim(),
      category,
      summary: summary.trim(),
      description: description.trim(),
      coverImage: coverImage || DEFAULT_EMBLEM_URL,
      tags: tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
      liveUrl: liveUrl.trim() || undefined,
      githubUrl: githubUrl.trim() || undefined,
      published,
      featured,
      challenge: challenge.trim(),
      approach: approach.trim(),
      development: development.trim(),
      result: result.trim(),
    });
    onNavigate('/admin/projects');
  };

  if (mode === 'new' || mode === 'edit') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display-app text-2xl font-bold text-[#08111f]">
              {mode === 'edit' ? 'Edit Project Case Study' : 'New Project Case Study'}
            </h1>
            <p className="text-sm text-slate-600">
              Complete the project overview, cover asset, and 4-step case study framework.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/admin/projects')}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 cursor-pointer"
          >
            Back to Projects
          </button>
        </div>

        <form
          onSubmit={handleSaveProject}
          className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Project Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Kaveri Commerce Suite"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                URL Slug (auto-generated if blank)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="kaveri-commerce-suite"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono-app"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 bg-white"
              >
                {db.categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Technologies (comma separated)
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="React, TypeScript, Tailwind CSS"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Live Project URL
              </label>
              <input
                type="url"
                value={liveUrl}
                onChange={(e) => setLiveUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Source on GitHub URL
              </label>
              <input
                type="url"
                value={githubUrl}
                onChange={(e) => setGithubUrl(e.target.value)}
                placeholder="https://github.com/..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Short Summary *
              </label>
              <textarea
                rows={3}
                required
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Concise 1–2 sentence card summary..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Project Description *
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detailed project overview..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          {/* Device Image Upload */}
          <div className="border-t border-slate-200 pt-5">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Project Cover Image (Device Upload via Base64 or Image URL)
            </label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-36 h-24 rounded-lg border border-slate-300 overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="space-y-2 flex-1 w-full">
                <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#08111f] text-white text-xs font-medium cursor-pointer hover:bg-slate-800">
                  <Upload size={14} strokeWidth={1.75} />
                  <span>Upload Image from Device</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Or paste image URL / Base64 data URL"
                  className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 font-mono-app"
                />
              </div>
            </div>
          </div>

          {/* 4-Step Case Study Fields */}
          <div className="border-t border-slate-200 pt-5 space-y-4">
            <h3 className="font-display-app text-sm font-bold text-[#08111f] uppercase tracking-wider">
              From Idea → Digital Product (4-Step Case Study Framework)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  01 Challenge
                </label>
                <textarea
                  rows={3}
                  value={challenge}
                  onChange={(e) => setChallenge(e.target.value)}
                  placeholder="What problem needed solving?"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  02 Approach
                </label>
                <textarea
                  rows={3}
                  value={approach}
                  onChange={(e) => setApproach(e.target.value)}
                  placeholder="How was the architecture and design planned?"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  03 Development
                </label>
                <textarea
                  rows={3}
                  value={development}
                  onChange={(e) => setDevelopment(e.target.value)}
                  placeholder="How was the solution engineered and tested?"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  04 Result
                </label>
                <textarea
                  rows={3}
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  placeholder="What was the final outcome and impact?"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Published on public site</span>
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300"
                />
                <span>Featured project</span>
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#6D001A] text-white text-sm font-medium hover:bg-[#8E092B] cursor-pointer"
            >
              <Save size={16} strokeWidth={1.75} />
              <span>Save Project</span>
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-app text-2xl font-bold text-[#08111f]">Projects</h1>
          <p className="text-sm text-slate-600">
            Manage portfolio case studies, publication states, and featured highlights.
          </p>
        </div>
        <button
          type="button"
          onClick={() => onNavigate('/admin/projects/new')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#6D001A] text-white text-sm font-medium hover:bg-[#8E092B] cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} strokeWidth={1.75} />
          <span>New Project</span>
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-mono-app uppercase text-slate-500 bg-slate-50">
              <th className="py-3.5 px-4">Project</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Featured</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {db.projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  No projects in CMS. Click &ldquo;New Project&rdquo; to create one.
                </td>
              </tr>
            ) : (
              db.projects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={proj.coverImage}
                        alt={proj.title}
                        referrerPolicy="no-referrer"
                        className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                      />
                      <div>
                        <div className="font-semibold text-slate-900">{proj.title}</div>
                        <div className="text-xs font-mono-app text-slate-500">/work/{proj.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-700">{proj.category}</td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleProjectPublish(proj.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                        proj.published
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {proj.published ? (
                        <>
                          <Eye size={13} strokeWidth={1.75} />
                          <span>published</span>
                        </>
                      ) : (
                        <>
                          <EyeOff size={13} strokeWidth={1.75} />
                          <span>draft</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="py-3.5 px-4">
                    <button
                      type="button"
                      onClick={() => toggleProjectFeatured(proj.id)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer ${
                        proj.featured
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <Star size={13} strokeWidth={1.75} />
                      <span>{proj.featured ? 'Featured' : 'Standard'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditClick(proj)}
                        className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                        title="Edit project"
                      >
                        <Edit3 size={15} strokeWidth={1.75} />
                      </button>
                      {confirmDeleteId === proj.id ? (
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              deleteProject(proj.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 rounded bg-rose-600 text-white text-xs font-medium cursor-pointer"
                          >
                            Confirm
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 rounded bg-slate-200 text-slate-700 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(proj.id)}
                          className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete project"
                        >
                          <Trash2 size={15} strokeWidth={1.75} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================================
   2. ADMIN SERVICES (/admin/services)
   ============================================================================ */
export const AdminServicesView: React.FC = () => {
  const {
    db,
    updateCategory,
    addService,
    toggleServiceActive,
    reorderService,
    deleteService,
  } = useCMS();

  const [newServiceNames, setNewServiceNames] = useState<Record<string, string>>({});
  const [newServiceDescs, setNewServiceDescs] = useState<Record<string, string>>({});
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [catNameDraft, setCatNameDraft] = useState('');
  const [catDescDraft, setCatDescDraft] = useState('');

  const sortedCategories = [...db.categories].sort((a, b) => a.order - b.order);

  const handleAddService = (categoryId: string) => {
    const name = (newServiceNames[categoryId] || '').trim();
    if (!name) return;
    addService({
      name,
      categoryId,
      description: newServiceDescs[categoryId] || undefined,
    });
    setNewServiceNames((prev) => ({ ...prev, [categoryId]: '' }));
    setNewServiceDescs((prev) => ({ ...prev, [categoryId]: '' }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-app text-2xl font-bold text-[#08111f]">
          Services & Categories ({db.services.length} Total)
        </h1>
        <p className="text-sm text-slate-600">
          Expand any category panel to edit its title/description, add new services, reorder, or
          toggle active/hidden status.
        </p>
      </div>

      <div className="space-y-4">
        {sortedCategories.map((cat, idx) => {
          const catServices = db.services
            .filter((s) => s.categoryId === cat.id)
            .sort((a, b) => a.order - b.order);

          return (
            <details
              key={cat.id}
              open={idx === 0}
              className="group bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 bg-slate-50 cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <span className="font-mono-app text-xs font-bold text-slate-500">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <div className="font-display-app text-base font-bold text-[#08111f]">
                      {cat.name}
                    </div>
                    <div className="text-xs text-slate-500">{cat.description}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono-app text-xs text-slate-600">
                    {catServices.filter((s) => s.active).length}/{catServices.length} active
                  </span>
                  <ChevronDown
                    size={16}
                    strokeWidth={1.75}
                    className="text-slate-500 transition-transform group-open:rotate-180"
                  />
                </div>
              </summary>

              <div className="p-5 space-y-5 border-t border-slate-200">
                {/* Category Edit Bar */}
                {editingCatId === cat.id ? (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex flex-col sm:flex-row gap-3 items-start sm:items-end">
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category Name
                      </label>
                      <input
                        type="text"
                        value={catNameDraft}
                        onChange={(e) => setCatNameDraft(e.target.value)}
                        className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 bg-white"
                      />
                    </div>
                    <div className="flex-1 w-full">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Category Description
                      </label>
                      <input
                        type="text"
                        value={catDescDraft}
                        onChange={(e) => setCatDescDraft(e.target.value)}
                        className="w-full rounded border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          updateCategory({
                            ...cat,
                            name: catNameDraft.trim() || cat.name,
                            description: catDescDraft.trim() || cat.description,
                          });
                          setEditingCatId(null);
                        }}
                        className="px-3 py-1.5 rounded bg-[#08111f] text-white text-xs font-medium cursor-pointer"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingCatId(null)}
                        className="px-3 py-1.5 rounded border border-slate-300 text-slate-700 text-xs cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCatId(cat.id);
                        setCatNameDraft(cat.name);
                        setCatDescDraft(cat.description);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      <Edit3 size={13} strokeWidth={1.75} />
                      <span>Edit Category Metadata</span>
                    </button>
                  </div>
                )}

                {/* Services Table */}
                <div className="divide-y divide-slate-200 border border-slate-200 rounded-lg">
                  {catServices.map((srv, sIdx) => (
                    <div
                      key={srv.id}
                      className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono-app text-xs text-slate-400 w-6">
                          {String(sIdx + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-sm text-slate-900">{srv.name}</div>
                          <div className="text-xs text-slate-500 truncate">{srv.description}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => toggleServiceActive(srv.id)}
                          className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                            srv.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {srv.active ? 'active' : 'hidden'}
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderService(srv.id, 'up')}
                          disabled={sIdx === 0}
                          className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
                          title="Move up"
                        >
                          <ArrowUp size={13} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => reorderService(srv.id, 'down')}
                          disabled={sIdx === catServices.length - 1}
                          className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
                          title="Move down"
                        >
                          <ArrowDown size={13} strokeWidth={1.75} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteService(srv.id)}
                          className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                          title="Delete service"
                        >
                          <Trash2 size={13} strokeWidth={1.75} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Service to Category */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={newServiceNames[cat.id] || ''}
                    onChange={(e) =>
                      setNewServiceNames((prev) => ({ ...prev, [cat.id]: e.target.value }))
                    }
                    placeholder={`New service in ${cat.name}...`}
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                  <input
                    type="text"
                    value={newServiceDescs[cat.id] || ''}
                    onChange={(e) =>
                      setNewServiceDescs((prev) => ({ ...prev, [cat.id]: e.target.value }))
                    }
                    placeholder="Optional description (defaults to standard template)"
                    className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddService(cat.id)}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#08111f] text-white text-xs font-medium hover:bg-slate-800 cursor-pointer shrink-0"
                  >
                    <Plus size={15} strokeWidth={1.75} />
                    <span>Add Service</span>
                  </button>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
};

/* ============================================================================
   3. ADMIN MESSAGES (/admin/messages)
   ============================================================================ */
export const AdminMessagesView: React.FC = () => {
  const { db, toggleMessageRead, deleteMessage } = useCMS();
  const [selectedId, setSelectedId] = useState<string | null>(db.messages[0]?.id || null);

  const selectedMsg = db.messages.find((m) => m.id === selectedId) || db.messages[0] || null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display-app text-2xl font-bold text-[#08111f]">
          Messages Inbox ({db.messages.length})
        </h1>
        <p className="text-sm text-slate-600">
          Inspect project enquiries submitted via the public Contact form.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Table List */}
        <div className="lg:col-span-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono-app uppercase text-slate-500 bg-slate-50">
                <th className="py-3 px-4">Sender</th>
                <th className="py-3 px-4">Service / Budget</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {db.messages.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-slate-500">
                    No enquiries received yet.
                  </td>
                </tr>
              ) : (
                db.messages.map((m) => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedId(m.id)}
                    className={`cursor-pointer transition-colors ${
                      selectedMsg?.id === m.id ? 'bg-slate-100' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{m.name}</div>
                      <div className="text-xs text-slate-500">{m.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-xs font-medium text-slate-800">
                        {m.service || 'General Enquiry'}
                      </div>
                      <div className="text-xs text-slate-500">{m.budget || '—'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-xs font-mono-app font-medium ${
                          m.read ? 'text-slate-500' : 'text-[#6D001A] font-bold'
                        }`}
                      >
                        {m.read ? 'Read' : 'New'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Detail Pane */}
        <div className="lg:col-span-6">
          {selectedMsg ? (
            <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5 shadow-xs">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <div className="font-mono-app text-xs text-slate-500">
                    {selectedMsg.createdAt}
                  </div>
                  <h2 className="font-display-app text-xl font-bold text-[#08111f] mt-1">
                    {selectedMsg.name}
                  </h2>
                  <div className="text-sm text-slate-600">
                    {selectedMsg.email} {selectedMsg.phone ? `· ${selectedMsg.phone}` : ''}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleMessageRead(selectedMsg.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {selectedMsg.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <a
                    href={`mailto:${selectedMsg.email}?subject=${encodeURIComponent(
                      `Re: Your Enquiry with KAVERI DIGITAL SOLUTIONS`
                    )}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#6D001A] text-white text-xs font-medium hover:bg-[#8E092B]"
                  >
                    <Mail size={13} strokeWidth={1.75} />
                    <span>Reply</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => deleteMessage(selectedMsg.id)}
                    className="p-1.5 rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                    title="Delete message"
                  >
                    <Trash2 size={15} strokeWidth={1.75} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-500 block">Service</span>
                  <strong className="text-slate-900">{selectedMsg.service || 'Not specified'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Budget</span>
                  <strong className="text-slate-900">{selectedMsg.budget || 'Not specified'}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block">Project Type</span>
                  <strong className="text-slate-900">
                    {selectedMsg.projectType || 'Not specified'}
                  </strong>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase text-slate-500 mb-2">
                  Project Brief
                </div>
                <p className="text-sm text-slate-800 whitespace-pre-wrap leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
                  {selectedMsg.message}
                </p>
              </div>

              {selectedMsg.attachmentName && (
                <div className="pt-2 flex items-center justify-between text-xs text-slate-700 border-t border-slate-200">
                  <span>Attachment: {selectedMsg.attachmentName}</span>
                  {selectedMsg.attachmentDataUrl && (
                    <a
                      href={selectedMsg.attachmentDataUrl}
                      download={selectedMsg.attachmentName}
                      className="text-blue-600 underline font-medium"
                    >
                      Download Attachment
                    </a>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              Select a message to inspect its details.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   4. ADMIN VISITOR REQUESTS (/admin/visitor-requests)
   ============================================================================ */
export const AdminVisitorRequestsView: React.FC = () => {
  const {
    db,
    updateVisitorEntry,
    deleteVisitorEntry,
    isGoogleSheetsConnected,
    googleUserEmail,
    connectGoogleSheets,
    disconnectGoogleSheets,
  } = useCMS();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editAge, setEditAge] = useState(25);
  const [editState, setEditState] = useState('');
  const [connecting, setConnecting] = useState(false);

  const filteredEntries = searchQuery.trim()
    ? db.visitorEntries.filter(
        (e) =>
          e.name.toLowerCase() === searchQuery.trim().toLowerCase() ||
          e.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          (e.submissionId && e.submissionId.toLowerCase() === searchQuery.trim().toLowerCase())
      )
    : db.visitorEntries;

  const handleExportCsv = () => {
    // Exact Google Sheet Row Structure ('Sheet1'!A:G)
    const headers = ['NAME', 'AGE', 'STATE', 'DATE', 'TIME', 'CONSENT', 'SUBMISSION_ID'];
    const rows = db.visitorEntries.map((e) => [
      `"${e.name.replace(/"/g, '""')}"`,
      String(e.age),
      `"${(e.state || e.stateOrUt).replace(/"/g, '""')}"`,
      `"${e.date}"`,
      `"${e.time}"`,
      'TRUE',
      `"${e.submissionId || e.id}"`,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'kaveri-visitor-intake-sheet.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConnect = async () => {
    if (connecting) return;
    setConnecting(true);
    try {
      await connectGoogleSheets();
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display-app text-2xl font-bold text-[#08111f]">
            Visitor Intake & Privacy Requests ({db.visitorEntries.length})
          </h1>
          <p className="text-sm text-slate-600">
            Connected to Google Sheet{' '}
            <a
              href="https://docs.google.com/spreadsheets/d/1ln90QfuF8V0laWFUnfWcN1Mjpd-BXuYgVD6X7-xJNAg/edit?usp=drivesdk"
              target="_blank"
              rel="noreferrer"
              className="font-mono-app text-xs bg-slate-200 px-1.5 py-0.5 rounded underline hover:text-blue-700"
            >
              1ln90QfuF8V0laWFUnfWcN1Mjpd-BXuYgVD6X7-xJNAg
            </a>{' '}
            (Range <code className="font-mono-app text-xs">&apos;Sheet1&apos;!A:G</code>). Search by
            exact name or Submission UUID to inspect, edit, or delete.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {isGoogleSheetsConnected ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
              <span>
                Google Sheets Live Sync Active{googleUserEmail ? ` (${googleUserEmail})` : ''}
              </span>
              <button
                type="button"
                onClick={disconnectGoogleSheets}
                className="underline text-emerald-900 hover:text-emerald-700 ml-1 cursor-pointer"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="gsi-material-button"
              onClick={handleConnect}
              disabled={connecting}
            >
              <div className="gsi-material-button-state"></div>
              <div className="gsi-material-button-content-wrapper">
                <div className="gsi-material-button-icon">
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    style={{ display: 'block' }}
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    ></path>
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    ></path>
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    ></path>
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    ></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                </div>
                <span className="gsi-material-button-contents">Sign in with Google</span>
                <span style={{ display: 'none' }}>Sign in with Google</span>
              </div>
            </button>
          )}

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#08111f] text-white text-xs sm:text-sm font-medium hover:bg-slate-800 cursor-pointer self-start sm:self-auto"
          >
            <Download size={16} strokeWidth={1.75} />
            <span>Export Visitor Intake (.csv)</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-3 shadow-xs">
        <Search size={18} strokeWidth={1.75} className="text-slate-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search visitor entry by exact name or SUBMISSION_ID to process correction or deletion..."
          className="w-full text-sm text-slate-900 focus:outline-none"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="text-xs text-slate-500 underline cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table matching 'Sheet1'!A:G */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-[11px] font-mono-app uppercase text-slate-500 bg-slate-50">
              <th className="py-3.5 px-4">A · NAME</th>
              <th className="py-3.5 px-4">B · AGE</th>
              <th className="py-3.5 px-4">C · STATE</th>
              <th className="py-3.5 px-4">D · DATE</th>
              <th className="py-3.5 px-4">E · TIME</th>
              <th className="py-3.5 px-4">F · CONSENT</th>
              <th className="py-3.5 px-4">G · SUBMISSION_ID</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {filteredEntries.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-slate-500">
                  No matching visitor intake records found.
                </td>
              </tr>
            ) : (
              filteredEntries.map((entry) => {
                const isEditing = editingId === entry.id;
                return (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="rounded border border-slate-300 px-2.5 py-1 text-sm text-slate-900"
                        />
                      ) : (
                        <span className="font-semibold text-slate-900">{entry.name}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono-app">
                      {isEditing ? (
                        <input
                          type="number"
                          min={1}
                          max={120}
                          value={editAge}
                          onChange={(e) => setEditAge(Number(e.target.value))}
                          className="w-20 rounded border border-slate-300 px-2 py-1 text-sm text-slate-900"
                        />
                      ) : (
                        <span className="text-slate-700">{entry.age}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {isEditing ? (
                        <select
                          value={editState}
                          onChange={(e) => setEditState(e.target.value)}
                          className="rounded border border-slate-300 px-2 py-1 text-sm text-slate-900 bg-white"
                        >
                          <optgroup label="States">
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </optgroup>
                          <optgroup label="Union Territories">
                            {INDIAN_UNION_TERRITORIES.map((ut) => (
                              <option key={ut} value={ut}>
                                {ut}
                              </option>
                            ))}
                          </optgroup>
                        </select>
                      ) : (
                        <span className="text-slate-700">{entry.state || entry.stateOrUt}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono-app text-slate-700 whitespace-nowrap">
                      {entry.date}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono-app text-slate-700 whitespace-nowrap">
                      {entry.time}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono-app text-emerald-700 font-semibold">
                      TRUE
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono-app text-slate-500">
                      {entry.submissionId || entry.id}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {isEditing ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              updateVisitorEntry(entry.id, {
                                name: editName,
                                age: editAge,
                                stateOrUt: editState,
                              });
                              setEditingId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-emerald-600 text-white text-xs font-medium cursor-pointer"
                          >
                            Confirm Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : confirmDeleteId === entry.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              deleteVisitorEntry(entry.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2.5 py-1 rounded bg-rose-600 text-white text-xs font-medium cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2.5 py-1 rounded bg-slate-200 text-slate-700 text-xs cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(entry.id);
                              setConfirmDeleteId(null);
                              setEditName(entry.name);
                              setEditAge(entry.age);
                              setEditState(entry.state || entry.stateOrUt);
                            }}
                            className="p-1.5 rounded border border-slate-200 text-slate-700 hover:bg-slate-100 cursor-pointer"
                            title="Correct visitor details (syncs to Sheet1)"
                          >
                            <Edit3 size={14} strokeWidth={1.75} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(entry.id)}
                            className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
                            title="Permanently delete visitor record (syncs to Sheet1)"
                          >
                            <Trash2 size={14} strokeWidth={1.75} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* ============================================================================
   5. ADMIN SKILLS (/admin/skills)
   ============================================================================ */
export const AdminSkillsView: React.FC = () => {
  const { db, addSkill, toggleSkillActive, reorderSkill, deleteSkill } = useCMS();
  const [newSkill, setNewSkill] = useState('');

  const sortedSkills = [...db.skills].sort((a, b) => a.order - b.order);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkill.trim()) return;
    addSkill(newSkill.trim());
    setNewSkill('');
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display-app text-2xl font-bold text-[#08111f]">
          Skills ({db.skills.length})
        </h1>
        <p className="text-sm text-slate-600">
          Add, reorder, toggle visibility, or remove skills displayed in the public #skills cloud
          (index 03 is automatically highlighted as .skill-accent).
        </p>
      </div>

      <form
        onSubmit={handleAdd}
        className="bg-white rounded-xl border border-slate-200 p-4 flex gap-3 shadow-xs"
      >
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          placeholder="Add a new skill or capability..."
          className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2 text-sm text-slate-900"
        />
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#6D001A] text-white text-sm font-medium hover:bg-[#8E092B] cursor-pointer"
        >
          <Plus size={16} strokeWidth={1.75} />
          <span>Add Skill</span>
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-200 shadow-xs">
        {sortedSkills.map((sk, idx) => (
          <div
            key={sk.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono-app text-xs font-bold text-slate-400 w-6">
                {String(idx + 1).padStart(2, '0')}
              </span>
              <span className="font-display-app text-sm font-semibold text-slate-900">
                {sk.name}
              </span>
              {idx === 2 && (
                <span className="text-[11px] font-mono-app text-[#6D001A] font-semibold">
                  · .skill-accent
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => toggleSkillActive(sk.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium cursor-pointer ${
                  sk.active
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {sk.active ? 'Visible' : 'Hidden'}
              </button>
              <button
                type="button"
                onClick={() => reorderSkill(sk.id, 'up')}
                disabled={idx === 0}
                className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
              >
                <ArrowUp size={14} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => reorderSkill(sk.id, 'down')}
                disabled={idx === sortedSkills.length - 1}
                className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-35 cursor-pointer"
              >
                <ArrowDown size={14} strokeWidth={1.75} />
              </button>
              <button
                type="button"
                onClick={() => deleteSkill(sk.id)}
                className="p-1.5 rounded border border-rose-200 text-rose-600 hover:bg-rose-50 cursor-pointer"
              >
                <Trash2 size={14} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ============================================================================
   6. ADMIN PROFILE (/admin/profile)
   ============================================================================ */
export const AdminProfileView: React.FC = () => {
  const { db, updateProfile } = useCMS();
  const [form, setForm] = useState(db.profile);
  const [savedToast, setSavedToast] = useState(false);

  const handlePortraitUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, portraitUrl: dataUrl }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(form);
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display-app text-2xl font-bold text-[#08111f]">Founder Profile</h1>
        <p className="text-sm text-slate-600">
          Update Krushna Kalamkar’s identity, biography, contact emails, and hero portrait image
          (krushna-kalamkar.png).
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs"
      >
        {/* Portrait upload */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 border-b border-slate-200">
          <div className="w-28 h-36 rounded-xl overflow-hidden border border-slate-300 bg-slate-900 shrink-0">
            <img
              src={form.portraitUrl}
              alt={form.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-900">
              Founder Portrait (krushna-kalamkar.png)
            </div>
            <p className="text-xs text-slate-500">
              Displayed in the Hero 3D tilt frame (425×545px) and About page. Persisted as Base64 in
              localStorage.
            </p>
            <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#08111f] text-white text-xs font-medium cursor-pointer hover:bg-slate-800">
              <Upload size={14} strokeWidth={1.75} />
              <span>Upload Portrait Image</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePortraitUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              First Name (Hero Headline)
            </label>
            <input
              type="text"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Title
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location & Experience
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Maharashtra, India"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
              <input
                type="text"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value })}
                placeholder="3+ years"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Email</label>
            <input
              type="email"
              value={form.primaryEmail}
              onChange={(e) => setForm({ ...form, primaryEmail: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Business Email
            </label>
            <input
              type="email"
              value={form.businessEmail}
              onChange={(e) => setForm({ ...form, businessEmail: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Biography / About Copy
          </label>
          <textarea
            rows={4}
            value={form.biography}
            onChange={(e) => setForm({ ...form, biography: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          {savedToast ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
              <Check size={15} strokeWidth={1.75} />
              <span>Profile saved and updated live!</span>
            </span>
          ) : (
            <span />
          )}
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#6D001A] text-white text-sm font-medium hover:bg-[#8E092B] cursor-pointer"
          >
            <Save size={16} strokeWidth={1.75} />
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </div>
  );
};

/* ============================================================================
   7. ADMIN RESUME (/admin/resume)
   ============================================================================ */
export const AdminResumeView: React.FC = () => {
  const { db, updateSettings } = useCMS();
  const [statusMsg, setStatusMsg] = useState('');

  const handleUploadPdf = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateSettings({
      ...db.settings,
      resumePdfDataUrl: dataUrl,
      resumeFileName: file.name,
    });
    setStatusMsg(`Uploaded ${file.name} (${Math.round(file.size / 1024)} KB)`);
  };

  const handleRemoveResume = () => {
    updateSettings({
      ...db.settings,
      resumePdfDataUrl: '',
      resumeFileName: 'Krushna-Kalamkar-Resume.html',
    });
    setStatusMsg('Custom PDF removed. Public download now uses the generated HTML résumé.');
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display-app text-2xl font-bold text-[#08111f]">Résumé Management</h1>
        <p className="text-sm text-slate-600">
          Upload a custom PDF résumé (stored via FileReader Base64) or use the auto-generated
          printable HTML résumé.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-[#08111f] shrink-0">
            <FileText size={22} strokeWidth={1.75} />
          </div>
          <div>
            <div className="font-display-app font-bold text-base text-slate-900">
              {db.settings.resumePdfDataUrl
                ? `Custom PDF Active: ${db.settings.resumeFileName}`
                : 'Dynamic Studio Résumé Active (HTML/PDF Printable)'}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {db.settings.resumePdfDataUrl
                ? 'Visitors clicking "Download résumé" will download your uploaded PDF file.'
                : 'Visitors clicking "Download résumé" will receive a formatted document built from your live profile & skills.'}
            </p>
          </div>
        </div>

        {statusMsg && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
            {statusMsg}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200">
          <label className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#08111f] text-white text-xs sm:text-sm font-medium cursor-pointer hover:bg-slate-800">
            <Upload size={16} strokeWidth={1.75} />
            <span>Upload PDF Résumé</span>
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleUploadPdf}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={() =>
              triggerResumeDownload(
                db.profile,
                db.settings.resumePdfDataUrl,
                db.settings.resumeFileName,
                db.skills,
                db.categories,
                db.services
              )
            }
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 cursor-pointer"
          >
            <Download size={16} strokeWidth={1.75} />
            <span>Test Download</span>
          </button>

          {db.settings.resumePdfDataUrl && (
            <button
              type="button"
              onClick={handleRemoveResume}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-rose-200 text-rose-600 text-xs sm:text-sm font-medium hover:bg-rose-50 cursor-pointer"
            >
              <Trash2 size={15} strokeWidth={1.75} />
              <span>Remove Current PDF</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

/* ============================================================================
   8. ADMIN SETTINGS (/admin/settings)
   ============================================================================ */
export const AdminSettingsView: React.FC = () => {
  const { db, updateSettings, importDatabaseJson, resetToDefaultSeed } = useCMS();
  const [form, setForm] = useState(db.settings);
  const [feedback, setFeedback] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  const appsScriptSnippet = `function doPost(e) {
  var sheet = SpreadsheetApp.openById('1ln90QfuF8V0laWFUnfWcN1Mjpd-BXuYgVD6X7-xJNAg').getSheetByName('Sheet1');
  var data = JSON.parse(e.postData.contents);
  var action = data.action || 'append';
  var row = data.row || [data.name, Number(data.age), data.state, data.date, data.time, true, data.submissionId];

  if (action === 'append') {
    sheet.appendRow(row);
  } else {
    var values = sheet.getDataRange().getValues();
    for (var i = 0; i < values.length; i++) {
      if (String(values[i][6]) === String(data.submissionId) || String(values[i][0]).toLowerCase() === String(data.name).toLowerCase()) {
        if (action === 'update') {
          sheet.getRange(i + 1, 1, 1, 7).setValues([row]);
        } else if (action === 'delete') {
          sheet.deleteRow(i + 1);
        }
        break;
      }
    }
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}`;

  const handleBrandUpload = async (
    key: 'logoUrl' | 'footerLightLogoUrl' | 'footerDarkLogoUrl',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setForm((prev) => ({ ...prev, [key]: dataUrl }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setFeedback('Site settings, Google Sheet webhook & brand assets saved.');
    setTimeout(() => setFeedback(''), 3000);
  };

  const handleExportJson = () => {
    const json = JSON.stringify(db, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kaveri-cms-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const res = importDatabaseJson(String(reader.result || ''));
      if (res.ok) {
        setFeedback('CMS JSON backup imported successfully.');
      } else {
        setFeedback(`Import error: ${res.error}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-display-app text-2xl font-bold text-[#08111f]">Site Settings</h1>
        <p className="text-sm text-slate-600">
          Configure site metadata, Google Sheet Visitor Intake webhook, custom brand emblems, JSON
          backups, and seed reset.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Site Title</label>
            <input
              type="text"
              value={form.siteTitle}
              onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
            <input
              type="text"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Instagram URL</label>
            <input
              type="url"
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn URL</label>
            <input
              type="url"
              value={form.linkedinUrl}
              onChange={(e) => setForm({ ...form, linkedinUrl: e.target.value })}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Site Meta Description
          </label>
          <textarea
            rows={2}
            value={form.metaDescription}
            onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
          />
        </div>

        {/* Google Sheet ('Sheet1'!A:G) & Apps Script Web App Webhook Configuration */}
        <div className="border-t border-slate-200 pt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-display-app text-sm font-bold text-[#08111f]">
                Google Sheet Visitor Intake Connection (&apos;Sheet1&apos;!A:G)
              </h3>
              <p className="text-xs text-slate-500">
                Target Spreadsheet ID:{' '}
                <code className="font-mono-app text-slate-700">
                  1ln90QfuF8V0laWFUnfWcN1Mjpd-BXuYgVD6X7-xJNAg
                </code>{' '}
                · Endpoint: <code className="font-mono-app text-slate-700">POST /portfolio-api/visitor-intake</code>
              </p>
            </div>
            <a
              href="https://docs.google.com/spreadsheets/d/1ln90QfuF8V0laWFUnfWcN1Mjpd-BXuYgVD6X7-xJNAg/edit"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-blue-600 underline shrink-0"
            >
              Open Google Sheet ↗
            </a>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Apps Script Web App Webhook URL (Optional Direct Browser/Server-to-Sheet URL)
            </label>
            <input
              type="url"
              value={form.googleAppsScriptWebhookUrl || ''}
              onChange={(e) =>
                setForm({ ...form, googleAppsScriptWebhookUrl: e.target.value })
              }
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 font-mono-app"
            />
          </div>

          <details className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs">
            <summary className="font-semibold text-slate-700 cursor-pointer select-none">
              View Ready-to-Paste Google Apps Script (Extensions → Apps Script → Deploy as Web App)
            </summary>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">
                  Appends &amp; syncs [NAME, AGE, STATE, DATE, TIME, TRUE, SUBMISSION_ID] to Sheet1!A:G
                </span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(appsScriptSnippet);
                    setCopiedScript(true);
                    setTimeout(() => setCopiedScript(false), 2000);
                  }}
                  className="px-2.5 py-1 rounded bg-[#08111f] text-white text-[11px] font-medium cursor-pointer"
                >
                  {copiedScript ? 'Copied!' : 'Copy Apps Script'}
                </button>
              </div>
              <pre className="p-3 rounded bg-slate-900 text-slate-100 font-mono-app text-[11px] overflow-x-auto leading-relaxed">
                {appsScriptSnippet}
              </pre>
            </div>
          </details>
        </div>

        {/* Brand Asset Upload Slots */}
        <div className="border-t border-slate-200 pt-5 space-y-3">
          <h3 className="font-display-app text-sm font-bold text-[#08111f]">
            Brand Emblem Upload Slots (Base64 localStorage Persistence)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                key: 'logoUrl' as const,
                label: 'Header Logo (kaveri-logo.png)',
                value: form.logoUrl,
              },
              {
                key: 'footerDarkLogoUrl' as const,
                label: 'Footer Dark Logo (kaveri-footer-dark.png)',
                value: form.footerDarkLogoUrl,
              },
              {
                key: 'footerLightLogoUrl' as const,
                label: 'Footer Light Logo (kaveri-footer-light.png)',
                value: form.footerLightLogoUrl,
              },
            ].map((slot) => (
              <div
                key={slot.key}
                className="rounded-xl border border-slate-200 p-3.5 flex items-center gap-3 bg-slate-50"
              >
                <img
                  src={slot.value}
                  alt={slot.label}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover border border-slate-300 bg-black shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="text-xs font-semibold text-slate-800 truncate">{slot.label}</div>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#08111f] text-white text-[11px] font-medium cursor-pointer">
                    <Upload size={12} strokeWidth={1.75} />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBrandUpload(slot.key, e)}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-medium text-emerald-700">{feedback}</span>
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#6D001A] text-white text-sm font-medium hover:bg-[#8E092B] cursor-pointer"
          >
            <Save size={16} strokeWidth={1.75} />
            <span>Save Settings</span>
          </button>
        </div>
      </form>

      {/* Backup & Reset */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4 shadow-xs">
        <h2 className="font-display-app text-base font-bold text-[#08111f]">
          CMS Backup & Seed Reset
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleExportJson}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#08111f] text-white text-xs sm:text-sm font-medium hover:bg-slate-800 cursor-pointer"
          >
            <Download size={15} strokeWidth={1.75} />
            <span>Export Full CMS JSON Backup</span>
          </button>

          <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs sm:text-sm font-medium hover:bg-slate-50 cursor-pointer">
            <Upload size={15} strokeWidth={1.75} />
            <span>Import CMS JSON Backup</span>
            <input type="file" accept=".json,application/json" onChange={handleImportJson} className="hidden" />
          </label>

          {confirmReset ? (
            <div className="inline-flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  resetToDefaultSeed();
                  setForm(db.settings);
                  setConfirmReset(false);
                  setFeedback('CMS reset to default seeded state.');
                }}
                className="px-3 py-2 rounded-lg bg-rose-600 text-white text-xs font-medium cursor-pointer"
              >
                Confirm Reset to Default Seed
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-rose-200 text-rose-600 text-xs sm:text-sm font-medium hover:bg-rose-50 cursor-pointer"
            >
              <RotateCcw size={15} strokeWidth={1.75} />
              <span>Reset to Default Seed State</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
