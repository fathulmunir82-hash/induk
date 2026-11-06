import React, { useState, useEffect } from 'react';
import { Student, Teacher, MutationLog, SystemUser } from './types';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, INITIAL_MUTATIONS, INITIAL_USERS } from './lib/mockData';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BukuIndukView } from './components/BukuIndukView';
import { GuruView } from './components/GuruView';
import { AdministrasiView } from './components/AdministrasiView';
import { UserManagementView } from './components/UserManagementView';
import { StudentModal } from './components/StudentModal';
import { StudentDetailModal } from './components/StudentDetailModal';
import { LanInfoModal } from './components/LanInfoModal';
import { ImportModal } from './components/ImportModal';
import { LoginModal } from './components/LoginModal';
import { SCHOOL_INFO, db } from './lib/firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('sdn_rajasinga_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  const [teachers, setTeachers] = useState<Teacher[]>(() => {
    const saved = localStorage.getItem('sdn_rajasinga_teachers');
    return saved ? JSON.parse(saved) : INITIAL_TEACHERS;
  });
  const [users, setUsers] = useState<SystemUser[]>(() => {
    const saved = localStorage.getItem('sdn_rajasinga_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [mutations, setMutations] = useState<MutationLog[]>(() => {
    const saved = localStorage.getItem('sdn_rajasinga_mutations');
    return saved ? JSON.parse(saved) : INITIAL_MUTATIONS;
  });

  const [currentUser, setCurrentUser] = useState<SystemUser | null>(() => {
    const saved = localStorage.getItem('sdn_rajasinga_current_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Default logged in as Fathul Munir
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isLanModalOpen, setIsLanModalOpen] = useState(false);

  // Import Modal state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importType, setImportType] = useState<'student' | 'teacher'>('student');

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('sdn_rajasinga_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('sdn_rajasinga_teachers', JSON.stringify(teachers));
  }, [teachers]);

  useEffect(() => {
    localStorage.setItem('sdn_rajasinga_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('sdn_rajasinga_mutations', JSON.stringify(mutations));
  }, [mutations]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sdn_rajasinga_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sdn_rajasinga_current_user');
    }
  }, [currentUser]);

  // Try syncing with Firestore if online & configured
  useEffect(() => {
    try {
      const unsubscribe = onSnapshot(collection(db, 'students'), (snapshot) => {
        if (!snapshot.empty) {
          const remoteStudents: Student[] = [];
          snapshot.forEach(docSnap => {
            remoteStudents.push({ id: docSnap.id, ...docSnap.data() } as Student);
          });
          setStudents(remoteStudents);
        }
      }, (err) => {
        console.log('Firestore offline mode / using localStorage fallback:', err.message);
      });
      return () => unsubscribe();
    } catch (e) {
      console.log('Firestore not initialized, running local mode.');
    }
  }, []);

  // CRUD Handlers for Students
  const handleSaveStudent = async (student: Student) => {
    const isNew = !students.some(s => s.id === student.id);
    let updatedList: Student[];

    if (isNew) {
      updatedList = [student, ...students];
      const newLog: MutationLog = {
        id: 'm_' + Date.now(),
        studentId: student.id,
        studentName: student.namaLengkap,
        nisn: student.nisn,
        jenisMutasi: student.status === 'Pindah Masuk' ? 'Masuk' : 'Kenaikan Kelas',
        keterangan: `Pendaftaran data buku induk baru siswa Kelas ${student.kelas}`,
        tanggal: student.tanggalMasuk || new Date().toISOString().split('T')[0],
        kelasTujuan: student.kelas,
        operator: currentUser?.nama || SCHOOL_INFO.operator
      };
      setMutations([newLog, ...mutations]);
    } else {
      updatedList = students.map(s => s.id === student.id ? student : s);
    }

    setStudents(updatedList);

    try {
      await setDoc(doc(db, 'students', student.id), student);
    } catch (e) {
      // LocalStorage updated
    }
  };

  const handleUpdateStudent = async (updatedStudent: Student) => {
    setStudents(students.map(s => s.id === updatedStudent.id ? updatedStudent : s));
    if (detailStudent && detailStudent.id === updatedStudent.id) {
      setDetailStudent(updatedStudent);
    }
    try {
      await setDoc(doc(db, 'students', updatedStudent.id), updatedStudent);
    } catch (e) {
      // LocalStorage updated
    }
  };

  const handleDeleteStudent = async (id: string) => {
    setStudents(students.filter(s => s.id !== id));
    try {
      await deleteDoc(doc(db, 'students', id));
    } catch (e) {
      // LocalStorage updated
    }
  };

  const handleAddTeacher = async (teacher: Teacher) => {
    setTeachers([teacher, ...teachers]);
    try {
      await setDoc(doc(db, 'teachers', teacher.id), teacher);
    } catch (e) {
      // LocalStorage fallback
    }
  };

  const handleUpdateTeacher = async (updatedTeacher: Teacher) => {
    setTeachers(teachers.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
    try {
      await setDoc(doc(db, 'teachers', updatedTeacher.id), updatedTeacher);
    } catch (e) {
      // LocalStorage fallback
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    setTeachers(teachers.filter(t => t.id !== id));
    try {
      await deleteDoc(doc(db, 'teachers', id));
    } catch (e) {
      // LocalStorage fallback
    }
  };

  const handleAddUser = (user: SystemUser) => {
    setUsers([user, ...users]);
  };

  const handleUpdateUser = (updatedUser: SystemUser) => {
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleImportStudents = (newStudents: Student[]) => {
    setStudents([...newStudents, ...students]);
  };

  const handleImportTeachers = (newTeachers: Teacher[]) => {
    setTeachers([...newTeachers, ...teachers]);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-emerald-600 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenLanModal={() => setIsLanModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            teachers={teachers}
            mutations={mutations}
            onNavigate={setActiveTab}
            onOpenAddStudent={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
          />
        )}

        {activeTab === 'buku-induk' && (
          <BukuIndukView
            students={students}
            onOpenAddModal={() => {
              setEditingStudent(null);
              setIsStudentModalOpen(true);
            }}
            onOpenEditModal={(student) => {
              setEditingStudent(student);
              setIsStudentModalOpen(true);
            }}
            onOpenDetailModal={(student) => {
              setDetailStudent(student);
              setIsDetailModalOpen(true);
            }}
            onDeleteStudent={handleDeleteStudent}
            onOpenImportModal={() => {
              setImportType('student');
              setIsImportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'guru' && (
          <GuruView
            teachers={teachers}
            onAddTeacher={handleAddTeacher}
            onUpdateTeacher={handleUpdateTeacher}
            onDeleteTeacher={handleDeleteTeacher}
            onOpenImportModal={() => {
              setImportType('teacher');
              setIsImportModalOpen(true);
            }}
          />
        )}

        {activeTab === 'administrasi' && (
          <AdministrasiView
            students={students}
          />
        )}

        {activeTab === 'users' && (
          <UserManagementView
            users={users}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onDeleteUser={handleDeleteUser}
            currentUser={currentUser}
            onLogout={() => {
              setCurrentUser(null);
              setIsLoginModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-300 py-6 border-t border-emerald-900 text-xs mt-12 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="font-bold text-white text-sm">{SCHOOL_INFO.nama}</p>
            <p className="text-emerald-400">NPSN: {SCHOOL_INFO.npsn} &bull; {SCHOOL_INFO.alamat}</p>
          </div>
          <div className="text-center sm:text-right text-emerald-400">
            <p>Login NIP &bull; Operator: <strong className="text-white">{currentUser?.nama || SCHOOL_INFO.operator}</strong></p>
            <p className="text-[11px] text-emerald-500 pt-0.5">Firebase Storage & Firestore Real-Time</p>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        editingStudent={editingStudent}
      />

      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        student={detailStudent}
        mutations={mutations}
        onUpdateStudent={handleUpdateStudent}
      />

      <LanInfoModal
        isOpen={isLanModalOpen}
        onClose={() => setIsLanModalOpen(false)}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        type={importType}
        onImportStudents={handleImportStudents}
        onImportTeachers={handleImportTeachers}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        users={users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsLoginModalOpen(false);
        }}
      />
    </div>
  );
}
