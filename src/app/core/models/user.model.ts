export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Doctor' | 'Patient';
  phoneNumber?: string;
  isActive: boolean;
  doctorId?: number;
  patientId?: number;
  adminId?: number;
}