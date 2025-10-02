
export interface OwnerProfile {
  uid: string;
  school_name: string;
  principal_name?: string;
  mobile_number: string;
  school_image_url?: string;
  register_date?: string;
  address?: string;
  website?: string;
  school_code?: string;
}

export interface Staff {
  id: number;
  uid: string;
  staff_id: string;
  name: string;
  mobile: string;
  gmail?: string;
  father_name?: string;
  mother_name?: string;
  address?: string;
  password?: string;
  highest_qualification?: string;
  joining_date: string;
  photo_url?: string;
  salary_amount: number;
  total_paid: number;
  total_dues: number;
  is_active: boolean;
}

export interface SalaryRecord {
  id: number;
  uid: string;
  staff_id: string;
  date_time: string;
  amount: number;
  notes?: string;
}

export interface Subject {
  id: number;
  uid: string;
  subject_name: string;
}

export interface Class {
  id: number;
  uid: string;
  class_name: string;
  staff_id?: string;
  school_fees?: number;
}

export interface Assignment {
  id: number;
  uid: string;
  class_id: number;
  subject_id: number;
  staff_id?: string;
  incoming_time?: string;
  outgoing_time?: string;
}

export interface Student {
  id: number;
  uid: string;
  roll_number?: string;
  name: string;
  mobile?: string;
  gmail?: string;
  password?: string;
  father_name?: string;
  mother_name?: string;
  class?: string;
  address?: string;
  photo_url?: string;
  aadhar?: string;
  gender?: 'Male' | 'Female' | 'Other';
  date_of_birth?: string;
  registration_date: string;
  caste?: string;
  blood_group?: string;
  previous_school_name?: string;
  // Monthly fee tracking
  january?: string;
  february?: string;
  march?: string;
  april?: string;
  may?: string;
  june?: string;
  july?: string;
  august?: string;
  september?: string;
  october?: string;
  november?: string;
  december?: string;
}

export interface Expense {
  id: number;
  uid: string;
  date: string;
  category: string;
  notes?: string;
  amount: number;
}

export interface Attendance {
  id?: number;
  uid: string;
  class_id: number;
  date: string; // 'YYYY-MM-DD'
  present?: string; // Comma-separated roll numbers
  absent?: string;  // Comma-separated roll numbers
}

export interface FeeType {
  id: number;
  uid: string;
  fees_name: string;
  amount: number;
  frequency: string;
}
