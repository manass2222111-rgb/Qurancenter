
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

type TabType = 'personal' | 'academic' | 'admin';

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  const filteredData = useMemo(() => {
    return students.filter(student => {
      const searchableText = `${student.name} ${student.phone} ${student.teacher} ${student.circle} ${student.nationalId}`;
      return !globalSearch || smartMatch(searchableText, globalSearch);
    });
  }, [students, globalSearch]);

  const handleOpenProfile = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditMode(false);
    setActiveTab('personal');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    setSelectedStudent(null);
  };

  const handleSave = async () => {
    if (editFormData && onUpdate) {
      await onUpdate(editFormData);
      setSelectedStudent(null);
    }
  };

  const handleFieldChange = (key: keyof Student, value: string) => {
    if (editFormData) setEditFormData({ ...editFormData, [key]: value });
  };

  const DataField = ({ label, value, fieldKey, icon, type = 'text' }: any) => (
    <div className="group bg-white p-5 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{icon}</span>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{label}</label>
      </div>
      {isEditMode ? (
        <input 
          type={type}
          value={(editFormData as any)?.[fieldKey] || ''}
          onChange={e => handleFieldChange(fieldKey, e.target.value)}
          className={`w-full bg-slate-50 border-2 border-indigo-50 rounded-xl px-3 py-2 text-sm font-bold text-indigo-700 outline-none focus:border-indigo-500 transition-colors ${type === 'date' ? 'dir-ltr text-right font-sans' : ''}`}
          style={type === 'date' ? { direction: 'ltr' } : {}}
        />
      ) : (
        <div className="text-sm font-extrabold text-slate-800 break-words">{value || '—'}</div>
      )}
    </div>
  );

  if (selectedStudent) {
    return (
      <div className="animate-in slide-in-from-left-4 duration-500">
        <div className="bg-white rounded-[3rem] shadow-xl border border-slate-100 overflow-hidden mb-8">
          <div className="bg-slate-900 p-8 md:p-12 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl"></div>
            
            <button onClick={handleBack} className="mb-8 flex items-center gap-2 text-indigo-300 hover:text-white transition-colors group">
              <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              <span className="text-xs font-black uppercase">العودة للسجل</span>
            </button>

            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="w-24 h-24 md:w-32 md:h-32 bg-indigo-600 rounded-[2.5rem] rotate-3 flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-white/10">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="text-center md:text-right flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h2 className="text-2xl md:text-4xl font-black">{selectedStudent.name}</h2>
                  <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase border ${selectedStudent.fees === 'نعم' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border-rose-500/30'}`}>
                    {selectedStudent.fees === 'نعم' ? 'خالص الرسوم' : 'مستحق'}
                  </span>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-indigo-300 text-sm font-bold">
                  <span className="flex items-center gap-2">🆔 {selectedStudent.id}</span>
                  <span className="flex items-center gap-2">🕌 {selectedStudent.circle}</span>
                  <span className="flex items-center gap-2">👳‍♂️ {selectedStudent.teacher}</span>
                </div>
              </div>
              <div className="flex flex-col gap-3 w-full md:w-auto">
                {isEditMode ? (
                  <button onClick={handleSave} className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-emerald-700 transition-all">حفظ التغييرات</button>
                ) : (
                  <button onClick={() => setIsEditMode(true)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all">تعديل الملف</button>
                )}
                {!isEditMode && (
                  <button onClick={() => onDelete?.(selectedStudent)} className="text-rose-400 hover:text-rose-500 text-[10px] font-black uppercase tracking-widest">حذف السجل نهائياً</button>
                )}
              </div>
            </div>
          </div>

          <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2">
            {[
              { id: 'personal', label: 'البيانات الشخصية', icon: '👤' },
              { id: 'academic', label: 'المسار الدراسي', icon: '🎓' },
              { id: 'admin', label: 'الشؤون الإدارية', icon: '📁' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex-1 py-4 px-4 rounded-2xl text-[11px] font-black transition-all flex items-center justify-center gap-3 ${
                  activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <span className="text-base">{tab.icon}</span> {tab.label}
              </button>
            ))}
          </div>

          <div className="p-8 md:p-12 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === 'personal' && (
                <>
                  <DataField label="الاسم الكامل" value={selectedStudent.name} fieldKey="name" icon="👤" />
                  <DataField label="رقم الهوية" value={selectedStudent.nationalId} fieldKey="nationalId" icon="🆔" />
                  <DataField label="الجنسية" value={selectedStudent.nationality} fieldKey="nationality" icon="🌍" />
                  <DataField label="رقم الجوال" value={selectedStudent.phone} fieldKey="phone" icon="📱" />
                  <DataField label="تاريخ الميلاد" value={selectedStudent.dob} fieldKey="dob" type="date" icon="📅" />
                  <DataField label="العمر" value={selectedStudent.age} fieldKey="age" icon="🎂" />
                  <DataField label="العنوان" value={selectedStudent.address} fieldKey="address" icon="📍" />
                </>
              )}
              {activeTab === 'academic' && (
                <>
                  <DataField label="المعلم" value={selectedStudent.teacher} fieldKey="teacher" icon="👳‍♂️" />
                  <DataField label="الحلقة" value={selectedStudent.circle} fieldKey="circle" icon="🕌" />
                  <DataField label="المستوى" value={selectedStudent.level} fieldKey="level" icon="📊" />
                  <DataField label="الجزء الحالي" value={selectedStudent.part} fieldKey="part" icon="📖" />
                  <DataField label="تاريخ التسجيل" value={selectedStudent.regDate} fieldKey="regDate" type="date" icon="✍️" />
                  <DataField label="المؤهل العلمي" value={selectedStudent.qualification} fieldKey="qualification" icon="📜" />
                </>
              )}
              {activeTab === 'admin' && (
                <>
                  <DataField label="انتهاء الهوية" value={selectedStudent.expiryId} fieldKey="expiryId" type="date" icon="⌛" />
                  <DataField label="سداد الرسوم" value={selectedStudent.fees} fieldKey="fees" icon="💰" />
                  <DataField label="الفئة العمرية" value={selectedStudent.category} fieldKey="category" icon="👥" />
                  <DataField label="الفترة" value={selectedStudent.period} fieldKey="period" icon="⏰" />
                  <DataField label="اكتمال الملف" value={selectedStudent.completion} fieldKey="completion" icon="✅" />
                  <DataField label="الوظيفة" value={selectedStudent.job} fieldKey="job" icon="💼" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative group max-w-xl">
        <input 
          type="text" 
          placeholder="ابحث بالاسم، الرقم، أو اسم المحفظ..."
          className="w-full pr-12 pl-6 py-4 bg-white border-none rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-[0.2em]">
              <tr>
                <th className="px-8 py-5 text-center w-20">#</th>
                <th className="px-8 py-5">اسم الدارس</th>
                <th className="px-8 py-5">المعلم</th>
                <th className="px-8 py-5 text-center">الحلقة</th>
                <th className="px-8 py-5 text-center">الحالة</th>
                <th className="px-8 py-5 w-16"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((s, idx) => (
                <tr key={s.id || idx} onClick={() => handleOpenProfile(s)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors group">
                  <td className="px-8 py-5 text-center text-[10px] font-bold text-slate-300">{idx + 1}</td>
                  <td className="px-8 py-5">
                    <div className="font-extrabold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{s.name}</div>
                    <div className="text-[10px] text-slate-400 font-medium mt-0.5">ID: {s.id} • {s.phone}</div>
                  </td>
                  <td className="px-8 py-5 text-xs font-bold text-slate-500">{s.teacher}</td>
                  <td className="px-8 py-5 text-center text-xs font-bold text-slate-500">{s.circle}</td>
                  <td className="px-8 py-5 text-center">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black ${s.fees === 'نعم' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                      {s.fees === 'نعم' ? 'خالص' : 'مستحق'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
