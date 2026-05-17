import { useCallback, useMemo, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ScrollArea } from "../../components/ui/scroll-area";
import { Pencil, Plus, Trash2, ChevronLeft, Loader2 } from "lucide-react";
import { API_URL } from "../../lib/api";

interface CropType {
  cropTypeID: number;
  cropName: string;
  category: string;
}

interface CropTypeManagementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cropTypes: CropType[];
  onSuccess: () => void;
}

const API_BASE = `${API_URL}/api`;
const CROP_TYPES_API = `${API_BASE}/products/crop-types`;

const PREDEFINED_CATEGORIES = [
  "Grain",
  "Vegetable",
  "Fruit",
  "Root Crop",
  "Plantation Crop",
  "Industrial Crop",
];

export function CropTypeManagementDialog({
  open,
  onOpenChange,
  cropTypes,
  onSuccess,
}: CropTypeManagementDialogProps) {
  const [view, setView] = useState<"list" | "form">("list");
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedCrop, setSelectedCrop] = useState<CropType | null>(null);

  const [cropName, setCropName] = useState("");
  const [category, setCategory] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const categoriesList = useMemo(() => {
    const existing = cropTypes.map((c) => c.category);
    return Array.from(new Set([...PREDEFINED_CATEGORIES, ...existing])).filter(Boolean);
  }, [cropTypes]);

  const resetForm = useCallback(() => {
    setCropName("");
    setCategory("");
    setCustomCategory("");
    setError("");
    setSelectedCrop(null);
    setFormMode("create");
    setView("list");
  }, []);

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetForm();
    onOpenChange(isOpen);
  };

  const openCreateForm = () => {
    resetForm();
    setView("form");
  };

  const openEditForm = (crop: CropType) => {
    resetForm();
    setSelectedCrop(crop);
    setCropName(crop.cropName);
    if (categoriesList.includes(crop.category)) {
      setCategory(crop.category);
    } else {
      setCategory("Other");
      setCustomCategory(crop.category);
    }
    setFormMode("edit");
    setView("form");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const name = cropName.trim();
    const finalCat = category === "Other" ? customCategory.trim() : category;

    if (!name || !finalCat) {
      setError("Crop name and category are required.");
      return;
    }

    setLoading(true);
    try {
      if (formMode === "create") {
        await axios.post(CROP_TYPES_API, {
          cropName: name,
          category: finalCat,
        });
      } else if (selectedCrop) {
        await axios.put(`${CROP_TYPES_API}/${selectedCrop.cropTypeID}`, {
          cropName: name,
          category: finalCat,
        });
      }
      onSuccess();
      resetForm();
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || "Failed to save crop type.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (crop: CropType) => {
    const confirmed = window.confirm(
      `Delete "${crop.cropName}"? This action cannot be undone.`
    );
    if (!confirmed) return;

    setError("");
    try {
      await axios.delete(`${CROP_TYPES_API}/${crop.cropTypeID}`);
      onSuccess();
    } catch (err: unknown) {
      const errorResponse = err as { response?: { data?: { message?: string } } };
      setError(errorResponse.response?.data?.message || "Failed to delete crop type.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            {view === "form" && (
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 h-8 w-8"
                onClick={() => setView("list")}
                type="button"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <DialogTitle>
              {view === "list"
                ? "Manage Crop Types"
                : formMode === "create"
                  ? "Add Crop Type"
                  : "Edit Crop Type"}
            </DialogTitle>
          </div>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {view === "list" && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Manage the master list of crops.</p>
              <Button size="sm" onClick={openCreateForm} type="button">
                <Plus className="mr-2 h-4 w-4" />
                Add Crop Type
              </Button>
            </div>

            <div className="rounded-md border">
              <ScrollArea className="h-[350px]">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground sticky top-0">
                    <tr>
                      <th className="font-medium px-4 py-2 text-left">Crop Name</th>
                      <th className="font-medium px-4 py-2 text-left">Category</th>
                      <th className="font-medium px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {cropTypes.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                          No crop types found.
                        </td>
                      </tr>
                    ) : (
                      cropTypes.map((crop) => (
                        <tr key={crop.cropTypeID} className="hover:bg-muted/30">
                          <td className="px-4 py-2 font-medium">{crop.cropName}</td>
                          <td className="px-4 py-2">{crop.category}</td>
                          <td className="px-4 py-2 text-right">
                            <div className="flex justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEditForm(crop)}
                                type="button"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDelete(crop)}
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </div>
        )}

        {view === "form" && (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cropName">Crop Name</Label>
              <Input
                id="cropName"
                placeholder="e.g. Palay (Rice)"
                value={cropName}
                onChange={(e) => setCropName(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                disabled={loading}
              >
                <option value="">— Select Category —</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="Other">Other (Custom)</option>
              </select>
              {category === "Other" && (
                <Input
                  placeholder="Enter custom category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  disabled={loading}
                  className="mt-2"
                />
              )}
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setView("list")}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formMode === "create" ? "Add Crop Type" : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
