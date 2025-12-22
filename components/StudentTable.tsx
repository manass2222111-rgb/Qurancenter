
import React, { useState, useMemo, useEffect } from 'react';
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

  // منع التمرير في الخلفية عند فتح البطاقة
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
      return !globalSearch || smartMatch(searchableText, globalSearch);
    });
  }, [students, globalSearch]);

  const handleOpenDetails = (student: Student) => {
    setSelectedStudent(student);
    setEditFormData({ ...student });
    setIsEditMode(false);
    setActiveTab('personal');
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

  const InfoTile = ({ label, value, fieldKey, icon, type = 'text' }: any) => (
    <div className="flex flex-col gap-1 p-3 bg-white rounded-xl border border-slate-100 hover:border-indigo-200 transition-all">
      <label className="text-[9px] font-black text-slate-400 flex items-center gap-1.5 uppercase">
        <span className="opacity-60">{icon}</span> {label}
      </label>
      {isEditMode ? (
        <input 
          type={type}
          value={(editFormData as any)?.[fieldKey] || ''}
          onChange={e => handleFieldChange(fieldKey, e.target.value)}
          className="w-full bg-slate-50 border border-indigo-100 rounded-lg px-2 py-1 text-xs font-bold text-indigo-700 outline-none"
        />
      ) : (
        <span className="text-xs font-bold text-slate-700 truncate">{value || '—'}</span>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* البحث العلوي */}
      <div className="relative group max-w-xl">
        <input 
          type="text" 
          placeholder="ابحث عن أي طالب بالاسم أو الرقم..."
          className="w-full pr-12 pl-6 py-4 bg-white border-none rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-slate-700"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
        />
        <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>

      {/* الجدول الرئيسي */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4 text-center w-16">#</th>
                <th className="px-6 py-4">اسم الدارس</th>
                <th className="px-6 py-4">المعلم</th>
                <th className="px-6 py-4 text-center">الحلقة</th>
                <th className="px-6 py-4 text-center">الرسوم</th>
                <th className="px-6 py-4 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.map((s, idx) => (
                <tr key={s.id || idx} onClick={() => handleOpenDetails(s)} className="hover:bg-indigo-50/40 cursor-pointer transition-colors group">
                  <td className="px-6 py-4 text-center text-[10px] font-bold text-slate-300">{idx + 1}</td>
                  <td className="px-6 py-4 font-bold text-slate-800 text-sm group-hover:text-indigo-600 transition-colors">{s.name}</td>
                  <td className="px-6 py-4 text-xs font-medium text-slate-500">{s.teacher}</td>
                  <td className="px-6 py-4 text-center text-xs font-medium text-slate-500">{s.circle}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black ${s.fees === 'نعم' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {s.fees === 'نعم' ? 'خالص' : 'مستحق'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- بطاقة الطالب الذكية (The Smart Detail View) --- */}
      {selectedStudent && (
        <div 
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} // تأكيد التموضع المطلق فوق كل شيء
        >
          <div className="bg-[#F8FAFC] w-full max-w-4xl h-fit max-h-[90vh] rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
            
            {/* الشريط الجانبي الثابت (Header Side) */}
            <div className="w-full md:w-80 bg-slate-900 p-8 flex flex-col items-center text-center shrink-0">
               <div className="relative mb-6">
                 <div className="w-24 h-24 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-[2rem] rotate-3 flex items-center justify-center text-white text-3xl font-black shadow-2xl border-2 border-white/20">
                   {selectedStudent.name.charAt(0)}
                 </div>
                 <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-slate-900 flex items-center justify-center ${selectedStudent.fees === 'نعم' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                   <span className="text-white text-[10px]">{selectedStudent.fees === 'نعم' ? '✓' : '!'}</span>
                 </div>
               </div>
               
               <h2 className="text-white text-xl font-black mb-1 leading-tight px-2">{selectedStudent.name}</h2>
               <p className="text-indigo-400 text-[10px] font-black tracking-widest uppercase mb-8 opacity-70">المعرف: {selectedStudent.id}</p>

               <div className="w-full space-y-2 mt-auto">
                 {isEditMode ? (
                    <button onClick={handleSave} className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-black text-xs shadow-lg hover:bg-emerald-700 transition-all">حفظ التعديلات</button>
                 ) : (
                    <button onClick={() => setIsEditMode(true)} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-xs shadow-lg hover:bg-indigo-700 transition-all">تعديل البيانات</button>
                 )}
                 <button onClick={() => setSelectedStudent(null)} className="w-full bg-white/10 text-white py-3 rounded-2xl font-black text-xs hover:bg-white/20 transition-all">إغلاق الملف</button>
                 {!isEditMode && (
                   <button onClick={() => onDelete?.(selectedStudent)} className="w-full text-rose-500/60 hover:text-rose-500 py-2 text-[10px] font-black transition-all mt-2">حذف الطالب</button>
                 )}
               </div>
            </div>

            {/* الجزء الأساسي المتغير (Tabs Content) */}
            <div className="flex-1 flex flex-col min-h-0 bg-white md:rounded-r-[2.5rem]">
              
              {/* شريط التبويبات (Tabs Switcher) */}
              <div className="flex border-b border-slate-100 p-2 gap-1 bg-slate-50/50 shrink-0">
                {[
                  { id: 'personal', label: 'البيانات الشخصية', icon: '👤' },
                  { id: 'academic', label: 'المسار الدراسي', icon: '🎓' },
                  { id: 'admin', label: 'الشؤون الإدارية', icon: '📁' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 py-4 px-2 rounded-2xl text-[10px] font-black transition-all flex items-center justify-center gap-2 ${
                      activeTab === tab.id ? 'bg-white text-indigo-600 shadow-sm border border-indigo-50' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    <span>{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>

              {/* محتوى التبويب المختار */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-slate-50/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-2 duration-300">
                  
                  {activeTab === 'personal' && (
                    <>
                      <InfoTile label="الاسم الرباعي" value={selectedStudent.name} fieldKey="name" icon="👤" />
                      <InfoTile label="رقم الهوية" value={selectedStudent.nationalId} fieldKey="nationalId" icon="🆔" />
                      <InfoTile label="الجنسية" value={selectedStudent.nationality} fieldKey="nationality" icon="🌍" />
                      <InfoTile label="رقم الجوال" value={selectedStudent.phone} fieldKey="phone" icon="📱" />
                      <InfoTile label="تاريخ الميلاد" value={selectedStudent.dob} fieldKey="dob" type="date" icon="📅" />
                      <InfoTile label="العمر" value={selectedStudent.age} fieldKey="age" icon="🎂" />
                      <InfoTile label="مكان السكن" value={selectedStudent.address} fieldKey="address" icon="📍" />
                    </>
                  )}

                  {activeTab === 'academic' && (
                    <>
                      <InfoTile label="المعلم" value={selectedStudent.teacher} fieldKey="teacher" icon="👳‍♂️" />
                      <InfoTile label="اسم الحلقة" value={selectedStudent.circle} fieldKey="circle" icon="🕌" />
                      <InfoTile label="المستوى الحالي" value={selectedStudent.level} fieldKey="level" icon="📊" />
                      <InfoTile label="رقم الجزء" value={selectedStudent.part} fieldKey="part" icon="📖" />
                      <InfoTile label="تاريخ الالتحاق" value={selectedStudent.regDate} fieldKey="regDate" type="date" icon="✍️" />
                      <InfoTile label="المؤهل العلمي" value={selectedStudent.qualification} fieldKey="qualification" icon="📜" />
                    </>
                  )}

                  {activeTab === 'admin' && (
                    <>
                      <InfoTile label="انتهاء الهوية" value={selectedStudent.expiryId} fieldKey="expiryId" type="date" icon="⌛" />
                      <InfoTile label="سداد الرسوم" value={selectedStudent.fees} fieldKey="fees" icon="💰" />
                      <InfoTile label="الفئة العمرية" value={selectedStudent.category} fieldKey="category" icon="👥" />
                      <InfoTile label="الفترة الدراسية" value={selectedStudent.period} fieldKey="period" icon="⏰" />
                      <InfoTile label="اكتمال الملف" value={selectedStudent.completion} fieldKey="completion" icon="✅" />
                      <InfoTile label="الوظيفة" value={selectedStudent.job} fieldKey="job" icon="💼" />
                    </>
                  )}

                </div>
              </div>

              {/* تذييل البطاقة (Footer) */}
              <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-300 shrink-0">
                <span className="uppercase tracking-[0.2em]">Validated Document</span>
                <span className="text-indigo-400">نور القرآن - الإدارة الذكية</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StudentTable;
