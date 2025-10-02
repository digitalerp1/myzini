
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { Staff, SalaryRecord } from '../types';
import Spinner from './Spinner';
import UserCircleIcon from './icons/UserCircleIcon';
import PhoneIcon from './icons/PhoneIcon';
import LocationIcon from './icons/LocationIcon';
import CalendarIcon from './icons/CalendarIcon';
import AcademicCapIcon from './icons/AcademicCapIcon';
import RupeeIcon from './icons/RupeeIcon';


interface StaffProfileModalProps {
    staff: Staff;
    onClose: () => void;
    onPaymentSuccess: () => void;
}

const StaffProfileModal: React.FC<StaffProfileModalProps> = ({ staff, onClose, onPaymentSuccess }) => {
    const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
    const [loadingRecords, setLoadingRecords] = useState(true);
    const [paymentAmount, setPaymentAmount] = useState<number | ''>('');
    const [paymentNotes, setPaymentNotes] = useState('');
    const [paying, setPaying] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchSalaryRecords = useCallback(async () => {
        setLoadingRecords(true);
        const { data, error } = await supabase
            .from('salary_records')
            .select('*')
            .eq('staff_id', staff.staff_id)
            .order('date_time', { ascending: false });

        if (error) {
            setError(error.message);
        } else {
            setSalaryRecords(data as SalaryRecord[]);
        }
        setLoadingRecords(false);
    }, [staff.staff_id]);

    useEffect(() => {
        fetchSalaryRecords();
        
        const channel = supabase.channel(`salary-records-${staff.staff_id}`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'salary_records', filter: `staff_id=eq.${staff.staff_id}` }, 
            (payload) => {
                fetchSalaryRecords();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };

    }, [fetchSalaryRecords, staff.staff_id]);
    
    const handlePaySalary = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!paymentAmount || paymentAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }

        setPaying(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
         if (!user) {
            setError("You must be logged in to perform this action.");
            setPaying(false);
            return;
        }

        const { error: recordError } = await supabase.from('salary_records').insert({
            uid: user.id,
            staff_id: staff.staff_id,
            amount: paymentAmount,
            notes: paymentNotes
        });

        if(recordError){
            setError(`Failed to record payment: ${recordError.message}`);
            setPaying(false);
            return;
        }

        onPaymentSuccess();
        setPaymentAmount('');
        setPaymentNotes('');
        setPaying(false);
    }
    
    return (
         <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-gray-50 p-8 rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <h2 className="text-3xl font-bold text-gray-800">Staff Profile</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-4xl leading-none">&times;</button>
                </div>
                {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-md flex-shrink-0">{error}</div>}
                
                 <div className="overflow-y-auto pr-4 -mr-4">
                   <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Left Column: Profile & Info */}
                        <div className="lg:col-span-1 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-md text-center">
                                <img src={staff.photo_url || `https://ui-avatars.com/api/?name=${staff.name}&background=4f46e5&color=fff&size=128`} alt={staff.name} className="w-32 h-32 rounded-full object-cover mx-auto border-4 border-primary-dark shadow-lg"/>
                                <h3 className="text-2xl font-bold text-gray-900 mt-4">{staff.name}</h3>
                                <p className="text-sm text-gray-500 font-mono">{staff.staff_id}</p>
                                <span className={`mt-2 px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${staff.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {staff.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                                <h4 className="info-header"><UserCircleIcon /> Personal Information</h4>
                                <InfoItem label="Father's Name" value={staff.father_name} />
                                <InfoItem label="Mother's Name" value={staff.mother_name} />
                            </div>
                             <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                                <h4 className="info-header"><PhoneIcon /> Contact Details</h4>
                                <InfoItem label="Mobile" value={staff.mobile} />
                                <InfoItem label="Gmail" value={staff.gmail} />
                                <InfoItem label="Address" value={staff.address} fullWidth/>
                            </div>
                            <div className="bg-white p-6 rounded-xl shadow-md space-y-4">
                                <h4 className="info-header"><AcademicCapIcon /> Professional Information</h4>
                                <InfoItem label="Joining Date" value={new Date(staff.joining_date).toLocaleDateString()} />
                                <InfoItem label="Highest Qualification" value={staff.highest_qualification} />
                            </div>
                        </div>

                        {/* Right Column: Salary & History */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h4 className="info-header"><RupeeIcon className="w-5 h-5"/> Salary Overview</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <SalaryStatCard label="Monthly Salary" value={`₹${staff.salary_amount.toLocaleString()}`} color="blue" />
                                    <SalaryStatCard label="Status" value={ staff.is_active ? 'Active' : 'Inactive' } color={staff.is_active ? "green" : "red"} />
                                </div>
                            </div>
                            
                            <div className="bg-white p-6 rounded-xl shadow-md">
                                <h4 className="info-header"><CalendarIcon /> Pay Salary</h4>
                                <form onSubmit={handlePaySalary} className="space-y-4">
                                    <div>
                                        <label htmlFor="payment_amount" className="block text-sm font-medium text-gray-700">Amount</label>
                                        <input type="number" id="payment_amount" value={paymentAmount} onChange={e => setPaymentAmount(Number(e.target.value))} required className="mt-1 input-field" placeholder="e.g., 5000"/>
                                    </div>
                                    <div>
                                         <label htmlFor="payment_notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
                                        <textarea id="payment_notes" rows={2} value={paymentNotes} onChange={e => setPaymentNotes(e.target.value)} className="mt-1 input-field" placeholder="e.g., Advance for May"/>
                                    </div>
                                    <button type="submit" disabled={paying} className="w-full px-6 py-2.5 bg-secondary text-white font-semibold rounded-md hover:bg-green-600 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors">
                                        {paying && <Spinner size="5" />}
                                        {paying ? 'Processing...' : 'Record Payment'}
                                    </button>
                                </form>
                            </div>

                             <div className="bg-white p-6 rounded-xl shadow-md">
                                <h4 className="info-header"><LocationIcon /> Payment History</h4>
                                <div className="h-80 overflow-y-auto border border-gray-200 rounded-md">
                                    {loadingRecords ? <div className="flex justify-center items-center h-full"><Spinner/></div> :
                                     salaryRecords.length === 0 ? <p className="p-4 text-center text-sm text-gray-500">No payment records found.</p> :
                                     (
                                         <table className="min-w-full text-sm">
                                             <thead className="bg-gray-50 sticky top-0">
                                                <tr>
                                                    <th className="p-2 text-left font-medium text-gray-500">Date</th>
                                                    <th className="p-2 text-right font-medium text-gray-500">Amount</th>
                                                    <th className="p-2 text-left font-medium text-gray-500">Notes</th>
                                                </tr>
                                             </thead>
                                             <tbody className="divide-y divide-gray-200">
                                                {salaryRecords.map(rec => (
                                                    <tr key={rec.id}>
                                                        <td className="p-2 whitespace-nowrap">{new Date(rec.date_time).toLocaleDateString()}</td>
                                                        <td className="p-2 font-medium text-right">₹ {rec.amount.toLocaleString()}</td>
                                                        <td className="p-2">{rec.notes}</td>
                                                    </tr>
                                                ))}
                                             </tbody>
                                         </table>
                                     )
                                    }
                                </div>
                            </div>
                        </div>
                   </div>
                 </div>
            </div>
             <style>{`
                .info-header { display: flex; align-items: center; gap: 0.5rem; font-size: 1.125rem; font-weight: 700; color: #374151; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; margin-bottom: 1rem; }
                .input-field {
                    display: block;
                    width: 100%;
                    border-radius: 0.375rem;
                    border-width: 1px;
                    border-color: #D1D5DB;
                    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
                    padding: 0.5rem 0.75rem;
                }
                .input-field:focus {
                    border-color: #4f46e5;
                    --tw-ring-color: #4f46e5;
                }
            `}</style>
        </div>
    );
};


const InfoItem = ({ label, value, fullWidth = false }: { label: string, value?: string | null, fullWidth?: boolean }) => (
    <div className={fullWidth ? 'col-span-full' : ''}>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-sm text-gray-900 break-words">{value || '-'}</p>
    </div>
);

const SalaryStatCard = ({ label, value, color }: { label: string, value: string, color: 'blue'|'green'|'red' }) => {
    const colors = {
        blue: 'bg-blue-50 text-blue-800',
        green: 'bg-green-50 text-green-800',
        red: 'bg-red-50 text-red-800'
    };
    return (
        <div className={`p-4 rounded-lg text-center ${colors[color]}`}>
            <p className="text-sm font-medium uppercase">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
        </div>
    );
}

export default StaffProfileModal;
