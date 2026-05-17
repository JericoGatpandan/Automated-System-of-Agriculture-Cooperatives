import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, CheckCircle2, Clock, MoreHorizontal, Eye, RefreshCw, UserPlus, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { toast } from "sonner";
import { API_URL } from "../../lib/api";

interface PartnershipRequest {
  id: number;
  coopName: string;
  contactPerson: string;
  email: string;
  phone: string;
  message: string;
  status: string;
  createdAt: string;
}

export function AdminRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PartnershipRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PartnershipRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const token = localStorage.getItem("asac_token");
        const res = await axios.get(`${API_URL}/api/requests`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRequests(res.data);
      } catch (err) {
        console.error("Failed to load requests", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const toggleStatus = async (req: PartnershipRequest) => {
    try {
      const token = localStorage.getItem("asac_token");
      const newStatus = req.status === "pending" ? "reviewed" : "pending";
      await axios.put(`${API_URL}/api/requests/${req.id}/status`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRequests(requests.map(r => r.id === req.id ? { ...r, status: newStatus } : r));
      if (selectedRequest?.id === req.id) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const openDetails = (req: PartnershipRequest) => {
    setSelectedRequest(req);
    setIsDialogOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  if (loading) {
    return (
      <div className="ml-64 min-h-screen bg-gray-50/50 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="ml-64 min-h-screen bg-bg-canvas">
      <div className="w-full mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-strong">Partnership Inquiries</h1>
          <p className="text-text-muted">Manage incoming requests from unregistered cooperatives.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>
              Review inquiries and manually register verified cooperatives into the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-sm text-text-muted py-8 text-center">No partnership requests found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Cooperative</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((req) => (
                    <TableRow key={req.id}>
                      <TableCell>{new Date(req.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{req.coopName}</TableCell>
                      <TableCell>
                        <div className="text-sm">{req.contactPerson}</div>
                        <div className="text-xs text-text-muted">{req.email}</div>
                        <div className="text-xs text-text-muted">{req.phone}</div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-xs text-text-muted">
                        {req.message || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant={req.status === "pending" ? "default" : "secondary"} className="gap-1">
                          {req.status === "pending" ? <Clock className="h-3 w-3"/> : <CheckCircle2 className="h-3 w-3"/>}
                          <span className="capitalize">{req.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end items-center gap-2">
                          <Button size="sm" onClick={() => navigate("/admin/cooperatives")} className="gap-1">
                            <UserPlus className="h-4 w-4" />
                            <span className="hidden xl:inline">Register Coop</span>
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetails(req)} className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => toggleStatus(req)} className="cursor-pointer">
                                <RefreshCw className="h-4 w-4 mr-2" />
                                {req.status === "pending" ? "Mark as Reviewed" : "Mark as Pending"}
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              Partnership request submitted on {selectedRequest ? new Date(selectedRequest.createdAt).toLocaleDateString() : ""}
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-sm text-right text-text-muted">Status:</span>
                <div className="col-span-3">
                  <Badge variant={selectedRequest.status === "pending" ? "default" : "secondary"} className="capitalize">
                    {selectedRequest.status}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-sm text-right text-text-muted">Cooperative:</span>
                <span className="col-span-3 font-semibold text-text-strong">{selectedRequest.coopName}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-sm text-right text-text-muted">Contact:</span>
                <span className="col-span-3 text-sm text-text-default">{selectedRequest.contactPerson}</span>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-sm text-right text-text-muted">Email:</span>
                <div className="col-span-3 flex items-center gap-2">
                  <span className="text-sm text-text-default">{selectedRequest.email}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-text-muted hover:text-primary" onClick={() => copyToClipboard(selectedRequest.email, "Email")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <span className="font-medium text-sm text-right text-text-muted">Phone:</span>
                <div className="col-span-3 flex items-center gap-2">
                  <span className="text-sm text-text-default">{selectedRequest.phone}</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-text-muted hover:text-primary" onClick={() => copyToClipboard(selectedRequest.phone, "Phone number")}>
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-4 items-start gap-4">
                <span className="font-medium text-sm text-right text-text-muted mt-1">Message:</span>
                <p className="col-span-3 text-sm text-text-default bg-sidebar p-3 rounded-md min-h-[80px]">
                  {selectedRequest.message || "No message provided."}
                </p>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" onClick={() => {
              if (selectedRequest) toggleStatus(selectedRequest);
            }}>
              {selectedRequest?.status === "pending" ? "Mark Reviewed" : "Revert to Pending"}
            </Button>
            <Button onClick={() => navigate("/admin/cooperatives")} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Register Coop
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
