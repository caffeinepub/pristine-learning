import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  withdrawalStore, referralStore, subscriptionStore,
  blogStore, userProfileStore, bookingsStore,
  type BlogPost, type SubscriptionPackage,
} from '../lib/localStore';
import DashboardLayout from '../components/DashboardLayout';
import ProfileSetupModal from '../components/ProfileSetupModal';
import StripeSetupModal from '../components/StripeSetupModal';
import { useIsStripeConfigured, useListTeacherProfiles } from '../hooks/useQueries';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { formatTime } from '../utils/formatTime';
import { useTimezone } from '../hooks/useTimezone';
import {
  BarChart3, Users, Calendar, Wallet, Package, FileText,
  Gift, CheckCircle, XCircle, Plus, Edit, Eye, Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

const CONTACT_EMAIL = 'pristinelearningofficial@gmail.com';

export default function AdminDashboard() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { timezone } = useTimezone();

  const principalId = identity?.getPrincipal().toString() || '';
  const profile = principalId ? userProfileStore.get(principalId) : null;
  const { data: isStripeConfigured } = useIsStripeConfigured();
  const { data: teachers = [] } = useListTeacherProfiles();
  const [stripeModalOpen, setStripeModalOpen] = useState(false);

  const needsProfile = !!identity && !profile;

  if (needsProfile) {
    return <ProfileSetupModal onComplete={() => qc.invalidateQueries()} />;
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold mb-3">Login Required</h2>
          <Button onClick={() => navigate({ to: '/' })} className="btn-primary">Go to Homepage</Button>
        </div>
      </div>
    );
  }

  const allBookings = bookingsStore.getAll();
  const withdrawals = withdrawalStore.getAll();
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');
  const allReferrals = referralStore.getAllCodes();
  const packages = subscriptionStore.getPackages();
  const blogPosts = blogStore.getAll();

  const totalRevenue = allBookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => sum + b.amount, 0);
  const totalCommission = totalRevenue * 0.1;

  const handleApproveWithdrawal = (id: string) => {
    withdrawalStore.update(id, 'approved');
    toast.success('Withdrawal approved.');
    qc.invalidateQueries();
  };

  const handleRejectWithdrawal = (id: string) => {
    withdrawalStore.update(id, 'rejected', 'Rejected by admin');
    toast.success('Withdrawal rejected.');
    qc.invalidateQueries();
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-6 space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm">Platform overview and management</p>
          </div>
          {!isStripeConfigured && (
            <Button onClick={() => setStripeModalOpen(true)} variant="outline" className="gap-2 border-amber-300 text-amber-700 hover:bg-amber-50">
              ⚠️ Configure Stripe
            </Button>
          )}
        </div>

        {/* Analytics cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Teachers', value: teachers.length, icon: <Users className="w-5 h-5" />, color: 'text-primary' },
            { label: 'Total Bookings', value: allBookings.length, icon: <Calendar className="w-5 h-5" />, color: 'text-green-600' },
            { label: 'Total Revenue', value: `$${totalRevenue.toFixed(0)}`, icon: <Wallet className="w-5 h-5" />, color: 'text-amber-500' },
            { label: 'Commission', value: `$${totalCommission.toFixed(0)}`, icon: <BarChart3 className="w-5 h-5" />, color: 'text-purple-600' },
          ].map(stat => (
            <div key={stat.label} className="bg-white rounded-xl border border-border p-4 shadow-xs">
              <div className={`${stat.color} mb-2`}>{stat.icon}</div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="bookings">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="withdrawals">
              Withdrawals
              {pendingWithdrawals.length > 0 && (
                <span className="ml-1.5 w-4 h-4 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full flex items-center justify-center">
                  {pendingWithdrawals.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="referrals">Referrals</TabsTrigger>
          </TabsList>

          {/* Bookings */}
          <TabsContent value="bookings" className="mt-4">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">All Bookings ({allBookings.length})</h3>
              </div>
              {allBookings.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No bookings yet.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allBookings.slice(0, 20).map(b => (
                        <TableRow key={b.id}>
                          <TableCell className="text-sm">{b.studentName}</TableCell>
                          <TableCell className="text-sm">{b.teacherName}</TableCell>
                          <TableCell><Badge variant="outline" className="capitalize text-xs">{b.sessionType}</Badge></TableCell>
                          <TableCell className="text-xs text-muted-foreground">{formatTime(b.scheduledTime, timezone)}</TableCell>
                          <TableCell className="text-sm font-medium">${b.amount}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              b.status === 'completed' ? 'bg-blue-100 text-blue-700' :
                              b.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>{b.status}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Withdrawals */}
          <TabsContent value="withdrawals" className="mt-4">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Withdrawal Requests ({withdrawals.length})</h3>
              </div>
              {withdrawals.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No withdrawal requests.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Teacher</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map(w => (
                        <TableRow key={w.id}>
                          <TableCell className="text-sm">{w.teacherName}</TableCell>
                          <TableCell className="text-sm font-medium">${w.amount}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {new Date(w.requestedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              w.status === 'approved' ? 'bg-green-100 text-green-700' :
                              w.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700'
                            }`}>{w.status}</span>
                          </TableCell>
                          <TableCell>
                            {w.status === 'pending' && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost" className="text-green-600 h-7 px-2"
                                  onClick={() => handleApproveWithdrawal(w.id)}>
                                  <CheckCircle className="w-3.5 h-3.5" />
                                </Button>
                                <Button size="sm" variant="ghost" className="text-red-600 h-7 px-2"
                                  onClick={() => handleRejectWithdrawal(w.id)}>
                                  <XCircle className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Subscriptions */}
          <TabsContent value="subscriptions" className="mt-4">
            <AdminSubscriptionPanel packages={packages} />
          </TabsContent>

          {/* Blog */}
          <TabsContent value="blog" className="mt-4">
            <AdminBlogPanel posts={blogPosts} />
          </TabsContent>

          {/* Referrals */}
          <TabsContent value="referrals" className="mt-4">
            <div className="bg-white rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Referral Stats ({allReferrals.length} users)</h3>
              </div>
              {allReferrals.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">No referral data yet.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Referred</TableHead>
                      <TableHead>Conversions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allReferrals.map(r => (
                      <TableRow key={r.userId}>
                        <TableCell><code className="font-mono text-sm text-primary">{r.code}</code></TableCell>
                        <TableCell>{r.referredCount}</TableCell>
                        <TableCell>{r.conversions}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Admin support section */}
        <div className="bg-muted/30 rounded-xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center text-primary shrink-0">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm">Technical Support</p>
            <p className="text-xs text-muted-foreground">
              For platform issues, billing questions, or technical assistance, contact the Pristine Learning team.
            </p>
          </div>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="text-xs text-primary hover:underline font-medium shrink-0 flex items-center gap-1"
          >
            <Mail className="w-3.5 h-3.5" />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>

      <StripeSetupModal open={stripeModalOpen} onClose={() => setStripeModalOpen(false)} />
    </DashboardLayout>
  );
}

function AdminSubscriptionPanel({ packages }: { packages: SubscriptionPackage[] }) {
  const [name, setName] = useState('');
  const [sessions, setSessions] = useState('');
  const [price, setPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    if (!name || !sessions || !price) {
      toast.error('Please fill all fields.');
      return;
    }
    setSaving(true);
    const pkg: SubscriptionPackage = {
      id: `pkg_${Date.now()}`,
      name,
      sessionsPerMonth: parseInt(sessions),
      price: parseFloat(price),
      features: [`${sessions} sessions/month`, 'Any subject', 'Session recordings'],
    };
    subscriptionStore.savePackage(pkg);
    setName(''); setSessions(''); setPrice('');
    setSaving(false);
    toast.success('Package created!');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Create Subscription Package
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Package Name</Label>
            <Input placeholder="e.g. Premium" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sessions/Month</Label>
            <Input type="number" placeholder="8" value={sessions} onChange={e => setSessions(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Price ($)</Label>
            <Input type="number" placeholder="99" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </div>
        <Button onClick={handleCreate} disabled={saving} className="mt-3 btn-primary">
          Create Package
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {packages.map(pkg => (
          <div key={pkg.id} className="bg-white rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold">{pkg.name}</h4>
              <span className="text-lg font-bold text-primary">${pkg.price}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{pkg.sessionsPerMonth} sessions/month</p>
            <ul className="space-y-1">
              {pkg.features.map(f => (
                <li key={f} className="text-xs flex items-center gap-1.5">
                  <CheckCircle className="w-3 h-3 text-green-500" /> {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminBlogPanel({ posts }: { posts: BlogPost[] }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = () => {
    if (!title || !content) {
      toast.error('Please fill title and content.');
      return;
    }
    setSaving(true);
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const post: BlogPost = {
      id: `blog_${Date.now()}`,
      slug,
      title,
      content,
      author: author || 'Admin',
      coverImageUrl: '',
      publishDate: new Date().toISOString().split('T')[0],
      published: true,
      excerpt: content.substring(0, 150) + '…',
    };
    blogStore.save(post);
    setTitle(''); setContent(''); setAuthor('');
    setSaving(false);
    toast.success('Blog post published!');
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-border p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4 text-primary" /> Create Blog Post
        </h3>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Title</Label>
            <Input placeholder="Post title…" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Author</Label>
            <Input placeholder="Author name" value={author} onChange={e => setAuthor(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Content</Label>
            <Textarea
              placeholder="Write your blog post content here…"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
            />
          </div>
        </div>
        <Button onClick={handleCreate} disabled={saving} className="mt-3 btn-primary">
          Publish Post
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">All Posts ({posts.length})</h3>
        </div>
        {posts.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No blog posts yet.</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {posts.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="text-sm font-medium">{p.title}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.author}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{p.publishDate}</TableCell>
                  <TableCell>
                    <Badge variant={p.published ? 'default' : 'secondary'} className="text-xs">
                      {p.published ? 'Published' : 'Draft'}
                    </Badge>
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
