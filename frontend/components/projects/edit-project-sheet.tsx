"use client";

import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Loader2, Mail, User, Trash2, Send, Edit, Play, Pause } from 'lucide-react';
import { Project, ProjectCreate, UnifiedTeamEntry } from '@/lib/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import useSWR from 'swr';
import { useMemo } from 'react';
import { Badge } from '../ui/badge';
import { useAuth } from '@/hooks/use-auth';

interface EditProjectSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: Project | null;
  onSubmit: (id: number, data: Partial<Project>) => Promise<void>;
}

// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function EditProjectSheet({ open, onOpenChange, project, onSubmit }: EditProjectSheetProps) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Project>>({});
  const [initialFormData, setInitialFormData] = useState<Partial<Project>>({});
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'viewer' | 'editor' | 'owner'>('viewer');
  const [isSendingInvite, setIsSendingInvite] = useState(false);
  const [updatingRole, setUpdatingRole] = useState<number | null>(null);
  const [deletingEntry, setDeletingEntry] = useState<number | null>(null);
  const [resendingInvite, setResendingInvite] = useState<number | null>(null);

  const isRTL = i18n.language === 'ar';

  // Fetch project details for pre-filling
  const { data: fullProject, isLoading: isLoadingProject } = useSWR(
    project?.id ? `/projects/${project.id}` : null,
    fetcher
  );

  // Fetch invites and members
  const { data: invites, mutate: mutateInvites, isLoading: isLoadingInvites } = useSWR(
    project?.id ? `/invites/projects/${project.id}` : null,
    fetcher
  );
  const { data: members, mutate: mutateMembers, isLoading: isLoadingMembers } = useSWR(
    project?.id ? `/members/projects/${project.id}` : null,
    fetcher
  );

  useEffect(() => {
    if (fullProject) {
      const currentData = {
        name: fullProject.name,
        url: fullProject.url,
        description: fullProject.description,
        search_engine: fullProject.search_engine,
        target_region: fullProject.target_region,
        language: fullProject.language,
        is_paused: fullProject.is_paused,
      };
      setFormData(currentData);
      setInitialFormData(currentData);
    }
  }, [fullProject]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSwitchChange = (id: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.id) return;

    const changes: Partial<Project> = {};
    (Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
      const newValue = formData[key];
      const oldValue = initialFormData[key];
       if (newValue !== oldValue && newValue !== null) {
        (changes as any)[key] = newValue;
      }
    });

    if (Object.keys(changes).length === 0) {
      // toast.info('No changes to save.');
      onOpenChange(false);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(project.id, changes);
      onOpenChange(false);
      toast.success('Project updated successfully!');
    } catch (error) {
      toast.error('Failed to update project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendInvite = async () => {
    if (!project?.id || !inviteEmail) {
      toast.error('Email is required.');
      return;
    }
    setIsSendingInvite(true);
    try {
      await api.post(`/invites/projects/${project.id}/invite`, { email: inviteEmail, role: inviteRole });
      toast.success('Invitation sent successfully!');
      setInviteEmail('');
      setInviteRole('viewer');
      mutateInvites(); // Refresh invites list
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to send invitation.';
      toast.error(errorMessage);
    } finally {
      setIsSendingInvite(false);
    }
  };

  const handleUpdateRole = async (entry: UnifiedTeamEntry, newRole: 'viewer' | 'editor' | 'owner') => {
    if (!project?.id || !entry.id || updatingRole === entry.id) return;

    setUpdatingRole(entry.id);
    try {
      if (entry.isInvite) {
        await api.patch(`/invites/${entry.id}`, { role: newRole });
        mutateInvites();
      } else {
        await api.patch(`/members/${entry.id}`, { role: newRole });
        mutateMembers();
      }
      toast.success(`Role updated to ${newRole} for ${entry.email}`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update role.';
      toast.error(errorMessage);
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDeleteEntry = async (entry: UnifiedTeamEntry) => {
    if (!project?.id || !entry.id || deletingEntry === entry.id) return;

    setDeletingEntry(entry.id);
    try {
      if (entry.isInvite) {
        await api.delete(`/invites/${entry.id}`);
        mutateInvites();
      } else {
        await api.delete(`/members/${entry.id}`);
        mutateMembers();
      }
      toast.success(`${entry.isInvite ? 'Invitation' : 'Member'} removed successfully.`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || `Failed to remove ${entry.isInvite ? 'invitation' : 'member'}.`;
      toast.error(errorMessage);
    } finally {
      setDeletingEntry(null);
    }
  };

  const handleResendInvite = async (inviteId: number) => {
    if (!project?.id || resendingInvite === inviteId) return;

    setResendingInvite(inviteId);
    try {
      await api.post(`/invites/resend/${inviteId}`);
      toast.success('Invitation resent successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to resend invitation.';
      toast.error(errorMessage);
    } finally {
      setResendingInvite(null);
    }
  };

  const unifiedTeamList: UnifiedTeamEntry[] = useMemo(() => {
    const combined: UnifiedTeamEntry[] = [];

    console.log('Members:', members);
    if (members) {
      members.forEach((member: any) => {
        combined.push({
          id: member.id,
          email: member.user.email,
          name: member.user.name,
          role: member.role,
          status: 'accepted',
          isInvite: false,
        });
      });
    }

    if (invites) {
      invites.forEach((invite: any) => {
        combined.push({
          id: invite.id,
          email: invite.email,
          role: invite.role,
          status: invite.status,
          created_at: invite.created_at,
          isInvite: true,
        });
      });
    }

    // Sort: accepted first, then pending, then declined
    return combined.sort((a, b) => {
      const statusOrder = { 'accepted': 1, 'pending': 2, 'declined': 3 };
      return statusOrder[a.status] - statusOrder[b.status];
    });
  }, [members, invites]);

  const isLoadingTeamData = isLoadingInvites || isLoadingMembers;

  // Check if current user is owner
  const isOwner = project?.role === 'owner';
  const canManageTeam = isOwner;
  const canEditProject = isOwner || project?.role === 'editor';
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle>Edit Project Settings</SheetTitle>
          <SheetDescription>
            Make changes to your project settings here. Click save when you're done.
          </SheetDescription>
        </SheetHeader>
        
        {isLoadingProject ? (
          <div className="flex flex-col items-center justify-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="mt-2 text-muted-foreground">Loading project details...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-y-auto py-4">
            <div className="grid gap-4 flex-1">
              {/* General Settings */}
              <h3 className="text-lg font-semibold">General Settings</h3>
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name</Label>
                <Input
                  id="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting || !canEditProject}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">Website URL</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.url || ''}
                  onChange={handleInputChange}
                  disabled={isSubmitting || !canEditProject}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={isSubmitting || !canEditProject}
                  dir={isRTL ? 'rtl' : 'ltr'}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Search Engine</Label>
                  <Select
                    value={formData.search_engine}
                    onValueChange={(value: 'Google' | 'Bing' | 'Yahoo') => handleSelectChange('search_engine', value)}
                    disabled={isSubmitting || !canEditProject}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Google">Google</SelectItem>
                      <SelectItem value="Bing">Bing</SelectItem>
                      <SelectItem value="Yahoo">Yahoo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label>Target Region</Label>
                  <Select
                    value={formData.target_region}
                    onValueChange={(value) => handleSelectChange('target_region', value)}
                    disabled={isSubmitting || !canEditProject}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Global">Global</SelectItem>
                      <SelectItem value="UAE">UAE</SelectItem>
                      <SelectItem value="KSA">Saudi Arabia</SelectItem>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label>Language</Label>
                <Select
                  value={formData.language}
                  onValueChange={(value) => handleSelectChange('language', value)}
                  disabled={isSubmitting || !canEditProject}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arabic">Arabic</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-x-2 mt-2">
                <Label htmlFor="is_paused" className="flex items-center gap-2">
                  {formData.is_paused ? <Pause className="h-4 w-4 text-muted-foreground" /> : <Play className="h-4 w-4 text-muted-foreground" />}
                  {formData.is_paused ? 'Project Paused' : 'Project Active'}
                </Label>
                <Switch
                  id="is_paused"
                  checked={formData.is_paused}
                  onCheckedChange={(checked) => handleSwitchChange('is_paused', checked)}
                  disabled={isSubmitting || !canEditProject}
                />
              </div>

              {/* Team Access Section - Only show for owners */}
              {canManageTeam && (
                <>
                  <Separator className="my-4" />
                  <h3 className="text-lg font-semibold">Team Access</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage team members and send invitations to collaborate on this project.
                  </p>

                  {/* Invite Member Form */}
                  <div className="grid gap-2 mb-4">
                    <Label htmlFor="inviteEmail">Invite New Member</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="inviteEmail"
                        type="email"
                        placeholder="member@example.com"
                        value={inviteEmail}
                        onChange={(e) => setInviteEmail(e.target.value)}
                        disabled={isSendingInvite}
                        className="flex-1"
                      />
                      <Select
                        value={inviteRole}
                        onValueChange={(value: 'viewer' | 'editor' | 'owner') => setInviteRole(value)}
                        disabled={isSendingInvite}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="viewer">Viewer</SelectItem>
                          <SelectItem value="editor">Editor</SelectItem>
                          <SelectItem value="owner">Owner</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button onClick={handleSendInvite} disabled={isSendingInvite}>
                        {isSendingInvite ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        <span className="sr-only">Send Invite</span>
                      </Button>
                    </div>
                  </div>

                  {/* Unified Team Table */}
                  {isLoadingTeamData ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">Loading team data...</span>
                    </div>
                  ) : unifiedTeamList.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No team members or pending invites yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Email</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {unifiedTeamList.map((entry) => (
                            <TableRow key={entry.id}>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  {entry.isInvite ? <Mail className="h-4 w-4 text-muted-foreground" /> : <User className="h-4 w-4 text-muted-foreground" />}
                                  <div>
                                    <p className="font-medium">{entry.email}</p>
                                    {entry.name && <p className="text-xs text-muted-foreground">{entry.name}</p>}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                {entry.status === 'accepted' ? (
                                  <Select
                                    value={entry.role}
                                    onValueChange={(value: 'viewer' | 'editor' | 'owner') => handleUpdateRole(entry, value)}
                                    disabled={updatingRole === entry.id}
                                  >
                                    <SelectTrigger className="w-[100px] h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="viewer">Viewer</SelectItem>
                                      <SelectItem value="editor">Editor</SelectItem>
                                      <SelectItem value="owner">Owner</SelectItem>
                                    </SelectContent>
                                  </Select>
                                ) : (
                                  <Badge variant="outline">{entry.role}</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <Badge variant={
                                  entry.status === 'accepted' ? 'default' :
                                  entry.status === 'pending' ? 'secondary' :
                                  'destructive'
                                }>
                                  {entry.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end space-x-2">
                                  {(entry.status === 'pending' || entry.status === 'declined') && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleResendInvite(entry.id)}
                                      disabled={resendingInvite === entry.id}
                                    >
                                      {resendingInvite === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                      <span className="sr-only">Resend</span>
                                    </Button>
                                  )}
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="destructive" size="sm" disabled={deletingEntry === entry.id}>
                                        {deletingEntry === entry.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                        <span className="sr-only">Remove</span>
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Confirm Removal</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to remove {entry.email} from this project?
                                          This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDeleteEntry(entry)}>
                                          Remove
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </>
              )}
            </div>
            
            <SheetFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !canEditProject}>
                {isSubmitting ? (
                  <>
                    <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </SheetFooter>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}
