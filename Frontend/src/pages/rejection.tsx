import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const Rejection: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // return id from URL
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleReject = async () => {
    if (!id) {
      toast({ variant: "destructive", title: "Error", description: "Return ID is missing." });
      return;
    }

    try {
      setLoading(true);
      
      const rejectUrl = `/api/returns/${id}/reject`;
      console.log(`🔥 FRONTEND: Attempting to call URL: ${rejectUrl}`);
      console.log(`🔥 FRONTEND: Return ID from params: ${id}`);
      
      const response = await fetch(rejectUrl, { 
        method: "POST",
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('🔥 FRONTEND: Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('🔥 FRONTEND: Error response:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }

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
          title: "Return Rejected", 
          description: `Email sent to ${result.data.customerEmail || 'customer'}` 
        });
        navigate(-1); // go back to previous page
      } else {
        throw new Error(result.message || 'Rejection failed');
      }
    } catch (err) {
      console.error('🔥 FRONTEND: Rejection error:', err);
      toast({ 
        variant: "destructive", 
        title: "Error", 
        description: err instanceof Error ? err.message : "Rejection failed." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 space-y-6">
      <h1 className="text-2xl font-bold text-red-600">Reject Return Request</h1>
      <p>Are you sure you want to reject return with ID: <strong>{id}</strong> and notify the customer via email?</p>
      <div className="flex gap-4">
        <Button variant="destructive" disabled={loading} onClick={handleReject}>
          {loading ? "Processing..." : "Confirm & Send Rejection Mail"}
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
      </div>
    </div>
  );
};

export default Rejection;