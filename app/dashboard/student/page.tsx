"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Navigation from '@/components/common/Navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import SubmissionUploader from '@/components/assignment/SubmissionUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, FileText, Upload, Clock, CheckCircle } from 'lucide-react';
import { Assignment, Submission, SubmissionFile } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { listenToAssignments, listenToSubmissions, createSubmission } from '@/lib/firebase/firestore';
import { useAuth } from '@/hooks/useAuth';

// Demo assignments for UI showcasing when no real assignments exist
const DEMO_ASSIGNMENTS: Assignment[] = [
  {
    id: "demo1",
    title: "Math Assignment 1",
    description: "Solve problems 1–10 from Chapter 3",
    classId: "math101",
    dueDate: "2025-09-10T23:59:59.000Z",
    questions: [
      { id: "q1", text: "Solve the quadratic equation: x² + 5x + 6 = 0", maxMarks: 10 },
      { id: "q2", text: "Find the derivative of f(x) = 3x³ - 2x² + 5x - 1", maxMarks: 15 },
      { id: "q3", text: "Calculate the area under the curve y = x² from x = 0 to x = 3", maxMarks: 20 }
    ],
    totalQuestions: 3,
    createdBy: "demo_teacher",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "demo2",
    title: "Physics Lab Report",
    description: "Experiment on Newton's Laws",
    classId: "physics101",
    dueDate: "2025-09-12T23:59:59.000Z",
    questions: [
      { id: "q1", text: "Explain Newton's First Law with examples from your experiment", maxMarks: 15 },
      { id: "q2", text: "Calculate the acceleration of the object in your experiment", maxMarks: 20 },
      { id: "q3", text: "Discuss sources of error in your measurements", maxMarks: 10 }
    ],
    totalQuestions: 3,
    createdBy: "demo_teacher",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  },
  {
    id: "demo3",
    title: "Computer Science Project",
    description: "Build a simple calculator in Python",
    classId: "cs101",
    dueDate: "2025-09-15T23:59:59.000Z",
    questions: [
      { id: "q1", text: "Implement basic arithmetic operations (+, -, *, /)", maxMarks: 25 },
      { id: "q2", text: "Add error handling for division by zero", maxMarks: 15 },
      { id: "q3", text: "Create a user-friendly interface with input validation", maxMarks: 20 }
    ],
    totalQuestions: 3,
    createdBy: "demo_teacher",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z"
  }
];

