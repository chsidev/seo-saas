"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Edit,
  Tag,
  Globe,
  Star,
  Calendar,
  Loader2,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { KeywordCreate, KeywordOut } from '@/lib/types';

// Data fetcher
const fetcher = (url: string) => api.get(url).then(res => res.data);

export default function ProjectKeywordsPage() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newKeyword, setNewKeyword] = useState<KeywordCreate>({
    keyword: '',
    tag: '',
    // priority: undefined,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editKeywordData, setEditKeywordData] = useState<KeywordCreate>({ keyword: '', tag: '' });

  const isRTL = i18n.language === 'ar';

  // Fetch keywords data
  const { data: keywords, error, mutate, isLoading } = useSWR<KeywordOut[]>(
    projectId ? `projects/${projectId}/keywords` : null,
    fetcher
  );

  // Fetch project info for header
  const { data: project } = useSWR(
    projectId ? `projects/${projectId}` : null,
    fetcher
  );

  // Role-based permissions
  const canEdit = project?.role === 'owner' || project?.role === 'editor';
  const canDelete = project?.role === 'owner' || project?.role === 'editor';
  const canAdd = project?.role === 'owner' || project?.role === 'editor';
  // Filter keywords based on search
  const filteredKeywords = keywords?.filter((keyword) =>
    keyword.keyword.toLowerCase().includes(searchTerm.toLowerCase()) ||
    keyword.tag?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const handleAddKeyword = async () => {
    if (!newKeyword.keyword.trim()) {
      toast.error('Keyword is required');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post(`/projects/${projectId}/keywords`, {
        keyword: newKeyword.keyword.trim(),
        tag: newKeyword.tag?.trim() || undefined,
        // priority: newKeyword.priority || undefined,
      });

      // Reset form
      setNewKeyword({
        keyword: '',
        tag: '',
        // priority: undefined,
      });
      setIsAddDialogOpen(false);
      mutate(); 
      toast.success('Keyword added successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to add keyword';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteKeyword = async (keywordId: number, keywordText: string) => {
    try {
      await api.delete(`/projects/${projectId}/keywords/${keywordId}`);
      mutate(); 
      toast.success(`Keyword "${keywordText}" deleted successfully!`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete keyword';
      toast.error(errorMessage);
    }
  };

  // const getPriorityBadge = (priority?: number) => {
  //   if (!priority) return null;
    
  //   const variants = {
  //     1: { variant: 'destructive' as const, label: 'Low' },
  //     2: { variant: 'secondary' as const, label: 'Medium' },
  //     3: { variant: 'outline' as const, label: 'High' },
  //     4: { variant: 'default' as const, label: 'Critical' },
  //   };

  //   const config = variants[priority as keyof typeof variants];
  //   return (
  //     <Badge variant={config.variant} className="flex items-center">
  //       <Star className="h-3 w-3 mr-1" />
  //       {config.label} ({priority})
  //     </Badge>
  //   );
  // };

  const handleEdit = (keyword: KeywordOut) => {
    setEditingId(keyword.id);
    setEditKeywordData({ keyword: keyword.keyword, tag: keyword.tag || '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditKeywordData({ keyword: '', tag: '' });
  };

  const handleSaveEdit = async () => {
    try {
      await api.patch(`/projects/${projectId}/keywords/${editingId}`, editKeywordData);
      mutate();
      toast.success('Keyword updated');
      handleCancelEdit();
    } catch (error: any) {
      toast.error('Failed to update keyword');
    }
  };

  if (!projectId) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Invalid Project</h1>
              <p className="text-muted-foreground mb-4">Project ID is missing or invalid.</p>
              <Button asChild>
                <Link href="/projects">Back to Projects</Link>
              </Button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <Button variant="ghost" className="mb-4 p-0" asChild>
                <Link href="/projects">
                  <ArrowLeft className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                  Back to Projects
                </Link>
              </Button>
              <h1 className="text-3xl font-bold text-foreground">
                Manage Keywords for {project?.name || `Project #${projectId}`}
              </h1>
              <p className="text-muted-foreground mt-1">
                Add, manage, and track SEO keywords for this project
              </p>
            </div>
            
            {canAdd && (
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                    Add Keyword
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[525px]">
                  <DialogHeader>
                    <DialogTitle>Add New Keyword</DialogTitle>
                    <DialogDescription>
                      Add a new SEO keyword to track for this project
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="keyword">Keyword *</Label>
                      <Input
                        id="keyword"
                        value={newKeyword.keyword}
                        onChange={(e) => setNewKeyword({ ...newKeyword, keyword: e.target.value })}
                        placeholder="Enter keyword to track"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="tag">Tag (Optional)</Label>
                      <Input
                        id="tag"
                        value={newKeyword.tag}
                        onChange={(e) => setNewKeyword({ ...newKeyword, tag: e.target.value })}
                        placeholder="e.g., brand, product, service"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setIsAddDialogOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button onClick={handleAddKeyword} disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className={`h-4 w-4 animate-spin ${isRTL ? 'ml-2' : 'mr-2'}`} />
                          Adding...
                        </>
                      ) : (
                        'Add Keyword'
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4`} />
              <Input
                placeholder="Search keywords or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            {keywords && (
              <div className="text-sm text-muted-foreground">
                {filteredKeywords.length} of {keywords.length} keywords
              </div>
            )}
          </div>

          {/* Keywords Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className={`h-5 w-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Keywords List
              </CardTitle>
              <CardDescription>
                Manage and track SEO keywords for this project
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading keywords...</span>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Failed to load keywords</h3>
                  <p className="text-muted-foreground mb-4">
                    There was an error loading the keywords for this project.
                  </p>
                  <Button onClick={() => mutate()}>Try Again</Button>
                </div>
              ) : filteredKeywords.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    {searchTerm ? 'No keywords found' : 'No keywords yet'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm 
                      ? 'Try adjusting your search terms'
                      : 'Add your first keyword to start tracking SEO performance'
                    }
                  </p>
                  {!searchTerm && (
                    <Button onClick={() => setIsAddDialogOpen(true)}>
                      <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      Add Your First Keyword
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Keyword</TableHead>
                        <TableHead>Tag</TableHead>
                        {/* <TableHead>Language</TableHead> */}
                        {/* <TableHead>Priority</TableHead> */}
                        <TableHead>Added Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredKeywords.map((keyword) => (
                        <TableRow key={keyword.id}>
                          <TableCell className="font-medium">
                            {editingId === keyword.id ? (
                              <input
                                type="text"
                                value={editKeywordData.keyword}
                                onChange={(e) => setEditKeywordData({ ...editKeywordData, keyword: e.target.value })}
                                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                              />
                            ) : (
                              keyword.keyword
                            )}
                          </TableCell>
                          <TableCell>
                            {editingId === keyword.id ? (
                              <input
                                type="text"
                                value={editKeywordData.tag}
                                onChange={(e) => setEditKeywordData({ ...editKeywordData, tag: e.target.value })}
                                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Optional tag"
                              />
                            ) : (
                              keyword.tag ? (
                                <Badge variant="secondary" className="flex items-center w-fit">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {keyword.tag}
                                </Badge>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )
                            )}
                          </TableCell>
                          {/* <TableCell>
                            {getLanguageBadge(keyword.language) || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell> */}
                          {/* <TableCell>
                            {getPriorityBadge(keyword.priority) || (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell> */}
                          <TableCell>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(keyword.added_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {editingId === keyword.id ? (
                              <div className="flex space-x-2">
                                {canEdit && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleSaveEdit}
                                      className="text-green-600 hover:text-green-700"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={handleCancelEdit}
                                      className="text-gray-600 hover:text-gray-700"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="flex space-x-2">
                                {canEdit && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(keyword)}
                                    className="text-blue-600 hover:text-blue-700"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                )}
                                {canDelete && (
                                  <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                      <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Keyword</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete the keyword "{keyword.keyword}"? 
                                          This action cannot be undone and will remove all associated tracking data.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction
                                          onClick={() => handleDeleteKeyword(keyword.id, keyword.keyword)}
                                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                        >
                                          Delete Keyword
                                        </AlertDialogAction>
                                      </AlertDialogFooter>
                                    </AlertDialogContent>
                                  </AlertDialog>
                                )}
                                {!canEdit && !canDelete && (
                                  <span className="text-xs text-muted-foreground px-2 py-1">
                                    View Only
                                  </span>
                                )}
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}