import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  useCreateKhutbah,
  useListKhutbahs,
  useUpdateKhutbah,
  useDeleteKhutbah,
  useGetSettings,
  useUpdateSettings,
  getListKhutbahsQueryKey,
  getGetCurrentKhutbahQueryKey,
  getGetSettingsQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Khutbah, KhutbahInput } from "@workspace/api-client-react";

type AdminView = "new" | "manage" | "about" | "password";

export function AdminPanel({ password, onClose }: { password: string; onClose: () => void }) {
  const [activeView, setActiveView] = useState<AdminView>("new");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const nav: { id: AdminView; icon: string; label: string }[] = [
    { id: "new", icon: "add_circle", label: "New Khutbah" },
    { id: "manage", icon: "list_alt", label: "Manage Sermons" },
    { id: "about", icon: "edit_note", label: "Edit About" },
    { id: "password", icon: "password", label: "Change Password" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex" style={{ background: "rgba(46,50,48,0.5)", backdropFilter: "blur(4px)" }}>
      <div className="m-auto w-full max-w-5xl max-h-[92vh] flex rounded-2xl overflow-hidden shadow-2xl" style={{ background: "#faf6f0" }}>
        {/* Sidebar */}
        <aside className="w-52 flex-shrink-0 flex flex-col" style={{ background: "#f0ece4", borderRight: "1px solid #e4e0d8" }}>
          <div className="px-5 pt-6 pb-4">
            <h2 className="font-headline text-base font-bold" style={{ color: "#2e3230" }}>Admin Console</h2>
            <p className="font-body text-xs" style={{ color: "#74796e" }}>Sermon Management System</p>
          </div>
          <nav className="flex-1 px-3 space-y-1">
            {nav.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all font-body text-sm font-medium text-left"
                style={activeView === item.id
                  ? { background: "#4a7c59", color: "#ffffff" }
                  : { color: "#4a4e4a" }
                }
              >
                <span className="material-symbols-outlined flex-shrink-0" style={{ fontSize: 18, color: activeView === item.id ? "#ffffff" : "#74796e" }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="px-3 pb-4 mt-2" style={{ borderTop: "1px solid #e4e0d8", paddingTop: 12 }}>
            <button
              onClick={onClose}
              className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all font-body text-sm font-medium"
              style={{ color: "#b83230" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#b83230" }}>logout</span>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 overflow-y-auto">
          {activeView === "new" && (
            <KhutbahForm
              password={password}
              onSuccess={() => {
                queryClient.invalidateQueries({ queryKey: getListKhutbahsQueryKey() });
                queryClient.invalidateQueries({ queryKey: getGetCurrentKhutbahQueryKey() });
                toast({ title: "Khutbah published successfully" });
              }}
            />
          )}
          {activeView === "manage" && <ManageKhutbahs password={password} />}
          {activeView === "about" && (
            <SettingsForm onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
              toast({ title: "Settings saved" });
            }} />
          )}
          {activeView === "password" && <PasswordForm password={password} onPasswordChanged={onClose} />}
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-7">
      <h1 className="font-headline text-2xl font-bold" style={{ color: "#2e3230" }}>{title}</h1>
      {subtitle && <p className="font-body text-sm mt-1" style={{ color: "#74796e" }}>{subtitle}</p>}
    </div>
  );
}

function LangBadge({ lang, children }: { lang: string; children: React.ReactNode }) {
  const isRtl = ["Urdu", "Farsi", "Arabic"].includes(lang);
  return (
    <div className="rounded-xl p-5" style={{ background: "#f5f1ea", border: "1px solid rgba(196,200,188,0.4)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="font-body text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded-full" style={{ background: "#e4e0d8", color: "#4a4e4a" }}>{lang}</span>
      </div>
      <div dir={isRtl ? "rtl" : "ltr"}>{children}</div>
    </div>
  );
}

function KhutbahForm({
  password,
  onSuccess,
  initialData,
}: {
  password?: string;
  onSuccess?: () => void;
  initialData?: Khutbah;
}) {
  const [formData, setFormData] = useState<KhutbahInput>(
    initialData
      ? {
          date: initialData.date.split("T")[0],
          isCurrent: initialData.isCurrent,
          titleAr: initialData.title.ar, titleEn: initialData.title.en, titleTr: initialData.title.tr,
          titleFr: initialData.title.fr, titleUr: initialData.title.ur, titleFa: initialData.title.fa,
          bodyAr: initialData.body.ar, bodyEn: initialData.body.en, bodyTr: initialData.body.tr,
          bodyFr: initialData.body.fr, bodyUr: initialData.body.ur, bodyFa: initialData.body.fa,
        }
      : {
          date: new Date().toISOString().split("T")[0],
          isCurrent: true,
          titleAr: "", titleEn: "", titleTr: "", titleFr: "", titleUr: "", titleFa: "",
          bodyAr: "", bodyEn: "", bodyTr: "", bodyFr: "", bodyUr: "", bodyFa: "",
        }
  );
  const [translating, setTranslating] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateKhutbah();
  const updateMutation = useUpdateKhutbah();

  const handleTranslate = async () => {
    if (!formData.titleAr || !formData.bodyAr) {
      toast({ title: "Arabic content required", description: "Please fill in the Arabic title and body first.", variant: "destructive" });
      return;
    }
    setTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titleAr: formData.titleAr, bodyAr: formData.bodyAr, adminPassword: password }),
      });
      const res = await response.json();
      setFormData((prev) => ({
        ...prev,
        titleEn: res.titleEn, titleTr: res.titleTr, titleFr: res.titleFr, titleUr: res.titleUr, titleFa: res.titleFa,
        bodyEn: res.bodyEn, bodyTr: res.bodyTr, bodyFr: res.bodyFr, bodyUr: res.bodyUr, bodyFa: res.bodyFa,
      }));
      toast({ title: "Translation complete" });
    } catch {
      toast({ title: "Translation failed", variant: "destructive" });
    } finally {
      setTranslating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (initialData) {
      updateMutation.mutate({ id: initialData.id, data: formData }, { onSuccess });
    } else {
      createMutation.mutate({ data: formData }, { onSuccess });
    }
  };

  const inputCls = "w-full rounded-xl font-body text-sm py-3 px-4 outline-none transition-all focus:ring-2 focus:ring-[#4a7c59]/20";
  const inputStyle = { background: "#f0ece4", border: "none", color: "#2e3230" };
  const labelCls = "font-body text-sm font-semibold mb-1.5 block";
  const labelStyle = { color: "#4a7c59" };

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <div className="flex items-center justify-between mb-7">
        <div>
          <h1 className="font-headline text-2xl font-bold" style={{ color: "#2e3230" }}>
            {initialData ? "Edit Khutbah" : "Add New Khutbah"}
          </h1>
          <p className="font-body text-sm mt-1" style={{ color: "#74796e" }}>
            Publish the weekly sermon for the congregation.
          </p>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <div className="relative">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={formData.isCurrent}
              onChange={(e) => setFormData((p) => ({ ...p, isCurrent: e.target.checked }))}
            />
            <div className="w-10 h-6 rounded-full transition-colors peer-checked:bg-[#4a7c59]" style={{ background: "#c4c8bc" }}>
              <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform peer-checked:translate-x-4 shadow" />
            </div>
          </div>
          <span className="font-body text-sm" style={{ color: "#4a4e4a" }}>Set as Current</span>
        </label>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelCls} style={labelStyle}>Sermon Date</label>
            <input
              type="date"
              className={inputCls}
              style={inputStyle}
              value={formData.date}
              onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className={labelCls} style={labelStyle}>Title (Arabic)</label>
            <input
              type="text"
              className={`${inputCls} font-headline`}
              style={{ ...inputStyle, fontSize: "1.1rem" }}
              dir="rtl"
              placeholder="عنوان الخطبة..."
              value={formData.titleAr}
              onChange={(e) => setFormData((p) => ({ ...p, titleAr: e.target.value }))}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelCls} style={labelStyle}>Primary Content (Arabic)</label>
          <textarea
            className={`${inputCls} leading-relaxed font-headline`}
            style={{ ...inputStyle, fontSize: "1.05rem", resize: "vertical" }}
            dir="rtl"
            rows={7}
            placeholder="اكتب نص الخطبة هنا باللغة العربية..."
            value={formData.bodyAr}
            onChange={(e) => setFormData((p) => ({ ...p, bodyAr: e.target.value }))}
            required
          />
        </div>

        <div className="flex items-center justify-between rounded-xl p-5" style={{ background: "#f0e8db", border: "1px solid rgba(196,200,188,0.3)" }}>
          <div>
            <h3 className="font-body font-bold text-sm" style={{ color: "#5e5548" }}>Automated Translation</h3>
            <p className="font-body text-xs mt-0.5" style={{ color: "#74796e" }}>
              Translate the Arabic text into all supported languages via AI.
            </p>
          </div>
          <button
            type="button"
            onClick={handleTranslate}
            disabled={translating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-body font-bold text-sm transition-all active:scale-95 shadow-sm disabled:opacity-60"
            style={{ background: "#4a7c59", color: "#ffffff" }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>translate</span>
            {translating ? "Translating..." : "Translate All"}
          </button>
        </div>

        <div>
          <LangBadge lang="English">
            <label className={labelCls} style={labelStyle}>Title</label>
            <input type="text" className={inputCls} style={inputStyle} placeholder="English title..." value={formData.titleEn} onChange={(e) => setFormData((p) => ({ ...p, titleEn: e.target.value }))} />
            <label className={`${labelCls} mt-3`} style={labelStyle}>Body</label>
            <textarea className={inputCls} style={{ ...inputStyle, resize: "vertical" }} rows={4} placeholder="The English translation will appear here after clicking translate..." value={formData.bodyEn} onChange={(e) => setFormData((p) => ({ ...p, bodyEn: e.target.value }))} />
          </LangBadge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { key: "Fr", lang: "French", placeholder: "Traduction française..." },
            { key: "Ur", lang: "Urdu", placeholder: "اردو ترجمہ..." },
            { key: "Tr", lang: "Turkish", placeholder: "Türkçe çeviri..." },
            { key: "Fa", lang: "Farsi", placeholder: "ترجمه فارسی..." },
          ].map(({ key, lang, placeholder }) => (
            <LangBadge key={key} lang={lang}>
              <input
                type="text"
                className={inputCls}
                style={inputStyle}
                placeholder={`${lang} title...`}
                value={formData[`title${key}` as keyof KhutbahInput] as string}
                onChange={(e) => setFormData((p) => ({ ...p, [`title${key}`]: e.target.value }))}
              />
              <textarea
                className={`${inputCls} mt-2`}
                style={{ ...inputStyle, resize: "vertical" }}
                rows={3}
                placeholder={placeholder}
                value={formData[`body${key}` as keyof KhutbahInput] as string}
                onChange={(e) => setFormData((p) => ({ ...p, [`body${key}`]: e.target.value }))}
              />
            </LangBadge>
          ))}
        </div>

        <div className="flex justify-end gap-3 pt-4" style={{ borderTop: "1px solid #e4e0d8" }}>
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="px-10 py-3 rounded-xl font-body font-bold text-sm transition-all active:scale-95 shadow-md disabled:opacity-60"
            style={{ background: "#4a7c59", color: "#ffffff" }}
          >
            {createMutation.isPending || updateMutation.isPending
              ? "Saving..."
              : initialData
              ? "Update Khutbah"
              : "Publish Khutbah"}
          </button>
        </div>
      </div>
    </form>
  );
}