export default function StudentDashboard() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [submissionModalOpen, setSubmissionModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [isShowingDemoData, setIsShowingDemoData] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();

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

    // Listen to assignments
    const unsubscribeAssignments = listenToAssignments(
      (assignmentsData) => {
        // If no real assignments found, show demo data for UI showcasing
        if (assignmentsData.length === 0) {
          setAssignments(DEMO_ASSIGNMENTS);
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
        setAssignments(DEMO_ASSIGNMENTS);
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

    // Listen to submissions for this student
    const unsubscribeSubmissions = listenToSubmissions(
      user.uid,
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

  const getSubmissionStatus = (assignmentId: string) => {
    const submission = submissions.find(sub => sub.assignmentId === assignmentId);
    if (!submission) return 'not_submitted';
    
    // Check if submission is late
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment && new Date(submission.submittedAt) > new Date(assignment.dueDate)) {
      return 'late_submitted';
    }
    
    return submission.status;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge variant="default" className="bg-green-500">Graded</Badge>;
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
      case 'late_submitted':
        return <Badge variant="secondary" className="bg-orange-500">Late Submission</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="destructive">Not Submitted</Badge>;
    }
  };

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date();
  };

  const handleViewDetails = (assignmentId: string) => {
    router.push(`/assignments/${assignmentId}`);
  };

  const handleSubmitClick = (assignment: Assignment) => {
    // Prevent submission on demo assignments
    if (isShowingDemoData && assignment.id.startsWith('demo')) {
      toast({
        title: "Demo Assignment",
        description: "This is a demo assignment. Submissions are not available for demo data.",
        variant: "default"
      });
      return;
    }
    
    setSelectedAssignment(assignment);
    setSubmissionModalOpen(true);
  };

  const handleUploadComplete = async (files: SubmissionFile[]) => {
    if (!selectedAssignment || !user) return;

    try {
      // Create submission directly in Firestore
      const submissionData = {
        assignmentId: selectedAssignment.id,
        studentId: user.uid,
        files,
        submittedAt: new Date().toISOString(),
        status: 'submitted' as const
      };

      await createSubmission(submissionData);
      
      // Show success message
      toast({
        title: "Assignment submitted successfully!",
        description: `Your submission for "${selectedAssignment.title}" has been uploaded.`,
      });
      
      // Close modal
      setSubmissionModalOpen(false);
      setSelectedAssignment(null);
      
    } catch (error) {
      console.error('Error creating submission:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleUploadError = (error: string) => {
    toast({
      title: "Upload error",
      description: error,
      variant: "destructive"
    });
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen pb-20">
          <Header title="Student Dashboard" />
          <div className="container mx-auto p-6">
            <div className="text-center">Loading assignments...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-20">
        <Header title="Student Dashboard" />

        <main className="container mx-auto p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">
                      Submitted
                      {isShowingDemoData && <span className="text-xs text-muted-foreground"> (Demo)</span>}
                    </p>
                    <p className="text-2xl font-bold">
                      {isShowingDemoData ? 1 : submissions.filter(sub => sub.status === 'submitted' || sub.status === 'graded').length}
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
                    <p className="text-sm font-medium">
                      Pending
                      {isShowingDemoData && <span className="text-xs text-muted-foreground"> (Demo)</span>}
                    </p>
                    <p className="text-2xl font-bold">
                      {isShowingDemoData ? 2 : assignments.length - submissions.filter(sub => sub.status === 'submitted' || sub.status === 'graded').length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Current Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Assignments</span>
                {isShowingDemoData && (
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                    Demo Data
                  </Badge>
                )}
              </CardTitle>
              {isShowingDemoData && (
                <p className="text-sm text-muted-foreground">
                  Showing demo assignments for UI showcasing. Real assignments will appear here when available.
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No assignments yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Check back later for new assignments from your teachers.
                    </p>
                  </div>
                ) : (
                  assignments.map((assignment) => {
                  const status = getSubmissionStatus(assignment.id);
                  const overdue = isOverdue(assignment.dueDate);
                  const isDemoAssignment = isShowingDemoData && assignment.id.startsWith('demo');
                  
                  return (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold">{assignment.title}</h3>
                          {isDemoAssignment && (
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              Demo
                            </Badge>
                          )}
                          {getStatusBadge(status)}
                          {overdue && status !== 'submitted' && status !== 'graded' && (
                            <Badge variant="destructive">Overdue</Badge>
                          )}
                        </div>
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
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleViewDetails(assignment.id)}
                        >
                          View Details
                        </Button>
                        {(status === 'not_submitted' || status === 'late_submitted') && !isDemoAssignment && (
                          <Button 
                            size="sm"
                            onClick={() => handleSubmitClick(assignment)}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            {status === 'late_submitted' ? 'Resubmit' : 'Submit'}
                          </Button>
                        )}
                        {isDemoAssignment && (
                          <Button 
                            size="sm"
                            variant="outline"
                            disabled
                            className="opacity-50"
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Demo Only
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
                            Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(submission.status)}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(submission.assignmentId)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </main>

        <Navigation currentPath="/dashboard/student" />

        {/* Submission Modal */}
        <Dialog open={submissionModalOpen} onOpenChange={setSubmissionModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Submit Assignment</DialogTitle>
              <DialogDescription>
                Upload your PDF files for "{selectedAssignment?.title}"
              </DialogDescription>
            </DialogHeader>
            
            {selectedAssignment && user && (
              <SubmissionUploader
                assignmentId={selectedAssignment.id}
                studentId={user.uid}
                onUploadComplete={handleUploadComplete}
                onUploadError={handleUploadError}
                maxFiles={3}
                maxFileSize={10}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ProtectedRoute>
  );
}
