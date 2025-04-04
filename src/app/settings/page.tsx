"use client";

import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Settings as SettingsIcon, 
  Save, 
  User, 
  Lock, 
  CreditCard, 
  Bell,
  Mail
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth/auth-provider";
import { useUser } from "@clerk/nextjs";

export default function SettingsPage() {
  const { user } = useUser();
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(false);

  // User settings
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);

  // Fetch user settings from Supabase
  useEffect(() => {
    const fetchUserSettings = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const { supabase } = await import('@/lib/supabase/client');
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          setFullName(data.full_name || '');
          setEmail(data.email || '');
          setPhone(data.phone_number || '');
          setEmailNotifications(data.email_notifications || true);
          setSmsNotifications(data.sms_notifications || false);
        }
      } catch (error) {
        console.error('Error fetching user settings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserSettings();
  }, [user]);

  const handleSaveUserSettings = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { supabase } = await import('@/lib/supabase/client');
      
      const { error } = await supabase
        .from('users')
        .update({
          full_name: fullName,
          phone_number: phone,
          email_notifications: emailNotifications,
          sms_notifications: smsNotifications,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving user settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Settings</h1>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-4">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            {userRole === 'landlord' && (
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment Methods
              </TabsTrigger>
            )}
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input 
                        id="fullName" 
                        value={fullName} 
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={email} 
                        disabled 
                        className="bg-gray-50"
                      />
                      <p className="text-sm text-gray-500">
                        Email address can only be changed through Clerk authentication.
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+254XXXXXXXXX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">Role</Label>
                      <Input 
                        id="role" 
                        value={userRole?.charAt(0).toUpperCase() + userRole?.slice(1) || 'User'} 
                        disabled 
                        className="bg-gray-50"
                      />
                    </div>
                    <Button onClick={handleSaveUserSettings} className="mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      Save Profile
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>Notification Settings</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center p-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="emailNotifications" 
                        checked={emailNotifications}
                        onCheckedChange={(checked) => setEmailNotifications(!!checked)}
                      />
                      <Label htmlFor="emailNotifications" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Notifications
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="smsNotifications" 
                        checked={smsNotifications}
                        onCheckedChange={(checked) => setSmsNotifications(!!checked)}
                      />
                      <Label htmlFor="smsNotifications" className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        SMS Notifications
                      </Label>
                    </div>
                    <Button onClick={handleSaveUserSettings} className="mt-4">
                      <Save className="mr-2 h-4 w-4" />
                      Save Notification Settings
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {userRole === 'landlord' && (
            <TabsContent value="payment">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Methods</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-gray-500">
                      Connect your payment accounts to receive rent payments.
                    </p>
                    <div className="p-4 border rounded-md bg-gray-50">
                      <p className="text-center text-gray-400">
                        No payment methods configured yet.
                      </p>
                    </div>
                    <Button>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Add Payment Method
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          <TabsContent value="security">
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-gray-500">
                    Security settings are managed through Clerk authentication.
                  </p>
                  <Button variant="outline">
                    <Lock className="mr-2 h-4 w-4" />
                    Manage Account Security
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
