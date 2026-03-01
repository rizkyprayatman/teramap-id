"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Copy,
  Loader2,
  LayoutTemplate,
  Code,
} from "lucide-react";
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/actions/document";
import { DOCUMENT_TYPES, TEMPLATE_PLACEHOLDERS } from "@/lib/constants";

interface Template {
  id: string;
  name: string;
  type: string;
  headerHtml: string;
  bodyHtml: string;
  footerHtml: string;
  isDefault: boolean;
  createdAt: string;
}

export function TemplateEditor({ templates }: { templates: Template[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    type: "CERTIFICATE",
    headerHtml: defaultHeaderHtml,
    bodyHtml: defaultBodyHtml,
    footerHtml: defaultFooterHtml,
  });

  const openCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      type: "CERTIFICATE",
      headerHtml: defaultHeaderHtml,
      bodyHtml: defaultBodyHtml,
      footerHtml: defaultFooterHtml,
    });
    setShowForm(true);
    setError("");
  };

  const openEdit = (t: Template) => {
    setEditingTemplate(t);
    setFormData({
      name: t.name,
      type: t.type,
      headerHtml: t.headerHtml,
      bodyHtml: t.bodyHtml,
      footerHtml: t.footerHtml,
    });
    setShowForm(true);
    setError("");
  };

  const handleSubmit = () => {
    setError("");
    const fd = new FormData();
    fd.set("name", formData.name);
    fd.set("type", formData.type);
    fd.set("headerHtml", formData.headerHtml);
    fd.set("bodyHtml", formData.bodyHtml);
    fd.set("footerHtml", formData.footerHtml);

    startTransition(async () => {
      const result = editingTemplate
        ? await updateTemplate(editingTemplate.id, fd)
        : await createTemplate(fd);

      if (result.error) {
        setError(result.error);
      } else {
        setShowForm(false);
        router.refresh();
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteTemplate(id);
      router.refresh();
    });
  };

  const copyPlaceholder = (key: string) => {
    navigator.clipboard.writeText(key);
  };

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {templates.length} template tersimpan
        </p>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Buat Template
        </Button>
      </div>

      {/* Template List */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((t) => (
          <Card key={t.id}>
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">{t.name}</CardTitle>
                <Badge variant="secondary" className="mt-1">
                  {DOCUMENT_TYPES[t.type as keyof typeof DOCUMENT_TYPES] || t.type}
                </Badge>
              </div>
              {t.isDefault && <Badge>Default</Badge>}
            </CardHeader>
            <CardContent>
              <div className="flex gap-1 mt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewTemplate(t)}
                >
                  <Eye className="mr-1 h-3 w-3" />
                  Preview
                </Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                  <Edit className="mr-1 h-3 w-3" />
                  Edit
                </Button>
                {!t.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => handleDelete(t.id)}
                    disabled={isPending}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Hapus
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <LayoutTemplate className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Belum ada template. Buat template pertama Anda.</p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Buat Template Baru"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Template</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: Sertifikat Tera Resmi"
                />
              </div>
              <div className="space-y-2">
                <Label>Jenis Dokumen</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(DOCUMENT_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Placeholders Reference */}
            <div className="border rounded-lg p-3">
              <p className="text-sm font-medium mb-2 flex items-center gap-1">
                <Code className="h-4 w-4" />
                Placeholder yang tersedia (klik untuk copy):
              </p>
              <div className="flex flex-wrap gap-1">
                {TEMPLATE_PLACEHOLDERS.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    onClick={() => copyPlaceholder(p.key)}
                    className="px-2 py-1 text-xs bg-muted rounded hover:bg-primary hover:text-primary-foreground transition-colors font-mono"
                    title={p.label}
                  >
                    {p.key}
                  </button>
                ))}
              </div>
            </div>

            <Tabs defaultValue="header">
              <TabsList>
                <TabsTrigger value="header">Header</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
                <TabsTrigger value="footer">Footer</TabsTrigger>
              </TabsList>
              <TabsContent value="header">
                <Textarea
                  value={formData.headerHtml}
                  onChange={(e) => setFormData({ ...formData, headerHtml: e.target.value })}
                  rows={8}
                  className="font-mono text-xs"
                  placeholder="HTML untuk header dokumen..."
                />
              </TabsContent>
              <TabsContent value="body">
                <Textarea
                  value={formData.bodyHtml}
                  onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                  rows={12}
                  className="font-mono text-xs"
                  placeholder="HTML untuk body dokumen..."
                />
              </TabsContent>
              <TabsContent value="footer">
                <Textarea
                  value={formData.footerHtml}
                  onChange={(e) => setFormData({ ...formData, footerHtml: e.target.value })}
                  rows={6}
                  className="font-mono text-xs"
                  placeholder="HTML untuk footer dokumen..."
                />
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Batal
              </Button>
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {editingTemplate ? "Update" : "Simpan"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Preview: {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          {previewTemplate && (
            <div className="border rounded-lg p-6 bg-white text-black space-y-4">
              <div dangerouslySetInnerHTML={{ __html: previewTemplate.headerHtml }} />
              <hr />
              <div dangerouslySetInnerHTML={{ __html: previewTemplate.bodyHtml }} />
              <hr />
              <div dangerouslySetInnerHTML={{ __html: previewTemplate.footerHtml }} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Default Template HTML
// ============================================================
const defaultHeaderHtml = `<div style="text-align:center;border-bottom:2px solid #000;padding-bottom:12px;">
  <h2 style="margin:0">{{organization_name}}</h2>
  <p style="margin:4px 0;font-size:12px;color:#555">{{organization_address}}</p>
</div>`;

const defaultBodyHtml = `<div style="margin-top:20px">
  <h3 style="text-align:center;text-decoration:underline">SERTIFIKAT TERA</h3>
  <p style="text-align:center;font-size:12px">Nomor: {{letter_number}}</p>
  
  <table style="width:100%;margin-top:20px;font-size:13px">
    <tr><td width="35%">Nama Alat</td><td width="5%">:</td><td><b>{{equipment_name}}</b></td></tr>
    <tr><td>Jenis</td><td>:</td><td>{{equipment_type}}</td></tr>
    <tr><td>Nomor Seri</td><td>:</td><td>{{serial_number}}</td></tr>
    <tr><td>Barcode</td><td>:</td><td>{{barcode}}</td></tr> 
    <tr><td>Tanggal Tera</td><td>:</td><td>{{tera_date}}</td></tr>
    <tr><td>Kadaluarsa</td><td>:</td><td>{{expiry_date}}</td></tr>
    <tr><td>Hasil</td><td>:</td><td><b>{{result}}</b></td></tr>
    <tr><td>Petugas</td><td>:</td><td>{{officer_name}}</td></tr>
    <tr><td>Lokasi</td><td>:</td><td>{{location}}</td></tr>
  </table>
</div>`;

const defaultFooterHtml = `<div style="margin-top:40px;text-align:right">
  <p>{{current_date}}</p>
  <br/><br/><br/>
  <p style="text-decoration:underline;font-weight:bold">{{signature_name}}</p>
  <p>{{signature_title}}</p>
</div>
<p style="text-align:center;margin-top:30px;font-size:10px;color:#999">
  Dokumen ini digenerate oleh TERAMAP - Platform Digital Manajemen UTTP & Tera
</p>`;
