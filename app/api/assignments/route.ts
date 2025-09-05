import { NextRequest, NextResponse } from 'next/server';
import { collection, addDoc, getDocs, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Assignment } from '@/lib/types';

// GET /api/assignments - List assignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Build query based on classId filter
    let assignmentsQuery = query(collection(db, 'assignments'), orderBy('createdAt', 'desc'));
    
    if (classId) {
      assignmentsQuery = query(
        collection(db, 'assignments'),
        where('classId', '==', classId),
        orderBy('createdAt', 'desc')
      );
    }

    const assignmentsSnapshot = await getDocs(assignmentsQuery);

    const assignments: Assignment[] = assignmentsSnapshot.docs.map(doc => {
      const data = doc.data();
      const questions = Array.isArray(data.questions) ? data.questions : [];

      return {
        id: doc.id,
        title: data.title ?? '',
        classId: data.classId ?? '',
        description: data.description ?? '',
        dueDate: data.dueDate ?? '',
        questions,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        // ✅ Ensure required fields are always present
        totalQuestions: data.totalQuestions ?? questions.length,
        createdBy: data.createdBy ?? 'unknown',
      };
    });

    return NextResponse.json({ assignments });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}

// POST /api/assignments - Create assignment (teacher only)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, classId, description, dueDate, questions, userId, userRole } = body;

    // Validate required fields
    if (!title || !classId || !description || !dueDate || !questions || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is a teacher
    if (userRole !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can create assignments' }, { status: 403 });
    }

    // Validate questions structure
    if (!Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'At least one question is required' }, { status: 400 });
    }

    for (const question of questions) {
      if (!question.id || !question.text || typeof question.maxMarks !== 'number') {
        return NextResponse.json({ error: 'Invalid question structure' }, { status: 400 });
      }
    }

    // ✅ Include required fields when creating assignment
    const assignmentData = {
      title,
      classId,
      description,
      dueDate,
      questions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      totalQuestions: questions.length,
      createdBy: userId,
    };

    const docRef = await addDoc(collection(db, 'assignments'), assignmentData);

    return NextResponse.json({ 
      id: docRef.id,
      message: 'Assignment created successfully' 
    });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Failed to create assignment' }, { status: 500 });
  }
}
