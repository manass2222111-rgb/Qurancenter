
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';
import * as XLSX from 'https://esm.sh/xlsx';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Partial<Record<keyof Student, string>>>({});
  
  // التحكم في اللوحة الجانبية
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  const filtered = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !search || Object.values(student).some(v => smartMatch(String(v), String(search)));
      const matchesColumnFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return smartMatch(String(student[key as keyof Student]), String(value));
      });
      return matchesSearch && matchesColumnFilters;
    });
  }, [students, search, filters]);

  const handleOpenDetails = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditMode(false);
  };

  const handleSaveEdit = () => {
    if (editFormData && onUpdate) {
      onUpdate(editFormData);
      setSelectedStudent(null);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedStudent && onDelete) {
      if (window.confirm(`هل أنت متأكد من حذف الدارس "${selectedStudent.name}" نهائياً من جوجل شيت؟`)) {
        onDelete(selectedStudent);
        setSelectedStudent(null);
      }
    }
  };

  const exportToExcel = () => {
    if (filtered.length === 0) return;
    const headers = ["م", "اسم الدارس", "الجنسية", "تاريخ الميلاد", "رقم الهاتف", "العمر", "المؤهل", "العمل", "السكن", "تاريخ التسجيل", "المستوى", "الجزء", "رقم الهوية", "الفئة", "الفترة", "انتهاء الهوية", "المحفظ", "الرسوم", "الحلقة", "نسبة الاكتمال"];
    const data = filtered.map(s => [s.id, s.name, s.nationality, s.dob, s.phone, s.age, s.qualification, s.job, s.address, s.regDate, s.level, s.part, s.nationalId, s.category, s.period, s.expiryId, s.teacher, s.fees, s.circle, s.completion]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!views'] = [{ RTL: true }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "الطلاب");
    XLSX.writeFile(wb, `طلاب_نور_القرآن.xlsx`);
  };

  return (
    <div className="relative">
      {/* Table Section */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-50 flex flex-wrap justify-between items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <input 
              type="text" 
              placeholder="البحث الذكي في سجل الدارسين..." 
              className="w-full pl-6 pr-12 py-3.5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <button onClick={exportToExcel} className="px-6 py-3.5 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            تصدير Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase text-center">م</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase">الدارس</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase">المعلم</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase">المستوى</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase">الهوية</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-900 uppercase">الحالة</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s, idx) => (
                <tr 
                  key={s.id + idx} 
                  className="hover:bg-indigo-50/30 transition-all group cursor-pointer"
                  onClick={() => handleOpenDetails(s)}
                >
                  <td className="px-6 py-4 text-xs text-slate-400 font-bold text-center">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center font-black text-xs">{s.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-600 font-bold">{s.teacher}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 text-[10px] font-black rounded-md">مستوى {s.level}</span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500 font-mono">{s.nationalId}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black ${s.fees === 'نعم' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {s.fees === 'نعم' ? 'خالص' : 'مستحق'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-left">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Side Detail Drawer */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${selectedStudent ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}></div>
        
        <div className={`absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transition-transform duration-500 ease-out transform ${selectedStudent ? 'translate-x-0' : 'translate-x-full'} flex flex-col`}>
          
          {/* Drawer Header */}
          <div className="p-8 bg-[#0F172A] text-white flex justify-between items-center relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                <svg width="100%" height="100%"><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="1"/></pattern><rect width="100%" height="100%" fill="url(#grid)" /></svg>
             </div>
             <div className="relative z-10 flex items-center gap-5">
                <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg">
                  {selectedStudent?.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedStudent?.name}</h3>
                  <p className="text-indigo-400 text-xs font-bold mt-1 uppercase tracking-widest">ملف الدارس رقم: {selectedStudent?.id}</p>
                </div>
             </div>
             <button onClick={() => setSelectedStudent(null)} className="relative z-10 w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-rose-500 transition-all">✕</button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-8 bg-slate-50/50 custom-scrollbar space-y-8">
            
            {/* Action Bar */}
            <div className="flex gap-4">
              <button 
                onClick={() => setIsEditMode(!isEditMode)} 
                className={`flex-1 py-4 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-2 ${isEditMode ? 'bg-rose-500 text-white' : 'bg-white border-2 border-slate-100 text-slate-600 shadow-sm hover:border-indigo-500 hover:text-indigo-600'}`}
              >
                {isEditMode ? 'إلغاء وضع التعديل' : 'تفعيل تعديل البيانات'}
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
              </button>
              <button onClick={handleDelete} className="px-6 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs hover:bg-rose-100 transition-all">
                حذف السجل
              </button>
            </div>

            {/* Data Grid */}
            <div className="grid grid-cols-1 gap-8 pb-10">
              
              {/* القسم 1: الشخصية */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> البيانات الشخصية
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: 'الجنسية', key: 'nationality' },
                    { label: 'تاريخ الميلاد', key: 'dob', type: 'date' },
                    { label: 'رقم الهاتف', key: 'phone' },
                    { label: 'العمر', key: 'age', readOnly: true },
                    { label: 'السكن', key: 'address' },
                    { label: 'المؤهل', key: 'qualification' },
                    { label: 'الوظيفة', key: 'job' },
                  ].map(f => (
                    <div key={f.key} className={f.key === 'job' ? 'col-span-2' : ''}>
                      <label className="text-[10px] text-slate-400 font-bold mb-1.5 block pr-1">{f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode || f.readOnly}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode && !f.readOnly ? 'border-indigo-100 bg-white focus:border-indigo-600' : 'border-transparent bg-slate-50 text-slate-600'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* القسم 2: التعليمية */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span> المسار التعليمي
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: 'اسم المعلم', key: 'teacher' },
                    { label: 'الحلقة', key: 'circle' },
                    { label: 'المستوى', key: 'level' },
                    { label: 'الجزء الحالي', key: 'part', type: 'number' },
                    { label: 'تاريخ التسجيل', key: 'regDate', type: 'date' },
                  ].map(f => (
                    <div key={f.key} className={f.key === 'regDate' ? 'col-span-2' : ''}>
                      <label className="text-[10px] text-slate-400 font-bold mb-1.5 block pr-1">{f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-600' : 'border-transparent bg-slate-50 text-slate-600'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* القسم 3: الإدارية */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h4 className="text-[10px] font-black text-rose-600 uppercase mb-6 flex items-center gap-2">
                   <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span> البيانات الإدارية والمالية
                </h4>
                <div className="grid grid-cols-2 gap-5">
                  {[
                    { label: 'رقم الهوية', key: 'nationalId' },
                    { label: 'انتهاء الهوية', key: 'expiryId', type: 'date' },
                    { label: 'الفئة', key: 'category' },
                    { label: 'الفترة', key: 'period' },
                    { label: 'سداد الرسوم', key: 'fees' },
                    { label: 'نسبة الإنجاز', key: 'completion', readOnly: true },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] text-slate-400 font-bold mb-1.5 block pr-1">{f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode || f.readOnly}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode && !f.readOnly ? 'border-indigo-100 bg-white focus:border-indigo-600' : 'border-transparent bg-slate-50 text-slate-600'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-8 bg-white border-t border-slate-100 flex gap-4 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
            {isEditMode ? (
              <button 
                onClick={handleSaveEdit} 
                className="flex-1 py-5 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-3"
              >
                تحديث البيانات في جوجل شيت
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/></svg>
              </button>
            ) : (
              <button 
                onClick={() => setSelectedStudent(null)} 
                className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-600 transition-all"
              >
                إغلاق بطاقة الدارس
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
