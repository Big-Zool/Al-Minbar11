import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  getGetSettingsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import type { Khutbah, KhutbahInput } from "@workspace/api-client-react";

export function AdminPanel({ password, onClose }: { password: string; onClose: () => void }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="ltr">
        <Tabs defaultValue="add">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="add">Add Khutbah</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="password">Password</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add">
            <KhutbahForm password={password} onSuccess={() => {
              queryClient.invalidateQueries({ queryKey: getListKhutbahsQueryKey() });
              queryClient.invalidateQueries({ queryKey: getGetCurrentKhutbahQueryKey() });
              toast({ title: "Khutbah saved" });
            }} />
          </TabsContent>

          <TabsContent value="manage">
            <ManageKhutbahs />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsForm />
          </TabsContent>

          <TabsContent value="password">
            <PasswordForm password={password} onPasswordChanged={onClose} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function KhutbahForm({ password, onSuccess, initialData }: { password?: string; onSuccess?: () => void; initialData?: Khutbah }) {
  const [formData, setFormData] = useState<KhutbahInput>(initialData ? {
    date: initialData.date.split("T")[0],
    isCurrent: initialData.isCurrent,
    titleAr: initialData.title.ar, titleEn: initialData.title.en, titleTr: initialData.title.tr, titleFr: initialData.title.fr, titleUr: initialData.title.ur, titleFa: initialData.title.fa,
    bodyAr: initialData.body.ar, bodyEn: initialData.body.en, bodyTr: initialData.body.tr, bodyFr: initialData.body.fr, bodyUr: initialData.body.ur, bodyFa: initialData.body.fa,
  } : {
    date: new Date().toISOString().split("T")[0],
    isCurrent: true,
    titleAr: "", titleEn: "", titleTr: "", titleFr: "", titleUr: "", titleFa: "",
    bodyAr: "", bodyEn: "", bodyTr: "", bodyFr: "", bodyUr: "", bodyFa: ""
  });

  const [translating, setTranslating] = useState(false);
  const { toast } = useToast();
  const createMutation = useCreateKhutbah();
  const updateMutation = useUpdateKhutbah();

  const handleTranslate = async () => {
    if (!formData.titleAr || !formData.bodyAr) {
      toast({ title: "Arabic required", description: "Please fill Arabic title and body first", variant: "destructive" });
      return;
    }
    setTranslating(true);
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          titleAr: formData.titleAr,
          bodyAr: formData.bodyAr,
          adminPassword: password
        })
      });
      const res = await response.json();
      setFormData(prev => ({
        ...prev,
        titleEn: res.titleEn, titleTr: res.titleTr, titleFr: res.titleFr, titleUr: res.titleUr, titleFa: res.titleFa,
        bodyEn: res.bodyEn, bodyTr: res.bodyTr, bodyFr: res.bodyFr, bodyUr: res.bodyUr, bodyFa: res.bodyFa
      }));
      toast({ title: "Translation complete" });
    } catch (e) {
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-4">
      <div className="flex justify-between items-center gap-4">
        <div className="flex-1 space-y-2">
          <Label>Date</Label>
          <Input type="date" value={formData.date} onChange={e => setFormData(p => ({ ...p, date: e.target.value }))} required />
        </div>
        <div className="flex items-center gap-2 pt-6">
          <Switch checked={formData.isCurrent} onCheckedChange={c => setFormData(p => ({ ...p, isCurrent: c }))} />
          <Label>Mark as Current</Label>
        </div>
      </div>

      <div className="space-y-4 p-4 border rounded-lg bg-muted/20">
        <h3 className="font-semibold">Arabic (Source)</h3>
        <div className="space-y-2">
          <Label>Title</Label>
          <Input value={formData.titleAr} onChange={e => setFormData(p => ({ ...p, titleAr: e.target.value }))} dir="rtl" required />
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <Textarea value={formData.bodyAr} onChange={e => setFormData(p => ({ ...p, bodyAr: e.target.value }))} dir="rtl" rows={5} required />
        </div>
        {!initialData && (
          <Button type="button" variant="secondary" onClick={handleTranslate} disabled={translating}>
            {translating ? "Translating..." : "Auto-Translate to All Languages"}
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {['En', 'Tr', 'Fr', 'Ur', 'Fa'].map(lang => (
          <div key={lang} className="space-y-2 p-4 border rounded-lg">
            <h3 className="font-semibold">{lang}</h3>
            <Input placeholder="Title" value={formData[`title${lang}` as keyof KhutbahInput] as string} onChange={e => setFormData(p => ({ ...p, [`title${lang}`]: e.target.value }))} dir={['Ur','Fa'].includes(lang) ? 'rtl' : 'ltr'} />
            <Textarea placeholder="Body" value={formData[`body${lang}` as keyof KhutbahInput] as string} onChange={e => setFormData(p => ({ ...p, [`body${lang}`]: e.target.value }))} rows={4} dir={['Ur','Fa'].includes(lang) ? 'rtl' : 'ltr'} />
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
        {initialData ? "Update Khutbah" : "Create Khutbah"}
      </Button>
    </form>
  );
}

function ManageKhutbahs() {
  const { data: khutbahs, isLoading } = useListKhutbahs();
  const deleteMutation = useDeleteKhutbah();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Khutbah | null>(null);

  if (editing) {
    return (
      <div className="pt-4 space-y-4">
        <Button variant="ghost" onClick={() => setEditing(null)}>← Back to list</Button>
        <KhutbahForm 
          initialData={editing} 
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: getListKhutbahsQueryKey() });
            queryClient.invalidateQueries({ queryKey: getGetCurrentKhutbahQueryKey() });
            setEditing(null);
          }} 
        />
      </div>
    );
  }

  return (
    <div className="pt-4 space-y-4">
      {isLoading ? <p>Loading...</p> : khutbahs?.map(k => (
        <div key={k.id} className="flex items-center justify-between p-4 border rounded-lg">
          <div>
            <h4 className="font-semibold">{k.title.en} / {k.title.ar}</h4>
            <p className="text-sm text-muted-foreground">{new Date(k.date).toLocaleDateString()} {k.isCurrent && <span className="text-secondary font-bold">(Current)</span>}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(k)}>Edit</Button>
            <Button variant="destructive" size="sm" onClick={() => {
              if (confirm("Are you sure?")) {
                deleteMutation.mutate({ id: k.id }, {
                  onSuccess: () => queryClient.invalidateQueries({ queryKey: getListKhutbahsQueryKey() })
                });
              }
            }}>Delete</Button>
          </div>
        </div>
      ))}
    </div>
  );
}

