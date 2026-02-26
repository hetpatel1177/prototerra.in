
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../../components/ui/accordion';
import { Mail, MessageCircle, Phone, FileText, ExternalLink, RefreshCw, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ContactMessage {
    _id: string;
    name: string;
    email: string;
    subject: string;
    orderId?: string;
    message: string;
    status: string;
    createdAt: string;
}

export default function SupportPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Failed to load messages', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            // Optimistic Update
            setMessages(prev => prev.map(msg => msg._id === id ? { ...msg, status: newStatus } : msg));

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            const data = await res.json();
            if (!data.success) {
                // Revert if failed
                fetchMessages();
                alert('Failed to update status');
            }
        } catch (error) {
            console.error('Update failed', error);
            fetchMessages();
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
                    <p className="text-muted-foreground mt-1">View customer inquiries and manage support resources.</p>
                </div>
                <Button variant="outline" size="icon" onClick={fetchMessages} title="Refresh Messages">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                </Button>
            </div>

            {/* Inquiries Section */}
            <Card className="bg-[#161616] border-[#1f1f1f]">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="h-5 w-5 text-amber-500" />
                        Recent Inquiries
                    </CardTitle>
                    <CardDescription>Messages from the contact form.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading && messages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">Loading inquiries...</div>
                    ) : messages.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">No inquiries found.</div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div key={msg._id} className="p-4 rounded-lg bg-[#0e0e0e] border border-[#2a2a2a] space-y-2 hover:border-amber-500/50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${msg.subject === 'Return' ? 'bg-red-500/10 text-red-500' :
                                                msg.subject === 'Customization' ? 'bg-blue-500/10 text-blue-500' :
                                                    'bg-zinc-800 text-zinc-400'
                                                }`}>
                                                {msg.subject}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {format(new Date(msg.createdAt), 'MMM d, yyyy h:mm a')}
                                            </span>
                                        </div>

                                        {/* Status Dropdown */}
                                        <Select
                                            defaultValue={msg.status}
                                            onValueChange={(val) => updateStatus(msg._id, val)}
                                        >
                                            <SelectTrigger className={`w-[130px] h-7 text-[10px] font-bold uppercase tracking-widest border-0 focus:ring-0 ${msg.status === 'resolved' ? 'text-green-500 bg-green-500/10' :
                                                msg.status === 'in-progress' ? 'text-blue-500 bg-blue-500/10' :
                                                    'text-amber-500 bg-amber-500/10'
                                                }`}>
                                                <div className="flex items-center gap-1.5">
                                                    {msg.status === 'resolved' ? <CheckCircle className="w-3 h-3" /> :
                                                        msg.status === 'in-progress' ? <RefreshCw className="w-3 h-3" /> :
                                                            <Clock className="w-3 h-3" />}
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-[#161616] border-[#2a2a2a] text-[#F5F5F5]">
                                                <SelectItem value="pending">Pending</SelectItem>
                                                <SelectItem value="in-progress">In Progress</SelectItem>
                                                <SelectItem value="resolved">Resolved</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h4 className="font-semibold text-[#F5F5F5]">{msg.name}</h4>
                                            <a href={`mailto:${msg.email}`} className="text-xs text-amber-500 hover:underline">{msg.email}</a>
                                        </div>
                                        {msg.orderId && (
                                            <div className="text-right">
                                                <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">Order ID</span>
                                                <span className="text-sm font-mono text-[#F5F5F5]">{msg.orderId}</span>
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-muted-foreground bg-[#161616] p-3 rounded border border-[#1f1f1f] mt-2">
                                        {msg.message}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Contact Options (Existing) */}
                <Card className="bg-[#161616] border-[#1f1f1f]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-amber-500" />
                            Internal Contacts
                        </CardTitle>
                        <CardDescription>Direct lines for admin escalation.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4 rounded-md border border-[#2a2a2a] p-4 bg-[#0e0e0e]">
                            <Mail className="h-6 w-6 text-amber-500" />
                            <div>
                                <p className="font-semibold text-[#F5F5F5]">Technical Support</p>
                                <p className="text-sm text-muted-foreground">admin@prototerra.in</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Documentation Links (Existing) */}
                <Card className="bg-[#161616] border-[#1f1f1f]">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-amber-500" />
                            Admin Docs
                        </CardTitle>
                        <CardDescription>Guides for managing the store.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {[
                            'Managing Products & Inventory',
                            'Processing Orders & Refunds',
                        ].map((topic, i) => (
                            <Button
                                key={i}
                                variant="ghost"
                                className="w-full justify-start text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10"
                            >
                                <ExternalLink className="mr-2 h-4 w-4" />
                                {topic}
                            </Button>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
