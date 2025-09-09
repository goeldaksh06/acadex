import React from 'react';

// Empty state illustration for no assignments
export const NoAssignmentsIllustration = ({ className = "w-24 h-24" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#3B82F6', stopOpacity: 0.8}} />
        <stop offset="100%" style={{stopColor: '#1D4ED8', stopOpacity: 0.6}} />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="90" fill="url(#grad1)" opacity="0.1"/>
    <rect x="60" y="70" width="80" height="60" rx="8" fill="#E5E7EB" stroke="#9CA3AF" strokeWidth="2"/>
    <rect x="70" y="80" width="60" height="4" rx="2" fill="#9CA3AF"/>
    <rect x="70" y="90" width="45" height="4" rx="2" fill="#D1D5DB"/>
    <rect x="70" y="100" width="50" height="4" rx="2" fill="#D1D5DB"/>
    <rect x="70" y="110" width="35" height="4" rx="2" fill="#D1D5DB"/>
    <circle cx="160" cy="50" r="15" fill="#F59E0B" opacity="0.7"/>
    <circle cx="45" cy="45" r="10" fill="#10B981" opacity="0.7"/>
    <circle cx="40" cy="150" r="12" fill="#EF4444" opacity="0.7"/>
  </svg>
);

// Student learning illustration
export const StudentLearningIllustration = ({ className = "w-32 h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="studentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#8B5CF6', stopOpacity: 0.8}} />
        <stop offset="100%" style={{stopColor: '#7C3AED', stopOpacity: 0.6}} />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#studentGrad)" opacity="0.1"/>
    <ellipse cx="100" cy="180" rx="60" ry="8" fill="#E5E7EB" opacity="0.5"/>
    
    {/* Books stack */}
    <rect x="70" y="130" width="60" height="8" rx="2" fill="#3B82F6"/>
    <rect x="75" y="125" width="50" height="8" rx="2" fill="#EF4444"/>
    <rect x="80" y="120" width="40" height="8" rx="2" fill="#10B981"/>
    
    {/* Student figure */}
    <circle cx="100" cy="80" r="20" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2"/>
    <rect x="85" y="95" width="30" height="35" rx="15" fill="#3B82F6"/>
    <rect x="90" y="125" width="8" height="20" fill="#1F2937"/>
    <rect x="102" y="125" width="8" height="20" fill="#1F2937"/>
    <rect x="88" y="143" width="12" height="6" rx="3" fill="#374151"/>
    <rect x="100" y="143" width="12" height="6" rx="3" fill="#374151"/>
    
    {/* Graduation cap */}
    <polygon points="85,65 115,65 105,55 95,55" fill="#1F2937"/>
    <rect x="90" y="60" width="20" height="8" fill="#1F2937"/>
    <circle cx="115" cy="58" r="2" fill="#F59E0B"/>
    
    {/* Floating elements */}
    <circle cx="50" cy="60" r="4" fill="#8B5CF6" opacity="0.6"/>
    <circle cx="150" cy="70" r="6" fill="#10B981" opacity="0.6"/>
    <circle cx="160" cy="120" r="5" fill="#F59E0B" opacity="0.6"/>
  </svg>
);

// Teacher dashboard illustration
export const TeacherDashboardIllustration = ({ className = "w-32 h-32" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="teacherGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#059669', stopOpacity: 0.8}} />
        <stop offset="100%" style={{stopColor: '#047857', stopOpacity: 0.6}} />
      </linearGradient>
    </defs>
    <circle cx="100" cy="100" r="95" fill="url(#teacherGrad)" opacity="0.1"/>
    
    {/* Blackboard */}
    <rect x="40" y="60" width="120" height="80" rx="8" fill="#1F2937" stroke="#374151" strokeWidth="3"/>
    
    {/* Mathematical equations on board */}
    <text x="60" y="85" fill="#10B981" fontSize="12" fontFamily="monospace">y = mx + b</text>
    <text x="60" y="105" fill="#F59E0B" fontSize="10" fontFamily="monospace">∫ f(x)dx</text>
    <text x="110" y="95" fill="#EF4444" fontSize="14" fontFamily="monospace">a² + b²</text>
    <text x="110" y="115" fill="#3B82F6" fontSize="11" fontFamily="monospace">= c²</text>
    
    {/* Charts/graphs */}
    <rect x="50" y="115" width="30" height="20" fill="none" stroke="#10B981" strokeWidth="1"/>
    <polyline points="52,130 58,125 64,128 70,120 76,125" stroke="#10B981" strokeWidth="2" fill="none"/>
    
    {/* Teacher figure */}
    <circle cx="100" cy="45" r="12" fill="#FDE68A" stroke="#F59E0B" strokeWidth="2"/>
    <rect x="90" y="52" width="20" height="25" rx="10" fill="#7C3AED"/>
    <rect x="85" y="60" width="8" height="15" fill="#FDE68A"/>
    <rect x="107" y="60" width="8" height="15" fill="#FDE68A"/>
    
    {/* Pointer/stick */}
    <line x1="115" y1="65" x2="135" y2="85" stroke="#8B4513" strokeWidth="3"/>
    
    {/* Floating academic elements */}
    <circle cx="30" cy="40" r="6" fill="#3B82F6" opacity="0.6"/>
    <polygon points="170,35 175,45 165,45" fill="#F59E0B" opacity="0.7"/>
    <rect x="25" y="140" width="8" height="8" fill="#EF4444" opacity="0.6"/>
  </svg>
);

// Success celebration illustration
export const SuccessIllustration = ({ className = "w-20 h-20" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="successGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style={{stopColor: '#10B981', stopOpacity: 0.8}} />
        <stop offset="100%" style={{stopColor: '#059669', stopOpacity: 0.6}} />
      </linearGradient>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#successGrad)" opacity="0.2"/>
    <circle cx="50" cy="50" r="30" fill="#10B981"/>
    <polyline points="40,50 45,55 60,40" stroke="white" strokeWidth="4" fill="none" strokeLinecap="round"/>
    
    {/* Celebration sparkles */}
    <circle cx="25" cy="25" r="2" fill="#F59E0B"/>
    <circle cx="75" cy="30" r="1.5" fill="#EF4444"/>
    <circle cx="80" cy="70" r="2" fill="#8B5CF6"/>
    <circle cx="20" cy="75" r="1.5" fill="#3B82F6"/>
    
    {/* Star sparkles */}
    <polygon points="15,50 17,54 21,54 18,57 19,61 15,59 11,61 12,57 9,54 13,54" fill="#F59E0B"/>
    <polygon points="85,20 86,22 88,22 87,24 87,26 85,25 83,26 83,24 82,22 84,22" fill="#EF4444"/>
  </svg>
);

// Assignment type icons
export const AssignmentTypeIcon = ({ type, className = "w-8 h-8" }: { type: string; className?: string }) => {
  const getIcon = () => {
    switch (type.toLowerCase()) {
      case 'math':
      case 'mathematics':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#3B82F6" opacity="0.1"/>
            <text x="12" y="16" textAnchor="middle" fill="#3B82F6" fontSize="14" fontWeight="bold">∑</text>
          </svg>
        );
      case 'physics':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#8B5CF6" opacity="0.1"/>
            <circle cx="12" cy="12" r="8" stroke="#8B5CF6" strokeWidth="2" fill="none"/>
            <circle cx="12" cy="12" r="2" fill="#8B5CF6"/>
            <line x1="12" y1="4" x2="12" y2="8" stroke="#8B5CF6" strokeWidth="2"/>
            <line x1="12" y1="16" x2="12" y2="20" stroke="#8B5CF6" strokeWidth="2"/>
            <line x1="4" y1="12" x2="8" y2="12" stroke="#8B5CF6" strokeWidth="2"/>
            <line x1="16" y1="12" x2="20" y2="12" stroke="#8B5CF6" strokeWidth="2"/>
          </svg>
        );
      case 'computer':
      case 'cs':
      case 'programming':
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#10B981" opacity="0.1"/>
            <polyline points="8,9 12,13 8,17" stroke="#10B981" strokeWidth="2" fill="none"/>
            <line x1="13" y1="17" x2="17" y2="17" stroke="#10B981" strokeWidth="2"/>
          </svg>
        );
      default:
        return (
          <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="24" height="24" rx="4" fill="#F59E0B" opacity="0.1"/>
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#F59E0B" strokeWidth="2" fill="none"/>
            <polyline points="14,2 14,8 20,8" stroke="#F59E0B" strokeWidth="2" fill="none"/>
          </svg>
        );
    }
  };

  return getIcon();
};

// Loading animation
export const LoadingSpinner = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#E5E7EB" strokeWidth="4"/>
    <path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="#3B82F6"/>
  </svg>
);
