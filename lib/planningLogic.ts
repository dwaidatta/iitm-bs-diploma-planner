import { Course, PlanningState, DiplomaTrack } from '@/types/course';
import coursesData from './courseData.json';

export const courses: Course[] = coursesData.courses as Course[];

export function canAddCourse(
  course: Course,
  termCourses: string[],
  completedCourses: string[],
  selectedTrack: DiplomaTrack
): { canAdd: boolean; reason?: string } {
  // Check if already in term
  if (termCourses.includes(course.id)) {
    return { canAdd: false, reason: 'Already in this term' };
  }

  // Check track compatibility
  if (selectedTrack === 'programming' && course.type === 'data-science' && !course.optional) {
    return { canAdd: false, reason: 'Not in Programming track' };
  }
  
  if ((selectedTrack === 'data-science-ba' || selectedTrack === 'data-science-dl') && 
      course.type === 'programming') {
    return { canAdd: false, reason: 'Not in Data Science track' };
  }

  // Check prerequisites
  for (const prereq of course.prerequisites) {
    if (!completedCourses.includes(prereq) && !termCourses.includes(prereq)) {
      const prereqCourse = courses.find(c => c.id === prereq);
      return { 
        canAdd: false, 
        reason: `Requires ${prereqCourse?.code || prereq} to be completed first` 
      };
    }
  }

  // Check corequisites (must be in same term or already completed)
  for (const coreq of course.corequisites) {
    if (!completedCourses.includes(coreq) && !termCourses.includes(coreq)) {
      const coreqCourse = courses.find(c => c.id === coreq);
      return { 
        canAdd: false, 
        reason: `Requires ${coreqCourse?.code || coreq} in same term or completed` 
      };
    }
  }

  // Check credit limit (max 4 theory courses per term, projects don't count)
  const theoryCourses = termCourses.filter(id => {
    const c = courses.find(course => course.id === id);
    return c && !c.isProject;
  }).length;

  if (!course.isProject && theoryCourses >= 4) {
    return { canAdd: false, reason: 'Max 4 theory courses per term' };
  }

  // Check OPPE limit (max 4 OPPEs per term)
  const oppeCount = termCourses.filter(id => {
    const c = courses.find(course => course.id === id);
    return c && c.hasOPPE;
  }).length;

  if (course.hasOPPE && oppeCount >= 4) {
    return { canAdd: false, reason: 'Max 4 OPPE courses per term' };
  }

  return { canAdd: true };
}

export function getCourseStatus(
  course: Course,
  completedCourses: string[],
  allPlannedCourses: string[]
): 'available' | 'locked' | 'completed' | 'in-progress' {
  if (completedCourses.includes(course.id)) return 'completed';
  if (allPlannedCourses.includes(course.id)) return 'in-progress';

  // Check if prerequisites are met (can be in completed OR planned courses)
  for (const prereq of course.prerequisites) {
    if (!completedCourses.includes(prereq) && !allPlannedCourses.includes(prereq)) {
      return 'locked';
    }
  }

  return 'available';
}

export function getRequiredCourses(track: DiplomaTrack): string[] {
  switch (track) {
    case 'programming':
      return courses
        .filter(c => c.type === 'programming')
        .map(c => c.id);
    case 'data-science-ba':
      return courses
        .filter(c => 
          (c.type === 'data-science' && !c.optional) ||
          (c.code === 'BSMS2002' || c.code === 'BSMS2001P')
        )
        .map(c => c.id);
    case 'data-science-dl':
      return courses
        .filter(c => 
          (c.type === 'data-science' && !c.optional) ||
          (c.code === 'BSDA2001' || c.code === 'BSDA2001P')
        )
        .map(c => c.id);
    case 'both':
      return courses.map(c => c.id);
  }
}

export function calculateProgress(
  planningState: PlanningState
): {
  totalCredits: number;
  requiredCredits: number;
  coursesCompleted: number;
  totalCourses: number;
  projectsCompleted: number;
  totalProjects: number;
} {
  const requiredCourseIds = getRequiredCourses(planningState.selectedTrack);
  const allPlannedCourses = planningState.terms.flatMap(t => t.courses);
  
  const completedCredits = planningState.completedCourses.reduce((sum, id) => {
    const course = courses.find(c => c.id === id);
    return sum + (course?.credits || 0);
  }, 0);

  const plannedCredits = allPlannedCourses.reduce((sum, id) => {
    const course = courses.find(c => c.id === id);
    return sum + (course?.credits || 0);
  }, 0);

  const requiredCredits = planningState.selectedTrack === 'both' ? 54 : 27;
  
  const projectsCompleted = planningState.completedCourses.filter(id => {
    const course = courses.find(c => c.id === id);
    return course?.isProject;
  }).length;

  const projectsPlanned = allPlannedCourses.filter(id => {
    const course = courses.find(c => c.id === id);
    return course?.isProject;
  }).length;

  const totalProjects = planningState.selectedTrack === 'both' ? 4 : 2;

  return {
    totalCredits: completedCredits + plannedCredits,
    requiredCredits,
    coursesCompleted: planningState.completedCourses.length,
    totalCourses: requiredCourseIds.length,
    projectsCompleted: projectsCompleted + projectsPlanned,
    totalProjects
  };
}
