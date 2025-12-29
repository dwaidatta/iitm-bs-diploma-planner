'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CourseCard } from './CourseCard';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';
import { courses as allCourses } from '@/lib/planningLogic';
import { Plus } from 'lucide-react';

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
      'flex flex-col h-full bg-slate-900 border-2 transition-all duration-200',
      isOver ? 'border-blue-500 bg-blue-950/30 shadow-lg shadow-blue-500/20' : 'border-slate-700'
    )}>
      <CardHeader className={cn(
        "pb-3 border-b transition-colors duration-200",
        isOver ? "border-blue-700 bg-blue-950/20" : "border-slate-800"
      )}>
        <div className="flex items-center justify-between gap-3">
          <CardTitle className={cn(
            "text-lg transition-colors duration-200",
            isOver ? "text-blue-300" : "text-slate-100"
          )}>
            {termName}
          </CardTitle>
          <div className="flex gap-2 items-center flex-shrink-0">
            <Badge variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600 whitespace-nowrap">
              {totalCredits} cr
            </Badge>
            {theoryCourses > 0 && (
              <Badge variant="outline" className="border-slate-600 bg-slate-800 text-slate-300 whitespace-nowrap">
                {theoryCourses} {theoryCourses === 1 ? 'course' : 'courses'}
              </Badge>
            )}
            {oppeCount > 0 && (
              <Badge className="bg-red-900/50 border border-red-700 text-red-300 whitespace-nowrap">
                {oppeCount} OPPE
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-4">
        <div
          ref={setNodeRef}
          className={cn(
            "space-y-3 min-h-[250px] rounded-lg transition-all duration-200 p-3 -m-3",
            isOver && "bg-blue-500/10 border-2 border-dashed border-blue-400"
          )}
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
          
          {/* Drop Zone Indicator */}
          {termCourses.length === 0 ? (
            <div className={cn(
              "flex flex-col items-center justify-center h-40 text-slate-500 text-sm border-2 border-dashed rounded-lg transition-all duration-200",
              isOver 
                ? "border-blue-400 bg-blue-500/10 text-blue-300" 
                : "border-slate-700/50 bg-slate-900/30"
            )}>
              <Plus className={cn(
                "h-8 w-8 mb-2 transition-colors duration-200",
                isOver ? "text-blue-400" : "text-slate-600"
              )} />
              <span className="font-medium">
                {isOver ? "Drop course here" : "Drag courses here"}
              </span>
            </div>
          ) : (
            <div className={cn(
              "flex items-center justify-center py-6 text-xs rounded-lg border-2 border-dashed transition-all duration-200",
              isOver 
                ? "border-blue-400 bg-blue-500/10 text-blue-300" 
                : "border-transparent text-slate-600 hover:border-slate-700/50"
            )}>
              {isOver ? (
                <span className="font-medium flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Drop to add course
                </span>
              ) : (
                <span>Drop courses anywhere in this area</span>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
