
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

type TabType = 'personal' | 'academic' | 'admin';
const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  const dropdownOptions = useMemo(() => {
    const getUnique = (key: keyof Student) => 
      Array.from(new Set(students.map(s => s[key]).filter(v => v && v.trim() !== ''))).sort();

    return {
      teachers: getUnique('teacher'),
      circles: getUnique('circle'),
      categories: getUnique('category'),
      periods: getUnique('period'),
    };
  }, [students]);

  const filteredData = useMemo(() => {
    return students.filter(student => {
      const searchableText = `${student.name} ${student.phone} ${student.teacher} ${student.circle} ${student.nationalId}`;
      const matchesSearch = !globalSearch || smartMatch(searchableText, globalSearch);
      const matchesLevel = !levelFilter || student.level === levelFilter;
      return matchesSearch && matchesLevel;
    });
  }, [students, globalSearch, levelFilter]);

  const handleOpenProfile = (student: Student) => {
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

  const DataField = ({ label, value, fieldKey, icon, type = 'text', isSelect = false, options = [] }: any) => (
    <div className="bg-[#F9F9F9] p-7 rounded-2xl border border-[#EDEDED] hover:border-[#84754E]/20 transition-all shadow-sm">
      <div className="flex items-center gap-2.5 mb-2.5 text-[#AAA]">
        <span className="text-sm">{icon}</span>
        <label className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</label>
      </div>
      {isEditMode ? (
        isSelect ? (
          <select 
            value={(editFormData as any)?.[fieldKey] || ''}
            onChange={e => setEditFormData({ ...editFormData!, [fieldKey]: e.target.value })}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none border border-[#EDEDED] text-[#444]"
          >
            <option value="">اختر...</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type={type}
            lang={type === 'date' ? 'en-GB' : undefined}
            value={(editFormData as any)?.[fieldKey] || ''}
            onChange={e => setEditFormData({ ...editFormData!, [fieldKey]: e.target.value })}
            className="w-full bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none border border-[#EDEDED] text-[#444]"
          />
        )
      ) : (
        <div className="text-base font-black text-[#444]">{value || 'غير محدد'}</div>
      )}
    </div>
  );

  if (selectedStudent) {
    return (
      <div className="animate-fade pb-16">
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-[#EBEBEB] overflow-hidden">
           <div className="bg-[#84754E] p-16 text-white flex flex-col md:flex-row items-center gap-10 relative">
              <div className="absolute top-0 left-0 w-64 h-full bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-10"></div>
              <button onClick={() => setSelectedStudent(null)} className="absolute top-10 right-10 text-white/50 hover:text-white transition-colors font-black text-sm">إغلاق ×</button>
              <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-5xl font-black border border-white/20 shadow-xl">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-right relative z-10">
                <h2 className="text-4xl font-black mb-3">{selectedStudent.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-6 text-white/70 text-sm font-bold tracking-widest uppercase">
                  <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full">كود: {selectedStudent.id}</span>
                  <span className="flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full">🕌 {selectedStudent.circle}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 relative z-10">
                {isEditMode ? (
                  <button onClick={handleSave} className="px-10 py-4 bg-white text-[#84754E] rounded-xl font-black text-xs shadow-xl transition-transform hover:scale-105">حفظ البيانات</button>
                ) : (
                  <button onClick={() => setIsEditMode(true)} className="px-10 py-4 bg-white/10 border border-white/20 text-white rounded-xl font-black text-xs hover:bg-white/20 transition-all backdrop-blur-sm">تعديل الملف</button>
                )}
                <button onClick={() => { if(confirm("حذف الطالب نهائياً؟")) onDelete?.(selectedStudent); setSelectedStudent(null); }} className="px-6 py-4 bg-rose-500/20 text-white rounded-xl font-black text-xs hover:bg-rose-500/40 transition-all">حذف</button>
              </div>
           </div>
           
           <div className="flex bg-[#F9F9F9] p-3 gap-3">
              {['personal', 'academic', 'admin'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as TabType)} className={`flex-1 py-5 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === t ? 'bg-white text-[#84754E] shadow-sm border border-[#EBEBEB]' : 'text-[#AAA] hover:text-[#84754E]'}`}>
                  {t === 'personal' ? 'البيانات الشخصية' : t === 'academic' ? 'التحصيل الأكاديمي' : 'شؤون الدارس'}
                </button>
              ))}
           </div>

           <div className="p-16">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {activeTab === 'personal' && (
                  <>
                    <DataField label="الاسم الكامل" value={selectedStudent.name} fieldKey="name" icon="👤" />
                    <DataField label="الجنسية" value={selectedStudent.nationality} fieldKey="nationality" icon="🌍" />
                    <DataField label="رقم الجوال" value={selectedStudent.phone} fieldKey="phone" icon="📱" />
                    <DataField label="تاريخ الميلاد" value={selectedStudent.dob} fieldKey="dob" type="date" icon="📅" />
                    <DataField label="العمر الحالي" value={selectedStudent.age} fieldKey="age" icon="⏳" />
                    <DataField label="عنوان السكن" value={selectedStudent.address} fieldKey="address" icon="📍" />
                  </>
                )}
                {activeTab === 'academic' && (
                  <>
                    <DataField label="اسم المحفظ" value={selectedStudent.teacher} fieldKey="teacher" isSelect options={dropdownOptions.teachers} icon="👳" />
                    <DataField label="المستوى" value={selectedStudent.level} fieldKey="level" isSelect options={LEVEL_ORDER} icon="📈" />
                    <DataField label="الحلقة" value={selectedStudent.circle} fieldKey="circle" isSelect options={dropdownOptions.circles} icon="🕌" />
                    <DataField label="الجزء الحالي" value={selectedStudent.part} fieldKey="part" icon="📖" />
                    <DataField label="تاريخ الالتحاق" value={selectedStudent.regDate} fieldKey="regDate" type="date" icon="📝" />
                  </>
                )}
                {activeTab === 'admin' && (
                  <>
                    <DataField label="رقم الهوية" value={selectedStudent.nationalId} fieldKey="nationalId" icon="🆔" />
                    <DataField label="صلاحية الهوية" value={selectedStudent.expiryId} fieldKey="expiryId" type="date" icon="🕒" />
                    <DataField label="الفئة" value={selectedStudent.category} fieldKey="category" isSelect options={dropdownOptions.categories} icon="🔖" />
                    <DataField label="الفترة الدراسية" value={selectedStudent.period} fieldKey="period" isSelect options={dropdownOptions.periods} icon="⏰" />
                    <DataField label="حالة السداد" value={selectedStudent.fees} fieldKey="fees" isSelect options={['نعم', 'لا']} icon="💸" />
                  </>
                )}
              </div>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row gap-6 bg-white p-8 rounded-[1.5rem] border border-[#EBEBEB] shadow-sm">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="البحث الذكي بالاسم، الرقم، أو اسم المحفظ..."
            className="w-full pr-14 pl-8 py-5 bg-[#F9F9F9] rounded-2xl outline-none focus:ring-1 focus:ring-[#84754E]/10 font-bold border border-transparent focus:border-[#84754E]/10 text-[#444]"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#84754E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="px-10 py-5 bg-white rounded-2xl border border-[#EDEDED] outline-none font-black text-[#777] text-sm cursor-pointer hover:bg-[#F9F9F9] transition-all">
          <option value="">تصفية حسب المستوى الأكاديمي</option>
          {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-[#EBEBEB] overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-[#F9F9F9] text-[#A1A1A1] text-[11px] font-black uppercase tracking-[0.25em] border-b border-[#EDEDED]">
            <tr>
              <th className="px-10 py-6">تفاصيل الدارس</th>
              <th className="px-10 py-6">المحفظ</th>
              <th className="px-10 py-6">المستوى</th>
              <th className="px-10 py-6 text-center">الرسوم</th>
              <th className="px-10 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F9F9F9]">
            {filteredData.map((s, idx) => (
              <tr key={idx} onClick={() => handleOpenProfile(s)} className="hover:bg-[#FDFDFB] cursor-pointer transition-all group">
                <td className="px-10 py-6">
                  <div className="font-black text-[#444] text-base group-hover:text-[#84754E] transition-colors">{s.name}</div>
                  <div className="text-[10px] text-[#BBB] font-bold mt-1.5 uppercase tracking-widest">كود: {s.id} | هاتف: {s.phone}</div>
                </td>
                <td className="px-10 py-6 text-sm font-bold text-[#777]">{s.teacher}</td>
                <td className="px-10 py-6 text-sm font-bold text-[#777]">{s.level}</td>
                <td className="px-10 py-6 text-center">
                  <span className={`px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${s.fees === 'نعم' ? 'bg-[#84754E]/5 text-[#84754E] border-[#84754E]/20' : 'bg-rose-50 text-rose-600 border-rose-100'}`}>
                    {s.fees === 'نعم' ? 'خالص' : 'مطلوب'}
                  </span>
                </td>
                <td className="px-10 py-6">
                   <div className="w-10 h-10 rounded-xl bg-[#F9F9F9] flex items-center justify-center text-[#84754E] group-hover:bg-[#84754E] group-hover:text-white transition-all shadow-inner">
                      ←
                   </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
