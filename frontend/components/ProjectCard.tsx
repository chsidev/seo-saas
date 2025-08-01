'use client';

import { Project } from '@/lib/types';
import Link from 'next/link';
import { 
  GlobeAltIcon, 
  CalendarIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {project.name}
          </h3>
          
          <div className="flex items-center text-sm text-gray-500 mb-3">
            <GlobeAltIcon className="h-4 w-4 mr-1" />
            <span>{project.url}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-500 mb-4">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              project.is_paused === false
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {project.is_paused === false}
            </span>
            
            <Link
              href={`/dashboard/projects/${project.id}`}
              className="inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}