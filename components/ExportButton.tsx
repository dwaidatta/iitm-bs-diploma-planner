'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { PlanningState } from '@/types/course';
import { toPng } from 'html-to-image';
import { courses as allCourses, calculateProgress } from '@/lib/planningLogic';

interface ExportButtonProps {
  planningState: PlanningState;
}

const trackLabels = {
  'programming': 'Programming Diploma',
  'data-science-ba': 'Data Science Diploma (Business Analytics Track)',
  'data-science-dl': 'Data Science Diploma (Deep Learning & AI Track)',
  'both': 'Both Diplomas (Programming + Data Science)'
};

export function ExportButton({ planningState }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const exportDiv = document.createElement('div');
      exportDiv.style.cssText = `
        padding: 48px;
        background: #0f172a;
        font-family: system-ui, -apple-system, sans-serif;
        width: 1400px;
        color: #e2e8f0;
      `;

      const progress = calculateProgress(planningState);
      const trackLabel = trackLabels[planningState.selectedTrack];
      
      exportDiv.innerHTML = `
        <div style="border-bottom: 3px solid #334155; padding-bottom: 24px; margin-bottom: 32px;">
          <h1 style="font-size: 36px; font-weight: bold; margin-bottom: 8px; color: #f1f5f9;">
            IITM BS DS Diploma Plan
          </h1>
          <p style="font-size: 16px; color: #94a3b8;">
            Generated on ${new Date().toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 32px;">
          <div style="padding: 20px; background: #1e293b; border-radius: 12px; border: 2px solid #334155;">
            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 4px;">Selected Track</p>
            <p style="font-size: 18px; font-weight: 600; color: #f1f5f9;">${trackLabel}</p>
          </div>
          <div style="padding: 20px; background: #1e293b; border-radius: 12px; border: 2px solid #334155;">
            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 4px;">Total Credits</p>
            <p style="font-size: 18px; font-weight: 600; color: #f1f5f9;">
              ${progress.totalCredits} / ${progress.requiredCredits} credits
            </p>
          </div>
          <div style="padding: 20px; background: #1e293b; border-radius: 12px; border: 2px solid #334155;">
            <p style="font-size: 14px; color: #94a3b8; margin-bottom: 4px;">Courses Planned</p>
            <p style="font-size: 18px; font-weight: 600; color: #f1f5f9;">
              ${planningState.terms.flatMap(t => t.courses).length} courses
            </p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
          ${planningState.terms.map(term => {
            const termCourses = term.courses
              .map(id => allCourses.find(c => c.id === id))
              .filter(Boolean);
            const totalCredits = termCourses.reduce((sum, c) => sum + (c?.credits || 0), 0);
            const oppeCount = termCourses.filter(c => c?.hasOPPE).length;
            const theoryCourses = termCourses.filter(c => !c?.isProject).length;
            
            return `
              <div style="background: #1e293b; border: 2px solid #334155; border-radius: 12px; padding: 24px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 2px solid #334155;">
                  <h2 style="font-size: 24px; font-weight: bold; color: #3b82f6;">
                    ${term.name}
                  </h2>
                  <div style="display: flex; gap: 8px; align-items: center;">
                    <span style="padding: 4px 12px; background: #334155; border-radius: 6px; font-size: 13px; color: #cbd5e1; white-space: nowrap;">
                      ${totalCredits} cr
                    </span>
                    <span style="padding: 4px 12px; background: #334155; border-radius: 6px; font-size: 13px; color: #cbd5e1; white-space: nowrap;">
                      ${theoryCourses} courses
                    </span>
                    ${oppeCount > 0 ? `
                      <span style="padding: 4px 12px; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 6px; font-size: 13px; color: #fca5a5; white-space: nowrap;">
                        ${oppeCount} OPPE
                      </span>
                    ` : ''}
                  </div>
                </div>
                
                ${termCourses.length === 0 ? `
                  <div style="text-align: center; padding: 32px; color: #64748b; font-size: 14px;">
                    No courses planned
                  </div>
                ` : termCourses.map(course => {
                  const borderColor = course?.isProject ? '#a855f7' : 
                                     course?.type === 'programming' ? '#3b82f6' : '#10b981';
                  const bgColor = course?.isProject ? '#581c87' : 
                                 course?.type === 'programming' ? '#1e3a8a' : '#065f46';
                  
                  return `
                    <div style="margin-bottom: 16px; padding: 16px; background: #0f172a; border-radius: 8px; border-left: 4px solid ${borderColor};">
                      <div style="font-size: 16px; font-weight: 600; margin-bottom: 6px; color: #f1f5f9;">
                        ${course?.name}
                      </div>
                      <div style="display: flex; gap: 6px; margin-bottom: 8px; align-items: center;">
                        <span style="padding: 2px 8px; background: ${bgColor}; border-radius: 4px; font-size: 12px; color: #e2e8f0; white-space: nowrap;">
                          ${course?.code}
                        </span>
                        <span style="padding: 2px 8px; background: #334155; border-radius: 4px; font-size: 12px; color: #cbd5e1; white-space: nowrap;">
                          ${course?.credits} cr
                        </span>
                        ${course?.hasOPPE ? `
                          <span style="padding: 2px 8px; background: #7f1d1d; border: 1px solid #991b1b; border-radius: 4px; font-size: 12px; color: #fca5a5; white-space: nowrap;">
                            OPPE
                          </span>
                        ` : ''}
                        ${course?.hasQuiz ? `
                          <span style="padding: 2px 8px; background: #1e3a8a; border: 1px solid #1e40af; border-radius: 4px; font-size: 12px; color: #93c5fd; white-space: nowrap;">
                            Quiz
                          </span>
                        ` : ''}
                        ${course?.isProject ? `
                          <span style="padding: 2px 8px; background: #581c87; border: 1px solid #6b21a8; border-radius: 4px; font-size: 12px; color: #e9d5ff; white-space: nowrap;">
                            Project
                          </span>
                        ` : ''}
                      </div>
                      <div style="font-size: 13px; color: #94a3b8; line-height: 1.5;">
                        ${course?.description}
                      </div>
                      ${course?.prerequisites.length ? `
                        <div style="font-size: 12px; color: #64748b; margin-top: 8px; padding-top: 8px; border-top: 1px solid #334155;">
                          <strong style="color: #94a3b8;">Prerequisites:</strong> ${course.prerequisites.join(', ')}
                        </div>
                      ` : ''}
                      ${course?.corequisites.length ? `
                        <div style="font-size: 12px; color: #64748b; margin-top: 4px;">
                          <strong style="color: #94a3b8;">Corequisites:</strong> ${course.corequisites.join(', ')}
                        </div>
                      ` : ''}
                    </div>
                  `;
                }).join('')}
              </div>
            `;
          }).join('')}
        </div>

        <div style="margin-top: 32px; padding-top: 20px; border-top: 2px solid #334155; text-align: center; color: #64748b; font-size: 14px;">
          <p>Generated by IITM BS DS Planner • Plan your journey term by term</p>
          <p style="font-size: 12px; margin-top: 8px; color: #475569;">
            Made with Gen AI • Always verify using human • Mistakes can be present
          </p>
        </div>
      `;

      document.body.appendChild(exportDiv);

      const dataUrl = await toPng(exportDiv, {
        quality: 0.95,
        pixelRatio: 2,
      });

      document.body.removeChild(exportDiv);

      const link = document.createElement('a');
      link.download = `iitm-diploma-plan-${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={isExporting}
      className="bg-blue-600 hover:bg-blue-700 text-white border-0"
    >
      <Download className="h-4 w-4 mr-2" />
      {isExporting ? 'Exporting...' : 'Export Plan'}
    </Button>
  );
}
