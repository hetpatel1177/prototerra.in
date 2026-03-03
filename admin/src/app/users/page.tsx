'use client';

import { useEffect, useState } from 'react';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import {
    Search, Loader2, Users, RefreshCw, Mail, Calendar, User as UserIcon
} from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    provider: string;
    createdAt: string;
    image?: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    async function fetchUsers() {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/users`);
            const data = await res.json();
            if (data.success) {
                setUsers(data.data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                    <p className="text-muted-foreground mt-1">Manage registered accounts and authentication methods.</p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchUsers}
                    disabled={loading}
                    className="gap-2"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                    { label: 'Total Users', value: loading ? null : users.length, icon: Users },
                    { label: 'Google Auth', value: loading ? null : users.filter(u => u.provider === 'google').length, icon: Mail },
                    { label: 'Email/Pass', value: loading ? null : users.filter(u => u.provider === 'credentials').length, icon: UserIcon },
                ].map(stat => (
                    <div
                        key={stat.label}
                        className="rounded-sm px-4 py-3 flex items-start gap-3"
                        style={{ background: '#161616', border: '1px solid #1f1f1f' }}
                    >
                        <div
                            className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-sm"
                            style={{ background: 'rgba(196,122,44,0.10)' }}
                        >
                            <stat.icon className="h-4 w-4 text-[#C47A2C]" />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-[#9A9A9A]">{stat.label}</p>
                            {stat.value === null
                                ? <Loader2 className="h-4 w-4 animate-spin mt-1 text-[#9A9A9A]" />
                                : <p className="text-2xl font-bold mt-0.5 text-[#F5F5F5]">{stat.value}</p>
                            }
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="flex h-10 w-full rounded-sm border border-input bg-card pl-9 pr-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="rounded-sm border bg-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
                        <Loader2 className="h-5 w-5 animate-spin" /> Loading users...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                        <Users className="h-10 w-10 opacity-30" />
                        <p className="text-sm">No users found.</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>USER</TableHead>
                                <TableHead>EMAIL</TableHead>
                                <TableHead>PROVIDER</TableHead>
                                <TableHead>JOINED</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.map(user => (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            {user.image ? (
                                                <img src={user.image} alt={user.name} className="h-8 w-8 rounded-full border border-[#1f1f1f]" />
                                            ) : (
                                                <div
                                                    className="h-8 w-8 rounded-sm flex items-center justify-center text-xs font-bold"
                                                    style={{ background: 'rgba(196,122,44,0.12)', color: '#C47A2C' }}
                                                >
                                                    {user.name?.charAt(0).toUpperCase() ?? 'U'}
                                                </div>
                                            )}
                                            <span className="font-medium text-[#F5F5F5]">{user.name || 'Anonymous'}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                    <TableCell>
                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-sm ${user.provider === 'google'
                                                ? 'bg-blue-500/10 text-blue-400'
                                                : 'bg-orange-500/10 text-orange-400'
                                            }`}>
                                            {user.provider}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-3 w-3" />
                                            {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
