'use client';

import { Course, DiplomaTrack } from '@/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseCard } from './CourseCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courses as allCourses, getRequiredCourses } from '@/lib/planningLogic';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Badge } from './ui/badge';
import { cn } from '@/lib/utils';
import { RotateCcw } from 'lucide-react';

interface CoursePoolProps {
  selectedTrack: DiplomaTrack;
  plannedCourses: string[];
  completedCourses: string[];
  getCourseStatus: (course: Course) => 'available' | 'locked' | 'completed' | 'in-progress';
}

export function CoursePool({
  selectedTrack,
  plannedCourses,
  completedCourses,
  getCourseStatus
}: CoursePoolProps) {
  const { setNodeRef, isOver } = useDroppable({ id: 'course-pool' });
  
  const requiredCourseIds = getRequiredCourses(selectedTrack);
  const availableCourses = allCourses.filter(c => 
    requiredCourseIds.includes(c.id) && 
    !plannedCourses.includes(c.id) &&
    !completedCourses.includes(c.id)
  );

  const programmingCourses = availableCourses.filter(c => c.type === 'programming');
  const datascienceCourses = availableCourses.filter(c => c.type === 'data-science');

  return (
    <Card className={cn(
      "h-full border-2 transition-all duration-200",
      isOver ? "border-amber-500 bg-amber-950/20 shadow-lg shadow-amber-500/20" : "bg-slate-900 border-slate-700"
    )}>
      <CardHeader className={cn(
        "pb-3 border-b transition-colors duration-200",
        isOver ? "border-amber-700 bg-amber-950/20" : "border-slate-800"
      )}>
        <div className="flex items-center justify-between">
          <CardTitle className={cn(
            "transition-colors duration-200",
            isOver ? "text-amber-300" : "text-slate-100"
          )}>
            Available Courses
          </CardTitle>
          <Badge variant="secondary" className="bg-slate-700 text-slate-200">
            {availableCourses.length}
          </Badge>
        </div>
        {isOver && (
          <p className="text-xs text-amber-400 flex items-center gap-2 mt-2">
            <RotateCcw className="h-3 w-3" />
            Drop here to remove from term
          </p>
        )}
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800 border border-slate-700 mb-4 p-1">
            <TabsTrigger 
              value="all"
              className="text-xs data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100 data-[state=inactive]:text-slate-400"
            >
              All
            </TabsTrigger>
            <TabsTrigger 
              value="programming"
              className="text-xs data-[state=active]:bg-blue-900/60 data-[state=active]:text-blue-200 data-[state=inactive]:text-slate-400"
            >
              Programming
            </TabsTrigger>
            <TabsTrigger 
              value="datascience"
              className="text-xs data-[state=active]:bg-emerald-900/60 data-[state=active]:text-emerald-200 data-[state=inactive]:text-slate-400"
            >
              Data Science
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-3 mt-0 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
            <div ref={setNodeRef} className={cn(
              "rounded-lg transition-all duration-200 p-2 -m-2",
              isOver && "bg-amber-500/10 border-2 border-dashed border-amber-400"
            )}>
              <SortableContext items={availableCourses.map(c => c.id)}>
                {availableCourses.map(course => (
                  <div key={course.id} className="mb-3">
                    <CourseCard
                      course={course}
                      status={getCourseStatus(course)}
                    />
                  </div>
                ))}
              </SortableContext>
            </div>
          </TabsContent>
          
          <TabsContent value="programming" className="space-y-3 mt-0 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
            <SortableContext items={programmingCourses.map(c => c.id)}>
              {programmingCourses.map(course => (
                <div key={course.id} className="mb-3">
                  <CourseCard
                    course={course}
                    status={getCourseStatus(course)}
                  />
                </div>
              ))}
            </SortableContext>
          </TabsContent>
          
          <TabsContent value="datascience" className="space-y-3 mt-0 max-h-[calc(100vh-320px)] overflow-y-auto pr-2">
            <SortableContext items={datascienceCourses.map(c => c.id)}>
              {datascienceCourses.map(course => (
                <div key={course.id} className="mb-3">
                  <CourseCard
                    course={course}
                    status={getCourseStatus(course)}
                  />
                </div>
              ))}
            </SortableContext>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