function SettingsForm() {
  const { data: settings } = useGetSettings();
  const updateMutation = useUpdateSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<any>(null);

  if (!settings && !formData) return <p>Loading...</p>;
  if (settings && !formData) setFormData(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({ data: formData }, {
      onSuccess: () => {
        toast({ title: "Settings saved" });
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <h3 className="font-semibold">About Section Text</h3>
      {['Ar', 'En', 'Tr', 'Fr', 'Ur', 'Fa'].map(lang => (
        <div key={lang} className="space-y-2">
          <Label>{lang}</Label>
          <Textarea 
            value={formData?.[`about${lang}`] || ''} 
            onChange={e => setFormData({ ...formData, [`about${lang}`]: e.target.value })}
            dir={['Ar','Ur','Fa'].includes(lang) ? 'rtl' : 'ltr'}
          />
        </div>
      ))}
      <Button type="submit" disabled={updateMutation.isPending}>Save Settings</Button>
    </form>
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
        body: JSON.stringify({ currentPassword: password, newPassword })
      });
      if (!response.ok) throw new Error("Failed");
      toast({ title: "Password updated" });
      onPasswordChanged();
    } catch (err) {
      toast({ title: "Failed to update password", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4 max-w-sm">
      <div className="space-y-2">
        <Label>New Password</Label>
        <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
      </div>
      <Button type="submit">Change Password</Button>
    </form>
  );
}
