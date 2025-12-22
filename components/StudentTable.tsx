
import React, { useState, useMemo, useCallback } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';
import * as XLSX from 'https://esm.sh/xlsx';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  // --- حالات البحث والفلترة ---
  const [globalSearch, setGlobalSearch] = useState('');
  const [dropdownFilters, setDropdownFilters] = useState<Partial<Record<keyof Student, string>>>({});
  const [columnSearch, setColumnSearch] = useState<Partial<Record<keyof Student, string>>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // حالات النافذة المنبثقة
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  // حساب القيم للقوائم المنسدلة
  const uniqueValues = useMemo(() => {
    const getOptions = (key: keyof Student) => 
      Array.from(new Set(students.map(s => String(s[key] || '')))).filter(Boolean).sort();
    
    return {
      nationalities: getOptions('nationality'),
      levels: getOptions('level'),
      teachers: getOptions('teacher'),
      fees: getOptions('fees'),
      circles: getOptions('circle'),
    };
  }, [students]);

  // محرك التصفية الموحد
  const filteredData = useMemo(() => {
    return students.filter(student => {
      // 1. البحث الشامل
      const searchableText = `${student.name} ${student.phone} ${student.teacher} ${student.address} ${student.nationalId}`;
      const matchesGlobal = !globalSearch || smartMatch(searchableText, globalSearch);

      // 2. الفلاتر المنسدلة
      const matchesDropdowns = Object.entries(dropdownFilters).every(([key, value]) => 
        !value || student[key as keyof Student] === (value as string)
      );

      // 3. فلاتر الأعمدة النصية (لجميع الأعمدة)
      const matchesColumns = Object.entries(columnSearch).every(([key, value]) => 
        !value || smartMatch(String(student[key as keyof Student] || ''), value as string)
      );

      return matchesGlobal && matchesDropdowns && matchesColumns;
    });
  }, [students, globalSearch, dropdownFilters, columnSearch]);

  const handleOpenDetails = useCallback((student: Student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditMode(false);
    document.body.style.overflow = 'hidden';
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedStudent(null);
    document.body.style.overflow = 'auto';
  }, []);

  const saveChanges = async () => {
    if (editFormData && onUpdate) {
      await onUpdate(editFormData);
      handleCloseDetails();
    }
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedStudent && onDelete && window.confirm(`تأكيد حذف: ${selectedStudent.name}؟`)) {
      onDelete(selectedStudent);
      handleCloseDetails();
    }
  };

  const handleExport = () => {
    const headers = ["الاسم", "المعلم", "الحلقة", "الهوية", "الهاتف", "الرسوم"];
    const data = filteredData.map(s => [s.name, s.teacher, s.circle, s.nationalId, s.phone, s.fees]);
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    ws['!views'] = [{ RTL: true }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "نتائج البحث");
    XLSX.writeFile(wb, `سجل_الطلاب.xlsx`);
  };

  return (
    <div className="relative space-y-6 animate-fade-up">
      
      {/* شريط البحث العلوي */}
      <div className="glass-card rounded-[2.5rem] p-6 shadow-sm border border-slate-200/50 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <input 
            type="text" 
            placeholder="البحث الذكي الشامل (اسم، هاتف، هواء، معلم...)"
            className="w-full pr-14 pl-6 py-4 bg-slate-100/50 rounded-2xl border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-sm"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        
        <div className="flex gap-2 shrink-0">
          <button onClick={handleExport} className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors border border-emerald-100" title="تصدير">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
          </button>
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`px-6 py-4 rounded-2xl font-black text-sm flex items-center gap-2 transition-all ${showAdvanced ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-100 text-slate-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            تصفية متقدمة
          </button>
        </div>
      </div>

      {/* الفلاتر المنسدلة */}
      {showAdvanced && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm animate-fade-up">
          {[
            { label: 'المعلم', key: 'teacher', options: uniqueValues.teachers },
            { label: 'المستوى', key: 'level', options: uniqueValues.levels },
            { label: 'الحلقة', key: 'circle', options: uniqueValues.circles },
            { label: 'الجنسية', key: 'nationality', options: uniqueValues.nationalities },
            { label: 'الرسوم', key: 'fees', options: uniqueValues.fees },
          ].map(f => (
            <div key={f.key} className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase pr-1">{f.label}</label>
              <select 
                className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-indigo-500/20"
                value={dropdownFilters[f.key as keyof Student] || ''}
                onChange={(e) => setDropdownFilters(p => ({ ...p, [f.key]: e.target.value }))}
              >
                <option value="">الكل</option>
                {f.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </select>
            </div>
          ))}
          <div className="md:col-span-5 flex justify-end">
            <button 
              onClick={() => { setDropdownFilters({}); setColumnSearch({}); setGlobalSearch(''); }}
              className="text-[10px] font-black text-rose-500 hover:bg-rose-50 px-3 py-1 rounded-lg transition-colors"
            >
              إعادة ضبط كل شيء
            </button>
          </div>
        </div>
      )}

      {/* الجدول الرئيسي */}
      <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#0F172A] text-white">
              <tr>
                <th className="px-6 py-5 text-[11px] font-black uppercase text-center w-16">#</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase">الدارس</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase">المعلم والحلقة</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase">المستوى</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase text-center">رقم الهوية</th>
                <th className="px-6 py-5 text-[11px] font-black uppercase text-center">الرسوم</th>
                <th className="px-6 py-5 w-20"></th>
              </tr>
              {/* صف فلاتر الأعمدة الكاملة */}
              <tr className="bg-slate-800">
                <th className="px-2 py-2"></th>
                <th className="px-4 py-2">
                  <input 
                    placeholder="فلترة بالاسم..."
                    className="w-full p-2 bg-slate-700 border-none rounded-lg text-[10px] text-white placeholder:text-slate-500 font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                    value={columnSearch.name || ''}
                    onChange={(e) => setColumnSearch(p => ({ ...p, name: e.target.value }))}
                  />
                </th>
                <th className="px-4 py-2">
                  <input 
                    placeholder="فلترة بالمعلم..."
                    className="w-full p-2 bg-slate-700 border-none rounded-lg text-[10px] text-white placeholder:text-slate-500 font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                    value={columnSearch.teacher || ''}
                    onChange={(e) => setColumnSearch(p => ({ ...p, teacher: e.target.value }))}
                  />
                </th>
                <th className="px-4 py-2">
                   <input 
                    placeholder="المستوى..."
                    className="w-full p-2 bg-slate-700 border-none rounded-lg text-[10px] text-white placeholder:text-slate-500 font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                    value={columnSearch.level || ''}
                    onChange={(e) => setColumnSearch(p => ({ ...p, level: e.target.value }))}
                  />
                </th>
                <th className="px-4 py-2">
                   <input 
                    placeholder="الهوية..."
                    className="w-full p-2 bg-slate-700 border-none rounded-lg text-[10px] text-white placeholder:text-slate-500 font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-center"
                    value={columnSearch.nationalId || ''}
                    onChange={(e) => setColumnSearch(p => ({ ...p, nationalId: e.target.value }))}
                  />
                </th>
                <th className="px-4 py-2">
                   <input 
                    placeholder="الهاتف..."
                    className="w-full p-2 bg-slate-700 border-none rounded-lg text-[10px] text-white placeholder:text-slate-500 font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-center"
                    value={columnSearch.phone || ''}
                    onChange={(e) => setColumnSearch(p => ({ ...p, phone: e.target.value }))}
                  />
                </th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((s, idx) => (
                <tr 
                  key={s.id || idx} 
                  className="hover:bg-indigo-50/50 transition-colors cursor-pointer group border-b border-slate-50"
                  onClick={() => handleOpenDetails(s)}
                >
                  <td className="px-6 py-5 text-[10px] font-black text-slate-400 text-center">{idx + 1}</td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-bold text-slate-700">{s.teacher}</p>
                    <p className="text-[10px] text-slate-400 font-medium">حلقة: {s.circle}</p>
                  </td>
                  <td className="px-6 py-5">
                    <span className="px-3 py-1 bg-slate-100 text-slate-600 text-[10px] font-black rounded-lg border border-slate-200">
                      {s.level}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center font-mono text-sm text-slate-500">{s.nationalId}</td>
                  <td className="px-6 py-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${s.fees === 'نعم' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className="text-[10px] font-black text-slate-500">{s.fees === 'نعم' ? 'خالص' : 'مستحق'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {/* تحسين مظهر السهم الصغير */}
                    <div className="w-8 h-8 rounded-lg bg-slate-50 text-slate-300 flex items-center justify-center group-hover:scale-110 transition-all">
                      <svg className="w-5 h-5 group-hover:text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredData.length === 0 && (
            <div className="p-20 text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-4xl mb-4">🔍</div>
              <h3 className="text-slate-900 font-black text-xl">لا توجد نتائج</h3>
              <p className="text-slate-400 text-sm mt-1">تأكد من إعدادات الفلترة أو امسح البحث</p>
            </div>
          )}
        </div>
      </div>

      {/* نافذة التفاصيل - تم إصلاح الأنيميشن والتموضع */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-md"
            onClick={handleCloseDetails}
          ></div>
          
          {/* Modal Box */}
          <div className="relative bg-white w-full max-w-6xl rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-fade-up max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-[#0F172A] p-8 text-white shrink-0 flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-2xl font-black">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black">{selectedStudent.name}</h3>
                  <p className="text-indigo-400 text-[10px] font-bold uppercase mt-1">سجل رقم: {selectedStudent.id}</p>
                </div>
              </div>
              <button 
                onClick={handleCloseDetails}
                className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center hover:bg-rose-500 transition-all"
              >✕</button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto bg-slate-50 p-8 md:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* 1. البيانات الشخصية */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-xs font-black text-indigo-600 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-indigo-600 rounded-full"></span> الهوية والتواصل
                  </h4>
                  {[
                    { label: 'رقم الهاتف', key: 'phone' },
                    { label: 'الجنسية', key: 'nationality' },
                    { label: 'تاريخ الميلاد', key: 'dob', type: 'date' },
                    { label: 'رقم الهوية', key: 'nationalId' },
                    { label: 'السكن', key: 'address' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-black text-slate-400 pr-2">{f.label}</label>
                      <input 
                        type={f.type || 'text'} readOnly={!isEditMode}
                        className={`w-full px-5 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-500 shadow-sm' : 'border-transparent bg-slate-50 text-slate-600'}`}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                {/* 2. التعليمية */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-xs font-black text-emerald-600 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-600 rounded-full"></span> المسار التعليمي
                  </h4>
                  {[
                    { label: 'المعلم', key: 'teacher' },
                    { label: 'الحلقة', key: 'circle' },
                    { label: 'المستوى', key: 'level' },
                    { label: 'الجزء', key: 'part', type: 'number' },
                    { label: 'تاريخ التسجيل', key: 'regDate', type: 'date' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-black text-slate-400 pr-2">{f.label}</label>
                      <input 
                        type={f.type || 'text'} readOnly={!isEditMode}
                        className={`w-full px-5 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-500 shadow-sm' : 'border-transparent bg-slate-50 text-slate-600'}`}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>

                {/* 3. الإدارية */}
                <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                  <h4 className="text-xs font-black text-rose-600 uppercase flex items-center gap-2">
                    <span className="w-2 h-2 bg-rose-600 rounded-full"></span> البيانات المالية
                  </h4>
                  {[
                    { label: 'الفئة', key: 'category' },
                    { label: 'الفترة', key: 'period' },
                    { label: 'الرسوم', key: 'fees' },
                    { label: 'انتهاء الهوية', key: 'expiryId', type: 'date' },
                    { label: 'الوظيفة', key: 'job' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-[10px] font-black text-slate-400 pr-2">{f.label}</label>
                      <input 
                        type={f.type || 'text'} readOnly={!isEditMode}
                        className={`w-full px-5 py-3 rounded-xl text-sm font-bold border-2 transition-all outline-none ${isEditMode ? 'border-indigo-100 bg-white focus:border-indigo-500 shadow-sm' : 'border-transparent bg-slate-50 text-slate-600'}`}
                        value={(editFormData as any)?.[f.key] || ''}
                        onChange={(e) => setEditFormData(p => ({ ...p!, [f.key]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-8 bg-white border-t border-slate-100 shrink-0 flex flex-col md:flex-row justify-between items-center gap-4">
              <button onClick={confirmDelete} className="w-full md:w-auto px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-black text-xs hover:bg-rose-100">حذف السجل</button>
              <div className="flex gap-3 w-full md:w-auto">
                {isEditMode ? (
                  <>
                    <button onClick={() => setIsEditMode(false)} className="flex-1 px-8 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-xs">إلغاء</button>
                    <button onClick={saveChanges} className="flex-1 px-10 py-3 bg-indigo-600 text-white rounded-xl font-black text-xs shadow-lg">حفظ التغييرات</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsEditMode(true)} className="flex-1 px-8 py-3 border-2 border-indigo-100 text-indigo-600 rounded-xl font-black text-xs">تعديل الملف</button>
                    <button onClick={handleCloseDetails} className="flex-1 px-10 py-3 bg-slate-900 text-white rounded-xl font-black text-xs">إغلاق</button>
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
