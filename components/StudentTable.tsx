
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';
import * as XLSX from 'xlsx';

interface StudentTableProps {
  students: Student[];
  onUpdate?: (student: Student) => void;
  onDelete?: (student: Student) => void;
}

type TabType = 'personal' | 'academic' | 'admin';
const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const StudentTable: React.FC<StudentTableProps> = ({ students, onUpdate, onDelete }) => {
  const [globalSearch, setGlobalSearch] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    level: '',
    teacher: '',
    circle: '',
    category: '',
    period: '',
    nationality: '',
    fees: ''
  });

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('personal');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Student | null>(null);

  // منطق الفلترة الأساسي
  const filteredData = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = !globalSearch || smartMatch(`${s.name} ${s.phone} ${s.teacher} ${s.circle} ${s.nationalId}`, globalSearch);
      const matchesLevel = !filters.level || s.level === filters.level;
      const matchesTeacher = !filters.teacher || s.teacher === filters.teacher;
      const matchesCircle = !filters.circle || s.circle === filters.circle;
      const matchesCategory = !filters.category || s.category === filters.category;
      const matchesPeriod = !filters.period || s.period === filters.period;
      const matchesNationality = !filters.nationality || s.nationality === filters.nationality;
      const matchesFees = !filters.fees || s.fees === filters.fees;

      return matchesSearch && matchesLevel && matchesTeacher && matchesCircle && 
             matchesCategory && matchesPeriod && matchesNationality && matchesFees;
    });
  }, [students, globalSearch, filters]);

  // حساب العدادات لكل فلتر (Faceted Search Counters)
  const getFilterCounts = (key: keyof Student, currentFilterValue: string) => {
    // نحسب العدد بناءً على جميع الفلاتر الأخرى باستثناء الفلتر الحالي نفسه
    return (optionValue: string) => {
      return students.filter(s => {
        const matchesSearch = !globalSearch || smartMatch(`${s.name} ${s.phone} ${s.teacher} ${s.circle} ${s.nationalId}`, globalSearch);
        const matchesLevel = (key === 'level') ? true : (!filters.level || s.level === filters.level);
        const matchesTeacher = (key === 'teacher') ? true : (!filters.teacher || s.teacher === filters.teacher);
        const matchesCircle = (key === 'circle') ? true : (!filters.circle || s.circle === filters.circle);
        const matchesCategory = (key === 'category') ? true : (!filters.category || s.category === filters.category);
        const matchesPeriod = (key === 'period') ? true : (!filters.period || s.period === filters.period);
        const matchesNationality = (key === 'nationality') ? true : (!filters.nationality || s.nationality === filters.nationality);
        const matchesFees = (key === 'fees') ? true : (!filters.fees || s.fees === filters.fees);

        return matchesSearch && matchesLevel && matchesTeacher && matchesCircle && 
               matchesCategory && matchesPeriod && matchesNationality && matchesFees &&
               s[key] === optionValue;
      }).length;
    };
  };

  const options = useMemo(() => {
    const getUnique = (key: keyof Student) => 
      Array.from(new Set(students.map(s => s[key]).filter(v => v && v.trim() !== ''))).sort();

    return {
      teachers: getUnique('teacher'),
      circles: getUnique('circle'),
      categories: getUnique('category'),
      periods: getUnique('period'),
      nationalities: getUnique('nationality'),
    };
  }, [students]);

  const handleExportExcel = () => {
    if (filteredData.length === 0) return;
    const dataToExport = filteredData.map(s => ({
      "م": s.id, "اسم الدارس": s.name, "الجنسية": s.nationality, "تاريخ الميلاد": s.dob, "رقم الهاتف": s.phone,
      "العمر": s.age, "المستوى": s.level, "الحلقة": s.circle, "المحفظ": s.teacher, "الفئة": s.category,
      "الفترة": s.period, "رقم الهوية": s.nationalId, "انتهاء الهوية": s.expiryId, "حالة السداد": s.fees === 'نعم' ? 'خالص' : 'مطلوب'
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "الدارسين");
    if (!worksheet['!views']) worksheet['!views'] = [];
    worksheet['!views'].push({ RTL: true });
    XLSX.writeFile(workbook, `سجل_الدارسين_${new Date().toLocaleDateString('ar-EG')}.xlsx`);
  };

  const resetFilters = () => {
    setFilters({ level: '', teacher: '', circle: '', category: '', period: '', nationality: '', fees: '' });
    setGlobalSearch('');
  };

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

  const DataField = ({ label, value, fieldKey, icon, type = 'text', isSelect = false, fieldOptions = [] }: any) => (
    <div className="bg-[#F9F9F9] p-7 rounded-2xl border border-[#EDEDED] hover:border-[#84754E]/20 transition-all shadow-sm">
      <div className="flex items-center gap-2.5 mb-2.5 text-[#AAA]">
        <span className="text-sm">{icon}</span>
        <label className="text-[10px] font-black uppercase tracking-[0.2em]">{label}</label>
      </div>
      {isEditMode ? (
        isSelect ? (
          <select value={(editFormData as any)?.[fieldKey] || ''} onChange={e => setEditFormData({ ...editFormData!, [fieldKey]: e.target.value })} className="w-full bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none border border-[#EDEDED] text-[#444]">
            <option value="">اختر...</option>
            {fieldOptions.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        ) : (
          type === 'date' ? (
            <div className="date-input-wrapper bg-white border border-[#EDEDED]">
              <input type="date" lang="en-GB" value={(editFormData as any)?.[fieldKey] || ''} onChange={e => setEditFormData({ ...editFormData!, [fieldKey]: e.target.value })} />
            </div>
          ) : (
            <input type={type} value={(editFormData as any)?.[fieldKey] || ''} onChange={e => setEditFormData({ ...editFormData!, [fieldKey]: e.target.value })} className="w-full bg-white rounded-xl px-4 py-3 text-sm font-bold outline-none border border-[#EDEDED] text-[#444]" />
          )
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
              <div className="w-28 h-28 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center text-5xl font-black border border-white/20 shadow-xl">{selectedStudent.name.charAt(0)}</div>
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
                    <DataField label="اسم المحفظ" value={selectedStudent.teacher} fieldKey="teacher" isSelect fieldOptions={options.teachers} icon="👳" />
                    <DataField label="المستوى" value={selectedStudent.level} fieldKey="level" isSelect fieldOptions={LEVEL_ORDER} icon="📈" />
                    <DataField label="الحلقة" value={selectedStudent.circle} fieldKey="circle" isSelect fieldOptions={options.circles} icon="🕌" />
                    <DataField label="الجزء الحالي" value={selectedStudent.part} fieldKey="part" icon="📖" />
                    <DataField label="تاريخ الالتحاق" value={selectedStudent.regDate} fieldKey="regDate" type="date" icon="📝" />
                  </>
                )}
                {activeTab === 'admin' && (
                  <>
                    <DataField label="رقم الهوية" value={selectedStudent.nationalId} fieldKey="nationalId" icon="🆔" />
                    <DataField label="صلاحية الهوية" value={selectedStudent.expiryId} fieldKey="expiryId" type="date" icon="🕒" />
                    <DataField label="الفئة" value={selectedStudent.category} fieldKey="category" isSelect fieldOptions={options.categories} icon="🔖" />
                    <DataField label="الفترة الدراسية" value={selectedStudent.period} fieldKey="period" isSelect fieldOptions={options.periods} icon="⏰" />
                    <DataField label="حالة السداد" value={selectedStudent.fees} fieldKey="fees" isSelect fieldOptions={['نعم', 'لا']} icon="💸" />
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
      {/* شريط البحث والفلاتر */}
      <div className="bg-white p-8 rounded-[2rem] border border-[#EBEBEB] shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <input 
              type="text" 
              placeholder="البحث الذكي (الاسم، الرقم، الجوال، المحفظ...)"
              className="w-full pr-14 pl-8 py-4 bg-[#F9F9F9] rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-[#84754E]/10 font-bold border border-transparent focus:border-[#84754E]/20 text-[#444] transition-all"
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-[#84754E]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
          <button 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`px-8 py-4 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 border ${showAdvancedFilters ? 'bg-[#84754E] text-white border-[#84754E]' : 'bg-white text-[#84754E] border-[#EBEBEB] hover:bg-[#F9F9F9]'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
            {showAdvancedFilters ? 'إخفاء الفلاتر' : 'تصفية متقدمة'}
          </button>
          
          <button 
            onClick={handleExportExcel}
            className="px-8 py-4 bg-[#84754E]/5 text-[#84754E] border border-[#84754E]/20 rounded-2xl font-black text-sm hover:bg-[#84754E] hover:text-white transition-all flex items-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            تصدير (Excel)
          </button>
        </div>

        {/* عداد ملخص النتائج الذكي */}
        {(globalSearch || Object.values(filters).some(v => v)) && (
          <div className="flex items-center justify-between px-6 py-3 bg-[#F4F1EA]/50 rounded-xl border border-[#84754E]/10 animate-fade">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-[#84754E] rounded-full animate-pulse"></span>
              <p className="text-[11px] font-black text-[#84754E] uppercase tracking-widest">
                تم العثور على <span className="text-base mx-1">{filteredData.length}</span> طالب يطابق اختياراتك
              </p>
            </div>
            <button onClick={resetFilters} className="text-[#84754E] font-black text-[10px] uppercase hover:underline decoration-2 underline-offset-4">إلغاء التصفية ×</button>
          </div>
        )}

        {showAdvancedFilters && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-6 border-t border-[#F5F5F5] animate-fade">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#84754E] uppercase pr-2">المحفظ</label>
              <select value={filters.teacher} onChange={e => setFilters({...filters, teacher: e.target.value})} className="filter-select w-full px-5 py-3.5 bg-[#F9F9F9] rounded-xl outline-none font-bold text-sm border border-transparent focus:bg-white focus:border-[#84754E]/20">
                <option value="">الكل</option>
                {options.teachers.map(t => {
                  const count = getFilterCounts('teacher', filters.teacher)(t);
                  return <option key={t} value={t}>{t} ({count})</option>
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#84754E] uppercase pr-2">الحلقة</label>
              <select value={filters.circle} onChange={e => setFilters({...filters, circle: e.target.value})} className="filter-select w-full px-5 py-3.5 bg-[#F9F9F9] rounded-xl outline-none font-bold text-sm border border-transparent focus:bg-white focus:border-[#84754E]/20">
                <option value="">الكل</option>
                {options.circles.map(c => {
                  const count = getFilterCounts('circle', filters.circle)(c);
                  return <option key={c} value={c}>{c} ({count})</option>
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#84754E] uppercase pr-2">المستوى</label>
              <select value={filters.level} onChange={e => setFilters({...filters, level: e.target.value})} className="filter-select w-full px-5 py-3.5 bg-[#F9F9F9] rounded-xl outline-none font-bold text-sm border border-transparent focus:bg-white focus:border-[#84754E]/20">
                <option value="">الكل</option>
                {LEVEL_ORDER.map(l => {
                  const count = getFilterCounts('level', filters.level)(l);
                  return <option key={l} value={l}>{l} ({count})</option>
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#84754E] uppercase pr-2">الفئة</label>
              <select value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})} className="filter-select w-full px-5 py-3.5 bg-[#F9F9F9] rounded-xl outline-none font-bold text-sm border border-transparent focus:bg-white focus:border-[#84754E]/20">
                <option value="">الكل</option>
                {options.categories.map(c => {
                  const count = getFilterCounts('category', filters.category)(c);
                  return <option key={c} value={c}>{c} ({count})</option>
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#84754E] uppercase pr-2">الجنسية</label>
              <select value={filters.nationality} onChange={e => setFilters({...filters, nationality: e.target.value})} className="filter-select w-full px-5 py-3.5 bg-[#F9F9F9] rounded-xl outline-none font-bold text-sm border border-transparent focus:bg-white focus:border-[#84754E]/20">
                <option value="">الكل</option>
                {options.nationalities.map(n => {
                  const count = getFilterCounts('nationality', filters.nationality)(n);
                  return <option key={n} value={n}>{n} ({count})</option>
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#84754E] uppercase pr-2">الفترة</label>
              <select value={filters.period} onChange={e => setFilters({...filters, period: e.target.value})} className="filter-select w-full px-5 py-3.5 bg-[#F9F9F9] rounded-xl outline-none font-bold text-sm border border-transparent focus:bg-white focus:border-[#84754E]/20">
                <option value="">الكل</option>
                {options.periods.map(p => {
                  const count = getFilterCounts('period', filters.period)(p);
                  return <option key={p} value={p}>{p} ({count})</option>
                })}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#84754E] uppercase pr-2">حالة السداد</label>
              <select value={filters.fees} onChange={e => setFilters({...filters, fees: e.target.value})} className="filter-select w-full px-5 py-3.5 bg-[#F9F9F9] rounded-xl outline-none font-bold text-sm border border-transparent focus:bg-white focus:border-[#84754E]/20">
                <option value="">الكل</option>
                <option value="نعم">تم السداد ({getFilterCounts('fees', filters.fees)('نعم')})</option>
                <option value="لا">لم يسدد ({getFilterCounts('fees', filters.fees)('لا')})</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-[#EBEBEB] overflow-hidden">
        <table className="w-full text-right">
          <thead className="bg-[#F9F9F9] text-[#A1A1A1] text-[11px] font-black uppercase tracking-[0.25em] border-b border-[#EDEDED]">
            <tr>
              <th className="px-10 py-6">تفاصيل الدارس</th>
              <th className="px-10 py-6">المحفظ / الحلقة</th>
              <th className="px-10 py-6">المستوى</th>
              <th className="px-10 py-6 text-center">الرسوم</th>
              <th className="px-10 py-6"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F9F9F9]">
            {filteredData.length > 0 ? (
              filteredData.map((s, idx) => (
                <tr key={idx} onClick={() => handleOpenProfile(s)} className="hover:bg-[#FDFDFB] cursor-pointer transition-all group">
                  <td className="px-10 py-6">
                    <div className="font-black text-[#444] text-base group-hover:text-[#84754E] transition-colors">{s.name}</div>
                    <div className="text-[10px] text-[#BBB] font-bold mt-1.5 uppercase tracking-widest">هاتف: {s.phone} | {s.nationality}</div>
                  </td>
                  <td className="px-10 py-6">
                    <div className="text-sm font-bold text-[#777]">{s.teacher}</div>
                    <div className="text-[10px] text-[#BBB] font-bold mt-1 uppercase">حلقة: {s.circle}</div>
                  </td>
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
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-10 py-32 text-center">
                  <div className="text-4xl mb-4 opacity-20">🔍</div>
                  <p className="text-[#AAA] font-black text-sm uppercase tracking-widest">لا توجد نتائج تطابق خيارات التصفية</p>
                  <button onClick={resetFilters} className="mt-4 text-[#84754E] font-black text-xs hover:underline">إلغاء جميع الفلاتر</button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentTable;
