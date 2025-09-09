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
import { Input } from '@/components/ui/input';
import { Calendar, FileText, Upload, Clock, CheckCircle, Search, Filter, TrendingUp, AlertCircle, Eye, BookOpen, Target, Award } from 'lucide-react';
import { NoAssignmentsIllustration, StudentLearningIllustration, AssignmentTypeIcon, LoadingSpinner } from '@/components/ui/illustrations';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
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

  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    
    const status = getSubmissionStatus(assignment.id);
    if (filterStatus === 'pending') return matchesSearch && (status === 'not_submitted' || status === 'late_submitted');
    if (filterStatus === 'submitted') return matchesSearch && (status === 'submitted' || status === 'graded');
    if (filterStatus === 'overdue') return matchesSearch && isOverdue(assignment.dueDate) && status !== 'submitted' && status !== 'graded';
    
    return matchesSearch;
  });

  const formatTimeRemaining = (dueDate: string) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffMs = due.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Overdue';
    
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} left`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} left`;
    return 'Due soon';
  };

  const handleViewDetails = async (assignmentId: string) => {
    setActionLoading(`view-${assignmentId}`);
    try {
      router.push(`/assignments/${assignmentId}`);
    } finally {
      // Clear loading after a short delay to show the loading state
      setTimeout(() => setActionLoading(null), 500);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(59,130,246,0.15)_1px,_transparent_0)] [background-size:24px_24px] pointer-events-none" />
        <div className="relative z-10">
          <Header title="Student Dashboard" />

        <main className="container mx-auto p-6 space-y-6">
          {/* Welcome Section with Illustration */}
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-blue-500 to-purple-600 border-0 text-white overflow-hidden relative">
              <CardContent className="pt-8 pb-8">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">Welcome back, Student! 📚</h2>
                    <p className="text-blue-100 mb-4">
                      Ready to conquer your assignments? Let's see what's on your learning journey today.
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <BookOpen className="h-5 w-5" />
                        <span>{assignments.length} Assignments</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Target className="h-5 w-5" />
                        <span>{assignments.length - submissions.filter(sub => sub.status === 'submitted' || sub.status === 'graded').length} Pending</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5" />
                        <span>{submissions.filter(sub => sub.status === 'graded').length} Completed</span>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <StudentLearningIllustration className="w-40 h-40" />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-700">
                      Total Assignments
                      {isShowingDemoData && <span className="text-xs text-blue-500"> (Demo)</span>}
                    </p>
                    <p className="text-3xl font-bold text-blue-900">{assignments.length}</p>
                    <p className="text-xs text-blue-600 mt-1">Active learning</p>
                  </div>
                  <div className="bg-blue-500 p-3 rounded-full">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-700">
                      Submitted
                      {isShowingDemoData && <span className="text-xs text-green-500"> (Demo)</span>}
                    </p>
                    <p className="text-3xl font-bold text-green-900">
                      {isShowingDemoData ? 1 : submissions.filter(sub => sub.status === 'submitted' || sub.status === 'graded').length}
                    </p>
                    <p className="text-xs text-green-600 mt-1">Great progress!</p>
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
                      Pending
                      {isShowingDemoData && <span className="text-xs text-orange-500"> (Demo)</span>}
                    </p>
                    <p className="text-3xl font-bold text-orange-900">
                      {isShowingDemoData ? 2 : assignments.length - submissions.filter(sub => sub.status === 'submitted' || sub.status === 'graded').length}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">Let's tackle them!</p>
                  </div>
                  <div className="bg-orange-500 p-3 rounded-full">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="bg-white/70 backdrop-blur-sm border-white/20 shadow-xl">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Search assignments by title or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 rounded-xl bg-white/90"
                  />
                </div>
                <div className="flex gap-2">
                  {[
                    { key: 'all', label: 'All', color: 'blue' },
                    { key: 'pending', label: 'Pending', color: 'orange' },
                    { key: 'submitted', label: 'Submitted', color: 'green' },
                    { key: 'overdue', label: 'Overdue', color: 'red' }
                  ].map((filter) => (
                    <Button
                      key={filter.key}
                      variant={filterStatus === filter.key ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFilterStatus(filter.key)}
                      className={`capitalize px-4 py-2 rounded-lg transition-all ${
                        filterStatus === filter.key 
                          ? `bg-${filter.color}-500 text-white hover:bg-${filter.color}-600` 
                          : `border-${filter.color}-200 text-${filter.color}-600 hover:bg-${filter.color}-50`
                      }`}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Current Assignments ({filteredAssignments.length})</span>
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
                {filteredAssignments.length === 0 ? (
                  <div className="text-center py-12">
                    <NoAssignmentsIllustration className="w-32 h-32 mx-auto mb-6" />
                    {searchQuery || filterStatus !== 'all' ? (
                      <div>
                        <p className="text-muted-foreground">No assignments match your search</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Try adjusting your search or filter criteria.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3"
                          onClick={() => {
                            setSearchQuery('');
                            setFilterStatus('all');
                          }}
                        >
                          Clear Filters
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <p className="text-muted-foreground">No assignments yet</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          Check back later for new assignments from your teachers.
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  filteredAssignments.map((assignment) => {
                  const status = getSubmissionStatus(assignment.id);
                  const overdue = isOverdue(assignment.dueDate);
                  const isDemoAssignment = isShowingDemoData && assignment.id.startsWith('demo');
                  
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
                            {getStatusBadge(status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{assignment.description}</p>
                          
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <FileText className="h-4 w-4" />
                              <span>{assignment.questions.length} questions</span>
                            </div>
                          </div>
                          
                          {/* Time remaining indicator */}
                          <div className="flex items-center space-x-2">
                            {overdue && status !== 'submitted' && status !== 'graded' ? (
                              <div className="flex items-center space-x-1 text-red-600">
                                <AlertCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Overdue</span>
                              </div>
                            ) : status === 'submitted' || status === 'graded' ? (
                              <div className="flex items-center space-x-1 text-green-600">
                                <CheckCircle className="h-4 w-4" />
                                <span className="text-sm font-medium">Completed</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 text-blue-600">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm font-medium">{formatTimeRemaining(assignment.dueDate)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {/* Action Buttons */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(assignment.id)}
                            disabled={actionLoading === `view-${assignment.id}`}
                            className="min-w-[100px] transition-all"
                          >
                            {actionLoading === `view-${assignment.id}` ? (
                              <div className="flex items-center space-x-2">
                                <LoadingSpinner className="h-4 w-4" />
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <Eye className="h-4 w-4" />
                                <span>View</span>
                              </div>
                            )}
                          </Button>
                          {(status === 'not_submitted' || status === 'late_submitted') && !isDemoAssignment && (
                            <Button 
                              size="sm"
                              onClick={() => handleSubmitClick(assignment)}
                              className="min-w-[100px] bg-primary hover:bg-primary/90"
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
                              className="opacity-50 min-w-[100px]"
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Demo Only
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
      </div>
    </ProtectedRoute>
  );
}
