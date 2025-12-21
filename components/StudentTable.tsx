
import React, { useState, useMemo } from 'react';
import { Student } from '../types';
import { smartMatch } from '../utils/arabicSearch';
import * as XLSX from 'https://esm.sh/xlsx';

interface StudentTableProps {
  students: Student[];
}

const StudentTable: React.FC<StudentTableProps> = ({ students }) => {
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // حالة الفلاتر المتقدمة لكل الأعمدة
  const [filters, setFilters] = useState<Partial<Record<keyof Student, string>>>({});

  // استخراج القيم الفريدة لبعض الحقول لتسهيل الاختيار
  const uniqueValues = useMemo(() => ({
    nationalities: Array.from(new Set(students.map(s => s.nationality))).filter(Boolean).sort(),
    levels: Array.from(new Set(students.map(s => s.level))).filter(Boolean).sort(),
    teachers: Array.from(new Set(students.map(s => s.teacher))).filter(Boolean).sort(),
    fees: Array.from(new Set(students.map(s => s.fees))).filter(Boolean),
    circles: Array.from(new Set(students.map(s => s.circle))).filter(Boolean).sort(),
    categories: Array.from(new Set(students.map(s => s.category))).filter(Boolean),
    periods: Array.from(new Set(students.map(s => s.period))).filter(Boolean),
    parts: (Array.from(new Set(students.map(s => s.part))).filter(Boolean) as string[]).sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    }),
  }), [students]);

  const handleFilterChange = (key: keyof Student, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearch('');
  };

  const filtered = useMemo(() => {
    return students.filter(student => {
      // 1. البحث العام
      const matchesSearch = !search || Object.values(student).some(v => smartMatch(String(v), String(search)));
      
      // 2. الفلاتر المخصصة لكل عمود
      const matchesColumnFilters = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return smartMatch(String(student[key as keyof Student]), String(value));
      });

      return matchesSearch && matchesColumnFilters;
    });
  }, [students, search, filters]);

  // وظيفة تصدير البيانات إلى Excel الحقيقي (.xlsx)
  const exportToExcel = () => {
    if (filtered.length === 0) return;

    // 1. تعريف عناوين الأعمدة
    const headers = [
      "م", "اسم الدارس", "الجنسية", "تاريخ الميلاد", "رقم الهاتف", 
      "العمر", "المؤهل", "العمل", "السكن", "تاريخ التسجيل", 
      "المستوى", "الجزء", "رقم الهوية", "الفئة", "الفترة", 
      "انتهاء الهوية", "المحفظ", "الرسوم", "الحلقة", "نسبة الاكتمال"
    ];

    // 2. تجهيز البيانات
    const data = filtered.map(s => [
      s.id, s.name, s.nationality, s.dob, s.phone,
      s.age, s.qualification, s.job, s.address, s.regDate,
      s.level, s.part, s.nationalId, s.category, s.period,
      s.expiryId, s.teacher, s.fees, s.circle, s.completion
    ]);

    // 3. إنشاء ورقة العمل (Worksheet)
    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // 4. ضبط اتجاه الورقة من اليمين لليسار (RTL)
    if (!ws['!views']) ws['!views'] = [];
    ws['!views'].push({ RTL: true });
    
    // ضبط عرض الأعمدة بشكل تقريبي لتناسب المحتوى العربي
    ws['!cols'] = headers.map(() => ({ wch: 20 }));

    // 5. إنشاء كتاب العمل (Workbook) وحفظ الملف
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "سجل الطلاب المصفى");

    // توليد الملف وتحميله
    XLSX.writeFile(wb, `سجل_نور_القرآن_${new Date().toLocaleDateString('ar-SA').replace(/\//g, '-')}.xlsx`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Control Bar */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-4 w-full md:w-auto flex-1">
            <div className="relative flex-1 max-w-xl">
              <input 
                type="text" 
                placeholder="البحث الذكي السريع..." 
                className="w-full pl-6 pr-14 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-bold text-slate-700"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <svg className="absolute right-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`px-6 py-4 rounded-2xl font-black text-sm transition-all flex items-center gap-3 ${showFilters ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"/></svg>
              تصفية متقدمة
            </button>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button 
              onClick={exportToExcel}
              disabled={filtered.length === 0}
              className="flex-1 md:flex-none px-6 py-4 bg-white border border-slate-200 text-emerald-600 rounded-2xl font-bold text-sm hover:bg-emerald-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
              تصدير Excel
            </button>
            <button 
              onClick={handlePrint}
              className="flex-1 md:flex-none px-6 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-sm shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
              طباعة كشف
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="p-8 bg-slate-50/50 border-b border-slate-100 animate-fade-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Group 1: الأساسيات */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 text-right">معلومات الهوية</h4>
                <input 
                  type="text" placeholder="رقم الهوية" 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none text-right"
                  value={filters.nationalId || ''} onChange={(e) => handleFilterChange('nationalId', e.target.value)}
                />
                <select 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                  value={filters.nationality || ''} onChange={(e) => handleFilterChange('nationality', e.target.value)}
                >
                  <option value="">كل الجنسيات</option>
                  {uniqueValues.nationalities.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <input 
                  type="text" placeholder="انتهاء الهوية" 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                  value={filters.expiryId || ''} onChange={(e) => handleFilterChange('expiryId', e.target.value)}
                />
              </div>

              {/* Group 2: التعليمي */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 text-right">الحلقة والمستوى</h4>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                    value={filters.level || ''} onChange={(e) => handleFilterChange('level', e.target.value)}
                  >
                    <option value="">المستوى</option>
                    {uniqueValues.levels.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select 
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right font-black text-indigo-600"
                    value={filters.part || ''} onChange={(e) => handleFilterChange('part', e.target.value)}
                  >
                    <option value="">الجزء (1-30)</option>
                    {uniqueValues.parts.map(v => <option key={v} value={v}>جزء {v}</option>)}
                  </select>
                </div>
                <select 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                  value={filters.teacher || ''} onChange={(e) => handleFilterChange('teacher', e.target.value)}
                >
                  <option value="">كل المحفظين</option>
                  {uniqueValues.teachers.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
                <select 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                  value={filters.circle || ''} onChange={(e) => handleFilterChange('circle', e.target.value)}
                >
                  <option value="">كل الحلقات</option>
                  {uniqueValues.circles.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              </div>

              {/* Group 3: البيانات الشخصية */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 text-right">البيانات الشخصية</h4>
                <input 
                  type="text" placeholder="رقم الهاتف" 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                  value={filters.phone || ''} onChange={(e) => handleFilterChange('phone', e.target.value)}
                />
                <input 
                  type="text" placeholder="العمر" 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                  value={filters.age || ''} onChange={(e) => handleFilterChange('age', e.target.value)}
                />
                <input 
                  type="text" placeholder="السكن" 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                  value={filters.address || ''} onChange={(e) => handleFilterChange('address', e.target.value)}
                />
              </div>

              {/* Group 4: أخرى */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-black text-indigo-600 uppercase tracking-widest px-2 text-right">إضافات وحالة</h4>
                <div className="grid grid-cols-2 gap-2">
                  <select 
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                    value={filters.fees || ''} onChange={(e) => handleFilterChange('fees', e.target.value)}
                  >
                    <option value="">الرسوم</option>
                    {uniqueValues.fees.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                  <select 
                    className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                    value={filters.period || ''} onChange={(e) => handleFilterChange('period', e.target.value)}
                  >
                    <option value="">الفترة</option>
                    {uniqueValues.periods.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <input 
                  type="text" placeholder="العمل / الوظيفة" 
                  className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none text-right"
                  value={filters.job || ''} onChange={(e) => handleFilterChange('job', e.target.value)}
                />
                <button 
                  onClick={clearFilters}
                  className="w-full py-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-black hover:bg-rose-100 transition-colors"
                >
                  تصفير كافة الفلاتر
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">م</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">الدارس</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">المعلم والحلقة</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">المستوى / الجزء</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">رقم الهوية</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right">الحالة المادية</th>
                <th className="px-8 py-5 text-[11px] font-black text-slate-900 uppercase tracking-widest text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-all group">
                  <td className="px-8 py-5 text-xs text-slate-400 font-bold text-center">{idx + 1}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center gap-4 justify-start">
                      <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs shrink-0">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5">{s.phone} | {s.nationality}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-bold text-right">
                    <p>{s.teacher}</p>
                    <p className="text-[10px] text-slate-400 font-medium">حلقة: {s.circle}</p>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex flex-col gap-1">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black rounded-lg border border-blue-100 w-fit">المستوى: {s.level}</span>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-black rounded-lg border border-indigo-100 w-fit">الجزء: {s.part}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-slate-600 font-medium font-mono text-right">{s.nationalId}</td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center gap-2 justify-start">
                      <div className={`w-1.5 h-1.5 rounded-full ${s.fees === 'نعم' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                      <span className="text-[11px] font-bold text-slate-500">{s.fees === 'نعم' ? 'خالص' : 'مستحق'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-lg transition-all shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-8 bg-slate-50/50 flex justify-between items-center">
          <p className="text-xs font-bold text-slate-400">إظهار <span className="text-slate-900 font-black">{filtered.length}</span> طالب من أصل <span className="text-slate-900 font-black">{students.length}</span></p>
          <div className="flex gap-2">
             <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all cursor-not-allowed">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
             </button>
             <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition-all">1</button>
             <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-indigo-600 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentTable;
