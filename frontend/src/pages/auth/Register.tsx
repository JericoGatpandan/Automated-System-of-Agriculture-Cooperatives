import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";
import { MapPin, Phone, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { API_URL } from "../../lib/api";

export function Register() {
  const [formData, setFormData] = useState({
    coopName: "",
    contactPerson: "",
    email: "",
    phone: "",
    message: ""
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await axios.post(`${API_URL}/api/requests`, formData);
      setSuccess(true);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit request. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-bg-canvas">
      {/* Left Column: Contact & Location */}
      <div className="hidden lg:flex flex-col w-1/2 bg-sidebar border-r border-border p-12">
        <Button 
          variant="ghost" 
          className="w-fit mb-8 gap-2 -ml-4 hover:bg-transparent" 
          onClick={() => navigate("/login")}
        >
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Button>
        
        <div className="max-w-xl space-y-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-sidebar-foreground">
              Partner with FACCS
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Join the Federation of Agriculture Cooperatives in Camarines Sur and access the ASAC system.
            </p>
            <div className="h-1 w-12 bg-primary mt-6 rounded"></div>
          </div>

          <div className="space-y-6 text-sidebar-foreground">
            <div className="flex items-start gap-4">
              <MapPin className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Office Address</h3>
                <p className="text-muted-foreground">300 J Miranda Ave<br/>Naga City, Camarines Sur<br/>Philippines, 4430</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Phone className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Contact Number</h3>
                <p className="text-muted-foreground">0948 933 4240</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Mail className="h-6 w-6 text-primary shrink-0" />
              <div>
                <h3 className="font-semibold text-lg">Email Address</h3>
                <p className="text-muted-foreground">federation.agricoops.camsur@gmail.com</p>
              </div>
            </div>
          </div>

          <div className="w-full h-64 rounded-xl overflow-hidden border border-border mt-8">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d734.6582257590828!2d123.19929440672507!3d13.624306442114513!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a18ccc4b014537%3A0x851a43f0d45d51c7!2s300%20J%20Miranda%20Ave%2C%20Naga%20City%2C%20Camarines%20Sur!5e0!3m2!1sen!2sph!4v1778889460648!5m2!1sen!2sph" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Right Column: Inquiry Form */}
      <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-4 sm:p-12 relative bg-bg-surface">
        <Button 
          variant="outline" 
          className="absolute top-4 right-4 lg:hidden" 
          onClick={() => navigate("/login")}
        >
          Back to Login
        </Button>

        {success ? (
          <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm text-center py-8">
            <CardContent className="space-y-6 pt-6">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-text-strong">Inquiry Sent!</h2>
                <p className="text-text-muted">
                  Your interest in joining FACCS has been securely recorded.
                </p>
              </div>
              <div className="bg-primary/10 p-6 rounded-lg text-left space-y-4">
                <h3 className="font-semibold text-primary">Next Steps:</h3>
                <ol className="list-decimal list-inside text-sm space-y-2 text-text-default">
                  <li>Prepare your official Cooperative Registration documents.</li>
                  <li>Visit our physical office at <strong>300 J Miranda Ave, Naga City</strong>.</li>
                  <li>Present your documents to the FACCS Admin.</li>
                  <li>Once verified, the Admin will create your ASAC Officer account.</li>
                </ol>
              </div>
              <Button onClick={() => navigate("/login")} className="w-full">
                Return to Login
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="w-full max-w-md border-0 shadow-none sm:border sm:shadow-sm">
            <CardHeader className="space-y-1 text-center sm:text-left">
              <CardTitle className="text-2xl font-bold">Partnership Inquiry</CardTitle>
              <CardDescription>
                Send a message to the federation to start your registration process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="coopName">Cooperative Name *</Label>
                  <Input
                    id="coopName"
                    value={formData.coopName}
                    onChange={(e) => setFormData({...formData, coopName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPerson">Contact Person *</Label>
                  <Input
                    id="contactPerson"
                    value={formData.contactPerson}
                    onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Message (Optional)</Label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="Tell us about your cooperative..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>
                
                {error && (
                  <div className="text-sm font-medium text-destructive">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Inquiry"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
