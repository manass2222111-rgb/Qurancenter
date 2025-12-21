
import React, { useState, useMemo, useEffect } from 'react';
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
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Partial<Record<keyof Student, string>>>({});
  
  // حالة الطالب المختار للعرض/التعديل
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  // استعادة الفلاتر الذكية
  const uniqueValues = useMemo(() => ({
    nationalities: Array.from(new Set(students.map(s => s.nationality))).filter(Boolean).sort(),
    levels: Array.from(new Set(students.map(s => s.level))).filter(Boolean).sort(),
    teachers: Array.from(new Set(students.map(s => s.teacher))).filter(Boolean).sort(),
    fees: Array.from(new Set(students.map(s => s.fees))).filter(Boolean),
    circles: Array.from(new Set(students.map(s => s.circle))).filter(Boolean).sort(),
  }), [students]);

  const filtered = useMemo(() => {
    return students.filter(student => {
      const matchesSearch = !search || Object.values(student).some(v => smartMatch(String(v), String(search)));
      const matchesColumnFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return String(student[key as keyof Student]) === value;
      });
      return matchesSearch && matchesColumnFilters;
    });
  }, [students, search, filters]);

  const handleOpenDetails = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditMode(false);
    // منع التمرير في الخلفية عند فتح النافذة
    document.body.style.overflow = 'hidden';
  };

  const handleCloseDetails = () => {
    setSelectedStudent(null);
    document.body.style.overflow = 'auto';
  };

  const handleSaveEdit = () => {
    if (editFormData && onUpdate) {
      onUpdate(editFormData);
      handleCloseDetails();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedStudent && onDelete) {
      if (window.confirm(`هل أنت متأكد من حذف الدارس "${selectedStudent.name}" نهائياً من جوجل شيت؟`)) {
        onDelete(selectedStudent);
        handleCloseDetails();
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
    <div className="space-y-6">
      {/* Control Bar with Restored Filters */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-xl">
              <input 
                type="text" 
                placeholder="البحث الذكي السريع..." 
                className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-bold"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={exportToExcel} className="px-6 py-4 bg-emerald-50 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-100 transition-all flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              تصدير Excel
            </button>
            <button 
              onClick={() => setShowFilters(!showFilters)} 
              className={`px-6 py-4 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${showFilters ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-slate-100 text-slate-600'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              تصفية متقدمة
            </button>
          </div>
        </div>

        {/* Restored Filters UI */}
        {showFilters && (
          <div className="p-8 bg-slate-50/50 border-b border-slate-100 grid grid-cols-2 md:grid-cols-5 gap-4 animate-fade-up">
            {[
              { label: 'الجنسية', key: 'nationality', options: uniqueValues.nationalities },
              { label: 'المستوى', key: 'level', options: uniqueValues.levels },
              { label: 'المعلم', key: 'teacher', options: uniqueValues.teachers },
              { label: 'الحلقة', key: 'circle', options: uniqueValues.circles },
              { label: 'الرسوم', key: 'fees', options: uniqueValues.fees },
            ].map(f => (
              <div key={f.key} className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase pr-1">{f.label}</label>
                <select 
                  className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                  value={filters[f.key as keyof Student] || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
                >
                  <option value="">الكل</option>
                  {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            ))}
            <div className="md:col-span-5 flex justify-end">
              <button onClick={() => setFilters({})} className="text-[10px] font-black text-rose-500 uppercase hover:underline">إعادة ضبط الفلاتر</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">م</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">الدارس</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">المعلم والحلقة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">المستوى</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">رقم الهوية</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">الحالة المادية</th>
                <th className="px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s, idx) => (
                <tr key={s.id + idx} className="hover:bg-slate-50 transition-all group cursor-pointer" onClick={() => handleOpenDetails(s)}>
                  <td className="px-8 py-5 text-xs text-slate-400 font-bold text-center">{idx + 1}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs">{s.name.charAt(0)}</div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-bold">
                    <p>{s.teacher}</p>
                    <p className="text-[10px] text-slate-400 font-medium">حلقة: {s.circle}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg border border-blue-100">مستوى {s.level}</span>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-mono">{s.nationalId}</td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.fees === 'نعم' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className="text-[11px] font-bold text-slate-500">{s.fees === 'نعم' ? 'خالص' : 'مستحق'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-left">
                    <button className="p-2 text-slate-300 hover:text-indigo-600 transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FIXED Details Card - solving the scrolling issue */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[100] bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[3rem] w-full max-w-5xl shadow-2xl flex flex-col animate-fade-up my-auto relative">
            
            {/* Header */}
            <div className="bg-[#0F172A] p-8 md:p-10 text-white flex justify-between items-center rounded-t-[3rem]">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center text-2xl md:text-3xl font-black border border-indigo-400/20">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black mb-1">{selectedStudent.name}</h3>
                  <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest">ملف الدارس رقم: {selectedStudent.id}</p>
                </div>
              </div>
              <button onClick={handleCloseDetails} className="w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-rose-500 transition-all">✕</button>
            </div>

            {/* Scrollable Body Content */}
            <div className="p-8 md:p-12 space-y-10 bg-slate-50 overflow-y-auto max-h-[65vh] custom-scrollbar">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* 1. البيانات الشخصية */}
                <div className="space-y-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-indigo-600 uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></span> البيانات الشخصية
                  </h4>
                  {[
                    { label: 'الجنسية', key: 'nationality' },
                    { label: 'تاريخ الميلاد', key: 'dob', type: 'date' },
                    { label: 'رقم الهاتف', key: 'phone' },
                    { label: 'السكن', key: 'address' },
                    { label: 'المؤهل', key: 'qualification' },
                    { label: 'الوظيفة', key: 'job' },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold px-2">{f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-500' : 'border-transparent bg-slate-50 text-slate-600'}`}
                      />
                    </div>
                  ))}
                </div>

                {/* 2. المسار التعليمي */}
                <div className="space-y-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-emerald-600 uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full"></span> المسار التعليمي
                  </h4>
                  {[
                    { label: 'المعلم', key: 'teacher' },
                    { label: 'الحلقة', key: 'circle' },
                    { label: 'المستوى', key: 'level' },
                    { label: 'الجزء الحالي', key: 'part', type: 'number' },
                    { label: 'تاريخ التسجيل', key: 'regDate', type: 'date' },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold px-2">{f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-500' : 'border-transparent bg-slate-50 text-slate-600'}`}
                      />
                    </div>
                  ))}
                </div>

                {/* 3. البيانات الإدارية والمالية */}
                <div className="space-y-6 bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                  <h4 className="text-[10px] font-black text-rose-600 uppercase mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-rose-600 rounded-full"></span> البيانات الإدارية
                  </h4>
                  {[
                    { label: 'رقم الهوية', key: 'nationalId' },
                    { label: 'انتهاء الهوية', key: 'expiryId', type: 'date' },
                    { label: 'الفئة', key: 'category' },
                    { label: 'الفترة', key: 'period' },
                    { label: 'حالة الرسوم', key: 'fees' },
                  ].map(f => (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-bold px-2">{f.label}</label>
                      <input 
                        type={f.type || 'text'}
                        readOnly={!isEditMode}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                        className={`w-full px-4 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-500' : 'border-transparent bg-slate-50 text-slate-600'}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-8 md:p-10 bg-white border-t border-slate-100 rounded-b-[3rem] flex flex-col md:flex-row justify-between items-center gap-4">
              <button onClick={handleDelete} className="w-full md:w-auto px-8 py-4 bg-rose-50 text-rose-600 rounded-2xl font-black text-xs hover:bg-rose-100 transition-all">
                حذف السجل نهائياً
              </button>
              <div className="flex gap-4 w-full md:w-auto">
                {isEditMode ? (
                  <>
                    <button onClick={() => setIsEditMode(false)} className="flex-1 md:px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs">إلغاء</button>
                    <button onClick={handleSaveEdit} className="flex-[2] md:px-12 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">حفظ التغييرات في السحابة</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsEditMode(true)} className="flex-1 md:px-10 py-4 border-2 border-indigo-100 text-indigo-600 rounded-2xl font-black text-xs hover:bg-indigo-50">تفعيل التعديل</button>
                    <button onClick={handleCloseDetails} className="flex-1 md:px-12 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs shadow-xl hover:bg-indigo-600 transition-all">إغلاق البطاقة</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
