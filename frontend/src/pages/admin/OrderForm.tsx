import axios from "axios";
import { format, parseISO } from "date-fns";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { DatePicker } from "../../components/ui/date-picker";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

import { ChevronLeft, Loader2, ShoppingCart } from "lucide-react";

const API = "http://localhost:8800/api/orders";
const CROP_API = "http://localhost:8800/api/farmers/crop-types";

interface CropType {
  cropTypeID: number;
  cropName: string;
  category: string;
}

export function OrderForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");

  const [buyerName, setBuyerName] = useState("");
  const [buyerCompany, setBuyerCompany] = useState("");
  const [buyerContact, setBuyerContact] = useState("");
  const [cropTypeID, setCropTypeID] = useState("");
  const [requestedQuantity, setRequestedQuantity] = useState("");
  const [urgencyLevel, setUrgencyLevel] = useState("normal");
  const [orderDate, setOrderDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [notes, setNotes] = useState("");

  useEffect(() => {
    axios
      .get(CROP_API)
      .then((r) => setCropTypes(r.data.cropTypes))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setFetchLoading(true);
        const res = await axios.get(`${API}/${id}`);
        const o = res.data.order;
        setBuyerName(o.buyerName);
        setBuyerCompany(o.buyerCompany || "");
        setBuyerContact(o.buyerContact);
        setCropTypeID(String(o.cropTypeID));
        setRequestedQuantity(String(o.requestedQuantity));
        setUrgencyLevel(o.urgencyLevel);
        setOrderDate(o.orderDate?.split("T")[0] || "");
        setNotes(o.notes || "");
      } catch {
        setError("Failed to load order");
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [id, isEdit]);

  const canSubmit =
    buyerName &&
    buyerContact &&
    cropTypeID &&
    requestedQuantity &&
    urgencyLevel &&
    orderDate;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = {
        buyerName,
        buyerCompany: buyerCompany || null,
        buyerContact,
        cropTypeID: parseInt(cropTypeID),
        requestedQuantity: parseInt(requestedQuantity),
        urgencyLevel,
        orderDate,
        notes: notes || null,
      };
      if (isEdit) {
        await axios.put(`${API}/${id}`, payload);
      } else {
        await axios.post(API, payload);
      }
      navigate("/admin/orders");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save order");
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
    <div className="ml-64 min-h-screen bg-gray-50/50">
      <div className="w-full mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/admin/orders")}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <ShoppingCart className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">
            {isEdit ? "Edit Order" : "New Order"}
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Buyer Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="buyerName">Buyer Name *</Label>
              <Input
                id="buyerName"
                value={buyerName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBuyerName(e.target.value)
                }
                placeholder="e.g. NFA Regional Office"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="buyerCompany">Company</Label>
              <Input
                id="buyerCompany"
                value={buyerCompany}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBuyerCompany(e.target.value)
                }
                placeholder="e.g. National Food Authority"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="buyerContact">Contact Number *</Label>
              <Input
                id="buyerContact"
                value={buyerContact}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setBuyerContact(e.target.value)
                }
                placeholder="e.g. 9171110001"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Crop Type *</Label>
              <Select value={cropTypeID} onValueChange={setCropTypeID}>
                <SelectTrigger id="cropType">
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {cropTypes.map((c) => (
                    <SelectItem key={c.cropTypeID} value={String(c.cropTypeID)}>
                      {c.cropName} ({c.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="qty">Requested Quantity (kg) *</Label>
                <Input
                  id="qty"
                  type="number"
                  min="1"
                  value={requestedQuantity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setRequestedQuantity(e.target.value)
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label>Urgency *</Label>
                <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                  <SelectTrigger id="urgency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="orderDate">Order Date *</Label>
              <DatePicker
                id="orderDate"
                date={orderDate ? parseISO(orderDate) : undefined}
                onDateChange={(value) =>
                  setOrderDate(value ? format(value, "yyyy-MM-dd") : "")
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNotes(e.target.value)
                }
                placeholder="Additional details…"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive mt-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin/orders")}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !canSubmit}
            id="submit-order-btn"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {isEdit ? "Saving…" : "Creating…"}
              </>
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Order"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
