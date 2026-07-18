import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Approval: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // return id from URL
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleApprove = async () => {
    if (!id) {
      toast({ variant: "destructive", title: "Error", description: "Return ID is missing." });
      return;
    }

    try {
      setLoading(true);
      
      // Add detailed debugging
      const approveUrl = `/api/returns/${id}/approve`;
      console.log(`🔥 FRONTEND: Attempting to call URL: ${approveUrl}`);
      console.log(`🔥 FRONTEND: Return ID from params: ${id}`);
      console.log(`🔥 FRONTEND: Full URL will be: ${window.location.origin}${approveUrl}`);
      
      const response = await fetch(approveUrl, { 
        method: "POST",
        credentials: 'include', // Important: Include cookies for authentication
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔥 FRONTEND: Response status:', response.status);
      console.log('🔥 FRONTEND: Response URL:', response.url);
      console.log('🔥 FRONTEND: Response headers:', response.headers);

      // Check if response is OK first
      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 FRONTEND: Error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

      // Check if response has content
      const responseText = await response.text();
      console.log('🔥 FRONTEND: Raw response:', responseText);

      if (!responseText) {
        throw new Error('Empty response from server');
      }

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('🔥 FRONTEND: JSON parse error:', parseError);
        throw new Error('Invalid JSON response from server');
      }

      console.log('🔥 FRONTEND: Parsed result:', result);

      if (result.success) {
        toast({ 
          title: "Return Approved", 
          description: `Email sent to ${result.data.customerEmail || 'customer'}` 
        });
        navigate(-1); // go back to previous page
      } else {
        throw new Error(result.message || 'Approval failed');
      }
    } catch (err) {
      console.error('🔥 FRONTEND: Approval error:', err);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: err instanceof Error ? err.message : "Approval failed." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6">
      <h1 className="text-2xl font-bold">Approve Return Request</h1>
      <p>Are you sure you want to approve return with ID: <strong>{id}</strong> and notify the customer via email?</p>
      <div className="flex gap-4">
        <Button disabled={loading} onClick={handleApprove}>
          {loading ? "Processing..." : "Confirm & Send Mail"}
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
      </div>
    </div>
  );
};

export default Approval;
