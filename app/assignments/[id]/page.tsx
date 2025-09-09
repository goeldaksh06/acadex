"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Header from '@/components/common/Header';
import Navigation from '@/components/common/Navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AssignmentCard from '@/components/assignment/AssignmentCard';
import SubmissionUploader from '@/components/assignment/SubmissionUploader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, FileText, Clock, CheckCircle } from 'lucide-react';
import { Assignment, Submission, SubmissionFile } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { createSubmission } from '@/lib/firebase/firestore';

export default function AssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assignmentId = params.id as string;
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Mock data for demo - in real app, fetch from API
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      // Mock assignment data based on ID
      const getMockAssignment = (id: string): Assignment => {
        const assignments = {
          // Student demo assignments
          'demo1': {
            id: 'demo1',
            title: 'Math Assignment 1',
            description: 'Solve problems 1–10 from Chapter 3',
            classId: 'math101',
            dueDate: '2025-09-10T23:59:59.000Z',
            questions: [
              { id: 'q1', text: 'Solve the quadratic equation: x² + 5x + 6 = 0', maxMarks: 10 },
              { id: 'q2', text: 'Find the derivative of f(x) = 3x³ - 2x² + 5x - 1', maxMarks: 15 },
              { id: 'q3', text: 'Calculate the area under the curve y = x² from x = 0 to x = 3', maxMarks: 20 }
            ],
            totalQuestions: 3,
            createdBy: 'demo_teacher',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          'demo2': {
            id: 'demo2',
            title: 'Physics Lab Report',
            description: 'Experiment on Newton\'s Laws',
            classId: 'physics101',
            dueDate: '2025-09-12T23:59:59.000Z',
            questions: [
              { id: 'q1', text: 'Explain Newton\'s First Law with examples from your experiment', maxMarks: 15 },
              { id: 'q2', text: 'Calculate the acceleration of the object in your experiment', maxMarks: 20 },
              { id: 'q3', text: 'Discuss sources of error in your measurements', maxMarks: 10 }
            ],
            totalQuestions: 3,
            createdBy: 'demo_teacher',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          'demo3': {
            id: 'demo3',
            title: 'Computer Science Project',
            description: 'Build a simple calculator in Python',
            classId: 'cs101',
            dueDate: '2025-09-15T23:59:59.000Z',
            questions: [
              { id: 'q1', text: 'Implement basic arithmetic operations (+, -, *, /)', maxMarks: 25 },
              { id: 'q2', text: 'Add error handling for division by zero', maxMarks: 15 },
              { id: 'q3', text: 'Create a user-friendly interface with input validation', maxMarks: 20 }
            ],
            totalQuestions: 3,
            createdBy: 'demo_teacher',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          // Teacher demo assignments
          'demo_teacher_1': {
            id: 'demo_teacher_1',
            title: 'Advanced Calculus Problem Set',
            description: 'Solve the following calculus problems involving derivatives and integrals',
            classId: 'math201',
            dueDate: '2025-09-15T23:59:59.000Z',
            questions: [
              { id: 'q1', text: 'Find the derivative of f(x) = x³ + 2x² - 5x + 1', maxMarks: 15 },
              { id: 'q2', text: 'Calculate the definite integral from 0 to 2 of (3x² + 2x) dx', maxMarks: 20 },
              { id: 'q3', text: 'Solve the differential equation dy/dx = 2xy', maxMarks: 25 }
            ],
            totalQuestions: 3,
            createdBy: 'demo_teacher',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          'demo_teacher_2': {
            id: 'demo_teacher_2',
            title: 'Physics Lab Report - Electromagnetic Fields',
            description: 'Analyze the electromagnetic field patterns and write a comprehensive lab report',
            classId: 'physics301',
            dueDate: '2025-09-20T23:59:59.000Z',
            questions: [
              { id: 'q1', text: 'Calculate the electric field strength at point P', maxMarks: 20 },
              { id: 'q2', text: 'Analyze the magnetic field lines and their properties', maxMarks: 25 },
              { id: 'q3', text: 'Discuss the relationship between electric and magnetic fields', maxMarks: 30 }
            ],
            totalQuestions: 3,
            createdBy: 'demo_teacher',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z'
          },
          // Legacy assignments for backward compatibility
          '1': {
            id: '1',
            title: 'Math Problem Set 1',
            classId: 'class_1',
            description: 'Solve the following mathematical problems. Show all your work and explain your reasoning.',
            dueDate: '2024-02-01T23:59:59.000Z',
            questions: [
              { id: 'q1', text: 'Solve for x: 2x + 5 = 13', maxMarks: 10 },
              { id: 'q2', text: 'Find the derivative of x² + 3x', maxMarks: 15 },
              { id: 'q3', text: 'Calculate the area under the curve y = x² from x = 0 to x = 2', maxMarks: 20 }
            ],
            totalQuestions: 3,
            createdBy: 'demo_teacher',
            createdAt: '2024-01-15T10:30:00.000Z',
            updatedAt: '2024-01-15T10:30:00.000Z'
          },
          '2': {
            id: '2',
            title: 'Physics Lab Report',
            classId: 'class_1',
            description: 'Write a comprehensive lab report on the pendulum experiment. Include data analysis, calculations, and conclusions.',
            dueDate: '2024-02-05T23:59:59.000Z',
            questions: [
              { id: 'q1', text: 'Calculate the period of oscillation for different pendulum lengths', maxMarks: 20 },
              { id: 'q2', text: 'Analyze the relationship between length and period using graphs', maxMarks: 25 },
              { id: 'q3', text: 'Compare experimental results with theoretical predictions', maxMarks: 15 }
            ],
            totalQuestions: 3,
            createdBy: 'demo_teacher',
            createdAt: '2024-01-20T10:30:00.000Z',
            updatedAt: '2024-01-20T10:30:00.000Z'
          }
        };
        
        return assignments[id as keyof typeof assignments] || {
          id: id,
          title: 'Assignment Not Found',
          classId: 'unknown',
          description: 'This assignment could not be found.',
          dueDate: new Date().toISOString(),
          questions: [],
          totalQuestions: 0,
          createdBy: 'unknown',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      };

      const mockAssignment = getMockAssignment(assignmentId);
      
      // Mock submission data (if exists)
      const mockSubmission: Submission | null = assignmentId === '1' ? {
        id: 'sub_1',
        assignmentId: '1',
        studentId: 'student_1',
        files: [{ url: 'https://example.com/file1.pdf', name: 'math_homework.pdf', size: 2048576 }],
        submittedAt: '2024-01-30T14:30:00.000Z',
        status: 'graded',
        createdAt: '2024-01-30T14:30:00.000Z'
      } : null;

      setAssignment(mockAssignment);
      setSubmission(mockSubmission);
      setLoading(false);
    }, 1000);
  }, [assignmentId]);

  const handleUploadComplete = async (files: SubmissionFile[]) => {
    if (!user) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to submit assignments.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    
    try {
      // Create submission directly in Firestore
      const submissionData = {
        assignmentId,
        studentId: user.uid,
        files,
        submittedAt: new Date().toISOString(),
        status: 'submitted' as const
      };

      await createSubmission(submissionData);
      
      // Update local state
      const newSubmission: Submission = {
        id: 'temp-id', // Will be updated by Firestore
        assignmentId,
        studentId: user.uid,
        files,
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        createdAt: new Date().toISOString()
      };
      
      setSubmission(newSubmission);
      
      toast({
        title: "Assignment submitted successfully!",
        description: `Your submission for "${assignment?.title}" has been uploaded.`,
      });
      
    } catch (error) {
      console.error('Error creating submission:', error);
      toast({
        title: "Submission failed",
        description: "Failed to submit assignment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleUploadError = (error: string) => {
    toast({
      title: "Upload error",
      description: error,
      variant: "destructive"
    });
  };

  const getSubmissionStatus = () => {
    if (!submission) return 'not_submitted';
    return submission.status;
  };

  const isOverdue = () => {
    if (!assignment) return false;
    return new Date(assignment.dueDate) < new Date();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'graded':
        return <Badge variant="default" className="bg-green-500">Graded</Badge>;
      case 'submitted':
        return <Badge variant="secondary">Submitted</Badge>;
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
          <Header title="Assignment Details" />
          <div className="container mx-auto p-6">
            <div className="text-center">Loading assignment...</div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!assignment) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen pb-20">
          <Header title="Assignment Not Found" />
          <div className="container mx-auto p-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Assignment Not Found</h1>
              <p className="text-muted-foreground mb-4">The assignment you're looking for doesn't exist.</p>
              <Button onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const submissionStatus = getSubmissionStatus();
  const overdue = isOverdue();
  const isDemoAssignment = assignment && (assignment.id.startsWith('demo') || assignment.createdBy === 'demo_teacher');

  return (
    <ProtectedRoute>
      <div className="min-h-screen pb-20">
        <Header title="Assignment Details" />

        <main className="container mx-auto p-6 space-y-6">
          {/* Back Button */}
          <Button variant="outline" onClick={() => router.push('/dashboard/student')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          {/* Assignment Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{assignment.title}</h1>
                {isDemoAssignment && (
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                    Demo Assignment
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-4 mb-4">
                {getStatusBadge(submissionStatus)}
                {overdue && submissionStatus !== 'submitted' && submissionStatus !== 'graded' && (
                  <Badge variant="destructive">Overdue</Badge>
                )}
              </div>
              {isDemoAssignment && (
                <p className="text-sm text-muted-foreground mb-4">
                  This is a demo assignment for UI showcasing purposes.
                </p>
              )}
            </div>
          </div>

          {/* Assignment Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Due Date</p>
                    <p className="text-lg font-bold">
                      {new Date(assignment.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Questions</p>
                    <p className="text-lg font-bold">{assignment.questions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Total Marks</p>
                    <p className="text-lg font-bold">
                      {assignment.questions.reduce((sum, q) => sum + q.maxMarks, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assignment Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{assignment.description}</p>
            </CardContent>
          </Card>

          {/* Questions */}
          <Card>
            <CardHeader>
              <CardTitle>Questions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignment.questions.map((question, index) => (
                  <div key={question.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      <Badge variant="outline">{question.maxMarks} marks</Badge>
                    </div>
                    <p className="text-muted-foreground">{question.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Submission Section */}
          {submissionStatus === 'not_submitted' && (
            <Card>
              <CardHeader>
                <CardTitle>Submit Your Work</CardTitle>
              </CardHeader>
              <CardContent>
                {isDemoAssignment ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-2">Submission not available for demo assignments</p>
                    <p className="text-sm text-muted-foreground">
                      This is a demo assignment for UI showcasing. Real assignments will allow file submissions.
                    </p>
                  </div>
                ) : user && (
                  <SubmissionUploader
                    assignmentId={assignmentId}
                    studentId={user.uid}
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                  />
                )}
              </CardContent>
            </Card>
          )}

          {/* Submission Status */}
          {submission && (
            <Card>
              <CardHeader>
                <CardTitle>Your Submission</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Status: {getStatusBadge(submissionStatus)}</p>
                      <p className="text-sm text-muted-foreground">
                        Submitted: {new Date(submission.submittedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Submitted Files:</h4>
                    <div className="space-y-2">
                      {submission.files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                          <div className="flex items-center space-x-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <Button variant="outline" size="sm">
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

        <Navigation currentPath="/assignments" />
      </div>
    </ProtectedRoute>
  );
}
