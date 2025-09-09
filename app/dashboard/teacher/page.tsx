"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Navigation from '@/components/common/Navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, FileText, Users, CheckCircle, Clock, Plus } from 'lucide-react';
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

  const handleViewAssignmentDetails = (assignmentId: string) => {
    router.push(`/assignments/${assignmentId}`);
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
      <div className="min-h-screen pb-20">
        <Header title="Teacher Dashboard" />

        <main className="container mx-auto p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">
                      Total Assignments
                      {isShowingDemoData && <span className="text-xs text-muted-foreground"> (Demo)</span>}
                    </p>
                    <p className="text-2xl font-bold">{assignments.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Total Submissions</p>
                    <p className="text-2xl font-bold">{submissions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Graded</p>
                    <p className="text-2xl font-bold">
                      {submissions.filter(sub => sub.status === 'graded').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium">Pending Review</p>
                    <p className="text-2xl font-bold">
                      {submissions.filter(sub => sub.status === 'submitted').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Create Assignment Button */}
          <div className="flex justify-end">
            <Button className="btn-hero" onClick={() => router.push('/assignments/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Assignment
            </Button>
          </div>

          {/* Assignments Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Assignments Overview</span>
                {isShowingDemoData && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Demo Data
                  </Badge>
                )}
              </CardTitle>
              {isShowingDemoData && (
                <p className="text-sm text-muted-foreground">
                  Showing demo assignments for UI showcasing. Real assignments will appear here when created.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.map((assignment) => {
                  const stats = getAssignmentStats(assignment.id);
                  
                  return (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-2">{assignment.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{assignment.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>{assignment.questions.length} questions</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Submissions</p>
                          <p className="font-semibold">{stats.totalSubmissions}</p>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewAssignmentDetails(assignment.id)}
                          >
                            View Details
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleGradeSubmissions(assignment.id)}
                          >
                            Grade Submissions
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Recent Submissions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Submissions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {submissions.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No submissions yet</p>
                ) : (
                  submissions.map((submission) => {
                    const assignment = assignments.find(a => a.id === submission.assignmentId);
                    return (
                      <div key={submission.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <h3 className="font-semibold">{assignment?.title || 'Unknown Assignment'}</h3>
                          <p className="text-sm text-muted-foreground">
                            Student ID: {submission.studentId} • Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(submission.status)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadSubmission(submission)}
                          >
                            Download
                          </Button>
                          {submission.status === 'submitted' && (
                            <Button 
                              size="sm"
                              onClick={() => handleGradeSubmission(submission)}
                            >
                              Grade
                            </Button>
                          )}
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
    </ProtectedRoute>
  );
}
