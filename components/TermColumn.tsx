'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from './CourseCard';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';
import { courses as allCourses } from '@/lib/planningLogic';

interface TermColumnProps {
  termId: number;
  termName: string;
  courseIds: string[];
  completedCourses: string[];
  getCourseStatus: (course: Course) => 'available' | 'locked' | 'completed' | 'in-progress';
}

export function TermColumn({
  termId,
  termName,
  courseIds,
  completedCourses,
  getCourseStatus
}: TermColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `term-${termId}`,
  });

  const termCourses = courseIds.map(id => allCourses.find(c => c.id === id)).filter(Boolean) as Course[];
  const totalCredits = termCourses.reduce((sum, c) => sum + c.credits, 0);
  const oppeCount = termCourses.filter(c => c.hasOPPE).length;
  const theoryCourses = termCourses.filter(c => !c.isProject).length;

  return (
    <Card className={cn(
      'flex flex-col h-full bg-slate-900 border-slate-700 transition-all duration-200',
      isOver && 'ring-2 ring-blue-500 bg-slate-800/80'
    )}>
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-slate-100">{termName}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600">
              {totalCredits} cr
            </Badge>
            {theoryCourses > 0 && (
              <Badge variant="outline" className="border-slate-600 bg-slate-800 text-slate-300">
                {theoryCourses} {theoryCourses === 1 ? 'course' : 'courses'}
              </Badge>
            )}
            {oppeCount > 0 && (
              <Badge className="bg-red-900/50 border border-red-700 text-red-300">
                {oppeCount} OPPE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div
          ref={setNodeRef}
          className="space-y-3 min-h-[250px]"
        >
          <SortableContext items={courseIds}>
            {termCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                status={getCourseStatus(course)}
              />
            ))}
          </SortableContext>
          {termCourses.length === 0 && (
            <div className="flex items-center justify-center h-40 text-slate-500 text-sm border-2 border-dashed border-slate-700/50 rounded-lg bg-slate-900/30">
              Drop courses here
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
