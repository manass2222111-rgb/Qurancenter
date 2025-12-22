
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
    <div className="bg-[#F9F9F9] p-6 rounded-2xl border border-[#EDEDED] hover:border-[#84754E]/20 transition-all">
      <div className="flex items-center gap-2 mb-2 text-[#999]">
        <span className="text-xs">{icon}</span>
        <label className="text-[9px] font-black uppercase tracking-wider">{label}</label>
      </div>
      {isEditMode ? (
        isSelect ? (
          <select 
            value={(editFormData as any)?.[fieldKey] || ''}
            onChange={e => setEditFormData({ ...editFormData!, [fieldKey]: e.target.value })}
            className="w-full bg-white rounded-lg px-3 py-2 text-sm font-bold outline-none border border-[#EDEDED]"
          >
            <option value="">اختر...</option>
            {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          <input 
            type={type}
            value={(editFormData as any)?.[fieldKey] || ''}
            onChange={e => setEditFormData({ ...editFormData!, [fieldKey]: e.target.value })}
            className="w-full bg-white rounded-lg px-3 py-2 text-sm font-bold outline-none border border-[#EDEDED]"
          />
        )
      ) : (
        <div className="text-sm font-black text-[#444]">{value || 'غير محدد'}</div>
      )}
    </div>
  );

  if (selectedStudent) {
    return (
      <div className="animate-fade pb-10">
        <div className="bg-white rounded-3xl shadow-sm border border-[#EDEDED] overflow-hidden">
           <div className="bg-[#84754E] p-12 text-white flex flex-col md:flex-row items-center gap-8 relative">
              <button onClick={() => setSelectedStudent(null)} className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors">إغلاق الملف ×</button>
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-4xl font-black border border-white/20">
                {selectedStudent.name.charAt(0)}
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-3xl font-black mb-2">{selectedStudent.name}</h2>
                <p className="text-white/60 text-xs font-bold uppercase tracking-widest">كود الدارس: {selectedStudent.id} | حلقة: {selectedStudent.circle}</p>
              </div>
              <div className="flex gap-3">
                {isEditMode ? (
                  <button onClick={handleSave} className="px-8 py-3 bg-white text-[#84754E] rounded-xl font-black text-xs shadow-md">حفظ البيانات</button>
                ) : (
                  <button onClick={() => setIsEditMode(true)} className="px-8 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-black text-xs hover:bg-white/20">تعديل الملف</button>
                )}
                <button onClick={() => { if(confirm("حذف الطالب نهائياً؟")) onDelete?.(selectedStudent); setSelectedStudent(null); }} className="px-5 py-3 bg-rose-500/20 text-white rounded-xl font-black text-xs">حذف</button>
              </div>
           </div>
           
           <div className="flex bg-[#F9F9F9] p-2 gap-2">
              {['personal', 'academic', 'admin'].map(t => (
                <button key={t} onClick={() => setActiveTab(t as TabType)} className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === t ? 'bg-white text-[#84754E] shadow-sm' : 'text-[#AAA] hover:text-[#84754E]'}`}>
                  {t === 'personal' ? 'البيانات الشخصية' : t === 'academic' ? 'التحصيل الأكاديمي' : 'الإدارة والرسوم'}
                </button>
              ))}
           </div>

           <div className="p-12">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                    <DataField label="رقم الحلقة" value={selectedStudent.circle} fieldKey="circle" isSelect options={dropdownOptions.circles} icon="🕌" />
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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 bg-white p-6 rounded-2xl border border-[#EDEDED] shadow-sm">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="ابحث بالاسم أو الرقم أو اسم المعلم..."
            className="w-full pr-12 pl-6 py-4 bg-[#F9F9F9] rounded-xl outline-none focus:ring-1 focus:ring-[#84754E]/20 font-bold border border-transparent focus:border-[#84754E]/10"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#84754E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <select value={levelFilter} onChange={e => setLevelFilter(e.target.value)} className="px-6 py-4 bg-white rounded-xl border border-[#EDEDED] outline-none font-bold text-[#666] text-sm cursor-pointer hover:bg-[#F9F9F9] transition-all">
          <option value="">تصفية حسب المستوى</option>
          {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-[#EDEDED] overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-[#F9F9F9] text-[#999] text-[10px] font-black uppercase tracking-widest border-b border-[#EDEDED]">
            <tr>
              <th className="px-8 py-5">بيانات الدارس</th>
              <th className="px-8 py-5">المعلم</th>
              <th className="px-8 py-5">المستوى</th>
              <th className="px-8 py-5 text-center">الرسوم</th>
              <th className="px-8 py-5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F9F9F9]">
            {filteredData.map((s, idx) => (
              <tr key={idx} onClick={() => handleOpenProfile(s)} className="hover:bg-[#FDFDFB] cursor-pointer transition-all group">
                <td className="px-8 py-5">
                  <div className="font-black text-[#444] text-sm group-hover:text-[#84754E]">{s.name}</div>
                  <div className="text-[9px] text-[#AAA] font-bold mt-1">كود: {s.id} | هاتف: {s.phone}</div>
                </td>
                <td className="px-8 py-5 text-xs font-bold text-[#777]">{s.teacher}</td>
                <td className="px-8 py-5 text-xs font-bold text-[#777]">{s.level}</td>
                <td className="px-8 py-5 text-center">
                  <span className={`px-4 py-1 rounded-full text-[9px] font-black tracking-wide ${s.fees === 'نعم' ? 'bg-[#84754E]/10 text-[#84754E]' : 'bg-rose-50 text-rose-600'}`}>
                    {s.fees === 'نعم' ? 'خالص' : 'مطلوب'}
                  </span>
                </td>
                <td className="px-8 py-5">
                   <div className="w-8 h-8 rounded-lg bg-[#F9F9F9] flex items-center justify-center text-[#84754E] group-hover:bg-[#84754E] group-hover:text-white transition-all">
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
