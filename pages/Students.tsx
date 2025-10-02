
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student as StudentType, Class } from '../types';
import Spinner from '../components/Spinner';
import StudentModal from '../components/StudentModal';
import StudentProfileModal from '../components/StudentProfileModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';
import ViewIcon from '../components/icons/ViewIcon';

const Students: React.FC = () => {
    const [students, setStudents] = useState<StudentType[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentType | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClass, setSelectedClass] = useState('all');

    const fetchData = useCallback(async () => {
        const { data: studentsData, error: studentsError } = await supabase
            .from('students')
            .select('*');

        if (studentsError) {
            setError(studentsError.message);
            setLoading(false);
            return;
        }
        setStudents(studentsData as StudentType[]);

        const { data: classesData, error: classesError } = await supabase
            .from('classes')
            .select('*')
            .order('class_name', { ascending: true });

        if (classesError) {
            setError(classesError.message);
        } else {
            setClasses(classesData as Class[]);
        }

        setLoading(false);
    }, []);

    useEffect(() => {
        setLoading(true);
        fetchData();

        const channel = supabase.channel('public:students')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'students' }, (payload) => {
                console.log('Student change received!', payload);
                fetchData();
            })
            .subscribe();
        
        const classesChannel = supabase.channel('public:classes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'classes' }, () => {
                fetchData();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
            supabase.removeChannel(classesChannel);
        };
    }, [fetchData]);
    
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleAdd = () => {
        setSelectedStudent(null);
        setIsModalOpen(true);
    };

    const handleEdit = (student: StudentType) => {
        setSelectedStudent(student);
        setIsModalOpen(true);
    };
    
    const handleViewProfile = (student: StudentType) => {
        setSelectedStudent(student);
        setIsProfileModalOpen(true);
    };

    const handleDelete = async (studentId: number, studentName: string) => {
        if (window.confirm(`Are you sure you want to delete the record for ${studentName}?`)) {
            const { error } = await supabase.from('students').delete().eq('id', studentId);
            if (error) {
                showMessage('error', `Error deleting student: ${error.message}`);
            } else {
                showMessage('success', 'Student record deleted successfully.');
            }
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setIsProfileModalOpen(false);
        setSelectedStudent(null);
    };

    const filteredAndSortedStudents = students
        .filter(student => {
            const matchesClass = selectedClass === 'all' || student.class === selectedClass;
            const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesClass && matchesSearch;
        })
        .sort((a, b) => {
            // Handle null, undefined, or non-numeric roll numbers gracefully
            const rollA = parseInt(String(a.roll_number).replace(/\D/g, '') || '0', 10);
            const rollB = parseInt(String(b.roll_number).replace(/\D/g, '') || '0', 10);
            
            if (rollA === 0 && rollB > 0) return 1; // Put students without roll number at the end
            if (rollB === 0 && rollA > 0) return -1;

            return rollA - rollB;
        });

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Student Management</h1>
                <button
                    onClick={handleAdd}
                    className="px-5 py-2.5 bg-primary text-white font-semibold rounded-md hover:bg-primary-dark transition-colors"
                >
                    Add New Student
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-4 text-sm rounded-md ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex flex-wrap gap-4 items-center p-4 bg-gray-50 rounded-lg mb-6">
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Name</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Enter student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label htmlFor="classFilter" className="block text-sm font-medium text-gray-700">Filter by Class</label>
                    <select
                        id="classFilter"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    >
                        <option value="all">All Classes</option>
                        {classes.map(c => (
                            <option key={c.id} value={c.class_name}>{c.class_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center h-96"><Spinner size="12" /></div>
            ) : error ? (
                <div className="text-center text-red-500">{error}</div>
            ) : filteredAndSortedStudents.length === 0 ? (
                <div className="text-center text-gray-500 h-96 flex flex-col justify-center items-center">
                    <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                    <h2 className="mt-4 text-xl font-semibold">No Students Found</h2>
                    <p className="mt-2">Get started by adding your first student record.</p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No.</th>
                                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile</th>
                                <th className="py-3 px-4 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAndSortedStudents.map((student) => (
                                <tr key={student.id}>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-gray-900">{student.name}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{student.class || 'N/A'}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{student.roll_number || 'N/A'}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{student.mobile || 'N/A'}</td>
                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-medium text-center">
                                        <div className="flex justify-center items-center space-x-2">
                                            <button onClick={() => handleViewProfile(student)} className="text-blue-600 hover:text-blue-900 transition-colors" title="View Profile"><ViewIcon /></button>
                                            <button onClick={() => handleEdit(student)} className="text-indigo-600 hover:text-indigo-900 transition-colors" title="Edit"><EditIcon /></button>
                                            <button onClick={() => handleDelete(student.id, student.name)} className="text-red-600 hover:text-red-900 transition-colors" title="Delete"><DeleteIcon /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {isModalOpen && (
                <StudentModal 
                    student={selectedStudent}
                    classes={classes}
                    onClose={closeModal}
                    onSave={() => {
                        showMessage('success', `Student ${selectedStudent ? 'updated' : 'added'} successfully.`);
                        closeModal();
                    }}
                />
            )}

            {isProfileModalOpen && selectedStudent && (
                 <StudentProfileModal 
                    student={selectedStudent}
                    classes={classes}
                    onClose={closeModal}
                 />
            )}
        </div>
    );
};

export default Students;
