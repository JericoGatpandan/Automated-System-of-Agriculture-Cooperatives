import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Card, CardContent,
} from "../../components/ui/card";

import {
  UserCircle, Sprout, Building2, Check, ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";

const API = "http://localhost:8800/api/farmers";

const STEPS = [
  { label: "Personal Information", icon: UserCircle },
  { label: "Farm Details", icon: Sprout },
  { label: "Cooperative", icon: Building2 },
  { label: "Review & Submit", icon: Check },
];

interface FormData {
  firstName: string;
  middleName: string;
  lastName: string;
  suffixName: string;
  email: string;
  password: string;
  farmName: string;
  farmLocation: string;
}

const emptyForm: FormData = {
  firstName: "", middleName: "", lastName: "", suffixName: "",
  email: "", password: "",
  farmName: "", farmLocation: "",
};

export function FarmerForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");

  // Load existing farmer for edit
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setFetchLoading(true);
        const res = await axios.get(`${API}/${id}`);
        const f = res.data.farmer;
        setForm({
          firstName: f.firstName || "",
          middleName: f.middleName || "",
          lastName: f.lastName || "",
          suffixName: f.suffixName || "",
          email: f.User?.email || "",
          password: "",
          farmName: f.farmName || "",
          farmLocation: f.farmLocation || "",
        });
      } catch {
        setError("Failed to load farmer data");
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [id, isEdit]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [field]: e.target.value });

  // Step validation
  const canProceed = () => {
    if (step === 0) {
      if (!form.firstName || !form.lastName) return false;
      if (!isEdit && (!form.email || !form.password || form.password.length < 8)) return false;
      return true;
    }
    if (step === 1) return !!form.farmLocation;
    return true;
  };

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      if (isEdit) {
        await axios.put(`${API}/${id}`, {
          firstName: form.firstName,
          middleName: form.middleName || null,
          lastName: form.lastName,
          suffixName: form.suffixName || null,
          farmName: form.farmName || null,
          farmLocation: form.farmLocation,
        });
      } else {
        await axios.post(API, {
          firstName: form.firstName,
          middleName: form.middleName || null,
          lastName: form.lastName,
          suffixName: form.suffixName || null,
          email: form.email,
          password: form.password,
          farmName: form.farmName || null,
          farmLocation: form.farmLocation,
        });
      }
      navigate("/coop/farmers");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save farmer");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Page header */}
        <h1 className="text-xl font-bold text-foreground mb-6">
          {isEdit ? "Edit Farmer" : "Register New Farmer"}
        </h1>

        {/* Stepper */}
        <div className="flex items-center gap-0 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = i === step;
            const isDone = i < step;

            return (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors ${
                      isDone
                        ? "bg-primary border-primary text-primary-foreground"
                        : isActive
                        ? "border-primary text-primary bg-primary/10"
                        : "border-muted-foreground/30 text-muted-foreground/50"
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span className={`text-xs mt-1.5 text-center ${isActive ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 -mt-5 ${i < step ? "bg-primary" : "bg-muted-foreground/20"}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step content */}
        <Card>
          <CardContent className="pt-6">
            {/* Step 0: Personal Information */}
            {step === 0 && (
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" value={form.firstName} onChange={set("firstName")} placeholder="e.g. Juan" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="middleName">Middle Name</Label>
                    <Input id="middleName" value={form.middleName} onChange={set("middleName")} placeholder="e.g. Reyes" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" value={form.lastName} onChange={set("lastName")} placeholder="e.g. Dela Cruz" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="suffixName">Suffix</Label>
                    <Input id="suffixName" value={form.suffixName} onChange={set("suffixName")} placeholder="e.g. Jr., Sr." />
                  </div>
                </div>
                {!isEdit && (
                  <>
                    <div className="border-t pt-4 mt-2">
                      <p className="text-sm font-medium mb-3 text-muted-foreground">Login Credentials</p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" value={form.email} onChange={set("email")} placeholder="e.g. farmer@email.ph" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Password *</Label>
                      <Input id="password" type="password" value={form.password} onChange={set("password")} placeholder="Minimum 8 characters" />
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 1: Farm Details */}
            {step === 1 && (
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="farmName">Farm Name</Label>
                  <Input id="farmName" value={form.farmName} onChange={set("farmName")} placeholder="e.g. Dela Cruz Farm" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="farmLocation">Farm Location *</Label>
                  <Input id="farmLocation" value={form.farmLocation} onChange={set("farmLocation")} placeholder="e.g. Bula, CamSur" />
                </div>
              </div>
            )}

            {/* Step 2: Cooperative Membership */}
            {step === 2 && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  The farmer will be automatically assigned to your cooperative.
                </p>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Your Cooperative</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Joined: {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                  <Badge variant="outline" className="border-green-500/50 text-green-700 bg-green-50 text-xs">
                    active
                  </Badge>
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold mb-2">Personal Information</h3>
                  <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">
                      {[form.firstName, form.middleName, form.lastName, form.suffixName].filter(Boolean).join(" ")}
                    </span>
                    {!isEdit && (
                      <>
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{form.email}</span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Farm Details</h3>
                  <div className="bg-muted/50 rounded-lg p-4 grid grid-cols-2 gap-y-2 text-sm">
                    <span className="text-muted-foreground">Farm Name</span>
                    <span className="font-medium">{form.farmName || "—"}</span>
                    <span className="text-muted-foreground">Location</span>
                    <span className="font-medium">{form.farmLocation}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-2">Cooperative</h3>
                  <div className="bg-muted/50 rounded-lg p-4 text-sm">
                    <span className="text-muted-foreground">Auto-assigned to your cooperative</span>
                  </div>
                </div>

                {error && <p className="text-sm text-destructive">{error}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => step === 0 ? navigate("/coop/farmers") : setStep(step - 1)}
            disabled={loading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            {step === 0 ? "Cancel" : "Back"}
          </Button>

          {step < 3 ? (
            <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} id="submit-farmer-btn">
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEdit ? "Saving…" : "Registering…"}</>
              ) : (
                isEdit ? "Save Changes" : "Register Farmer"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
