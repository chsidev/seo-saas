"use client";

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProtectedRoute from '@/components/layout/protected-route';
import Navbar from '@/components/layout/navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Plus,
  Search,
  BarChart3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useSWR from 'swr';
import { api } from '@/lib/api';
import { Project, ProjectCreate } from '@/lib/types';
import ProjectCard from '@/components/projects/project-card';
import CreateProjectDialog from '@/components/projects/create-project-dialog';
import EditProjectSheet from '@/components/projects/edit-project-sheet';

// Data fetcher with error handling
const fetcher = (url: string) => {
  return api.get(url)
    .then(res => res.data)
    .catch((error) => {
      console.error("Error fetching data:", error);  
      throw error;
    });
};

export default function ProjectsPage() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // Fetch projects data
  const { data: projects, error, mutate, isLoading } = useSWR<Project[]>('/projects', fetcher);

  // Filter projects based on search term
  const filteredProjects = useMemo(() => {
    if (!Array.isArray(projects)) return [];

    const list = [...projects]; // clone
    list.sort((a, b) => a.id - b.id);
    
    if (!searchTerm.trim()) return list;
    
    const searchLower = searchTerm.toLowerCase();
    return list.filter((project) =>
      project.name.toLowerCase().includes(searchLower) ||
      project.url.toLowerCase().includes(searchLower) ||
      project.description?.toLowerCase().includes(searchLower)
    );
  }, [projects, searchTerm]);

  const handleCreateProject = async (data: ProjectCreate) => {
    try {
      await api.post('/projects', data);
      mutate(); // Refresh the list
      toast.success('Project created successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to create project';
      toast.error(errorMessage);
      throw error; // Re-throw to handle in dialog
    }
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditSheetOpen(true);
  };

  const handleUpdateProject = async (id: number, data: Partial<Project>) => {
    try {
      await api.patch(`/projects/${id}`, data);
      mutate(); // Refresh the list
      toast.success('Project updated successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update project';
      toast.error(errorMessage);
      throw error; // Re-throw to handle in sheet
    }
  };

  const handleDeleteProject = async (id: number) => {
    try {
      await api.delete(`/projects/${id}`);
      mutate(); // Refresh the list
      toast.success('Project deleted successfully!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to delete project';
      toast.error(errorMessage);
    }
  };

  const handleToggleProjectStatus = async (id: number, isPaused: boolean) => {
    try {
      await api.patch(`/projects/${id}`, { is_paused:isPaused });
      mutate(); // Refresh the list
      toast.success(`Project ${isPaused === false ? 'resumed' : 'paused'} successfully!`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 'Failed to update project status';
      toast.error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
              ))}
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-destructive/10 rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Failed to load projects</h3>
              <p className="text-muted-foreground mb-4">
                There was an error loading your projects. Please try again.
              </p>
              <Button onClick={() => mutate()}>Try Again</Button>
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
              <h1 className="text-3xl font-bold text-foreground">
                {t('projects.title')}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your SEO projects and track their performance
              </p>
            </div>
            
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              Create Project
            </Button>
          </div>

          {/* Search */}
          <div className="flex items-center space-x-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4`} />
              <Input
                placeholder="Search projects by name or URL..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={isRTL ? 'pr-10' : 'pl-10'}
              />
            </div>
            {projects && (
              <div className="text-sm text-muted-foreground">
                {filteredProjects.length} of {projects.length} projects
              </div>
            )}
          </div>

          {/* Projects Grid */}
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                {searchTerm ? 'No projects found' : 'No projects yet'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms or create a new project'
                  : 'Create your first project to start tracking SEO performance'
                }
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  // key={`project-${project.id}-${project.is_paused}`}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={handleDeleteProject}
                  onToggleStatus={handleToggleProjectStatus}
                />
              ))}
            </div>
          )}
        </main>

        {/* Create Project Dialog */}
        <CreateProjectDialog
          open={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          onSubmit={handleCreateProject}
        />

        {/* Edit Project Sheet */}
        <EditProjectSheet
          open={isEditSheetOpen}
          onOpenChange={setIsEditSheetOpen}
          project={editingProject}
          onSubmit={handleUpdateProject}
        />
      </div>
    </ProtectedRoute>
  );
}