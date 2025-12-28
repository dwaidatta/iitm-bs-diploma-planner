'use client';

import { Course, DiplomaTrack } from '@/types/course';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CourseCard } from './CourseCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { courses as allCourses, getRequiredCourses } from '@/lib/planningLogic';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { Badge } from './ui/badge';

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
  const { setNodeRef } = useDroppable({ id: 'course-pool' });
  
  const requiredCourseIds = getRequiredCourses(selectedTrack);
  const availableCourses = allCourses.filter(c => 
    requiredCourseIds.includes(c.id) && 
    !plannedCourses.includes(c.id) &&
    !completedCourses.includes(c.id)
  );

  const programmingCourses = availableCourses.filter(c => c.type === 'programming');
  const datascienceCourses = availableCourses.filter(c => c.type === 'data-science');

  return (
    <Card className="h-full bg-slate-900 border-slate-700">
      <CardHeader className="pb-3 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <CardTitle className="text-slate-100">Available Courses</CardTitle>
          <Badge variant="secondary" className="bg-slate-700 text-slate-200">
            {availableCourses.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800/50 border border-slate-700 mb-4 p-1">
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
            <div ref={setNodeRef}>
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
