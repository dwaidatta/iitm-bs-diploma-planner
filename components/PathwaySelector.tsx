'use client';

import { DiplomaTrack } from '@/types/course';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PathwaySelectorProps {
  selectedTrack: DiplomaTrack;
  onTrackChange: (track: DiplomaTrack) => void;
}

const tracks = [
  {
    id: 'programming' as DiplomaTrack,
    title: 'Programming',
    subtitle: '27 credits',
    description: 'DBMS, PDSA, MAD I/II, Java, System Commands',
    color: 'border-blue-500 bg-blue-950/20',
    activeColor: 'border-blue-500 bg-blue-900/40 ring-2 ring-blue-500'
  },
  {
    id: 'data-science-ba' as DiplomaTrack,
    title: 'Data Science',
    subtitle: '27 credits - BA Track',
    description: 'MLF, MLT, MLP, BDM, BA, TDS (Business Analytics path)',
    color: 'border-emerald-500 bg-emerald-950/20',
    activeColor: 'border-emerald-500 bg-emerald-900/40 ring-2 ring-emerald-500'
  },
  {
    id: 'data-science-dl' as DiplomaTrack,
    title: 'Data Science',
    subtitle: '27 credits - DL/AI Track',
    description: 'MLF, MLT, MLP, BDM, DL-GenAI, TDS (Deep Learning path)',
    color: 'border-teal-500 bg-teal-950/20',
    activeColor: 'border-teal-500 bg-teal-900/40 ring-2 ring-teal-500'
  },
  {
    id: 'both' as DiplomaTrack,
    title: 'Both Diplomas',
    subtitle: '54 credits',
    description: 'Complete both Programming and Data Science diplomas',
    color: 'border-purple-500 bg-purple-950/20',
    activeColor: 'border-purple-500 bg-purple-900/40 ring-2 ring-purple-500'
  }
];

export function PathwaySelector({ selectedTrack, onTrackChange }: PathwaySelectorProps) {
  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardContent className="pt-6">
        <Label className="text-lg font-semibold mb-4 block text-slate-100">Select Your Diploma Track</Label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <button
              key={track.id}
              onClick={() => onTrackChange(track.id)}
              className={cn(
                'text-left p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer',
                'hover:scale-[1.02] active:scale-[0.98]',
                selectedTrack === track.id ? track.activeColor : track.color
              )}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-slate-100">{track.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{track.subtitle}</p>
                </div>
                {selectedTrack === track.id && (
                  <Check className="h-5 w-5 text-green-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mt-2">
                {track.description}
              </p>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
