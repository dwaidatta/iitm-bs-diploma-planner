'use client';

import { Course } from '@/types/course';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Code2, Presentation, Calendar, Lock } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course;
  status: 'available' | 'locked' | 'completed' | 'in-progress';
  isDragging?: boolean;
  reason?: string;
}

export function CourseCard({ course, status, isDragging, reason }: CourseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: course.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDisabled = status === 'locked' || status === 'completed';

  // Get color scheme for the card
  const getColorScheme = () => {
    if (course.isProject) {
      return {
        bg: 'bg-purple-950/40',
        borderLeft: 'border-l-4 border-l-purple-500',
        borderInner: 'border-purple-700/30'
      };
    }
    if (course.type === 'programming') {
      return {
        bg: 'bg-blue-950/40',
        borderLeft: 'border-l-4 border-l-blue-500',
        borderInner: 'border-blue-700/30'
      };
    }
    if (course.type === 'data-science') {
      return {
        bg: 'bg-emerald-950/40',
        borderLeft: 'border-l-4 border-l-emerald-500',
        borderInner: 'border-emerald-700/30'
      };
    }
    return {
      bg: 'bg-slate-900/50',
      borderLeft: 'border-l-4 border-l-slate-600',
      borderInner: 'border-slate-700/50'
    };
  };

  const colors = getColorScheme();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card
            ref={setNodeRef}
            style={style}
            {...(isDisabled ? {} : { ...attributes, ...listeners })}
            className={cn(
              'cursor-grab active:cursor-grabbing transition-all duration-200',
              'border-0',
              colors.bg,
              colors.borderLeft,
              isDragging && 'opacity-50 scale-105 shadow-xl',
              status === 'locked' && 'opacity-40 cursor-not-allowed',
              status === 'completed' && 'opacity-50'
            )}
          >
            <CardHeader className="pb-2 px-4 pt-3">
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-semibold leading-tight text-slate-100">
                  {course.name}
                </h3>
                {status === 'locked' && (
                  <Lock className="h-4 w-4 text-orange-400 flex-shrink-0" />
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3 px-4 pb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs border-slate-600 bg-slate-800/50 text-slate-300">
                  {course.code}
                </Badge>
                <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-200">
                  {course.credits} {course.credits === 1 ? 'credit' : 'credits'}
                </Badge>
              </div>
              
              <p className="text-xs text-slate-400 leading-relaxed">{course.description}</p>
              
              <div className="flex flex-wrap gap-1.5">
                {course.hasOPPE && (
                  <Badge className="text-xs bg-red-900/50 border border-red-700 text-red-300 hover:bg-red-900/70">
                    <Code2 className="h-3 w-3 mr-1" />
                    OPPE
                  </Badge>
                )}
                {course.hasQuiz && (
                  <Badge className="text-xs bg-blue-900/50 border border-blue-700 text-blue-300 hover:bg-blue-900/70">
                    <Presentation className="h-3 w-3 mr-1" />
                    Quiz
                  </Badge>
                )}
                {course.isProject && (
                  <Badge className="text-xs bg-purple-900/50 border border-purple-700 text-purple-300 hover:bg-purple-900/70">
                    <Calendar className="h-3 w-3 mr-1" />
                    Project
                  </Badge>
                )}
              </div>

              {(course.prerequisites.length > 0 || course.corequisites.length > 0) && (
                <div className={cn("text-xs space-y-1 pt-2 border-t", colors.borderInner)}>
                  {course.prerequisites.length > 0 && (
                    <div className="text-slate-400">
                      <span className="font-semibold text-slate-300">Pre-Req:</span>{' '}
                      <span className="text-slate-400">{course.prerequisites.join(', ')}</span>
                    </div>
                  )}
                  {course.corequisites.length > 0 && (
                    <div className="text-slate-400">
                      <span className="font-semibold text-slate-300">Co-Req:</span>{' '}
                      <span className="text-slate-400">{course.corequisites.join(', ')}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TooltipTrigger>
        {reason && (
          <TooltipContent className="bg-slate-800 border-slate-700">
            <p>{reason}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
