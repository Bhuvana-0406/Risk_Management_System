import React, { useState } from 'react';
import { registerAdmin } from '@/lib/api'; // Adjust path as needed
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/components/ui/card";

const AdminRegisterPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("handleSubmit triggered!"); // <--- Confirm this appears in browser console
    setIsLoading(true);
    try {
      // Log the data being sent to verify its contents
      console.log("Data being sent from frontend:", { username, email, password, role: 'admin' });

      // Call the registerAdmin API function with the form data
      const res = await registerAdmin({ username, email, password, role: 'admin' });

      // Show success toast and clear form fields
      toast({
        title: 'Admin Registered!',
        description: `Admin "${res.username}" created successfully.`,
      });
      setUsername('');
      setEmail('');
      setPassword('');
    } catch (error) {
      // Show error toast if registration fails
      toast({
        title: 'Registration Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      // Reset loading state
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Register New Admin</CardTitle>
          <CardDescription>
            Use this form to create new administrator accounts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin_user"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Registering...' : 'Register Admin'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="text-sm text-muted-foreground">
            <p>Remember to disable this registration page after initial setup for security.</p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default AdminRegisterPage;