function ManageKhutbahs({ password }: { password: string }) {
  const { data: khutbahs, isLoading } = useListKhutbahs();
  const deleteMutation = useDeleteKhutbah();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Khutbah | null>(null);

  if (editing) {
    return (
      <div className="p-8">
        <button
          onClick={() => setEditing(null)}
          className="flex items-center gap-2 font-body text-sm font-semibold mb-6 transition-colors"
          style={{ color: "#4a7c59" }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
          Back to list
        </button>
        <KhutbahForm
          password={password}
          initialData={editing}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: getListKhutbahsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetCurrentKhutbahQueryKey() });
            setEditing(null);
            toast({ title: "Khutbah updated" });
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-8">
      <SectionHeader title="Manage Sermons" subtitle="Edit or delete existing khutbahs." />
      {isLoading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: "#f0ece4" }} />)}
        </div>
      ) : (
        <div className="space-y-3">
          {khutbahs?.map((k) => (
            <div
              key={k.id}
              className="flex items-center justify-between rounded-xl px-5 py-4"
              style={{ background: "#f5f1ea", border: "1px solid rgba(196,200,188,0.4)" }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-body font-bold text-sm" style={{ color: "#2e3230" }}>
                    {k.title.en || k.title.ar}
                  </h4>
                  {k.isCurrent && (
                    <span className="font-body text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: "#c8e8d0", color: "#2a6038" }}>
                      Current
                    </span>
                  )}
                </div>
                <p className="font-body text-xs mt-0.5" style={{ color: "#74796e" }}>
                  {new Date(k.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditing(k)}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-body text-xs font-semibold transition-all"
                  style={{ background: "#f0ece4", color: "#4a7c59", border: "1px solid #c4c8bc" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm("Delete this khutbah?")) {
                      deleteMutation.mutate({ id: k.id }, {
                        onSuccess: () => {
                          queryClient.invalidateQueries({ queryKey: getListKhutbahsQueryKey() });
                          toast({ title: "Khutbah deleted" });
                        },
                      });
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg font-body text-xs font-semibold transition-all"
                  style={{ background: "#ffdad8", color: "#b83230" }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 14 }}>delete</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsForm({ onSuccess }: { onSuccess?: () => void }) {
  const { data: settings } = useGetSettings();
  const updateMutation = useUpdateSettings();
  const [formData, setFormData] = useState<Record<string, string> | null>(null);

  if (settings && !formData) setFormData(settings as unknown as Record<string, string>);

  const inputCls = "w-full rounded-xl font-body text-sm py-3 px-4 outline-none transition-all focus:ring-2 focus:ring-[#4a7c59]/20";
  const inputStyle = { background: "#f0ece4", border: "none", color: "#2e3230", resize: "vertical" as const };

  const langs = [
    { key: "Ar", label: "Arabic", rtl: true },
    { key: "En", label: "English" },
    { key: "Tr", label: "Turkish" },
    { key: "Fr", label: "French" },
    { key: "Ur", label: "Urdu", rtl: true },
    { key: "Fa", label: "Farsi", rtl: true },
  ];

  return (
    <div className="p-8">
      <SectionHeader title="Edit About Section" subtitle="Update the about text shown to visitors in each language." />
      <div className="space-y-4">
        {langs.map(({ key, label, rtl }) => (
          <div key={key}>
            <label className="font-body text-sm font-semibold mb-1.5 block" style={{ color: "#4a7c59" }}>{label}</label>
            <textarea
              className={inputCls}
              style={{ ...inputStyle }}
              dir={rtl ? "rtl" : "ltr"}
              rows={2}
              value={formData?.[`about${key}`] || ""}
              onChange={(e) => setFormData((d) => ({ ...d!, [`about${key}`]: e.target.value }))}
            />
          </div>
        ))}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => formData && updateMutation.mutate({ data: formData as any }, { onSuccess })}
            disabled={updateMutation.isPending}
            className="px-8 py-3 rounded-xl font-body font-bold text-sm shadow-sm disabled:opacity-60 transition-all active:scale-95"
            style={{ background: "#4a7c59", color: "#ffffff" }}
          >
            {updateMutation.isPending ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordForm({ password, onPasswordChanged }: { password: string; onPasswordChanged: () => void }) {
  const [newPassword, setNewPassword] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/admin/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: password, newPassword }),
      });
      if (!response.ok) throw new Error("Failed");
      toast({ title: "Password updated successfully" });
      onPasswordChanged();
    } catch {
      toast({ title: "Failed to update password", variant: "destructive" });
    }
  };

  return (
    <div className="p-8 max-w-sm">
      <SectionHeader title="Change Password" subtitle="Update your admin password." />
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="font-body text-sm font-semibold mb-1.5 block" style={{ color: "#4a7c59" }}>New Password</label>
          <input
            type="password"
            className="w-full rounded-xl font-body text-sm py-3 px-4 outline-none focus:ring-2 focus:ring-[#4a7c59]/20"
            style={{ background: "#f0ece4", border: "none", color: "#2e3230" }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            minLength={6}
            autoFocus
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 rounded-xl font-body font-bold text-sm shadow-sm transition-all active:scale-95"
          style={{ background: "#4a7c59", color: "#ffffff" }}
        >
          Update Password
        </button>
      </form>
    </div>
  );
}
