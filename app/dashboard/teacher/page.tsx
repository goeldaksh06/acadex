"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Navigation from '@/components/common/Navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Calendar, FileText, Users, CheckCircle, Clock, Plus, Search, Eye, Download, GraduationCap, TrendingUp, AlertCircle, BookOpen, Target, Award } from 'lucide-react';
import { NoAssignmentsIllustration, TeacherDashboardIllustration, AssignmentTypeIcon, LoadingSpinner } from '@/components/ui/illustrations';
import { Assignment, Submission } from '@/lib/types';
import { listenToTeacherAssignments, listenToAllSubmissions } from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

// Demo assignments for UI showcasing when no real assignments exist
const DEMO_TEACHER_ASSIGNMENTS: Assignment[] = [
  {
    id: "demo_teacher_1",
    title: "Advanced Calculus Problem Set",
    description: "Solve the following calculus problems involving derivatives and integrals",
    classId: "math201",
    dueDate: "2025-09-15T23:59:59.000Z",
    questions: [
      { id: "q1", text: "Find the derivative of f(x) = x³ + 2x² - 5x + 1", maxMarks: 15 },
      { id: "q2", text: "Calculate the definite integral from 0 to 2 of (3x² + 2x) dx", maxMarks: 20 },
      { id: "q3", text: "Solve the differential equation dy/dx = 2xy", maxMarks: 25 }
    ],
    totalQuestions: 3,
    createdBy: "demo_teacher",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "demo_teacher_2", 
    title: "Physics Lab Report - Electromagnetic Fields",
    description: "Analyze the electromagnetic field patterns and write a comprehensive lab report",
    classId: "physics301",
    dueDate: "2025-09-20T23:59:59.000Z",
    questions: [
      { id: "q1", text: "Calculate the electric field strength at point P", maxMarks: 20 },
      { id: "q2", text: "Analyze the magnetic field lines and their properties", maxMarks: 25 },
      { id: "q3", text: "Discuss the relationship between electric and magnetic fields", maxMarks: 30 }
    ],
    totalQuestions: 3,
    createdBy: "demo_teacher",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
];

export default function TeacherDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [isShowingDemoData, setIsShowingDemoData] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Real-time Firestore listeners
  useEffect(() => {
    if (!user) return;

    setLoading(true);
    let assignmentsLoaded = false;
    let submissionsLoaded = false;

    const checkLoadingComplete = () => {
      if (assignmentsLoaded && submissionsLoaded) {
        setLoading(false);
      }
    };

    // Listen to teacher's assignments
    const unsubscribeAssignments = listenToTeacherAssignments(
      user.uid,
      (assignmentsData) => {
        // If no real assignments found, show demo data for UI showcasing
        if (assignmentsData.length === 0) {
          setAssignments(DEMO_TEACHER_ASSIGNMENTS);
          setIsShowingDemoData(true);
        } else {
          setAssignments(assignmentsData);
          setIsShowingDemoData(false);
        }
        assignmentsLoaded = true;
        checkLoadingComplete();
      },
      (error) => {
        console.error('Error loading assignments:', error);
        // On error, also show demo data as fallback
        setAssignments(DEMO_TEACHER_ASSIGNMENTS);
        setIsShowingDemoData(true);
        toast({
          title: "Error loading assignments",
          description: "Showing demo data. Please refresh the page to try again.",
          variant: "destructive"
        });
        assignmentsLoaded = true;
        checkLoadingComplete();
      }
    );

    // Listen to all submissions (for demo purposes, in real app would filter by teacher's assignments)
    const unsubscribeSubmissions = listenToAllSubmissions(
      (submissionsData) => {
        setSubmissions(submissionsData);
        submissionsLoaded = true;
        checkLoadingComplete();
      },
      (error) => {
        console.error('Error loading submissions:', error);
        toast({
          title: "Error loading submissions",
          description: "Failed to load submissions. Please refresh the page.",
          variant: "destructive"
        });
        submissionsLoaded = true;
        checkLoadingComplete();
      }
    );

    // Cleanup listeners on unmount
    return () => {
      unsubscribeAssignments();
      unsubscribeSubmissions();
    };
  }, [user, toast]);

  const getAssignmentStats = (assignmentId: string) => {
    const assignmentSubmissions = submissions.filter(sub => sub.assignmentId === assignmentId);
    const totalSubmissions = assignmentSubmissions.length;
    const gradedSubmissions = assignmentSubmissions.filter(sub => sub.status === 'graded').length;
    const pendingGrading = assignmentSubmissions.filter(sub => sub.status === 'submitted').length;

    return { totalSubmissions, gradedSubmissions, pendingGrading };
  };

  const filteredAssignments = assignments.filter(assignment => 
    assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    assignment.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays <= 7) return `Due in ${diffDays} days`;
    
    return date.toLocaleDateString();
  };

  const handleViewAssignmentDetails = async (assignmentId: string) => {
    console.log('Teacher View Assignment:', assignmentId);
    setActionLoading(`view-${assignmentId}`);
    
    try {
      // Show loading feedback
      toast({
        title: "Opening assignment details...",
        description: `Loading ${assignmentId}`,
        duration: 1500
      });
      
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Try router navigation first
      try {
        await router.push(`/assignments/${assignmentId}`);
      } catch (routerError) {
        console.warn('Router navigation failed, trying window.location:', routerError);
        // Fallback to window.location
        window.location.href = `/assignments/${assignmentId}`;
      }
      
    } catch (error) {
      console.error('Error navigating to assignment:', error);
      toast({
        title: "Navigation Error",
        description: "Failed to open assignment details. Please try again.",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => setActionLoading(null), 800);
    }
  };

  const handleGradeSubmissions = (assignmentId: string) => {
    // For demo assignments, show a message
    if (isShowingDemoData && assignmentId.startsWith('demo_teacher_')) {
      toast({
        title: "Demo Assignment",
        description: "This is a demo assignment. Grading functionality is not available for demo data.",
        variant: "default"
      });
      return;
    }
    
    // Navigate to grading page (you can implement this later)
    toast({
      title: "Grading Interface",
      description: "Grading interface will be implemented soon.",
      variant: "default"
    });
  };

  const handleDownloadSubmission = (submission: Submission) => {
    // For demo, just show a message
    toast({
      title: "Download Submission",
      description: `Downloading submission files for ${submission.id}`,
      variant: "default"
    });
  };

  const handleGradeSubmission = (submission: Submission) => {
    // For demo, just show a message
    toast({
      title: "Grade Submission",
      description: `Opening grading interface for submission ${submission.id}`,
      variant: "default"
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge variant="default" className="bg-green-500">Graded</Badge>;
      case 'submitted':
        return <Badge variant="secondary">Pending Review</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="destructive">Not Submitted</Badge>;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen pb-20">
          <Header title="Teacher Dashboard" />
          <div className="container mx-auto p-6">
            <div className="text-center">Loading dashboard...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 pb-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(34,197,94,0.15)_1px,_transparent_0)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative z-10">
          <Header title="Teacher Dashboard" />

        <main className="container mx-auto p-6 space-y-6">
          {/* Welcome Section with Illustration */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-green-600 to-blue-600 border-0 text-white overflow-hidden relative">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Welcome back, Educator! 👨‍🏫</h2>
                    <p className="text-green-100 mb-4">
                      Ready to inspire and guide your students? Let's check on your classes and assignments.
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span>{assignments.length} Assignments</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="h-5 w-5" />
                        <span>{submissions.length} Submissions</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5" />
                        <span>{submissions.filter(sub => sub.status === 'graded').length} Graded</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <TeacherDashboardIllustration className="w-40 h-40" />
                  </div>
                </div>
                {/* Decorative elements */}
                <div className="absolute top-4 right-4 opacity-20">
                  <div className="w-32 h-32 rounded-full bg-white/10" />
                </div>
                <div className="absolute -bottom-4 -left-4 opacity-10">
                  <div className="w-24 h-24 rounded-full bg-white/20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Total Assignments
                      {isShowingDemoData && <span className="text-xs text-blue-500"> (Demo)</span>}
                    </p>
                    <p className="text-3xl font-bold text-blue-900">{assignments.length}</p>
                    <p className="text-xs text-blue-600 mt-1">Active courses</p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-700">
                      Total Submissions
                      {isShowingDemoData && <span className="text-xs text-purple-500"> (Demo)</span>}
                    </p>
                    <p className="text-3xl font-bold text-purple-900">{submissions.length}</p>
                    <p className="text-xs text-purple-600 mt-1">From students</p>
                  </div>
                  <div className="bg-purple-500 p-3 rounded-full">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Graded
                      {isShowingDemoData && <span className="text-xs text-green-500"> (Demo)</span>}
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {submissions.filter(sub => sub.status === 'graded').length}
                    </p>
                    <p className="text-xs text-green-600 mt-1">{submissions.length > 0 ? Math.round((submissions.filter(sub => sub.status === 'graded').length / submissions.length) * 100) : 0}% completed</p>
                  </div>
                  <div className="bg-green-500 p-3 rounded-full">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-700">
                      Pending Review
                      {isShowingDemoData && <span className="text-xs text-orange-500"> (Demo)</span>}
                    </p>
                    <p className="text-3xl font-bold text-orange-900">
                      {submissions.filter(sub => sub.status === 'submitted').length}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      {submissions.filter(sub => sub.status === 'submitted').length > 0 ? 'Needs attention' : 'All caught up!'}
                    </p>
                  </div>
                  <div className="bg-orange-500 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Actions */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search assignments by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-green-500 rounded-xl bg-white/90"
                  />
                </div>
                <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all duration-200 hover:shadow-xl" onClick={() => router.push('/assignments/create')}>
                  <Plus className="h-5 w-5 mr-2" />
                  Create New Assignment
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Assignments Overview */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  Assignments Overview ({filteredAssignments.length})
                </span>
                {isShowingDemoData && (
                  <Badge variant="outline" className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-300 px-3 py-1">
                    Demo Data
                  </Badge>
                )}
              </CardTitle>
              {isShowingDemoData && (
                <p className="text-sm text-gray-600 bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200">
                  Showing demo assignments for UI showcasing. Real assignments will appear here when created.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <NoAssignmentsIllustration className="w-32 h-32 mx-auto mb-6" />
                    {searchQuery ? (
                      <div>
                        <p className="text-muted-foreground">No assignments match your search</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => setSearchQuery('')}
                        >
                          Clear Search
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground">No assignments created yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Create your first assignment to get started.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredAssignments.map((assignment) => {
                    const stats = getAssignmentStats(assignment.id);
                    const isDemoAssignment = isShowingDemoData && assignment.id.startsWith('demo_teacher_');
                    
                    return (
                      <div key={assignment.id} className="group p-6 border rounded-xl hover:shadow-xl transition-all duration-300 bg-white/80 backdrop-blur-sm border-white/40">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3 mb-3">
                              <AssignmentTypeIcon type={assignment.title} className="w-10 h-10 flex-shrink-0" />
                              <h3 className="font-bold text-xl truncate text-gray-900">{assignment.title}</h3>
                              {isDemoAssignment && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                  Demo
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{assignment.description}</p>
                            
                            <div className="flex items-center space-x-6 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">{formatDueDate(assignment.dueDate)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <FileText className="h-4 w-4" />
                                <span>{assignment.questions.length} questions</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Users className="h-4 w-4" />
                                <span>{stats.totalSubmissions} submissions</span>
                              </div>
                            </div>
                            
                            {/* Progress bar for grading */}
                            {stats.totalSubmissions > 0 && (
                              <div className="mb-2">
                                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                                  <span>Grading Progress</span>
                                  <span>{Math.round((stats.gradedSubmissions / stats.totalSubmissions) * 100)}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-green-500 h-2 rounded-full transition-all"
                                    style={{ width: `${(stats.gradedSubmissions / stats.totalSubmissions) * 100}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex flex-col space-y-2 ml-6">
                            <div className="text-right mb-2">
                              <div className="flex items-center space-x-4 text-sm">
                                <div className="text-center">
                                  <p className="font-semibold text-green-600">{stats.gradedSubmissions}</p>
                                  <p className="text-xs text-muted-foreground">Graded</p>
                                </div>
                                <div className="text-center">
                                  <p className="font-semibold text-orange-600">{stats.pendingGrading}</p>
                                  <p className="text-xs text-muted-foreground">Pending</p>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewAssignmentDetails(assignment.id)}
                                disabled={actionLoading === `view-${assignment.id}`}
                                className="min-w-[100px]"
                              >
                                {actionLoading === `view-${assignment.id}` ? (
                                  <LoadingSpinner className="h-4 w-4" />
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    View
                                  </>
                                )}
                              </Button>
                              <Button 
                                size="sm"
                                onClick={() => handleGradeSubmissions(assignment.id)}
                                variant={stats.pendingGrading > 0 ? 'default' : 'outline'}
                                className="min-w-[120px]"
                              >
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Grade ({stats.pendingGrading})
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card className="bg-white/80 backdrop-blur-sm border-white/30 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Recent Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-purple-600" />
                    </div>
                    <p className="text-gray-600 font-medium">No submissions yet</p>
                    <p className="text-sm text-gray-500 mt-1">Student submissions will appear here</p>
                  </div>
                ) : (
                  submissions.map((submission) => {
                    const assignment = assignments.find(a => a.id === submission.assignmentId);
                    return (
                      <div key={submission.id} className="group p-4 border rounded-xl hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-white to-purple-50/30 border-purple-100">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 flex items-center space-x-3">
                            <AssignmentTypeIcon type={assignment?.title || ''} className="w-10 h-10 flex-shrink-0" />
                            <div>
                              <h3 className="font-bold text-gray-900">{assignment?.title || 'Unknown Assignment'}</h3>
                              <p className="text-sm text-gray-600">
                                Student ID: {submission.studentId} • Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            {getStatusBadge(submission.status)}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewAssignmentDetails(submission.assignmentId)}
                              disabled={actionLoading === `view-submission-${submission.id}`}
                              className="bg-white hover:bg-purple-50 border-purple-200 text-purple-700 hover:text-purple-800 font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                            >
                              {actionLoading === `view-submission-${submission.id}` ? (
                                <LoadingSpinner className="h-4 w-4" />
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  View
                                </>
                              )}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDownloadSubmission(submission)}
                              className="bg-white hover:bg-green-50 border-green-200 text-green-700 hover:text-green-800 font-medium px-3 py-2 rounded-lg transition-all duration-200 hover:shadow-md"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                            {submission.status === 'submitted' && (
                              <Button 
                                size="sm"
                                onClick={() => handleGradeSubmission(submission)}
                                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-md"
                              >
                                <GraduationCap className="h-4 w-4 mr-2" />
                                Grade
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </main>

          <Navigation currentPath="/dashboard/teacher" />
        </div>
      </div>
    </ProtectedRoute>
  );
}
