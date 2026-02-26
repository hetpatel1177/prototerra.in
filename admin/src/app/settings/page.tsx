'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Save, User, Store, Bell } from 'lucide-react';

export default function SettingsPage() {
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);

    // Form states
    const [storeName, setStoreName] = useState('ProtoTerra');
    const [supportEmail, setSupportEmail] = useState('admin@prototerra.in');
    const [notifyOrder, setNotifyOrder] = useState(true);
    const [notifyReview, setNotifyReview] = useState(true);
    const [lowStockAlert, setLowStockAlert] = useState(true);

    async function handleSave() {
        setLoading(true);
        // Simulate API call
        await new Promise(r => setTimeout(r, 1000));
        setLoading(false);
        alert('Settings saved successfully!');
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your store preferences and account details.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="grid w-full grid-cols-3 lg:w-[400px] bg-muted p-1">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="account">Account</TabsTrigger>
                    <TabsTrigger value="notifications">Notifications</TabsTrigger>
                </TabsList>

                {/* General Tab */}
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Store className="h-5 w-5 text-amber-500" />
                                Store Information
                            </CardTitle>
                            <CardDescription>Configure your store details visible to customers.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Store Name</label>
                                <Input value={storeName} onChange={e => setStoreName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Support Email</label>
                                <Input value={supportEmail} onChange={e => setSupportEmail(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Currency</label>
                                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                    <option>INR (₹)</option>
                                    <option>EUR (€)</option>
                                    <option>GBP (£)</option>
                                </select>
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </div>
                </TabsContent>

                {/* Account Tab */}
                <TabsContent value="account" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5 text-amber-500" />
                                Profile
                            </CardTitle>
                            <CardDescription>Update your personal information.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center text-2xl font-bold text-amber-500">
                                    {session?.user?.name?.[0] || 'A'}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg">{session?.user?.name || 'Admin User'}</h3>
                                    <p className="text-sm text-muted-foreground">{session?.user?.email || 'admin@prototerra.in'}</p>
                                    <div className="mt-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase inline-block">
                                        Administrator
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Full Name</label>
                                <Input defaultValue={session?.user?.name || ''} disabled />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Email Address</label>
                                <Input defaultValue={session?.user?.email || ''} disabled />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button variant="outline" disabled>Change Password (Coming Soon)</Button>
                    </div>
                </TabsContent>

                {/* Notifications Tab */}
                <TabsContent value="notifications" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-amber-500" />
                                Email Alerts
                            </CardTitle>
                            <CardDescription>Choose what updates you want to receive via email.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium">Order Notifications</label>
                                    <p className="text-sm text-muted-foreground">Receive an email when a new order is placed.</p>
                                </div>
                                <Switch checked={notifyOrder} onCheckedChange={setNotifyOrder} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium">Review Alerts</label>
                                    <p className="text-sm text-muted-foreground">Get notified when a customer leaves a review.</p>
                                </div>
                                <Switch checked={notifyReview} onCheckedChange={setNotifyReview} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <label className="text-base font-medium">Low Stock Warning</label>
                                    <p className="text-sm text-muted-foreground">Alert when product stock drops below threshold.</p>
                                </div>
                                <Switch checked={lowStockAlert} onCheckedChange={setLowStockAlert} />
                            </div>
                        </CardContent>
                    </Card>
                    <div className="flex justify-end">
                        <Button onClick={handleSave} disabled={loading} className="bg-amber-600 hover:bg-amber-700">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Preferences
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
