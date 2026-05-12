import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";


import {
  AlertTriangle,
  Box,
  Eye,
  ImageIcon,
  Loader2,
  PackageSearch,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import { TablePaginationFooter } from "../../components/table-pagination-footer";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { ScrollArea } from "../../components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { Textarea } from "../../components/ui/textarea";

const API_BASE = "http://localhost:8800/api";
const API_ORIGIN = "http://localhost:8800";
const PRODUCT_API = `${API_BASE}/products`;
const FARMER_API = `${API_BASE}/farmers`;

type Mode = "admin" | "coop";

interface ProductInventoryPageProps {
  mode: Mode;
}

interface CropType {
  cropTypeID: number;
  cropName: string;
  category: string;
}

interface FarmerSummary {
  farmerID: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  suffixName?: string | null;
  farmName?: string | null;
  FarmCooperatives?: never;
  User?: { email: string };
  FarmerCooperatives?: Array<{
    primaryCoopID: number;
    PrimaryCooperative?: {
      primaryCoopID: number;
      coopName: string;
    };
  }>;
}

interface ProductRow {
  productID: number;
  farmerID: number;
  cropTypeID: number;
  unitPrice: string | number | null;
  availableQuantity: number;
  qualityGrade: string | null;
  imagePath: string | null;
  isDeleted: boolean;
  updatedAt: string | null;
  Farmer?: FarmerSummary;
  CropType?: CropType;
}

interface FarmerOption {
  farmerID: number;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  farmName?: string | null;
}

interface ProductFormState {
  farmerID: string;
  cropTypeID: string;
  unitPrice: string;
  availableQuantity: string;
  qualityGrade: string;
  imagePath: string;
}

const emptyForm: ProductFormState = {
  farmerID: "",
  cropTypeID: "",
  unitPrice: "",
  availableQuantity: "",
  qualityGrade: "",
  imagePath: "",
};

const AVAILABILITY_OPTIONS = [
  { value: "all", label: "All Stock" },
  { value: "available", label: "In Stock" },
  { value: "empty", label: "Out of Stock" },
];

const SORT_OPTIONS = [
  { value: "crop-asc", label: "Crop A-Z" },
  { value: "qty-desc", label: "Quantity: High to Low" },
  { value: "updated-desc", label: "Recently Updated" },
];

function fmtMoney(value: string | number | null | undefined) {
  const amount = Number(value || 0);
  return `PHP ${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fmtDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function availabilityLabel(quantity: number) {
  if (quantity <= 0) return "Out of Stock";
  if (quantity <= 25) return "Low Stock";
  return "In Stock";
}

function availabilityClass(quantity: number) {
  if (quantity <= 0) return "bg-gray-50 text-gray-500 border-gray-300";
  if (quantity <= 25)
    return "bg-yellow-50 text-yellow-700 border-yellow-500/50";
  return "bg-green-50 text-green-700 border-green-500/50";
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getAssetImage(product: ProductRow) {
  const cropName = product.CropType?.cropName;
  if (!cropName) return null;
  return `/crops/${slugify(cropName)}.png`;
}

function resolveImageSrc(imagePath: string | null | undefined) {
  if (!imagePath) return null;
  if (imagePath.startsWith("/uploads/")) {
    return `${API_ORIGIN}${imagePath}`;
  }
  return imagePath;
}

function getPrimaryCoopName(product: ProductRow) {
  return (
    product.Farmer?.FarmerCooperatives?.[0]?.PrimaryCooperative?.coopName ?? "—"
  );
}

function getFarmerLabel(farmer?: FarmerSummary | FarmerOption) {
  if (!farmer) return "—";
  return [farmer.lastName, farmer.firstName].filter(Boolean).join(", ");
}

function getFarmerLongLabel(farmer?: FarmerSummary | FarmerOption) {
  if (!farmer) return "—";
  const name = [farmer.lastName, farmer.firstName, farmer.middleName || ""]
    .filter(Boolean)
    .join(", ");
  return farmer.farmName ? `${name} • ${farmer.farmName}` : name;
}

function ProductImage({
  product,
  broken,
  setBroken,
}: {
  product: ProductRow;
  broken: boolean;
  setBroken: (value: boolean) => void;
}) {
  const src = resolveImageSrc(product.imagePath) || getAssetImage(product);

  if (!src || broken) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-border/70 bg-gradient-to-br from-[var(--color-bg-subtle)] to-[var(--color-bg-canvas)] text-[var(--color-text-muted)]">
        <div className="flex flex-col items-center gap-2 text-center px-4">
          <ImageIcon className="h-8 w-8" />
          <span className="text-xs font-medium uppercase tracking-[0.22em]">
            No image
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={product.CropType?.cropName || "Product image"}
      className="h-full w-full rounded-xl object-cover"
      onError={() => setBroken(true)}
    />
  );
}

export function ProductInventoryPage({ mode }: ProductInventoryPageProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pageSize = 10;
  const canManage = mode === "coop";

  const [products, setProducts] = useState<ProductRow[]>([]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [farmers, setFarmers] = useState<FarmerOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [availability, setAvailability] = useState("all");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("crop-asc");
  const [secondaryFilter, setSecondaryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  const [detailProduct, setDetailProduct] = useState<ProductRow | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [selectedProduct, setSelectedProduct] = useState<ProductRow | null>(
    null,
  );
  const [formData, setFormData] = useState<ProductFormState>(emptyForm);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [productRes, cropRes, farmerRes] = await Promise.all([
        axios.get(mode === "admin" ? PRODUCT_API : `${PRODUCT_API}/my-coop`),
        axios.get(`${PRODUCT_API}/crop-types`),
        canManage ? axios.get(`${FARMER_API}/my-coop`) : Promise.resolve(null),
      ]);

      setProducts(productRes.data.products || []);
      setCropTypes(cropRes.data.cropTypes || []);
      setFarmers((farmerRes as any)?.data?.farmers || []);
      setBrokenImages({});
    } catch (err: any) {
      if (err.response?.status === 401) {
        logout();
        navigate("/login");
        return;
      }
      setError(err.response?.data?.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  }, [canManage, logout, mode, navigate]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(() => {
    return Array.from(
      new Set(cropTypes.map((crop) => crop.category).filter(Boolean)),
    );
  }, [cropTypes]);

  const secondaryOptions = useMemo(() => {
    if (mode === "admin") {
      return Array.from(
        new Set(
          products
            .map((product) => getPrimaryCoopName(product))
            .filter((name) => name !== "—"),
        ),
      );
    }

    return farmers.map((farmer) => getFarmerLabel(farmer));
  }, [farmers, mode, products]);

  useEffect(() => {
    setSecondaryFilter("all");
  }, [mode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, availability, category, secondaryFilter, sortBy]);

  const clearSelectedImage = useCallback(() => {
    setSelectedImageFile(null);
    setSelectedImagePreview((currentPreview) => {
      if (currentPreview.startsWith("blob:")) {
        URL.revokeObjectURL(currentPreview);
      }
      return "";
    });
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    const items = products.filter((product) => {
      const cropName = product.CropType?.cropName || "";
      const cropCategory = product.CropType?.category || "";
      const farmerLabel = getFarmerLabel(product.Farmer);
      const coopName = getPrimaryCoopName(product);
      const quality = product.qualityGrade || "";

      const matchesSearch =
        !query ||
        [cropName, cropCategory, farmerLabel, coopName, quality]
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesAvailability =
        availability === "all" ||
        (availability === "available" && product.availableQuantity > 0) ||
        (availability === "empty" && product.availableQuantity <= 0);

      const matchesCategory =
        category === "all" || product.CropType?.category === category;

      const matchesSecondary =
        secondaryFilter === "all" ||
        (mode === "admin"
          ? coopName === secondaryFilter
          : farmerLabel === secondaryFilter);

      return (
        matchesSearch &&
        matchesAvailability &&
        matchesCategory &&
        matchesSecondary
      );
    });

    const sorted = [...items].sort((left, right) => {
      if (sortBy === "qty-desc") {
        return right.availableQuantity - left.availableQuantity;
      }

      if (sortBy === "updated-desc") {
        return (
          new Date(right.updatedAt || 0).getTime() -
          new Date(left.updatedAt || 0).getTime()
        );
      }

      return (
        (left.CropType?.cropName || "").localeCompare(
          right.CropType?.cropName || "",
        ) ||
        getFarmerLabel(left.Farmer).localeCompare(getFarmerLabel(right.Farmer))
      );
    });

    return sorted;
  }, [availability, category, mode, products, search, secondaryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, totalPages));
  }, [totalPages]);

  const summary = useMemo(() => {
    return {
      total: products.length,
      available: products.filter((product) => product.availableQuantity > 0)
        .length,
      empty: products.filter((product) => product.availableQuantity <= 0)
        .length,
      crops: Array.from(new Set(products.map((product) => product.cropTypeID)))
        .length,
    };
  }, [products]);

  const relatedEntries = useMemo(() => {
    if (!detailProduct)
      return [] as Array<{ label: string; quantity: number; names: string[] }>;

    if (mode === "admin") {
      const grouped = new Map<
        string,
        { label: string; quantity: number; names: string[] }
      >();

      products
        .filter((product) => product.cropTypeID === detailProduct.cropTypeID)
        .forEach((product) => {
          const coopName = getPrimaryCoopName(product);
          const key = `${coopName}-${product.cropTypeID}`;
          const current = grouped.get(key) || {
            label: coopName,
            quantity: 0,
            names: [],
          };
          current.quantity += Number(product.availableQuantity || 0);
          const farmerName = product.Farmer
            ? [product.Farmer.lastName, product.Farmer.firstName]
              .filter(Boolean)
              .join(", ")
            : "—";
          if (!current.names.includes(farmerName)) {
            current.names.push(farmerName);
          }
          grouped.set(key, current);
        });

      return Array.from(grouped.values()).sort(
        (left, right) => right.quantity - left.quantity,
      );
    }

    const grouped = new Map<
      string,
      { label: string; quantity: number; names: string[] }
    >();

    products
      .filter((product) => product.cropTypeID === detailProduct.cropTypeID)
      .forEach((product) => {
        const name = getFarmerLabel(product.Farmer);
        const key = `${product.farmerID}-${product.cropTypeID}`;
        const current = grouped.get(key) || {
          label: name,
          quantity: 0,
          names: [getFarmerLongLabel(product.Farmer)],
        };
        current.quantity += Number(product.availableQuantity || 0);
        grouped.set(key, current);
      });

    return Array.from(grouped.values()).sort(
      (left, right) => right.quantity - left.quantity,
    );
  }, [detailProduct, mode, products]);

  const openDetail = (product: ProductRow) => {
    setDetailProduct(product);
    setDetailOpen(true);
  };

  const openCreate = () => {
    clearSelectedImage();
    setFormMode("create");
    setSelectedProduct(null);
    setFormData(emptyForm);
    setFormError("");
    setFormOpen(true);
  };

  const openEdit = (product: ProductRow) => {
    clearSelectedImage();
    setFormMode("edit");
    setSelectedProduct(product);
    setFormData({
      farmerID: String(product.farmerID),
      cropTypeID: String(product.cropTypeID),
      unitPrice: String(product.unitPrice ?? ""),
      availableQuantity: String(product.availableQuantity ?? 0),
      qualityGrade: product.qualityGrade || "",
      imagePath: product.imagePath || getAssetImage(product) || "",
    });
    setSelectedImagePreview(
      resolveImageSrc(product.imagePath) || getAssetImage(product) || "",
    );
    setFormError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    clearSelectedImage();
    setFormOpen(false);
    setSelectedProduct(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async () => {
    try {
      setFormLoading(true);
      setFormError("");

      const payload = new FormData();
      payload.append("farmerID", formData.farmerID);
      payload.append("cropTypeID", formData.cropTypeID);
      payload.append(
        "unitPrice",
        formData.unitPrice === "" ? "" : String(Number(formData.unitPrice)),
      );
      payload.append(
        "availableQuantity",
        formData.availableQuantity === ""
          ? "0"
          : String(Number(formData.availableQuantity)),
      );
      payload.append("qualityGrade", formData.qualityGrade);

      if (selectedImageFile) {
        payload.append("image", selectedImageFile);
      } else if (formData.imagePath) {
        payload.append("imagePath", formData.imagePath);
      }

      if (formMode === "create") {
        await axios.post(PRODUCT_API, payload);
      } else if (selectedProduct) {
        await axios.put(`${PRODUCT_API}/${selectedProduct.productID}`, payload);
      }

      closeForm();
      await fetchProducts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setFormError(err.response?.data?.message || "Failed to save product");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (product: ProductRow) => {
    const confirmed = window.confirm(
      `Delete ${product.CropType?.cropName || "this product"}?`,
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${PRODUCT_API}/${product.productID}`);
      await fetchProducts();
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleImagePick = (file: File | null) => {
    clearSelectedImage();

    if (!file) {
      setSelectedImagePreview(formData.imagePath || "");
      return;
    }

    const preview = URL.createObjectURL(file);
    setSelectedImageFile(file);
    setSelectedImagePreview(preview);
  };

  const title =
    mode === "admin" ? "Product Inventory" : "Cooperative Product Inventory";
  const description =
    mode === "admin"
      ? "Search crops across cooperatives and inspect which groups can fulfill supply requests."
      : "Manage products listed by farmers in your cooperative and prepare supply for orders.";

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="mx-auto flex min-h-screen w-full flex-col px-6 py-8">
        <div className="mb-6 flex items-center gap-3">
          <PackageSearch className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Box className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Total
                </p>
                <p className="text-lg font-semibold">{summary.total}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <Users className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Available
                </p>
                <p className="text-lg font-semibold">{summary.available}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <AlertTriangle className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Out of Stock
                </p>
                <p className="text-lg font-semibold">{summary.empty}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-3 py-4">
              <PackageSearch className="h-5 w-5 text-primary" />
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  Crop Types
                </p>
                <p className="text-lg font-semibold">{summary.crops}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 grid gap-3 xl:grid-cols-12">
          <div className="relative xl:col-span-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="product-search"
              placeholder="Search crops, farmers, cooperatives"
              className="h-10 pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>

          <div className="xl:col-span-2">
            <Select value={availability} onValueChange={setAvailability}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Availability" />
              </SelectTrigger>
              <SelectContent>
                {AVAILABILITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="xl:col-span-2">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="xl:col-span-2">
            <Select value={secondaryFilter} onValueChange={setSecondaryFilter}>
              <SelectTrigger className="h-10">
                <SelectValue
                  placeholder={mode === "admin" ? "Cooperative" : "Farmer"}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {secondaryOptions.map((value) => (
                  <SelectItem key={value} value={value}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="xl:col-span-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <Badge variant="secondary">{filtered.length} results</Badge>
          <Badge variant="outline">
            {mode === "admin" ? "All cooperatives" : "My cooperative"}
          </Badge>
          {canManage && (
            <Button onClick={openCreate} id="add-product-btn">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
        </div>

        {error && (
          <Card className="mb-6 border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={fetchProducts}
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading products…</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex min-h-0 flex-1 flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Products</CardTitle>
              <CardDescription>
                {filtered.length} of {products.length} product
                {products.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col px-0 pb-0">
              {filtered.length === 0 ? (
                <div className="py-12 text-center">
                  <PackageSearch className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                  <p className="font-medium text-muted-foreground">
                    {search ||
                      availability !== "all" ||
                      category !== "all" ||
                      secondaryFilter !== "all"
                      ? "No products match your filters"
                      : "No products yet"}
                  </p>
                  {canManage &&
                    !search &&
                    availability === "all" &&
                    category === "all" &&
                    secondaryFilter === "all" && (
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={openCreate}
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Create first product
                      </Button>
                    )}
                </div>
              ) : (
                <div className="flex min-h-0 flex-1 flex-col">
                  <ScrollArea className="min-h-0 flex-1">
                    <Table>
                      <TableHeader>
                        <TableRow className="sticky top-0 z-10 bg-muted hover:bg-muted">
                          <TableHead className="font-semibold text-muted-foreground">
                            Image
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Crop
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Farmer
                          </TableHead>
                          {mode === "admin" && (
                            <TableHead className="font-semibold text-muted-foreground">
                              Cooperative
                            </TableHead>
                          )}
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Qty
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Price
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Grade
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-center">
                            Status
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Updated
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginated.map((product) => (
                          <TableRow
                            key={product.productID}
                            className="cursor-pointer"
                            onClick={() => openDetail(product)}
                          >
                            <TableCell className="py-4">
                              <div className="h-14 w-14 overflow-hidden rounded-xl border border-border/70 bg-background">
                                <ProductImage
                                  product={product}
                                  broken={Boolean(
                                    brokenImages[product.productID],
                                  )}
                                  setBroken={(value) =>
                                    setBrokenImages((current) => ({
                                      ...current,
                                      [product.productID]: value,
                                    }))
                                  }
                                />
                              </div>
                            </TableCell>
                            <TableCell className="py-4 font-semibold">
                              {product.CropType?.cropName || "—"}
                            </TableCell>
                            <TableCell className="py-4">
                              {getFarmerLabel(product.Farmer)}
                            </TableCell>
                            {mode === "admin" && (
                              <TableCell className="py-4">
                                {getPrimaryCoopName(product)}
                              </TableCell>
                            )}
                            <TableCell className="py-4 text-right font-mono">
                              {Number(
                                product.availableQuantity || 0,
                              ).toLocaleString()}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono">
                              {fmtMoney(product.unitPrice)}
                            </TableCell>
                            <TableCell className="py-4">
                              {product.qualityGrade || "—"}
                            </TableCell>
                            <TableCell className="py-4 text-center">
                              <Badge
                                variant="outline"
                                className={availabilityClass(
                                  product.availableQuantity,
                                )}
                              >
                                {availabilityLabel(product.availableQuantity)}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-4">
                              {fmtDate(product.updatedAt)}
                            </TableCell>
                            <TableCell className="py-4 text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    openDetail(product);
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                {canManage && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        openEdit(product);
                                      }}
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={(event) => {
                                        event.stopPropagation();
                                        handleDelete(product);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                  <TablePaginationFooter
                    currentPage={currentPage}
                    pageSize={pageSize}
                    totalCount={filtered.length}
                    onPageChange={setCurrentPage}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
            <DialogDescription>
              Inventory information and connected farmers or cooperatives.
            </DialogDescription>
          </DialogHeader>

          {detailProduct && (
            <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
              <div className="h-56 overflow-hidden rounded-2xl border border-border/70 bg-muted">
                <ProductImage
                  product={detailProduct}
                  broken={Boolean(brokenImages[detailProduct.productID])}
                  setBroken={(value) =>
                    setBrokenImages((current) => ({
                      ...current,
                      [detailProduct.productID]: value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    {detailProduct.CropType?.cropName || "Product"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {detailProduct.CropType?.category || "Uncategorized"}
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Farmer
                      </p>
                      <p className="mt-1 font-medium">
                        {getFarmerLongLabel(detailProduct.Farmer)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Quantity
                      </p>
                      <p className="mt-1 font-medium">
                        {Number(
                          detailProduct.availableQuantity || 0,
                        ).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Price
                      </p>
                      <p className="mt-1 font-medium">
                        {fmtMoney(detailProduct.unitPrice)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Grade
                      </p>
                      <p className="mt-1 font-medium">
                        {detailProduct.qualityGrade || "—"}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Updated
                      </p>
                      <p className="mt-1 font-medium">
                        {fmtDate(detailProduct.updatedAt)}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="py-4">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        Status
                      </p>
                      <Badge
                        variant="outline"
                        className={`mt-1 ${availabilityClass(detailProduct.availableQuantity)}`}
                      >
                        {availabilityLabel(detailProduct.availableQuantity)}
                      </Badge>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">
                      {mode === "admin"
                        ? "Cooperatives with this crop"
                        : "Farmers with this crop"}
                    </CardTitle>
                    <CardDescription>
                      Products sharing this crop type help match order
                      fulfillment.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {relatedEntries.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No related inventory found.
                      </p>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {relatedEntries.map((entry) => (
                          <div
                            key={`${entry.label}-${entry.quantity}`}
                            className="rounded-xl border border-border/70 bg-muted/20 p-3"
                          >
                            <p className="font-medium">{entry.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {entry.names.join(" • ")}
                            </p>
                            <p className="mt-2 text-sm text-muted-foreground">
                              Total quantity:{" "}
                              {Number(entry.quantity || 0).toLocaleString()}
                            </p>

                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <div className="flex flex-col px-4 gap-4">
                    <p >This product has <span className="text-primary font-bold font">2</span> unassigned orders.</p>
                    <Button className="px-4" size="sm">
                      <Plus className="h-4 w-4 mr-1" />
                      Assign orders to Cooperative
                    </Button>
                  </div>
                </Card>


              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {formMode === "create" ? "Add Product" : "Edit Product"}
            </DialogTitle>
            <DialogDescription>
              Cooperative officers can manage product listings and attach an
              optional image path.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="space-y-3">
              <div className="h-56 overflow-hidden rounded-2xl border border-border/70 bg-muted">
                {selectedImagePreview || formData.imagePath ? (
                  <img
                    src={
                      selectedImagePreview ||
                      resolveImageSrc(formData.imagePath) ||
                      ""
                    }
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <ImageIcon className="mx-auto mb-2 h-8 w-8" />
                      <p className="text-sm">Optional image preview</p>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <Label htmlFor="product-image">Image file</Label>
                <Input
                  id="product-image"
                  type="file"
                  accept="image/*"
                  className="mt-2"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null;
                    handleImagePick(file);
                  }}
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  The selected file is saved in the backend uploads folder and
                  the database stores only its relative path.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="product-farmer">Farmer</Label>
                <Select
                  value={formData.farmerID}
                  onValueChange={(value) =>
                    setFormData((current) => ({ ...current, farmerID: value }))
                  }
                >
                  <SelectTrigger id="product-farmer">
                    <SelectValue placeholder="Select farmer" />
                  </SelectTrigger>
                  <SelectContent>
                    {farmers.map((farmer) => (
                      <SelectItem
                        key={farmer.farmerID}
                        value={String(farmer.farmerID)}
                      >
                        {getFarmerLongLabel(farmer)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-crop">Crop type</Label>
                <Select
                  value={formData.cropTypeID}
                  onValueChange={(value) =>
                    setFormData((current) => ({
                      ...current,
                      cropTypeID: value,
                    }))
                  }
                >
                  <SelectTrigger id="product-crop">
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropTypes.map((crop) => (
                      <SelectItem
                        key={crop.cropTypeID}
                        value={String(crop.cropTypeID)}
                      >
                        {crop.cropName} — {crop.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-price">Unit price</Label>
                <Input
                  id="product-price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      unitPrice: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-qty">Available quantity</Label>
                <Input
                  id="product-qty"
                  type="number"
                  min="0"
                  value={formData.availableQuantity}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      availableQuantity: event.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="product-grade">Quality grade</Label>
                <Textarea
                  id="product-grade"
                  rows={3}
                  value={formData.qualityGrade}
                  onChange={(event) =>
                    setFormData((current) => ({
                      ...current,
                      qualityGrade: event.target.value,
                    }))
                  }
                  placeholder="Optional grade or notes"
                />
              </div>

              {formError && (
                <p className="md:col-span-2 text-sm text-destructive">
                  {formError}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeForm}
              disabled={formLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={formLoading}>
              {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formMode === "create" ? "Create Product" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ProductInventoryPage;
