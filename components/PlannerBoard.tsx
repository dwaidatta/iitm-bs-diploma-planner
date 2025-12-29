'use client';

import { useState, useEffect, useRef } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { PlanningState, DiplomaTrack, Course } from '@/types/course';
import { TermColumn } from './TermColumn';
import { CoursePool } from './CoursePool';
import { CourseCard } from './CourseCard';
import { PathwaySelector } from './PathwaySelector';
import { ExportButton } from './ExportButton';
import { Button } from './ui/button';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  courses as allCourses, 
  canAddCourse, 
  getCourseStatus as getStatus,
  calculateProgress 
} from '@/lib/planningLogic';
import { RotateCcw, Plus, Trash2, AlertCircle } from 'lucide-react';

const STORAGE_KEY = 'iitm-diploma-plan';

export function PlannerBoard() {
  const [mounted, setMounted] = useState(false);
  const [planningState, setPlanningState] = useState<PlanningState>({
    terms: [
      { id: 1, name: 'Term 1', courses: [] },
      { id: 2, name: 'Term 2', courses: [] },
      { id: 3, name: 'Term 3', courses: [] },
      { id: 4, name: 'Term 4', courses: [] },
    ],
    completedCourses: [],
    selectedTrack: 'both',
  });

  const [activeId, setActiveId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Track last drag over position to prevent infinite updates
  const lastOverId = useRef<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPlanningState(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load saved plan:', e);
      }
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planningState));
  }, [planningState, mounted]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setError(null);
    lastOverId.current = null;
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Prevent unnecessary updates if hovering over the same item
    if (lastOverId.current === overId) return;
    lastOverId.current = overId;

    // Find which term contains the active item
    const activeTermId = planningState.terms.find(t => 
      t.courses.includes(activeId)
    )?.id;

    // Determine if we're over a term or a course
    const overTermId = overId.startsWith('term-') 
      ? parseInt(overId.replace('term-', ''))
      : planningState.terms.find(t => t.courses.includes(overId))?.id;

    // Only reorder if dragging within the same term and over a different course
    if (activeTermId && overTermId && activeTermId === overTermId && activeId !== overId && !overId.startsWith('term-')) {
      setPlanningState(prev => {
        const term = prev.terms.find(t => t.id === activeTermId);
        if (!term) return prev;

        const oldIndex = term.courses.indexOf(activeId);
        const newIndex = term.courses.indexOf(overId);
        
        // Don't update if indices are the same
        if (oldIndex === newIndex) return prev;

        return {
          ...prev,
          terms: prev.terms.map(t => {
            if (t.id === activeTermId) {
              return {
                ...t,
                courses: arrayMove(t.courses, oldIndex, newIndex)
              };
            }
            return t;
          })
        };
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    lastOverId.current = null;

    if (!over) return;

    const courseId = active.id as string;
    const course = allCourses.find(c => c.id === courseId);
    if (!course) return;

    const sourceTermId = planningState.terms.find(t => 
      t.courses.includes(courseId)
    )?.id;

    const overStr = over.id as string;
    
    // Check if dropped on a term
    const destTermId = overStr.startsWith('term-') 
      ? parseInt(overStr.replace('term-', ''))
      : null;

    // Check if dropped on another course (to determine term)
    const overCourseTermId = planningState.terms.find(t => 
      t.courses.includes(overStr)
    )?.id;

    const finalDestTermId = destTermId ?? overCourseTermId;

    // Moving to a different term
    if (finalDestTermId !== null && finalDestTermId !== undefined && sourceTermId !== finalDestTermId) {
      const destTerm = planningState.terms.find(t => t.id === finalDestTermId);
      if (!destTerm) return;

      const completedInPrevTerms = planningState.terms
        .filter(t => t.id < finalDestTermId)
        .flatMap(t => t.courses);

      const validation = canAddCourse(
        course,
        destTerm.courses,
        [...planningState.completedCourses, ...completedInPrevTerms],
        planningState.selectedTrack
      );

      if (!validation.canAdd) {
        setError(validation.reason || 'Cannot add course');
        return;
      }

      setPlanningState(prev => ({
        ...prev,
        terms: prev.terms.map(term => {
          if (term.id === sourceTermId) {
            return {
              ...term,
              courses: term.courses.filter(id => id !== courseId)
            };
          }
          if (term.id === finalDestTermId && !term.courses.includes(courseId)) {
            return {
              ...term,
              courses: [...term.courses, courseId]
            };
          }
          return term;
        })
      }));
    } else if (overStr === 'course-pool') {
      // Moving back to course pool
      setPlanningState(prev => ({
        ...prev,
        terms: prev.terms.map(term => ({
          ...term,
          courses: term.courses.filter(id => id !== courseId)
        }))
      }));
    }
    // If sourceTermId === finalDestTermId, reordering was already handled in handleDragOver
  };

  const allPlannedCourses = planningState.terms.flatMap(t => t.courses);

  const getCourseStatusWrapper = (course: Course) => {
    return getStatus(course, planningState.completedCourses, allPlannedCourses);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your plan? This cannot be undone.')) {
      setPlanningState({
        terms: [
          { id: 1, name: 'Term 1', courses: [] },
          { id: 2, name: 'Term 2', courses: [] },
          { id: 3, name: 'Term 3', courses: [] },
          { id: 4, name: 'Term 4', courses: [] },
        ],
        completedCourses: [],
        selectedTrack: 'both',
      });
      setError(null);
    }
  };

  const handleAddTerm = () => {
    const newTermId = Math.max(...planningState.terms.map(t => t.id)) + 1;
    const newTermNumber = planningState.terms.length + 1;
    setPlanningState(prev => ({
      ...prev,
      terms: [
        ...prev.terms,
        { id: newTermId, name: `Term ${newTermNumber}`, courses: [] }
      ]
    }));
  };

  const handleRemoveTerm = (termId: number) => {
    if (planningState.terms.length <= 1) return;
    
    const term = planningState.terms.find(t => t.id === termId);
    if (term && term.courses.length > 0) {
      if (!confirm('This term has courses. Are you sure you want to remove it?')) {
        return;
      }
    }

    setPlanningState(prev => {
      const updatedTerms = prev.terms.filter(t => t.id !== termId);
      const renumberedTerms = updatedTerms.map((term, index) => ({
        ...term,
        name: `Term ${index + 1}`
      }));

      return {
        ...prev,
        terms: renumberedTerms
      };
    });
  };

  const progress = calculateProgress(planningState);
  const progressPercentage = (progress.totalCredits / progress.requiredCredits) * 100;

  const activeCourse = activeId ? allCourses.find(c => c.id === activeId) : null;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-[1800px] mx-auto space-y-6">
          <div className="flex items-center justify-center h-96">
            <div className="text-slate-400">Loading...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-4xl font-bold text-slate-100">IITM BS DS Planner</h1>
            <div className="flex items-center gap-2 mt-2 text-xs">
              <span className="px-2 py-1 bg-amber-900/30 border border-amber-700/50 text-amber-400 rounded">
                ⚠ Made with Gen AI • Always verify • Mistakes can be present
              </span>
              <span className="text-slate-500">
                Not affiliated with IITM
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <ExportButton planningState={planningState} />
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="border-slate-700 bg-slate-900 hover:bg-slate-800 text-slate-200"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>

        {/* Track Selection */}
        <PathwaySelector
          selectedTrack={planningState.selectedTrack}
          onTrackChange={(track: DiplomaTrack) => 
            setPlanningState(prev => ({ ...prev, selectedTrack: track }))
          }
        />

        {/* Progress */}
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between text-sm mb-3">
            <span className="font-semibold text-slate-100">Overall Progress</span>
            <span className="text-slate-400">
              {progress.totalCredits} / {progress.requiredCredits} credits ({Math.round(progressPercentage)}%)
            </span>
          </div>
          <Progress value={progressPercentage} className="h-3 bg-slate-800" />
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-slate-300">Courses: {allPlannedCourses.length} / {progress.totalCourses}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-slate-300">Projects: {progress.projectsCompleted} / {progress.totalProjects}</span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="bg-red-950/50 border-red-900">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6">
            {/* Course Pool */}
            <div className="h-fit xl:sticky xl:top-6">
              <CoursePool
                selectedTrack={planningState.selectedTrack}
                plannedCourses={allPlannedCourses}
                completedCourses={planningState.completedCourses}
                getCourseStatus={getCourseStatusWrapper}
              />
            </div>

            {/* Terms */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-slate-100">Term Planning</h2>
                <Button 
                  size="sm" 
                  onClick={handleAddTerm}
                  className="bg-blue-600 hover:bg-blue-700 text-white border-0"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Term
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {planningState.terms.map((term, index) => {
                  const completedInPrevTerms = planningState.terms
                    .slice(0, index)
                    .flatMap(t => t.courses);

                  return (
                    <div key={term.id} className="relative">
                      {planningState.terms.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute -top-2 -right-2 z-10 h-7 w-7 p-0 bg-slate-800 hover:bg-red-900 border border-slate-700"
                          onClick={() => handleRemoveTerm(term.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                      <TermColumn
                        termId={term.id}
                        termName={term.name}
                        courseIds={term.courses}
                        completedCourses={[...planningState.completedCourses, ...completedInPrevTerms]}
                        getCourseStatus={getCourseStatusWrapper}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DragOverlay>
            {activeCourse ? (
              <CourseCard
                course={activeCourse}
                status={getCourseStatusWrapper(activeCourse)}
                isDragging
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
