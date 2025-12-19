import React, { useState } from 'react';
import {
   UserCheck, Users, Plus, Search, Filter,
   MoreHorizontal, CheckCircle, XCircle, Clock,
   Briefcase, Banknote, Download, Shield, Eye, Calendar, Save,
   Lock, Edit2, Trash2
} from 'lucide-react';
import { Employee, PayrollRecord, AttendanceRecord, Role, AppModule, ActionType } from '../types';
import { useStore } from '../context/StoreContext';

const MODULES: AppModule[] = ['Customer', 'Karigar', 'Dealer', 'Mint', 'Tejori', 'Diamond', 'Hallmark', 'Accounts', 'HR'];
const ACTIONS: ActionType[] = ['View', 'Add', 'Edit', 'Delete', 'Approve'];

const HR = () => {
   const { employees, addEmployee, logs, roles, payrolls, addPayroll, attendance, markAttendance, addRole, updateRole } = useStore();
   const [activeTab, setActiveTab] = useState<'Employees' | 'Attendance' | 'Payroll' | 'Roles' | 'Logs'>('Employees');
   const [showAddEmployee, setShowAddEmployee] = useState(false);
   const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
   const [selectedPayroll, setSelectedPayroll] = useState<PayrollRecord | null>(null);

   // Role Management State
   const [showRoleModal, setShowRoleModal] = useState(false);
   const [isEditingRole, setIsEditingRole] = useState(false);
   const [newRole, setNewRole] = useState<Partial<Role>>({
      name: '',
      description: '',
      permissions: []
   });

   // New Employee Form State
   const [newEmp, setNewEmp] = useState<Partial<Employee>>({
      code: '', fullName: '', email: '', phone: '', designation: 'Sales Exec', department: 'Showroom',
      dateOfJoining: '', status: 'Active', address: '', dob: '',
      basicSalary: 0, hra: 0, conveyance: 0, allowances: 0, deductions: 0,
      bankName: '', accountNumber: '', ifscCode: ''
   });

   const handleSaveEmployee = () => {
      if (!newEmp.fullName || !newEmp.code) {
         alert("Name and Employee Code are required");
         return;
      }
      addEmployee({
         id: Math.random().toString(),
         code: newEmp.code!,
         fullName: newEmp.fullName!,
         email: newEmp.email || '',
         phone: newEmp.phone || '',
         designation: newEmp.designation as any,
         department: newEmp.department as any,
         dateOfJoining: newEmp.dateOfJoining || new Date().toISOString().split('T')[0],
         status: newEmp.status as any,
         address: newEmp.address,
         dob: newEmp.dob,
         basicSalary: Number(newEmp.basicSalary),
         hra: Number(newEmp.hra),
         conveyance: Number(newEmp.conveyance),
         allowances: Number(newEmp.allowances),
         deductions: Number(newEmp.deductions),
         roleId: 'user',
         bankName: newEmp.bankName,
         accountNumber: newEmp.accountNumber,
         ifscCode: newEmp.ifscCode
      });
      setShowAddEmployee(false);
      setNewEmp({
         code: '', fullName: '', email: '', phone: '', designation: 'Sales Exec', department: 'Showroom',
         dateOfJoining: '', status: 'Active', address: '', dob: '',
         basicSalary: 0, hra: 0, conveyance: 0, allowances: 0, deductions: 0,
         bankName: '', accountNumber: '', ifscCode: ''
      });
   };

   const handleMarkAttendance = (empId: string, status: 'Present' | 'Absent' | 'Leave' | 'Half Day') => {
      markAttendance({
         id: `${empId}-${attendanceDate}`,
         employeeId: empId,
         date: attendanceDate,
         status: status
      });
   };

   const markAllPresent = () => {
      employees.filter(e => e.status === 'Active').forEach(emp => {
         handleMarkAttendance(emp.id, 'Present');
      });
   };

   const handleGeneratePayroll = () => {
      // Prevent duplicates for current month
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const exists = payrolls.some(p => p.month === currentMonth);
      if (exists) {
         alert('Payroll for this month already exists!');
         return;
      }

      const [year, month] = currentMonth.split('-').map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      employees.filter(e => e.status === 'Active').forEach(emp => {
         // Calculate attendance for this month
         // Note: In a real scenario, we'd query by date range. Simplified here to check matching YYYY-MM strings
         const monthlyAttendance = attendance.filter(a =>
            a.employeeId === emp.id && a.date.startsWith(currentMonth)
         );

         let presentDays = 0;
         monthlyAttendance.forEach(a => {
            if (a.status === 'Present') presentDays += 1;
            if (a.status === 'Half Day') presentDays += 0.5;
            // Holidays/Leaves logic can be added here
         });

         // Fallback: If no attendance marked, assume full presence for demo (or 0 if strict)
         const effectiveDays = monthlyAttendance.length > 0 ? presentDays : 0;

         const totalEarnings = emp.basicSalary + emp.hra + emp.conveyance + emp.allowances;
         const perDaySalary = totalEarnings / daysInMonth;

         const finalPayableDays = monthlyAttendance.length > 0 ? effectiveDays : daysInMonth;

         const gross = Math.round(perDaySalary * finalPayableDays);
         const net = gross - emp.deductions;

         const record: PayrollRecord = {
            id: Math.random().toString(),
            employeeId: emp.id,
            month: currentMonth,
            year: year,
            totalDays: daysInMonth,
            presentDays: finalPayableDays,
            basicPay: emp.basicSalary,
            additions: emp.hra + emp.conveyance + emp.allowances, // Storing standard, calculation happens on net
            deductions: emp.deductions,
            netPay: net,
            status: 'Draft',
            generatedDate: new Date().toISOString().split('T')[0]
         };
         addPayroll(record);
      });
   };

   // Role Handlers
   const handleOpenRoleModal = (role?: Role) => {
      if (role) {
         setNewRole({ ...role });
         setIsEditingRole(true);
      } else {
         setNewRole({ name: '', description: '', permissions: [] });
         setIsEditingRole(false);
      }
      setShowRoleModal(true);
   };

   const togglePermission = (module: string, action: string) => {
      const permString = `${module}:${action}`;
      const currentPerms = newRole.permissions || [];
      if (currentPerms.includes(permString)) {
         setNewRole({ ...newRole, permissions: currentPerms.filter(p => p !== permString) });
      } else {
         setNewRole({ ...newRole, permissions: [...currentPerms, permString] });
      }
   };

   const toggleModulePermissions = (module: string) => {
      const allActionsForModule = ACTIONS.map(a => `${module}:${a}`);
      const currentPerms = newRole.permissions || [];

      // Check if all are currently selected
      const allSelected = allActionsForModule.every(p => currentPerms.includes(p));

      if (allSelected) {
         // Remove all
         setNewRole({ ...newRole, permissions: currentPerms.filter(p => !allActionsForModule.includes(p)) });
      } else {
         // Add missing ones
         const newPerms = [...currentPerms];
         allActionsForModule.forEach(p => {
            if (!newPerms.includes(p)) newPerms.push(p);
         });
         setNewRole({ ...newRole, permissions: newPerms });
      }
   };

   const handleSaveRole = () => {
      if (!newRole.name) return;

      const roleData: Role = {
         id: newRole.id || Math.random().toString(),
         name: newRole.name,
         description: newRole.description || '',
         permissions: newRole.permissions || []
      };

      if (isEditingRole) {
         updateRole(roleData);
      } else {
         addRole(roleData);
      }
      setShowRoleModal(false);
   };

   return (
      <div className="p-8">
         <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-serif font-bold text-maroon-900">HR & Payroll</h1>
               <p className="text-gray-500 mt-1">Manage workforce, attendance, access, and salaries.</p>
            </div>
            <div className="flex gap-2 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
               {['Employees', 'Attendance', 'Payroll', 'Roles', 'Logs'].map(tab => (
                  <button
                     key={tab}
                     onClick={() => setActiveTab(tab as any)}
                     className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab
                        ? 'bg-maroon-900 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                        }`}
                  >
                     {tab}
                  </button>
               ))}
            </div>
         </div>

         {/* --- EMPLOYEES TAB --- */}
         {activeTab === 'Employees' && (
            <div className="space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                     <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users size={24} /></div>
                     <div><p className="text-xs text-gray-500 uppercase">Total Staff</p><p className="text-xl font-bold text-gray-800">{employees.length}</p></div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                     <div className="p-3 bg-green-50 text-green-600 rounded-xl"><UserCheck size={24} /></div>
                     <div><p className="text-xs text-gray-500 uppercase">Active</p><p className="text-xl font-bold text-gray-800">{employees.filter(e => e.status === 'Active').length}</p></div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                     <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Briefcase size={24} /></div>
                     <div><p className="text-xs text-gray-500 uppercase">Departments</p><p className="text-xl font-bold text-gray-800">5</p></div>
                  </div>
                  <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                     <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Banknote size={24} /></div>
                     <div><p className="text-xs text-gray-500 uppercase">Payroll Cost</p><p className="text-xl font-bold text-gray-800">₹{employees.reduce((a, b) => a + b.basicSalary + b.hra, 0) / 1000}k</p></div>
                  </div>
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                     <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input type="text" placeholder="Search Employee..." className="w-full pl-10 py-2 bg-gray-50 rounded-lg border-none text-sm" />
                     </div>
                     <button
                        onClick={() => setShowAddEmployee(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-maroon-900 text-white rounded-lg hover:bg-maroon-800 transition-colors text-sm font-medium"
                     >
                        <Plus size={16} /> Add Employee
                     </button>
                  </div>
                  <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                        <tr>
                           <th className="px-6 py-4">Employee</th>
                           <th className="px-6 py-4">Designation</th>
                           <th className="px-6 py-4">Department</th>
                           <th className="px-6 py-4">Contact</th>
                           <th className="px-6 py-4">Status</th>
                           <th className="px-6 py-4">Actions</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {employees.map(emp => (
                           <tr key={emp.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                 <p className="font-bold text-gray-800">{emp.fullName}</p>
                                 <p className="text-xs text-gray-500 font-mono">{emp.code}</p>
                              </td>
                              <td className="px-6 py-4 text-gray-600">{emp.designation}</td>
                              <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                              <td className="px-6 py-4 text-gray-600">
                                 <div className="flex flex-col text-xs">
                                    <span>{emp.phone}</span>
                                    <span className="text-gray-400">{emp.email}</span>
                                 </div>
                              </td>
                              <td className="px-6 py-4">
                                 <span className={`px-2 py-1 rounded-full text-xs font-medium border ${emp.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                    {emp.status}
                                 </span>
                              </td>
                              <td className="px-6 py-4">
                                 <button className="text-maroon-900 hover:text-gold-600 font-medium text-xs">Edit Profile</button>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* --- ATTENDANCE TAB --- */}
         {activeTab === 'Attendance' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex items-center gap-4">
                     <h3 className="font-bold text-gray-800">Daily Attendance</h3>
                     <input
                        type="date"
                        className="border border-gray-200 rounded-lg px-3 py-1 text-sm outline-none focus:border-gold-500"
                        value={attendanceDate}
                        onChange={(e) => setAttendanceDate(e.target.value)}
                     />
                  </div>
                  <div className="flex gap-4 items-center">
                     <button
                        onClick={markAllPresent}
                        className="text-sm font-medium text-green-600 hover:bg-green-50 px-3 py-1 rounded-lg"
                     >
                        Mark All Present
                     </button>
                     <div className="flex gap-3 text-sm">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-green-500"></span> Present</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Absent</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Late</div>
                     </div>
                  </div>
               </div>

               <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-gray-50 border-b border-gray-100 text-gray-500">
                        <tr>
                           <th className="px-6 py-3">Employee</th>
                           <th className="px-6 py-3">Department</th>
                           <th className="px-6 py-3">Mark Status</th>
                           <th className="px-6 py-3">Remarks</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {employees.filter(e => e.status === 'Active').map(emp => {
                           const record = attendance.find(a => a.employeeId === emp.id && a.date === attendanceDate);
                           const status = record?.status;

                           return (
                              <tr key={emp.id} className="hover:bg-gray-50">
                                 <td className="px-6 py-4">
                                    <div className="font-bold text-gray-800">{emp.fullName}</div>
                                    <div className="text-xs text-gray-500">{emp.code}</div>
                                 </td>
                                 <td className="px-6 py-4 text-gray-600">{emp.department}</td>
                                 <td className="px-6 py-4">
                                    <div className="flex gap-1">
                                       {['Present', 'Absent', 'Leave', 'Half Day'].map(s => (
                                          <button
                                             key={s}
                                             onClick={() => handleMarkAttendance(emp.id, s as any)}
                                             className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${status === s
                                                ? s === 'Present' ? 'bg-green-600 text-white border-green-600'
                                                   : s === 'Absent' ? 'bg-red-600 text-white border-red-600'
                                                      : 'bg-yellow-500 text-white border-yellow-500'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                          >
                                             {s}
                                          </button>
                                       ))}
                                    </div>
                                 </td>
                                 <td className="px-6 py-4">
                                    <input type="text" placeholder="Add note..." className="bg-transparent border-b border-gray-200 focus:border-gold-500 outline-none text-xs w-full" />
                                 </td>
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* --- PAYROLL TAB --- */}
         {activeTab === 'Payroll' && (
            <div className="space-y-6">
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
                  <div>
                     <h3 className="font-bold text-gray-800">Payroll Processor</h3>
                     <p className="text-sm text-gray-500">Generate salaries for Current Month based on Attendance</p>
                  </div>
                  <button
                     onClick={handleGeneratePayroll}
                     className="px-6 py-3 bg-maroon-900 text-white rounded-xl font-bold hover:bg-maroon-800 shadow-lg flex items-center gap-2"
                  >
                     <Banknote size={18} /> Run Payroll
                  </button>
               </div>

               {payrolls.length > 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                     <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                           <tr>
                              <th className="px-6 py-4">Employee</th>
                              <th className="px-6 py-4">Month</th>
                              <th className="px-6 py-4">Attendance</th>
                              <th className="px-6 py-4">Earnings</th>
                              <th className="px-6 py-4">Deductions</th>
                              <th className="px-6 py-4">Net Pay</th>
                              <th className="px-6 py-4">Action</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                           {payrolls.map(rec => {
                              const emp = employees.find(e => e.id === rec.employeeId);
                              return (
                                 <tr key={rec.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-gray-800">{emp?.fullName}</td>
                                    <td className="px-6 py-4 text-gray-600 font-mono">{rec.month}</td>
                                    <td className="px-6 py-4 text-gray-600">
                                       <span className={`font-bold ${rec.presentDays < rec.totalDays ? 'text-red-500' : 'text-green-600'}`}>
                                          {rec.presentDays}
                                       </span> / {rec.totalDays} Days
                                    </td>
                                    <td className="px-6 py-4 text-green-600">+₹{(rec.basicPay + rec.additions).toLocaleString()}</td>
                                    <td className="px-6 py-4 text-red-600">-₹{rec.deductions.toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-maroon-900">₹{rec.netPay.toLocaleString()}</td>
                                    <td className="px-6 py-4">
                                       <button onClick={() => setSelectedPayroll(rec)} className="text-blue-600 hover:underline text-xs flex items-center gap-1">
                                          <Eye size={12} /> View Slip
                                       </button>
                                    </td>
                                 </tr>
                              );
                           })}
                        </tbody>
                     </table>
                  </div>
               ) : (
                  <div className="p-8 text-center text-gray-400 bg-gray-50 rounded-2xl">No payroll records generated yet.</div>
               )}
            </div>
         )}

         {/* --- ROLES & PERMISSIONS TAB --- */}
         {activeTab === 'Roles' && (
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-800">Role-Based Access Control</h2>
                  <button
                     onClick={() => handleOpenRoleModal()}
                     className="flex items-center gap-2 px-4 py-2 bg-maroon-900 text-white rounded-lg hover:bg-maroon-800 transition-colors shadow text-sm font-medium"
                  >
                     <Plus size={16} /> Create New Role
                  </button>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.map(role => (
                     <div key={role.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-gold-300 transition-colors">
                        <div className="flex justify-between items-start mb-4">
                           <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
                              <Shield size={24} />
                           </div>
                           <button onClick={() => handleOpenRoleModal(role)} className="text-gray-400 hover:text-maroon-900">
                              <Edit2 size={18} />
                           </button>
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{role.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{role.description}</p>
                        <div className="border-t border-gray-100 pt-4">
                           <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Access Rights</p>
                           <div className="flex flex-wrap gap-2">
                              {role.permissions.includes('*') ? (
                                 <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">Full Access</span>
                              ) : (
                                 role.permissions.slice(0, 5).map((perm, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                       {perm}
                                    </span>
                                 ))
                              )}
                              {role.permissions.length > 5 && (
                                 <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">+{role.permissions.length - 5} more</span>
                              )}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         )}

         {/* --- LOGS TAB --- */}
         {activeTab === 'Logs' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
               <div className="p-4 border-b border-gray-100 bg-gray-50">
                  <h3 className="font-bold text-gray-800">System Activity Audit</h3>
               </div>
               <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                     <thead className="bg-white text-gray-500 border-b border-gray-100">
                        <tr>
                           <th className="px-6 py-4">Timestamp</th>
                           <th className="px-6 py-4">User</th>
                           <th className="px-6 py-4">Module</th>
                           <th className="px-6 py-4">Action</th>
                           <th className="px-6 py-4">Description</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-100">
                        {logs.length > 0 ? logs.map(log => (
                           <tr key={log.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 text-gray-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                              <td className="px-6 py-4 font-medium text-gray-800">{log.employeeName}</td>
                              <td className="px-6 py-4"><span className="px-2 py-1 bg-gray-100 rounded text-xs">{log.module}</span></td>
                              <td className="px-6 py-4 text-maroon-900 font-medium">{log.action}</td>
                              <td className="px-6 py-4 text-gray-600">{log.description}</td>
                           </tr>
                        )) : (
                           <tr><td colSpan={5} className="p-8 text-center text-gray-400">No activity recorded yet.</td></tr>
                        )}
                     </tbody>
                  </table>
               </div>
            </div>
         )}

         {/* Add Employee Modal */}
         {showAddEmployee && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl w-full max-w-4xl p-0 h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                  <div className="bg-maroon-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                     <h2 className="text-lg font-bold">New Employee Onboarding</h2>
                     <button onClick={() => setShowAddEmployee(false)} className="opacity-70 hover:opacity-100">✕</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-8">
                     {/* Personal & Professional */}
                     <div>
                        <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Employee Code</label>
                              <input type="text" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.code} onChange={e => setNewEmp({ ...newEmp, code: e.target.value })} placeholder="EMP-00X" />
                           </div>
                           <div className="md:col-span-2">
                              <label className="text-xs font-semibold text-gray-500 uppercase">Full Name</label>
                              <input type="text" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.fullName} onChange={e => setNewEmp({ ...newEmp, fullName: e.target.value })} />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Phone</label>
                              <input type="text" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.phone} onChange={e => setNewEmp({ ...newEmp, phone: e.target.value })} />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Email</label>
                              <input type="email" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.email} onChange={e => setNewEmp({ ...newEmp, email: e.target.value })} />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Date of Joining</label>
                              <input type="date" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.dateOfJoining} onChange={e => setNewEmp({ ...newEmp, dateOfJoining: e.target.value })} />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Department</label>
                              <select className="w-full mt-1 p-2 border border-gray-300 rounded outline-none bg-white"
                                 value={newEmp.department} onChange={e => setNewEmp({ ...newEmp, department: e.target.value as any })}>
                                 <option>Showroom</option><option>Tejori</option><option>Accounts</option><option>Management</option>
                              </select>
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Designation</label>
                              <select className="w-full mt-1 p-2 border border-gray-300 rounded outline-none bg-white"
                                 value={newEmp.designation} onChange={e => setNewEmp({ ...newEmp, designation: e.target.value as any })}>
                                 <option>Manager</option><option>Sales Exec</option><option>Cashier</option><option>Tejori Incharge</option>
                              </select>
                           </div>
                        </div>
                     </div>

                     {/* Financial */}
                     <div>
                        <h3 className="text-sm font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4 uppercase tracking-wider">Compensation & Bank Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Basic Salary</label>
                              <input type="number" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.basicSalary} onChange={e => setNewEmp({ ...newEmp, basicSalary: Number(e.target.value) })} />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">HRA</label>
                              <input type="number" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.hra} onChange={e => setNewEmp({ ...newEmp, hra: Number(e.target.value) })} />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Conveyance</label>
                              <input type="number" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.conveyance} onChange={e => setNewEmp({ ...newEmp, conveyance: Number(e.target.value) })} />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase text-red-500">Fixed Deductions</label>
                              <input type="number" className="w-full mt-1 p-2 border border-red-200 rounded outline-none text-red-600"
                                 value={newEmp.deductions} onChange={e => setNewEmp({ ...newEmp, deductions: Number(e.target.value) })} />
                           </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Bank Name</label>
                              <input type="text" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.bankName} onChange={e => setNewEmp({ ...newEmp, bankName: e.target.value })} />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">Account No</label>
                              <input type="text" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.accountNumber} onChange={e => setNewEmp({ ...newEmp, accountNumber: e.target.value })} />
                           </div>
                           <div>
                              <label className="text-xs font-semibold text-gray-500 uppercase">IFSC Code</label>
                              <input type="text" className="w-full mt-1 p-2 border border-gray-300 rounded outline-none"
                                 value={newEmp.ifscCode} onChange={e => setNewEmp({ ...newEmp, ifscCode: e.target.value })} />
                           </div>
                        </div>
                     </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-4">
                     <button onClick={() => setShowAddEmployee(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium">Cancel</button>
                     <button onClick={handleSaveEmployee} className="flex-1 py-3 bg-maroon-900 text-white rounded-xl font-bold shadow-lg">Onboard Employee</button>
                  </div>
               </div>
            </div>
         )}

         {/* Role Management Modal */}
         {showRoleModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
               <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
                  <div className="bg-purple-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
                     <h2 className="text-lg font-bold">{isEditingRole ? 'Edit Role Permissions' : 'Create New Role'}</h2>
                     <button onClick={() => setShowRoleModal(false)} className="opacity-70 hover:opacity-100">✕</button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase">Role Name</label>
                           <input
                              type="text"
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                              value={newRole.name}
                              onChange={e => setNewRole({ ...newRole, name: e.target.value })}
                              placeholder="e.g. Sales Manager"
                           />
                        </div>
                        <div>
                           <label className="text-xs font-semibold text-gray-500 uppercase">Description</label>
                           <input
                              type="text"
                              className="w-full mt-1 p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                              value={newRole.description}
                              onChange={e => setNewRole({ ...newRole, description: e.target.value })}
                              placeholder="e.g. Can manage sales and customers"
                           />
                        </div>
                     </div>

                     {/* Permission Matrix */}
                     <div className="border rounded-xl overflow-hidden shadow-sm">
                        <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                           <h3 className="font-bold text-gray-700 text-sm">Permission Matrix</h3>
                           <div className="text-xs text-gray-500">
                              {newRole.permissions?.length} rights selected
                           </div>
                        </div>
                        <table className="w-full text-sm text-left">
                           <thead className="bg-gray-50 text-gray-500 font-semibold border-b">
                              <tr>
                                 <th className="px-4 py-3">Module (Select All)</th>
                                 {ACTIONS.map(action => <th key={action} className="px-4 py-3 text-center">{action}</th>)}
                              </tr>
                           </thead>
                           <tbody className="divide-y">
                              {MODULES.map(module => (
                                 <tr key={module} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800 flex items-center gap-2">
                                       <input
                                          type="checkbox"
                                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                                          checked={ACTIONS.every(a => newRole.permissions?.includes(`${module}:${a}`) || newRole.permissions?.includes('*'))}
                                          onChange={() => toggleModulePermissions(module)}
                                          disabled={newRole.permissions?.includes('*')}
                                       />
                                       {module}
                                    </td>
                                    {ACTIONS.map(action => {
                                       const isChecked = newRole.permissions?.includes(`${module}:${action}`) || newRole.permissions?.includes('*');
                                       return (
                                          <td key={action} className="px-4 py-3 text-center">
                                             <input
                                                type="checkbox"
                                                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 cursor-pointer"
                                                checked={isChecked}
                                                onChange={() => togglePermission(module, action)}
                                                disabled={newRole.permissions?.includes('*')}
                                             />
                                          </td>
                                       );
                                    })}
                                 </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </div>

                  <div className="p-6 border-t border-gray-100 bg-gray-50 shrink-0 flex gap-4">
                     <button onClick={() => setShowRoleModal(false)} className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl font-medium">Cancel</button>
                     <button onClick={handleSaveRole} className="flex-1 py-3 bg-purple-800 text-white rounded-xl font-bold shadow-lg hover:bg-purple-900 transition-all">
                        {isEditingRole ? 'Update Role Rights' : 'Create Role'}
                     </button>
                  </div>
               </div>
            </div>
         )}

         {/* Payslip Modal */}
         {selectedPayroll && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
               <div className="bg-white w-full max-w-md rounded-xl p-6 shadow-2xl">
                  <div className="flex justify-between items-center mb-6 border-b pb-4">
                     <h3 className="font-bold text-lg">Payslip: {selectedPayroll.month}</h3>
                     <button onClick={() => setSelectedPayroll(null)}><XCircle size={24} className="text-gray-400 hover:text-red-500" /></button>
                  </div>
                  <div className="space-y-2 text-sm">
                     <div className="flex justify-between bg-gray-50 p-2 rounded"><span>Days Worked</span><span className="font-bold">{selectedPayroll.presentDays} / {selectedPayroll.totalDays}</span></div>
                     <div className="flex justify-between"><span>Basic Pay</span><span>{selectedPayroll.basicPay}</span></div>
                     <div className="flex justify-between"><span>HRA/Allowances</span><span>{selectedPayroll.additions}</span></div>
                     <div className="flex justify-between text-red-500"><span>Deductions</span><span>-{selectedPayroll.deductions}</span></div>
                     <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2"><span>Net Pay</span><span>₹{selectedPayroll.netPay}</span></div>
                  </div>
                  <button onClick={() => window.print()} className="mt-6 w-full py-2 bg-maroon-900 text-white rounded-lg font-bold">Print</button>
               </div>
            </div>
         )}
      </div>
   );
};

export default HR;