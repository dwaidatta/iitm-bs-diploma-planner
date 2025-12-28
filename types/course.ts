export type CourseType = 'programming' | 'data-science' | 'both';
export type DiplomaTrack = 'programming' | 'data-science-ba' | 'data-science-dl' | 'both';

export interface Course {
  id: string;
  name: string;
  code: string;
  credits: number;
  prerequisites: string[];
  corequisites: string[];
  type: CourseType;
  isProject: boolean;
  description: string;
  hasOPPE: boolean;
  hasQuiz: boolean;
  optional?: boolean; // For BA vs DL-GenAI choice
}

export interface Term {
  id: number;
  name: string;
  courses: string[]; // Course IDs
}

export interface PlanningState {
  terms: Term[];
  completedCourses: string[];
  selectedTrack: DiplomaTrack;
}
