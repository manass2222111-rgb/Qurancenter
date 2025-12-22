
import React, { useState, useMemo, useEffect } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [columnSearch, setColumnSearch] = useState<Partial<Record<keyof Student, string>>>({});
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  useEffect(() => {
    if (selectedStudent) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedStudent]);

  const filteredData = useMemo(() => {
    return students.filter(student => {
      const searchableText = `${student.name} ${student.phone} ${student.teacher} ${student.circle} ${student.nationalId}`;
      const matchesGlobal = !globalSearch || smartMatch(searchableText, globalSearch);
      const matchesColumns = Object.entries(columnSearch).every(([key, value]) => 
        !value || smartMatch(String(student[key as keyof Student] || ''), value as string)
      );
      return matchesGlobal && matchesColumns;
    });
  }, [students, globalSearch, columnSearch]);

  const handleOpenDetails = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditMode(false);
  };

  const handleSave = async () => {
    if (editFormData && onUpdate) {
      await onUpdate(editFormData);
      setSelectedStudent(null);
    }
  };

  const handleDelete = () => {
    if (selectedStudent && onDelete && window.confirm(`⚠️ حذف سجل: ${selectedStudent.name}؟`)) {
      onDelete(selectedStudent);
      setSelectedStudent(null);
    }
  };

  const handleFieldChange = (key: keyof Student, value: string) => {
    if (editFormData) {
      setEditFormData({ ...editFormData, [key]: value });
    }
  };

  const fieldGroups = [
    {
      title: 'البيانات الشخصية',
      color: 'indigo',
      fields: [
        { label: 'الاسم', key: 'name', icon: '👤' },
        { label: 'الهوية', key: 'nationalId', icon: '🆔' },
        { label: 'الجنسية', key: 'nationality', icon: '🌍' },
        { label: 'الهاتف', key: 'phone', icon: '📱' },
        { label: 'الميلاد', key: 'dob', type: 'date', icon: '📅' },
        { label: 'العمر', key: 'age', icon: '🎂' },
      ]
    },
    {
      title: 'المسار التعليمي',
      color: 'violet',
      fields: [
        { label: 'المحفظ', key: 'teacher', icon: '🎓' },
        { label: 'الحلقة', key: 'circle', icon: '🕌' },
        { label: 'المستوى', key: 'level', icon: '📊' },
        { label: 'الجزء', key: 'part', icon: '📖' },
        { label: 'التسجيل', key: 'regDate', type: 'date', icon: '✍️' },
        { label: 'الإنجاز', key: 'completion', icon: '✅' },
      ]
    },
    {
      title: 'إضافي وإداري',
      color: 'slate',
      fields: [
        { label: 'انتهاء الهوية', key: 'expiryId', type: 'date', icon: '⌛' },
        { label: 'الفترة', key: 'period', icon: '⏰' },
        { label: 'الرسوم', key: 'fees', icon: '💰' },
        { label: 'الفئة', key: 'category', icon: '👥' },
        { label: 'السكن', key: 'address', icon: '📍' },
        { label: 'الوظيفة', key: 'job', icon: '💼' },
      ]
    }
  ];

  return (
    <div className="space-y-6">
      {/* البحث */}
      <div className="relative group max-w-2xl">
        <input 
          type="text" 
          placeholder="بحث سريع في الأسماء والأرقام..."
          className="w-full pr-12 pl-6 py-4 bg-white border-none rounded-2xl shadow-lg shadow-indigo-100/50 outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>

      {/* الجدول */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right min-w-[1000px]">
            <thead className="bg-[#1E293B] text-white">
              <tr>
                <th className="px-4 py-4 text-[10px] font-black opacity-50 text-center w-12">#</th>
                <th className="px-4 py-4 text-xs font-black">الاسم</th>
                <th className="px-4 py-4 text-xs font-black">المعلم</th>
                <th className="px-4 py-4 text-xs font-black">الحلقة</th>
                <th className="px-4 py-4 text-xs font-black text-center">الهوية</th>
                <th className="px-4 py-4 text-xs font-black text-center">الرسوم</th>
                <th className="px-4 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((s, idx) => (
                <tr key={s.id || idx} onClick={() => handleOpenDetails(s)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                  <td className="px-4 py-4 text-[10px] font-bold text-slate-300 text-center">{idx + 1}</td>
                  <td className="px-4 py-4 font-bold text-slate-700 text-sm">{s.name}</td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{s.teacher}</td>
                  <td className="px-4 py-4 text-xs font-medium text-slate-500">{s.circle}</td>
                  <td className="px-4 py-4 text-center font-mono text-[10px] text-slate-400">{s.nationalId}</td>
                  <td className="px-4 py-4 text-center">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-black ${s.fees === 'نعم' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                      {s.fees === 'نعم' ? 'خالص' : 'مستحق'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- بطاقة الطالب (Modal) الاحترافية --- */}
      {selectedStudent && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-5xl max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* الهيدر: ثابت */}
            <div className="bg-[#0F172A] p-6 md:p-8 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-xl md:text-2xl font-black shadow-lg">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-black text-white truncate max-w-[200px] md:max-w-md">
                    {isEditMode ? 'تعديل البيانات' : selectedStudent.name}
                  </h2>
                  <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest mt-1">كود الطالب: {selectedStudent.id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                 {isEditMode ? (
                   <>
                     <button onClick={() => setIsEditMode(false)} className="px-4 py-2 text-white/70 hover:text-white font-bold text-xs transition-colors">إلغاء</button>
                     <button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-xl font-black text-xs shadow-lg transition-all">حفظ</button>
                   </>
                 ) : (
                   <>
                     <button onClick={handleDelete} className="bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white px-4 py-2 rounded-xl font-black text-xs transition-all">حذف</button>
                     <button onClick={() => setIsEditMode(true)} className="bg-white text-slate-900 px-6 py-2 rounded-xl font-black text-xs shadow-lg hover:bg-slate-100 transition-all">تعديل</button>
                   </>
                 )}
                 <button onClick={() => setSelectedStudent(null)} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all">✕</button>
              </div>
            </div>

            {/* المحتوى: تمرير داخلي فقط عند الحاجة */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50/50 custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {fieldGroups.map((group, gIdx) => (
                  <div key={gIdx} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-5 h-fit">
                    <h3 className={`text-[11px] font-black text-${group.color}-600 flex items-center gap-2 mb-2 uppercase tracking-widest`}>
                      <span className={`w-1.5 h-4 bg-${group.color}-500 rounded-full`}></span> {group.title}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      {group.fields.map(f => (
                        <div key={f.key}>
                          <label className="text-[9px] font-black text-slate-400 block mb-1 pr-1">{f.icon} {f.label}</label>
                          {isEditMode && f.key !== 'id' ? (
                            <input 
                              type={f.type || 'text'}
                              value={(editFormData as any)?.[f.key] || ''}
                              onChange={e => handleFieldChange(f.key as keyof Student, e.target.value)}
                              className="w-full bg-indigo-50/50 border border-indigo-100 rounded-lg px-3 py-2 text-xs font-bold text-indigo-700 outline-none focus:border-indigo-400"
                            />
                          ) : (
                            <div className="text-xs font-black text-slate-700 px-1 py-1 truncate bg-transparent">
                              {(selectedStudent as any)?.[f.key] || '—'}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* الفوتر: ثابت وبسيط */}
            <div className="p-4 bg-white border-t border-slate-100 text-center shrink-0">
               <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">نظام نور القرآن لإدارة الحلقات • 2024</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
