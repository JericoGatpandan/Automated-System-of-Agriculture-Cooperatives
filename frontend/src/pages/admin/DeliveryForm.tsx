import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Button } from "../../components/ui/button";
import {
  Card, CardContent, CardHeader, CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { Textarea } from "../../components/ui/textarea";

import { ChevronLeft, Loader2, Truck } from "lucide-react";

const API = "http://localhost:8800/api/deliveries";
const ORDER_API = "http://localhost:8800/api/orders";

interface OrderOption {
  orderID: number;
  buyerName: string;
  status: string;
}

export function DeliveryForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [orders, setOrders] = useState<OrderOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState("");

  const [orderID, setOrderID] = useState("");
  const [consolidationDate, setConsolidationDate] = useState(new Date().toISOString().split("T")[0]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [totalTransactionAmount, setTotalTransactionAmount] = useState("");
  const [commissionRateFederation, setCommissionRateFederation] = useState("0.03");
  const [commissionRateCoop, setCommissionRateCoop] = useState("0.05");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    axios.get(ORDER_API).then((r) => {
      const allOrders = r.data.orders || [];
      const eligible = allOrders.filter((o: OrderOption) => ["consolidated", "inProgress"].includes(o.status));
      if (isEdit && orderID) {
        const currentOrder = allOrders.find((o: OrderOption) => String(o.orderID) === orderID);
        if (currentOrder && !eligible.some((o: OrderOption) => o.orderID === currentOrder.orderID)) {
          eligible.push(currentOrder);
        }
      }
      setOrders(eligible);
    }).catch(() => {});
  }, [isEdit, orderID]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setFetchLoading(true);
        const res = await axios.get(`${API}/${id}`);
        const d = res.data.delivery;
        setOrderID(String(d.orderID));
        setConsolidationDate(d.consolidationDate?.split("T")[0] || "");
        setDeliveryDate(d.deliveryDate?.split("T")[0] || "");
        setTotalTransactionAmount(String(d.totalTransactionAmount));
        setCommissionRateFederation(String(d.commissionRateFederation));
        setCommissionRateCoop(String(d.commissionRateCoop));
        setNotes(d.notes || "");
      } catch {
        setError("Failed to load delivery");
      } finally {
        setFetchLoading(false);
      }
    })();
  }, [id, isEdit]);

  const canSubmit = orderID && consolidationDate && totalTransactionAmount && commissionRateFederation && commissionRateCoop;

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = {
        orderID: parseInt(orderID),
        consolidationDate,
        totalTransactionAmount: parseFloat(totalTransactionAmount),
        commissionRateFederation: parseFloat(commissionRateFederation),
        commissionRateCoop: parseFloat(commissionRateCoop),
        notes: notes || null,
      };
      if (isEdit) {
        await axios.put(`${API}/${id}`, payload);
      } else {
        await axios.post(API, payload);
      }
      navigate("/admin/deliveries");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to save delivery");
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
          <Button variant="ghost" size="icon" onClick={() => navigate("/admin/deliveries")}>
            <ChevronLeft />
          </Button>
          <Truck className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-bold text-foreground">{isEdit ? "Edit Delivery" : "New Delivery"}</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Delivery Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label>Order *</Label>
              <Select value={orderID} onValueChange={setOrderID} disabled={isEdit}>
                <SelectTrigger id="orderSelect"><SelectValue placeholder="Select order" /></SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {orders.map((o) => (
                      <SelectItem key={o.orderID} value={String(o.orderID)}>
                        ORD-{o.orderID} — {o.buyerName} ({o.status})
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="consolidationDate">Consolidation Date *</Label>
              <Input id="consolidationDate" type="date" value={consolidationDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConsolidationDate(e.target.value)} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="deliveryDate">Delivery Date</Label>
              <Input
                id="deliveryDate"
                type="date"
                value={deliveryDate}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryDate(e.target.value)}
                placeholder="Set when marking delivered"
                disabled
              />
              <p className="text-xs text-muted-foreground">Set when marking the delivery as delivered</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="totalAmount">Total Transaction Amount (PHP) *</Label>
              <Input id="totalAmount" type="number" min="1" step="0.01" value={totalTransactionAmount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTotalTransactionAmount(e.target.value)}
                placeholder="e.g. 45000.00" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="fedRate">Federation Rate *</Label>
                <Input id="fedRate" type="number" min="0" max="1" step="0.01" value={commissionRateFederation}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommissionRateFederation(e.target.value)} />
                <p className="text-xs text-muted-foreground">e.g. 0.03 = 3%</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="coopRate">Cooperative Rate *</Label>
                <Input id="coopRate" type="number" min="0" max="1" step="0.01" value={commissionRateCoop}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCommissionRateCoop(e.target.value)} />
                <p className="text-xs text-muted-foreground">e.g. 0.05 = 5%</p>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNotes(e.target.value)}
                placeholder="Additional details…" rows={3} />
            </div>
          </CardContent>
        </Card>

        {error && <p className="text-sm text-destructive mt-4">{error}</p>}

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={() => navigate("/admin/deliveries")} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !canSubmit} id="submit-delivery-btn">
            {loading ? <><Loader2 data-icon="inline-start" className="animate-spin" />{isEdit ? "Saving…" : "Creating…"}</>
              : isEdit ? "Save Changes" : "Create Delivery"}
          </Button>
        </div>
      </div>
    </div>
  );
}
