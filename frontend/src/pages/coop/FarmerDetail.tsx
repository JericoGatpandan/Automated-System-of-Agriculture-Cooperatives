import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";

import {
  Building2,
  Calendar,
  ChevronLeft,
  CreditCard,
  Loader2,
  Mail,
  MapPin,
  Shield,
  Sprout,
  UserCircle,
} from "lucide-react";

const API = "http://localhost:8800/api/farmers";

interface FarmerDetail {
  farmerID: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  suffixName: string | null;
  farmName: string | null;
  municipality: string;
  barangay: string;
  createdAt: string;
  isDeleted: boolean;
  User?: { email: string };
  FarmerCooperatives?: {
    joinedDate: string;
    status: string;
    PrimaryCooperative?: { coopName: string };
  }[];
  Products?: {
    productID: number;
    CropType?: { cropName: string; category: string };
    unitPrice: number;
    availableQuantity: number;
    qualityGrade: string;
    updatedAt: string;
  }[];
}

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function FarmerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [farmer, setFarmer] = useState<FarmerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const backRoute = user?.role === "Admin" ? "/admin/farmers" : "/coop/farmers";

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/${id}`);
        setFarmer(res.data.farmer);
      } catch (err: any) {
        if (err.response?.status === 401) {
          logout();
          navigate("/login");
          return;
        }
        setError(err.response?.data?.message || "Failed to load farmer");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, logout, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !farmer) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                {error || "Farmer not found"}
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => navigate(backRoute)}
              >
                Back
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const fullName = [
    farmer.firstName,
    farmer.middleName,
    farmer.lastName,
    farmer.suffixName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="w-full mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(backRoute)}
            id="back-to-list"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{fullName}</h1>
            <p className="text-sm text-muted-foreground">
              {farmer.User?.email}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="personal">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="personal" className="text-xs sm:text-sm">
              Personal
            </TabsTrigger>
            <TabsTrigger value="farm" className="text-xs sm:text-sm">
              Farm
            </TabsTrigger>
            <TabsTrigger value="memberships" className="text-xs sm:text-sm">
              Memberships
            </TabsTrigger>
            <TabsTrigger value="account" className="text-xs sm:text-sm">
              Account
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Personal Information */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <UserCircle className="h-5 w-5 text-primary" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <UserCircle className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Full Name</p>
                    <p className="text-sm font-medium">{fullName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-medium">
                      {farmer.User?.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Role</p>
                    <Badge variant="secondary" className="text-xs mt-0.5">
                      Farmer
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Farm Details */}
          <TabsContent value="farm">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sprout className="h-5 w-5 text-primary" />
                  Farm Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Sprout className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Farm Name</p>
                    <p className="text-sm font-medium">
                      {farmer.farmName || "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      Farm Location
                    </p>
                    <p className="text-sm font-medium">
                      {farmer.barangay}, {farmer.municipality}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: Cooperative Memberships */}
          <TabsContent value="memberships">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Cooperative Memberships
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                {farmer.FarmerCooperatives &&
                farmer.FarmerCooperatives.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted hover:bg-muted">
                        <TableHead className="font-semibold text-muted-foreground">
                          Cooperative
                        </TableHead>
                        <TableHead className="font-semibold text-muted-foreground">
                          Joined
                        </TableHead>
                        <TableHead className="font-semibold text-muted-foreground text-center">
                          Status
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {farmer.FarmerCooperatives.map((fc, i) => (
                        <TableRow key={i}>
                          <TableCell className="py-4 font-medium">
                            {fc.PrimaryCooperative?.coopName || "Unknown"}
                          </TableCell>
                          <TableCell className="py-4">
                            {fmtDate(fc.joinedDate)}
                          </TableCell>
                          <TableCell className="py-4 text-center">
                            <Badge
                              variant="outline"
                              className={
                                fc.status === "active"
                                  ? "border-green-500/50 text-green-700 bg-green-50"
                                  : "border-gray-300 text-gray-500 bg-gray-50"
                              }
                            >
                              {fc.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-muted-foreground">
                      No cooperative memberships
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: Account Information + Products */}
          <TabsContent value="account">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="text-sm font-medium">
                        {fmtDate(farmer.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Status</p>
                      <Badge
                        variant="outline"
                        className={
                          !farmer.isDeleted
                            ? "border-green-500/50 text-green-700 bg-green-50"
                            : "border-gray-300 text-gray-500 bg-gray-50"
                        }
                      >
                        {farmer.isDeleted ? "inactive" : "active"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Products table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Products</CardTitle>
                  <CardDescription>Crops this farmer sells</CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  {farmer.Products && farmer.Products.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted hover:bg-muted">
                          <TableHead className="font-semibold text-muted-foreground">
                            Crop
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Unit Price
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground text-right">
                            Qty Available
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Grade
                          </TableHead>
                          <TableHead className="font-semibold text-muted-foreground">
                            Updated
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {farmer.Products.map((p) => (
                          <TableRow key={p.productID}>
                            <TableCell className="py-4 font-medium">
                              {p.CropType?.cropName || "—"}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono">
                              PHP {Number(p.unitPrice).toFixed(2)}
                            </TableCell>
                            <TableCell className="py-4 text-right font-mono">
                              {p.availableQuantity}
                            </TableCell>
                            <TableCell className="py-4">
                              {p.qualityGrade}
                            </TableCell>
                            <TableCell className="py-4">
                              {fmtDate(p.updatedAt)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No products listed
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
