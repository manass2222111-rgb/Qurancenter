
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Student } from '../types';

interface AddStudentFormProps {
  onAdd: (student: Student) => void;
  onCancel: () => void;
  studentsCount: number;
  students: Student[];
  isSaving?: boolean;
}

const LEVEL_ORDER = ['تمهيدي', 'الأول', 'الثاني', 'الثالث', 'الرابع', 'الخامس', 'السادس'];

const AddStudentForm: React.FC<AddStudentFormProps> = ({ onAdd, onCancel, studentsCount, students, isSaving = false }) => {
  const [step, setStep] = useState(1);
  const [manualInputs, setManualInputs] = useState<Record<string, boolean>>({});
  const [formData, setFormData] = useState<Partial<Student>>({
    regDate: new Date().toISOString().split('T')[0],
    fees: 'لا',
    completion: '0%'
  });

  // استخراج القيم الفريدة بشكل مستقر
  const dropdownOptions = useMemo(() => {
    const getUnique = (key: keyof Student) => {
      const vals = students.map(s => s[key]).filter(v => v && v.trim() !== '');
      return Array.from(new Set(vals)).sort();
    };

    return {
      teachers: getUnique('teacher'),
      circles: getUnique('circle'),
      categories: getUnique('category'),
      periods: getUnique('period'),
    };
  }, [students]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (isSaving) return;
    const { name, value } = e.target;
    
    if (value === "__MANUAL__") {
      setManualInputs(prev => ({ ...prev, [name]: true }));
      return;
    }

    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'dob' && value) {
        const birthDate = new Date(value);
        const age = new Date().getFullYear() - birthDate.getFullYear();
        updated.age = age.toString();
      }
      return updated;
    });
  }, [isSaving]);

  useEffect(() => {
    const fieldsToCount = ['name', 'phone', 'nationality', 'dob', 'address', 'qualification', 'teacher', 'circle', 'level', 'part', 'regDate', 'nationalId', 'category', 'period', 'expiryId', 'fees'];
    const filledFields = fieldsToCount.filter(key => {
      const val = (formData as any)[key];
      return val && val.trim() !== '';
    }).length;
    const percentage = Math.round((filledFields / fieldsToCount.length) * 100);
    setFormData(prev => ({ ...prev, completion: `${percentage}%` }));
  }, [formData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    const newStudent: Student = {
      id: (studentsCount + 1).toString(),
      name: formData.name || '',
      nationality: formData.nationality || '',
      dob: formData.dob || '',
      phone: formData.phone || '',
      age: formData.age || '',
      qualification: formData.qualification || '',
      job: formData.job || '',
      address: formData.address || '',
      regDate: formData.regDate || '',
      level: formData.level || '',
      part: formData.part || '',
      nationalId: formData.nationalId || '',
      category: formData.category || '',
      period: formData.period || '',
      expiryId: formData.expiryId || '',
      teacher: formData.teacher || '',
      fees: formData.fees || 'لا',
      circle: formData.circle || '',
      completion: formData.completion || '0%'
    };
    onAdd(newStudent);
  };

  const DynamicSelect = ({ name, label, options, placeholder }: { name: string, label: string, options: string[], placeholder: string }) => (
    <div className="space-y-2">
      <label className="text-[11px] font-black text-slate-400 uppercase pr-2">{label}</label>
      {manualInputs[name] ? (
        <div className="relative group">
          <input 
            name={name} 
            type="text" 
            value={(formData as any)[name] || ''} 
            onChange={handleChange}
            placeholder={`اكتب ${label} جديد...`}
            className="w-full px-6 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl outline-none font-bold text-indigo-700 shadow-inner"
            autoFocus
          />
          <button 
            type="button" 
            onClick={() => setManualInputs(p => ({ ...p, [name]: false }))}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[9px] bg-white text-slate-400 px-3 py-1.5 rounded-xl shadow-sm font-black uppercase hover:text-indigo-600 transition-colors border border-slate-100"
          >
            رجوع للقائمة
          </button>
        </div>
      ) : (
        <div className="relative">
          <select 
            name={name} 
            value={(formData as any)[name] || ''} 
            onChange={handleChange} 
            className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold appearance-none cursor-pointer"
          >
            <option value="">{placeholder}</option>
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            <option value="__MANUAL__" className="text-indigo-600 font-black pt-4 border-t">+ إضافة قيمة غير موجودة</option>
          </select>
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
          </div>
        </div>
      )}
    </div>
  );

  const steps = [
    { title: 'البيانات الشخصية', icon: '👤' },
    { title: 'المسار التعليمي', icon: '📖' },
    { title: 'البيانات الإدارية', icon: '📂' }
  ];

  return (
    <div className={`max-w-4xl mx-auto bg-white rounded-[3rem] border border-slate-100 shadow-2xl overflow-hidden mb-10 transition-all duration-500 ${isSaving ? 'opacity-60 grayscale pointer-events-none' : ''}`}>
      <div className="bg-[#0F172A] p-10 text-white flex justify-between items-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-slate-800">
           <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: formData.completion }}></div>
        </div>
        <div className="relative z-10">
          <h3 className="text-2xl font-black mb-1">تسجيل دارس جديد</h3>
          <p className="text-indigo-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
            اكتمال الملف: {formData.completion}
            {isSaving && <span className="animate-pulse">| جاري الحفظ سحابياً...</span>}
          </p>
        </div>
        <div className="flex gap-4 items-center relative z-10">
          <div className="text-left ml-4">
            <p className="text-xs font-bold text-slate-500">الخطوة {step} من 3</p>
            <p className="text-sm font-black">{steps[step - 1].title}</p>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`w-8 h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'bg-indigo-500' : 'bg-slate-700'}`}></div>
            ))}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-12 space-y-10">
        
        {step === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">اسم الدارس رباعياً</label>
              <input name="name" type="text" value={formData.name || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="أدخل الاسم..." required />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">رقم الهاتف</label>
              <input name="phone" type="text" value={formData.phone || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="05xxxxxxxx" />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">الجنسية</label>
              <input name="nationality" type="text" value={formData.nationality || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="سعودي، مصري..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2">تاريخ الميلاد</label>
                <input name="dob" type="date" lang="en" dir="ltr" value={formData.dob || ''} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-right" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase pr-2">العمر</label>
                <input name="age" type="number" value={formData.age || ''} onChange={handleChange} className="w-full px-4 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" readOnly />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">السكن</label>
              <input name="address" type="text" value={formData.address || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="الحي..." />
            </div>
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">المؤهل الدراسي</label>
              <input name="qualification" type="text" value={formData.qualification || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
            <DynamicSelect name="teacher" label="اسم المحفظ" options={dropdownOptions.teachers} placeholder="اختر المحفظ من الشيت" />
            <DynamicSelect name="circle" label="الحلقة" options={dropdownOptions.circles} placeholder="اختر الحلقة من الشيت" />
            
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">المستوى الأكاديمي</label>
              <select name="level" value={formData.level || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold appearance-none cursor-pointer">
                <option value="">اختر المستوى</option>
                {LEVEL_ORDER.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">الجزء الحالي</label>
              <input name="part" type="number" min="1" max="30" value={formData.part || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="1-30" />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">تاريخ التسجيل بالمركز</label>
              <input name="regDate" type="date" lang="en" dir="ltr" value={formData.regDate || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-right" />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-up">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">رقم الهوية / الإقامة</label>
              <input name="nationalId" type="text" value={formData.nationalId || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold" placeholder="10xxxxxxxx" />
            </div>
            
            <DynamicSelect name="category" label="الفئة" options={dropdownOptions.categories} placeholder="اختر الفئة من الشيت" />
            <DynamicSelect name="period" label="الفترة" options={dropdownOptions.periods} placeholder="اختر الفترة من الشيت" />

            <div className="space-y-2 md:col-span-1">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">تاريخ انتهاء الهوية</label>
              <input name="expiryId" type="date" lang="en" dir="ltr" value={formData.expiryId || ''} onChange={handleChange} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-right" />
            </div>

            <div className="space-y-2 md:col-span-2 pt-4">
              <label className="text-[11px] font-black text-slate-400 uppercase pr-2">هل تم سداد الرسوم؟</label>
              <div className="flex gap-4">
                {['نعم', 'لا'].map(option => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, fees: option }))}
                    className={`flex-1 py-4 rounded-2xl font-black transition-all border ${formData.fees === option ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-slate-50 text-slate-400 border-transparent hover:bg-slate-100'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center pt-10 border-t border-slate-50">
          <button type="button" onClick={onCancel} className="text-slate-400 font-black text-sm hover:text-rose-600 transition-colors">إلغاء العملية</button>
          <div className="flex gap-4">
            {step > 1 && (
              <button type="button" onClick={() => setStep(step - 1)} className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm">السابق</button>
            )}
            {step < 3 ? (
              <button type="button" onClick={() => setStep(step + 1)} className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-xl hover:bg-indigo-700 transition-all">المتابعة</button>
            ) : (
              <button 
                type="submit" 
                disabled={isSaving} 
                className={`px-10 py-4 rounded-2xl font-black text-sm shadow-xl transition-all ${isSaving ? 'bg-slate-400 cursor-not-allowed opacity-50' : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'}`}
              >
                {isSaving ? 'جاري الحفظ...' : 'إتمام التسجيل وحفظ البيانات'}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddStudentForm;
