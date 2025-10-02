```typescript
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Student as StudentType, Class } from '../types';
import Spinner from '../components/Spinner';
import StudentModal from '../components/StudentModal';
import StudentProfileModal from '../components/StudentProfileModal';
import EditIcon from '../components/icons/EditIcon';
import DeleteIcon from '../components/icons/DeleteIcon';
import ViewIcon from '../components/icons/ViewIcon';
import FullScreenEmbed from '../components/FullScreenEmbed';

const Students: React.FC = () => {
    const [students, setStudents] = useState<StudentType[]>([]);
    const [classes, setClasses] = useState<Class[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isEmbedOpen, setIsEmbedOpen] = useState(false);
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
        setIsEmbedOpen(true);
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
        if (window.confirm(`Are you sure you want to delete the record for ${studentName}? This will also delete related fee records.`)) {
            // First, delete related fee records
            const { error: feeError } = await supabase.from('fee_records').delete().eq('student_id', studentId);
            if(feeError){
                showMessage('error', `Could not delete fee records: ${feeError.message}`);
                return;
            }

            // Then, delete the student
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
            const rollA = parseInt(String(a.roll_number).replace(/\D/g, '') || '0', 10);
            const rollB = parseInt(String(b.roll_number).replace(/\D/g, '') || '0', 10);
            
            if (rollA === 0 && rollB > 0) return 1;
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

            <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
                <div className="relative flex-grow w-full md:w-auto">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                    </span>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by student name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>
                <div className="flex-grow w-full md:w-auto md:flex-grow-0">
                    <select
                        id="classFilter"
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                        className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
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
                    <p className="mt-2">Your search and filter criteria did not match any students.</p>
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

            {isEmbedOpen && (
                <FullScreenEmbed 
                    src="https://digitalerp.shop/add_students.html"
                    onClose={() => setIsEmbedOpen(false)}
                />
            )}
        </div>
    );
};

export default Students;
```
